import { getSupabaseServerClient } from "@/lib/supabase";
import { BoardType, Comment, Post } from "@/lib/types";

export type PostSummary = {
  id: string;
  title: string;
  nickname: string;
  views: number;
  created_at: string;
};

const POST_DETAIL_FIELDS =
  "id, board_type, title, content, nickname, user_id, image_urls, views, created_at";

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
      .select("id, title, nickname, views, created_at")
      .eq("board_type", boardType)
      .order("created_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch {
    return null;
  }
};

export const fetchPostWithViewIncrement = async (
  id: string
): Promise<Post | null> => {
  try {
    const supabase = getSupabaseServerClient();

    const { data: post, error } = await supabase
      .from("posts")
      .select(POST_DETAIL_FIELDS)
      .eq("id", id)
      .single();

    if (error || !post) return null;

    const { data: updated } = await supabase
      .from("posts")
      .update({ views: post.views + 1 })
      .eq("id", id)
      .select(POST_DETAIL_FIELDS)
      .single();

    return (updated ?? post) as Post;
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
