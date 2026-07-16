import DonationBoard from "@/components/DonationBoard";
import { isAdminUser } from "@/lib/admin";
import { GuildName, fetchDonations, isGuildName, summarize } from "@/lib/donations";
import { getAuthUser } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "길드 기부현황",
};

type DonationsPageProps = {
  searchParams: Promise<{ guild?: string }>;
};

const DonationsPage = async ({
  searchParams,
}: DonationsPageProps): Promise<JSX.Element> => {
  const user = await getAuthUser();

  if (!user) {
    return (
      <section className="cute-card">
        <h1 className="title">길드 기부현황</h1>
        <p className="font-body text-ink/70">
          기부현황은 길드 회원만 볼 수 있어요. 상단의 <b>카카오 로그인</b> 버튼을
          눌러주세요.
        </p>
      </section>
    );
  }

  const { guild: guildParam } = await searchParams;
  const guild: GuildName = isGuildName(guildParam) ? guildParam : "카피";

  const [donations, isAdmin] = await Promise.all([
    fetchDonations(guild),
    isAdminUser(user.id),
  ]);

  const summary = donations ? await summarize(donations) : null;

  return (
    <DonationBoard
      guild={guild}
      donations={donations}
      summary={summary}
      currentUserId={user.id}
      isAdmin={isAdmin}
    />
  );
};

export default DonationsPage;
