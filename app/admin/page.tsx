import Link from "next/link";
import AdminMembers from "@/components/AdminMembers";
import { isMasterUser } from "@/lib/admin";
import { listMembers } from "@/lib/members";
import { getAuthUser } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "관리자 · 길드원 관리",
};

const AdminPage = async (): Promise<JSX.Element> => {
  const user = await getAuthUser();

  if (!user) {
    return (
      <section className="cute-card">
        <h1 className="title">관리자 페이지</h1>
        <p className="font-body text-ink/70">
          카카오 로그인 후 이용할 수 있어요.
        </p>
      </section>
    );
  }

  if (!(await isMasterUser(user.id))) {
    return (
      <section className="cute-card">
        <h1 className="title">관리자 페이지</h1>
        <p className="font-body text-ink/70">
          이 페이지는 길드마스터만 접근할 수 있어요.
        </p>
        <Link href="/" className="btn-secondary mt-4 inline-flex">
          홈으로
        </Link>
      </section>
    );
  }

  const members = await listMembers();

  return <AdminMembers initialMembers={members} currentUserId={user.id} />;
};

export default AdminPage;
