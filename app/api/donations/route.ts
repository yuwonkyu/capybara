import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { GUILD_SKILLS } from "@/lib/donations";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getAuthUser } from "@/lib/supabase-server";
import { getDisplayName } from "@/lib/user";

const MAX_AMOUNT_MAN = 1_000_000; // 100억 메소
const MAX_INVEST_COUNT = 1000;

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { error: "기부현황은 카카오 로그인 후 볼 수 있어요." },
      { status: 401 }
    );
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("donations")
      .select(
        "id, user_id, nickname, amount_man, invest_count, skill, image_url, note, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ donations: data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "기부 내역을 불러오지 못했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { error: "카카오 로그인 후 기부를 등록할 수 있어요." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { amount_man, invest_count, skill, image_url, note } = body ?? {};

  const amount = Number(amount_man);
  const count = Number(invest_count);

  if (!Number.isInteger(amount) || amount < 0 || amount > MAX_AMOUNT_MAN) {
    return NextResponse.json(
      { error: "기부 메소를 올바르게 입력해주세요. (만 메소 단위)" },
      { status: 400 }
    );
  }

  if (!Number.isInteger(count) || count < 0 || count > MAX_INVEST_COUNT) {
    return NextResponse.json(
      { error: "투자 횟수를 올바르게 입력해주세요." },
      { status: 400 }
    );
  }

  if (amount === 0 && count === 0) {
    return NextResponse.json(
      { error: "기부 메소 또는 투자 횟수 중 하나는 입력해주세요." },
      { status: 400 }
    );
  }

  if (skill && !GUILD_SKILLS.includes(skill)) {
    return NextResponse.json(
      { error: "유효하지 않은 길드 스킬입니다." },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("donations")
      .insert({
        user_id: user.id,
        nickname: getDisplayName(user),
        amount_man: amount,
        invest_count: count,
        skill: skill ?? null,
        image_url: typeof image_url === "string" ? image_url : null,
        note: typeof note === "string" ? note.trim().slice(0, 200) || null : null,
      })
      .select("id")
      .single();

    if (error) throw error;

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
