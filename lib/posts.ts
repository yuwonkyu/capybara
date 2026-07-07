import { getSupabaseServerClient } from "@/lib/supabase";
import { BoardType, Comment, Post } from "@/lib/types";

export type PostSummary = {
  id: string;
  title: string;
  nickname: string;
  category: string | null;
  views: number;
  comment_count: number;
  created_at: string;
};

export type PopularPost = PostSummary & { board_type: BoardType };
export type MyPost = PostSummary & { board_type: BoardType };

// Supabase의 comments(count) 응답을 숫자로 정규화한다.
type WithCommentAgg = { comments?: { count: number }[] | null };

const withCommentCount = <T extends WithCommentAgg>(
  row: T
): Omit<T, "comments"> & { comment_count: number } => {
  const { comments, ...rest } = row;
  return { ...rest, comment_count: comments?.[0]?.count ?? 0 };
};

const SUMMARY_FIELDS = "id, title, nickname, category, views, created_at, comments(count)";
const SUMMARY_FIELDS_WITH_BOARD =
  "id, board_type, title, nickname, category, views, created_at, comments(count)";

// 인기 게시글: 자유·공략·거래 게시판에서 조회수 높은 순으로 모은다.
// (파티 게시판은 모집글 특성상 인기 게시글에서 제외)
const POPULAR_BOARDS: BoardType[] = ["free", "guide", "share"];

export const fetchPopularPosts = async (
  limit = 5
): Promise<PopularPost[] | null> => {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select(SUMMARY_FIELDS_WITH_BOARD)
      .in("board_type", POPULAR_BOARDS)
      .order("views", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(withCommentCount) as PopularPost[];
  } catch {
    return null;
  }
};

const POST_DETAIL_FIELDS =
  "id, board_type, title, content, nickname, user_id, image_urls, category, views, created_at";

// 서버 컴포넌트에서 직접 호출하는 데이터 헬퍼.
// API 라우트를 거치지 않아 클라이언트 왕복이 줄어든다.

export const fetchBoardPosts = async (
  boardType: BoardType,
  limit?: number
): Promise<PostSummary[] | null> => {
  try {
    const supabase = getSupabaseServerClient();
    let query = supabase
      .from("posts")
      .select(SUMMARY_FIELDS)
      .eq("board_type", boardType)
      .order("created_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;

    if (error) throw error;
    return (data ?? []).map(withCommentCount) as PostSummary[];
  } catch {
    return null;
  }
};

// 특정 사용자가 쓴 글 목록 (내 정보 페이지용)
export const fetchMyPosts = async (
  userId: string,
  limit = 20
): Promise<MyPost[]> => {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select(SUMMARY_FIELDS_WITH_BOARD)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(withCommentCount) as MyPost[];
  } catch {
    return [];
  }
};

// 조회수를 올리지 않고 게시글만 가져온다.
// (조회수 증가는 클라이언트가 /api/posts/[id]/view 를 호출해 쿠키로 중복 없이 처리)
export const fetchPost = async (id: string): Promise<Post | null> => {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select(POST_DETAIL_FIELDS)
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as Post;
  } catch {
    return null;
  }
};

export const fetchComments = async (postId: string): Promise<Comment[]> => {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("comments")
      .select("id, post_id, nickname, content, user_id, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data as Comment[];
  } catch {
    return [];
  }
};
