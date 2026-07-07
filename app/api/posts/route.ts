import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getAuthUser } from "@/lib/supabase-server";
import { getDisplayName } from "@/lib/user";
import {
  ADMIN_ONLY_BOARDS,
  BOARD_TYPES,
  BoardType,
  CATEGORY_BOARDS,
  isValidCategory,
} from "@/lib/types";

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
      .select("id, board_type, title, nickname, category, views, created_at")
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

const sanitizeImageUrls = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((url): url is string => typeof url === "string" && url.length < 1000)
    .slice(0, 5);
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { board_type, title, content, image_urls, category } = body ?? {};

  if (!board_type || !VALID_TYPES.includes(board_type) || !title?.trim() || !content?.trim()) {
    return NextResponse.json(
      { error: "제목과 내용을 모두 입력해주세요." },
      { status: 400 }
    );
  }

  if (!isValidCategory(board_type, category)) {
    return NextResponse.json({ error: "말머리를 선택해주세요." }, { status: 400 });
  }

  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "카카오 로그인 후 글을 쓸 수 있어요." },
        { status: 401 }
      );
    }

    if (ADMIN_ONLY_BOARDS.includes(board_type)) {
      const isAdmin = await isAdminUser(user.id);
      if (!isAdmin) {
        return NextResponse.json(
          { error: "이 게시판은 관리자만 글을 쓸 수 있어요." },
          { status: 403 }
        );
      }
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .insert({
        board_type,
        title: title.trim(),
        content: content.trim(),
        nickname: getDisplayName(user),
        user_id: user.id,
        image_urls: sanitizeImageUrls(image_urls),
        category: CATEGORY_BOARDS.includes(board_type) ? category : null,
      })
      .select("id")
      .single();

    if (error) throw error;

    // 캐시된 목록/홈을 즉시 갱신
    revalidatePath(`/board/${board_type}`);
    revalidatePath("/");

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "게시글을 작성하지 못했습니다." },
      { status: 500 }
    );
  }
}
