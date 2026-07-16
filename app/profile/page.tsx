import Link from "next/link";
import MyPosts from "@/components/MyPosts";
import ProfileForm from "@/components/ProfileForm";
import { isMasterUser } from "@/lib/admin";
import { fetchMyPosts } from "@/lib/posts";
import { getAuthUser } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "내 정보 관리",
};

const ProfilePage = async (): Promise<JSX.Element> => {
  const user = await getAuthUser();

  if (!user) {
    return (
      <section className="cute-card">
        <h1 className="title">내 정보 관리</h1>
        <p className="font-body text-ink/70">
          카카오 로그인 후 이용할 수 있어요. 상단의 <b>카카오 로그인</b> 버튼을
          눌러주세요.
        </p>
      </section>
    );
  }

  const [myPosts, isMaster] = await Promise.all([
    fetchMyPosts(user.id),
    isMasterUser(user.id),
  ]);

  return (
    <div className="space-y-4">
      <ProfileForm />

      {/* 길드마스터에게만 보이는 회원 관리 진입점 */}
      {isMaster && (
        <section className="cute-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="title mb-1">👑 길드마스터 메뉴</h2>
              <p className="font-body text-sm text-ink/60">
                길드원 목록을 보고 등급 변경·추방을 할 수 있어요.
              </p>
            </div>
            <Link href="/admin" className="btn-primary">
              회원 관리하기
            </Link>
          </div>
        </section>
      )}

      <MyPosts posts={myPosts} />
    </div>
  );
};

export default ProfilePage;
