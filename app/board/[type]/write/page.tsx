import { notFound } from "next/navigation";
import PostForm from "@/components/PostForm";
import { isAdminUser } from "@/lib/admin";
import { getAuthUser } from "@/lib/supabase-server";
import { ADMIN_ONLY_BOARDS, getBoardConfig } from "@/lib/types";

type WritePageProps = { params: Promise<{ type: string }> };

const WritePage = async ({ params }: WritePageProps): Promise<JSX.Element> => {
  const { type } = await params;
  const board = getBoardConfig(type);
  if (!board) notFound();

  const user = await getAuthUser();

  if (!user) {
    return (
      <section className="cute-card">
        <h1 className="title">{board.label} · 글쓰기</h1>
        <p className="font-body text-ink/70">
          카카오 로그인 후 글을 쓸 수 있어요. 상단의 <b>카카오 로그인</b> 버튼을
          눌러주세요.
        </p>
      </section>
    );
  }

  if (ADMIN_ONLY_BOARDS.includes(board.type) && !(await isAdminUser(user.id))) {
    return (
      <section className="cute-card">
        <h1 className="title">{board.label} · 글쓰기</h1>
        <p className="font-body text-ink/70">
          이 게시판은 길드 관리자만 글을 쓸 수 있어요.
        </p>
      </section>
    );
  }

  return <PostForm board={board} mode="create" />;
};

export default WritePage;
