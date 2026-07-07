import MyPosts from "@/components/MyPosts";
import ProfileForm from "@/components/ProfileForm";
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

  const myPosts = await fetchMyPosts(user.id);

  return (
    <div className="space-y-4">
      <ProfileForm />
      <MyPosts posts={myPosts} />
    </div>
  );
};

export default ProfilePage;
