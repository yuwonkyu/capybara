import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const supabase = getSupabaseServerClient();

    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("id, board_type, title, content, nickname, views, created_at")
      .eq("id", id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    const { data: updated } = await supabase
      .from("posts")
      .update({ views: post.views + 1 })
      .eq("id", id)
      .select("id, board_type, title, content, nickname, views, created_at")
      .single();

    return NextResponse.json({ post: updated ?? post });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "게시글을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const { title, content, password } = body ?? {};

  if (!title?.trim() || !content?.trim() || !password) {
    return NextResponse.json(
      { error: "제목, 내용, 비밀번호를 모두 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseServerClient();

    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("password_hash")
      .eq("id", id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    const matches = await bcrypt.compare(String(password), post.password_hash);
    if (!matches) {
      return NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 403 });
    }

    const { error: updateError } = await supabase
      .from("posts")
      .update({ title: title.trim(), content: content.trim() })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "게시글을 수정하지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { password } = body ?? {};

  if (!password) {
    return NextResponse.json({ error: "비밀번호를 입력해주세요." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServerClient();

    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("password_hash")
      .eq("id", id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    const matches = await bcrypt.compare(String(password), post.password_hash);
    if (!matches) {
      return NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 403 });
    }

    const { error: deleteError } = await supabase.from("posts").delete().eq("id", id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "게시글을 삭제하지 못했습니다." },
      { status: 500 }
    );
  }
}
