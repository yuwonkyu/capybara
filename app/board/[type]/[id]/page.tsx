import { notFound } from "next/navigation";
import PostDetail from "@/components/PostDetail";
import { getBoardConfig } from "@/lib/types";

type PostPageProps = { params: Promise<{ type: string; id: string }> };

const PostPage = async ({ params }: PostPageProps): Promise<JSX.Element> => {
  const { type, id } = await params;
  const board = getBoardConfig(type);
  if (!board) notFound();

  return <PostDetail board={board} postId={id} />;
};

export default PostPage;
