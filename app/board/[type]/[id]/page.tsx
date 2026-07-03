import { notFound } from "next/navigation";
import PostDetail from "@/components/PostDetail";
import { isAdminUser } from "@/lib/admin";
import { getAuthUser } from "@/lib/supabase-server";
import { getBoardConfig } from "@/lib/types";

type PostPageProps = { params: Promise<{ type: string; id: string }> };

const PostPage = async ({ params }: PostPageProps): Promise<JSX.Element> => {
  const { type, id } = await params;
  const board = getBoardConfig(type);
  if (!board) notFound();

  const user = await getAuthUser();
  const isAdmin = user ? await isAdminUser(user.id) : false;

  return (
    <PostDetail
      board={board}
      postId={id}
      currentUserId={user?.id ?? null}
      isAdmin={isAdmin}
    />
  );
};

export default PostPage;
