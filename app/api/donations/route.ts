import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { INVEST_UNIT_MAN, isGuildName } from "@/lib/donations";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getAuthUser } from "@/lib/supabase-server";
import { getDisplayName } from "@/lib/user";

const MAX_INVEST_COUNT = 100;

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { error: "카카오 로그인 후 기부를 등록할 수 있어요." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { guild, invest_count, image_url, note } = body ?? {};

  if (!isGuildName(guild)) {
    return NextResponse.json({ error: "길드를 선택해주세요." }, { status: 400 });
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
    const { data, error } = await supabase
      .from("donations")
      .insert({
        user_id: user.id,
        nickname: getDisplayName(user),
        guild,
        invest_count: count,
        amount_man: count * INVEST_UNIT_MAN,
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
