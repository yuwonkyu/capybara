import { notFound } from "next/navigation";
import PostDetail from "@/components/PostDetail";
import { isAdminUser } from "@/lib/admin";
import { fetchComments, fetchPostWithViewIncrement } from "@/lib/posts";
import { getAuthUser } from "@/lib/supabase-server";
import { getBoardConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

type PostPageProps = { params: Promise<{ type: string; id: string }> };

const PostPage = async ({ params }: PostPageProps): Promise<JSX.Element> => {
  const { type, id } = await params;
  const board = getBoardConfig(type);
  if (!board) notFound();

  const [post, comments, user] = await Promise.all([
    fetchPostWithViewIncrement(id),
    fetchComments(id),
    getAuthUser(),
  ]);

  if (!post) notFound();

  const isAdmin = user ? await isAdminUser(user.id) : false;

  return (
    <PostDetail
      board={board}
      post={post}
      initialComments={comments}
      currentUserId={user?.id ?? null}
      isAdmin={isAdmin}
    />
  );
};

export default PostPage;
