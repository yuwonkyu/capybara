import { notFound } from "next/navigation";
import BoardList from "@/components/BoardList";
import { fetchBoardPosts } from "@/lib/posts";
import { BOARD_TYPES, getBoardConfig } from "@/lib/types";

// 목록은 로그인과 무관(제목·작성자·날짜만 공개)하므로 캐시해서 prefetch가 되게 한다.
// 새 글/삭제 시 API에서 revalidatePath로 즉시 갱신한다.
export const revalidate = 60;

export const generateStaticParams = () =>
  BOARD_TYPES.map((board) => ({ type: board.type }));

type BoardPageProps = { params: Promise<{ type: string }> };

const BoardPage = async ({ params }: BoardPageProps): Promise<JSX.Element> => {
  const { type } = await params;
  const board = getBoardConfig(type);
  if (!board) notFound();

  const posts = await fetchBoardPosts(board.type);

  return <BoardList board={board} posts={posts} />;
};

export default BoardPage;
