import { notFound } from "next/navigation";
import PostDetail from "@/components/PostDetail";
import { isAdminUser } from "@/lib/admin";
import { fetchComments, fetchPost } from "@/lib/posts";
import { getAuthUser } from "@/lib/supabase-server";
import { getBoardConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

type PostPageProps = { params: Promise<{ type: string; id: string }> };

const PostPage = async ({ params }: PostPageProps): Promise<JSX.Element> => {
  const { type, id } = await params;
  const board = getBoardConfig(type);
  if (!board) notFound();

  // 글 내용과 댓글은 길드 회원(로그인 사용자)만 볼 수 있다
  const user = await getAuthUser();

  if (!user) {
    return (
      <section className="cute-card">
        <p className="pill-badge mb-2">{board.label}</p>
        <h1 className="title">회원 전용 게시글이에요</h1>
        <p className="font-body text-ink/70">
          게시글 내용은 길드 회원만 볼 수 있어요. 상단의 <b>카카오 로그인</b>{" "}
          버튼을 눌러 로그인해주세요.
        </p>
      </section>
    );
  }

  const [post, comments, isAdmin] = await Promise.all([
    fetchPost(id),
    fetchComments(id),
    isAdminUser(user.id),
  ]);

  if (!post) notFound();

  return (
    <PostDetail
      board={board}
      post={post}
      initialComments={comments}
      currentUserId={user.id}
      isAdmin={isAdmin}
    />
  );
};

export default PostPage;
