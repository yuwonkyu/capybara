import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getAuthUser } from "@/lib/supabase-server";
import { getDisplayName } from "@/lib/user";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "댓글은 카카오 로그인 후 볼 수 있어요." },
        { status: 401 }
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("comments")
      .select("id, post_id, nickname, content, user_id, created_at")
      .eq("post_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ comments: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "댓글을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const { content } = body ?? {};

  if (!content?.trim()) {
    return NextResponse.json({ error: "댓글 내용을 입력해주세요." }, { status: 400 });
  }

  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "카카오 로그인 후 댓글을 쓸 수 있어요." },
        { status: 401 }
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: id,
        nickname: getDisplayName(user),
        content: content.trim(),
        user_id: user.id,
      })
      .select("id, post_id, nickname, content, user_id, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "댓글을 작성하지 못했습니다." },
      { status: 500 }
    );
  }
}
