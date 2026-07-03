import { notFound } from "next/navigation";
import EditPostLoader from "@/components/EditPostLoader";
import { getBoardConfig } from "@/lib/types";

type EditPageProps = { params: Promise<{ type: string; id: string }> };

const EditPage = async ({ params }: EditPageProps): Promise<JSX.Element> => {
  const { type, id } = await params;
  const board = getBoardConfig(type);
  if (!board) notFound();

  return <EditPostLoader board={board} postId={id} />;
};

export default EditPage;
