import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { INVEST_UNIT_MAN } from "@/lib/donations";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getAuthUser } from "@/lib/supabase-server";

type RouteParams = { params: Promise<{ id: string }> };

const MAX_INVEST_COUNT = 100;

// 투자 횟수 수정 (관리자 전용) — 확인필요 기록을 길마가 바로잡을 때 사용
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "카카오 로그인이 필요합니다." }, { status: 401 });
  }
  if (!(await isAdminUser(user.id))) {
    return NextResponse.json(
      { error: "관리자만 수정할 수 있어요." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const count = Number(body?.invest_count);

  if (!Number.isInteger(count) || count < 0 || count > MAX_INVEST_COUNT) {
    return NextResponse.json(
      { error: "투자 횟수를 올바르게 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("donations")
      .update({
        invest_count: count,
        amount_man: count * INVEST_UNIT_MAN,
        needs_review: false,
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/donations");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 기부 기록 삭제 (본인 또는 관리자)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "카카오 로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const supabase = getSupabaseServerClient();

    const { data: donation, error: fetchError } = await supabase
      .from("donations")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !donation) {
      return NextResponse.json({ error: "기부 내역을 찾을 수 없습니다." }, { status: 404 });
    }

    const isOwner = donation.user_id === user.id;
    if (!isOwner && !(await isAdminUser(user.id))) {
      return NextResponse.json(
        { error: "본인이 등록한 기부만 삭제할 수 있어요." },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from("donations")
      .delete()
      .eq("id", id);
    if (deleteError) throw deleteError;

    revalidatePath("/donations");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
