import { NextRequest, NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getAuthUser } from "@/lib/supabase-server";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "카카오 로그인이 필요합니다." }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();

    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }

    const isOwner = comment.user_id === user.id;
    if (!isOwner && !(await isAdminUser(user.id))) {
      return NextResponse.json(
        { error: "본인이 작성한 댓글만 삭제할 수 있어요." },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase.from("comments").delete().eq("id", id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "댓글을 삭제하지 못했습니다." },
      { status: 500 }
    );
  }
}
