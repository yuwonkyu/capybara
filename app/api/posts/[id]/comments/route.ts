import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("comments")
      .select("id, post_id, nickname, content, created_at")
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
  const { nickname, content, password } = body ?? {};

  if (!nickname?.trim() || !content?.trim() || !password) {
    return NextResponse.json(
      { error: "닉네임, 내용, 비밀번호를 모두 입력해주세요." },
      { status: 400 }
    );
  }

  if (String(password).length < 4) {
    return NextResponse.json(
      { error: "비밀번호는 4자 이상 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseServerClient();
    const passwordHash = await bcrypt.hash(String(password), 10);

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: id,
        nickname: nickname.trim(),
        content: content.trim(),
        password_hash: passwordHash,
      })
      .select("id, post_id, nickname, content, created_at")
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
