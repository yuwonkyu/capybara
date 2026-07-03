import { notFound } from "next/navigation";
import EditPostLoader from "@/components/EditPostLoader";
import { getAuthUser } from "@/lib/supabase-server";
import { getBoardConfig } from "@/lib/types";

type EditPageProps = { params: Promise<{ type: string; id: string }> };

const EditPage = async ({ params }: EditPageProps): Promise<JSX.Element> => {
  const { type, id } = await params;
  const board = getBoardConfig(type);
  if (!board) notFound();

  const user = await getAuthUser();

  if (!user) {
    return (
      <section className="cute-card">
        <h1 className="title">{board.label} · 글 수정</h1>
        <p className="font-body text-ink/70">
          카카오 로그인 후 글을 수정할 수 있어요. 상단의 <b>카카오 로그인</b>{" "}
          버튼을 눌러주세요.
        </p>
      </section>
    );
  }

  return <EditPostLoader board={board} postId={id} currentUserId={user.id} />;
};

export default EditPage;
