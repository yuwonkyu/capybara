import { NextRequest, NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getAuthUser } from "@/lib/supabase-server";
import { CATEGORY_BOARDS, isValidCategory } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "게시글 내용은 카카오 로그인 후 볼 수 있어요." },
        { status: 401 }
      );
    }

    const supabase = getSupabaseServerClient();

    // 수정 화면 등에서 원본을 불러올 때 사용 — 조회수는 올리지 않는다
    // (조회수 증가는 상세 페이지 서버 렌더링에서만 처리)
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select(
        "id, board_type, title, content, nickname, user_id, image_urls, category, views, created_at"
      )
      .eq("id", id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "게시글을 불러오지 못했습니다." },
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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const { title, content, image_urls, category } = body ?? {};

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json(
      { error: "제목과 내용을 모두 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "카카오 로그인이 필요합니다." }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();

    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("user_id, board_type")
      .eq("id", id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    if (post.user_id !== user.id) {
      return NextResponse.json(
        { error: "본인이 작성한 글만 수정할 수 있어요." },
        { status: 403 }
      );
    }

    if (!isValidCategory(post.board_type, category)) {
      return NextResponse.json({ error: "말머리를 선택해주세요." }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        content: content.trim(),
        image_urls: sanitizeImageUrls(image_urls),
        category: CATEGORY_BOARDS.includes(post.board_type) ? category : null,
      })
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

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "카카오 로그인이 필요합니다." }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();

    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    const isOwner = post.user_id === user.id;
    if (!isOwner && !(await isAdminUser(user.id))) {
      return NextResponse.json(
        { error: "본인이 작성한 글만 삭제할 수 있어요." },
        { status: 403 }
      );
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
