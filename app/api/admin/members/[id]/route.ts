import { NextRequest, NextResponse } from "next/server";
import { isMasterUser } from "@/lib/admin";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getAuthUser } from "@/lib/supabase-server";
import { ROLE_ORDER, MemberRole } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

const isValidRole = (role: unknown): role is MemberRole =>
  typeof role === "string" && ROLE_ORDER.includes(role as MemberRole);

// 등급 변경
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (!(await isMasterUser(user.id))) {
    return NextResponse.json({ error: "길드마스터만 접근할 수 있어요." }, { status: 403 });
  }

  const body = await request.json();
  const { role } = body ?? {};
  if (!isValidRole(role)) {
    return NextResponse.json({ error: "유효하지 않은 등급입니다." }, { status: 400 });
  }

  if (id === user.id && role !== "master") {
    return NextResponse.json(
      { error: "본인의 길드마스터 등급은 내릴 수 없어요. 다른 마스터를 먼저 지정하세요." },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("members")
      .upsert({ user_id: id, role }, { onConflict: "user_id" });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "등급 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 추방 (회원 삭제)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (!(await isMasterUser(user.id))) {
    return NextResponse.json({ error: "길드마스터만 접근할 수 있어요." }, { status: 403 });
  }
  if (id === user.id) {
    return NextResponse.json({ error: "본인은 추방할 수 없어요." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServerClient();
    // members는 auth.users 삭제 시 cascade로 함께 삭제된다
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "추방에 실패했습니다." },
      { status: 500 }
    );
  }
}
