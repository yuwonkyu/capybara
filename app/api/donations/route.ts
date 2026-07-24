import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { INVEST_UNIT_MAN, isGuildName, syncDonationRoles } from "@/lib/donations";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getAuthUser } from "@/lib/supabase-server";
import { NICKNAME_MAX, NICKNAME_MIN } from "@/lib/user";

const MAX_INVEST_COUNT = 100;

// 직접 등록: 길드마스터·부마스터가 (디스코드에 못 올린) 길드원의 투자를
// 대신 입력하는 용도. user_id는 연결하지 않고 닉네임 텍스트로만 기록하며,
// 회원등급 표시는 이 닉네임과 사이트 계정 닉네임이 일치할 때만 자동으로 붙는다.
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { error: "카카오 로그인 후 이용할 수 있어요." },
      { status: 401 }
    );
  }
  if (!(await isAdminUser(user.id))) {
    return NextResponse.json(
      { error: "직접 등록은 길드마스터·부마스터만 이용할 수 있어요." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { guild, nickname, invest_count, image_url, note } = body ?? {};

  if (!isGuildName(guild)) {
    return NextResponse.json({ error: "길드를 선택해주세요." }, { status: 400 });
  }

  const trimmedNickname = typeof nickname === "string" ? nickname.trim() : "";
  if (trimmedNickname.length < NICKNAME_MIN || trimmedNickname.length > NICKNAME_MAX) {
    return NextResponse.json(
      { error: `투자자 닉네임은 ${NICKNAME_MIN}~${NICKNAME_MAX}자로 입력해주세요.` },
      { status: 400 }
    );
  }

  const count = Number(invest_count);
  if (!Number.isInteger(count) || count <= 0 || count > MAX_INVEST_COUNT) {
    return NextResponse.json(
      { error: "투자 횟수를 올바르게 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseServerClient();

    // 연타·중복 클릭으로 같은 내용이 다시 등록되는 것을 막는다
    // (같은 닉네임·길드·횟수 조합이 2분 이내 이미 있으면 거부)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("donations")
      .select("id")
      .eq("nickname", trimmedNickname)
      .eq("guild", guild)
      .eq("invest_count", count)
      .gte("created_at", twoMinutesAgo)
      .limit(1)
      .maybeSingle();

    if (recent) {
      return NextResponse.json(
        {
          error:
            "방금 같은 내용으로 등록됐어요. 중복 등록을 막기 위해 2분 뒤 다시 시도해주세요.",
        },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("donations")
      .insert({
        user_id: null,
        nickname: trimmedNickname,
        guild,
        invest_count: count,
        amount_man: count * INVEST_UNIT_MAN,
        image_url: typeof image_url === "string" ? image_url : null,
        note: typeof note === "string" ? note.trim().slice(0, 200) || null : null,
      })
      .select("id")
      .single();

    if (error) throw error;

    await syncDonationRoles();
    revalidatePath("/donations");

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "기부 등록에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
