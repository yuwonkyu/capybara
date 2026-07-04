import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

type RouteParams = { params: Promise<{ id: string }> };

// 조회수 증가 전용 엔드포인트.
// 같은 방문자가 이미 본 글은 쿠키로 판별해 중복 카운트하지 않는다.
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const cookieName = `viewed_${id}`;

  if (request.cookies.get(cookieName)) {
    return NextResponse.json({ counted: false });
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data: post } = await supabase
      .from("posts")
      .select("views")
      .eq("id", id)
      .single();

    if (post) {
      await supabase
        .from("posts")
        .update({ views: post.views + 1 })
        .eq("id", id);
    }
  } catch {
    // 조회수 증가 실패는 무시
  }

  const response = NextResponse.json({ counted: true });
  response.cookies.set(cookieName, "1", {
    maxAge: 60 * 60 * 6, // 6시간 동안 같은 글 재조회는 카운트 안 함
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
