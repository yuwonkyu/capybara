import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import {
  DiscordMessage,
  extractGameNick,
  fetchChannelMessages,
  fetchGuildNick,
  getChannelConfig,
  parseInvestCount,
  parseMesoMan,
  pickDisplayName,
} from "@/lib/discord";
import { INVEST_UNIT_MAN } from "@/lib/donations";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getAuthUser } from "@/lib/supabase-server";

export const maxDuration = 60;

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

const hasImage = (message: DiscordMessage): boolean =>
  message.attachments.some(
    (a) => a.content_type && IMAGE_TYPES.includes(a.content_type)
  );

/**
 * 메시지에서 투자 횟수를 판단한다.
 * 1) "!투자 2" 양식 → 확정
 * 2) "천만원 투자" 같은 금액 표현 → 추측 (길마 확인 필요)
 * 3) 인증샷만 있음 → 0회 + 확인 필요
 * 4) 그 외 잡담 → null (가져오지 않음)
 */
const resolveInvestCount = (
  message: DiscordMessage
): { count: number; needsReview: boolean } | null => {
  const exact = parseInvestCount(message.content ?? "");
  if (exact !== null) return { count: exact, needsReview: false };

  // 투자 인증 채널이므로 인증샷이 있으면 기부 기록으로 본다
  if (!hasImage(message)) return null;

  const man = parseMesoMan(message.content ?? "");
  if (man !== null) {
    const guessed = Math.round(man / INVEST_UNIT_MAN);
    if (guessed > 0) return { count: guessed, needsReview: true };
  }

  return { count: 0, needsReview: true };
};

// 디스코드 첨부 이미지는 URL이 만료되므로 Supabase Storage로 옮겨 영구 보관한다.
const copyAttachmentToStorage = async (
  message: DiscordMessage
): Promise<string | null> => {
  const image = message.attachments.find(
    (a) => a.content_type && IMAGE_TYPES.includes(a.content_type)
  );
  if (!image) return null;

  try {
    const res = await fetch(image.url);
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = image.content_type === "image/jpeg" ? "jpg" : image.content_type!.split("/")[1];
    const path = `discord/${message.id}.${ext}`;

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.storage
      .from("post-images")
      .upload(path, buffer, { contentType: image.content_type, upsert: true });

    if (error) return null;

    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return null;
  }
};

export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (!(await isAdminUser(user.id))) {
    return NextResponse.json(
      { error: "관리자만 동기화할 수 있어요." },
      { status: 403 }
    );
  }

  const channels = getChannelConfig();
  if (channels.length === 0) {
    return NextResponse.json(
      {
        error:
          "디스코드 채널이 설정되지 않았습니다. DISCORD_CHANNEL_CAPY / DISCORD_CHANNEL_CAPYLAND 환경변수를 확인해주세요.",
      },
      { status: 500 }
    );
  }

  try {
    const supabase = getSupabaseServerClient();

    // 이미 가져온 메시지는 건너뛴다
    const { data: existing } = await supabase
      .from("donations")
      .select("discord_message_id")
      .not("discord_message_id", "is", null);
    const seen = new Set(
      (existing ?? []).map((r) => r.discord_message_id as string)
    );

    const nickCache = new Map<string, string | null>();
    let imported = 0;
    let skipped = 0;
    let review = 0;

    for (const { guild, channelId } of channels) {
      const messages = await fetchChannelMessages(channelId);

      for (const message of messages) {
        if (message.author.bot) continue;
        if (seen.has(message.id)) continue;

        const resolved = resolveInvestCount(message);
        if (resolved === null) {
          skipped += 1;
          continue;
        }
        const { count, needsReview } = resolved;

        // 서버 닉네임 우선 (예: "전태영/저격수/104")
        if (!nickCache.has(message.author.id)) {
          nickCache.set(
            message.author.id,
            message.member?.nick ?? (await fetchGuildNick(message.author.id))
          );
        }
        const fullNick = nickCache.get(message.author.id) ?? pickDisplayName(message);
        // 표에는 캐릭터명만 쓰고("전태영"), 원본 닉네임은 따로 보관한다
        const nickname = extractGameNick(fullNick);

        const imageUrl = await copyAttachmentToStorage(message);

        const { error } = await supabase.from("donations").insert({
          nickname,
          guild,
          invest_count: count,
          amount_man: count * INVEST_UNIT_MAN,
          image_url: imageUrl,
          discord_user_id: message.author.id,
          discord_name: fullNick,
          discord_message_id: message.id,
          discord_channel_id: channelId,
          // 스크린샷만으로 헷갈릴 때 참고하도록 원문을 그대로 보관
          discord_content: message.content?.trim() || null,
          needs_review: needsReview,
          created_at: message.timestamp,
        });

        // 동시 실행 등으로 중복이면 무시
        if (!error) {
          imported += 1;
          if (needsReview) review += 1;
        }
      }
    }

    revalidatePath("/donations");

    return NextResponse.json({ imported, skipped, review });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "디스코드 동기화에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
