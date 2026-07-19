import Link from "next/link";
import { GuildName, TopDonor } from "@/lib/donations";

type DonationRankingsProps = {
  guild: GuildName;
  donors: TopDonor[];
};

const MEDALS = ["🥇", "🥈", "🥉"];

const DonationRankings = ({ guild, donors }: DonationRankingsProps): JSX.Element => {
  return (
    <article className="cute-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="title mb-0">🏆 {guild} 기부 랭킹</h2>
        <Link
          href={`/donations?guild=${encodeURIComponent(guild)}`}
          className="font-body text-xs text-mintdeep hover:underline"
        >
          전체보기
        </Link>
      </div>

      {donors.length === 0 ? (
        <p className="font-body text-sm text-ink/50">아직 기부 기록이 없어요.</p>
      ) : (
        <ol className="space-y-2">
          {donors.map((donor, index) => (
            <li
              key={donor.nickname + index}
              className="list-item flex items-center justify-between gap-2"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="w-6 shrink-0 text-center text-base">
                  {MEDALS[index] ?? index + 1}
                </span>
                <span className="truncate font-body text-sm font-semibold text-ink">
                  {donor.nickname}
                </span>
              </span>
              <span className="shrink-0 font-body text-sm font-semibold text-mintdeep">
                {donor.totalCount}회
              </span>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
};

export default DonationRankings;
