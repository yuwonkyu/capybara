import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { BOARD_TYPES, BoardType } from "@/lib/types";

const VALID_TYPES = BOARD_TYPES.map((board) => board.type);

export async function GET(request: NextRequest) {
  const boardType = request.nextUrl.searchParams.get("type");

  if (!boardType || !VALID_TYPES.includes(boardType as BoardType)) {
    return NextResponse.json(
      { error: "유효하지 않은 게시판입니다." },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select("id, board_type, title, nickname, views, created_at")
      .eq("board_type", boardType)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ posts: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "게시글 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { board_type, title, content, nickname, password } = body ?? {};

  if (
    !board_type ||
    !VALID_TYPES.includes(board_type) ||
    !title?.trim() ||
    !content?.trim() ||
    !nickname?.trim() ||
    !password
  ) {
    return NextResponse.json(
      { error: "제목, 내용, 닉네임, 비밀번호를 모두 입력해주세요." },
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
      .from("posts")
      .insert({
        board_type,
        title: title.trim(),
        content: content.trim(),
        nickname: nickname.trim(),
        password_hash: passwordHash,
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "게시글을 작성하지 못했습니다." },
      { status: 500 }
    );
  }
}
