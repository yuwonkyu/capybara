import { notFound } from "next/navigation";
import BoardList from "@/components/BoardList";
import { getBoardConfig } from "@/lib/types";

type BoardPageProps = { params: Promise<{ type: string }> };

const BoardPage = async ({ params }: BoardPageProps): Promise<JSX.Element> => {
  const { type } = await params;
  const board = getBoardConfig(type);
  if (!board) notFound();

  return <BoardList board={board} />;
};

export default BoardPage;
