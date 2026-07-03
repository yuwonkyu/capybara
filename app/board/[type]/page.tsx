import { notFound } from "next/navigation";
import BoardList from "@/components/BoardList";
import { fetchBoardPosts } from "@/lib/posts";
import { getBoardConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

type BoardPageProps = { params: Promise<{ type: string }> };

const BoardPage = async ({ params }: BoardPageProps): Promise<JSX.Element> => {
  const { type } = await params;
  const board = getBoardConfig(type);
  if (!board) notFound();

  const posts = await fetchBoardPosts(board.type);

  return <BoardList board={board} posts={posts} />;
};

export default BoardPage;
