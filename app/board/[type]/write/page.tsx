import { notFound } from "next/navigation";
import PostForm from "@/components/PostForm";
import { getBoardConfig } from "@/lib/types";

type WritePageProps = { params: Promise<{ type: string }> };

const WritePage = async ({ params }: WritePageProps): Promise<JSX.Element> => {
  const { type } = await params;
  const board = getBoardConfig(type);
  if (!board) notFound();

  return <PostForm board={board} mode="create" />;
};

export default WritePage;
