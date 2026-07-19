import Image from "next/image";
import Link from "next/link";
import DonationRankings from "@/components/DonationRankings";
import LatestPosts from "@/components/LatestPosts";
import PopularPosts from "@/components/PopularPosts";
import ShortcutLinks from "@/components/ShortcutLinks";
import { fetchTopDonors } from "@/lib/donations";
import { GAME_INFO_LINKS } from "@/lib/links";
import { fetchBoardPosts, fetchPopularPosts } from "@/lib/posts";
import { BOARD_TYPES } from "@/lib/types";

// 홈은 로그인 여부와 무관한 부분만 서버에서 렌더하고 캐시한다.
// 새 글은 60초 이내 또는 글 작성 시 revalidatePath로 갱신된다.
export const revalidate = 60;

const highlights = [
  "방송인 친절한 카피바라씨의 길드",
  "치지직과 유튜브에서 활동 중",
];

const Home = async (): Promise<JSX.Element> => {
  const [notices, popular, capyTop, capylandTop] = await Promise.all([
    fetchBoardPosts("notice", 5),
    fetchPopularPosts(5),
    fetchTopDonors("카피", 3),
    fetchTopDonors("카피랜드", 3),
  ]);

  return (
    <>
      <section className="mb-5 overflow-hidden rounded-3xl border border-sand bg-gradient-to-br from-[#fbf8f1] via-[#e9f6ee] to-[#e7f2fa] shadow-candy">
        <div className="flex flex-col items-center gap-5 p-5 text-center sm:p-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-6 lg:p-8 lg:text-left">
          <div className="order-2 lg:order-1">
            <p className="font-body mb-2 inline-block rounded-full bg-white px-3 py-1 text-xs text-mintdeep">
              길드 전용 페이지
            </p>
            <h1 className="font-display text-3xl leading-tight text-mintdeep sm:text-5xl lg:text-6xl">
              같이 성장하는 카피 길드
            </h1>
            <p className="font-body mt-3 text-sm leading-6 text-ink/80 sm:text-base sm:leading-7">
              방송인 친절한 카피바라씨의 길드입니다. 서로 도와가며 성장하는
              분위기를 먼저 생각하고, 메이플 플래닛 안에서 친목과 보스 사냥을
              즐기는 길드예요.
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white px-3 py-1.5 font-body text-xs text-ink/80 shadow-sm sm:px-4 sm:py-2 sm:text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-[220px] sm:max-w-xs lg:order-2 lg:max-w-md">
            <div className="absolute inset-0 hidden translate-x-4 translate-y-4 rounded-[2rem] bg-mint lg:block" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white p-3 shadow-[0_18px_60px_rgba(79,157,130,0.2)] sm:p-4">
              <Image
                src="/images/hi.png"
                alt="귀여운 카피바라 캐릭터"
                width={480}
                height={480}
                className="h-auto w-full rounded-[1.25rem] object-cover"
                priority
              />
              <p className="font-body mt-3 text-center text-xs text-ink/70 sm:text-sm">
                귀여운 카피바라와 함께 성장하는 길드
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-2 gap-2.5 sm:gap-3">
        {BOARD_TYPES.map((board) => (
          <Link
            key={board.type}
            href={`/board/${board.type}`}
            className="cute-card block p-4 transition hover:-translate-y-1 sm:p-5"
          >
            <p className="font-display text-lg text-mintdeep sm:text-xl">{board.label}</p>
            <p className="font-body mt-1 line-clamp-2 text-xs text-ink/60 sm:text-sm">
              {board.description}
            </p>
          </Link>
        ))}
      </section>

      <section className="mb-5 grid gap-4 md:grid-cols-2">
        <LatestPosts board="notice" title="최근 공지" posts={notices} />
        <PopularPosts posts={popular} />
      </section>

      <section className="mb-5 grid gap-4 md:grid-cols-2">
        <DonationRankings guild="카피" donors={capyTop} />
        <DonationRankings guild="카피랜드" donors={capylandTop} />
      </section>

      <section className="mb-5 cute-card">
        <h2 className="title">바로가기</h2>
        <p className="font-body mb-3 text-sm text-ink/60">
          방송과 길드 채팅방은 아래 링크에서 만나볼 수 있어요.
        </p>
        <ShortcutLinks />
      </section>

      <section className="cute-card">
        <h2 className="title">게임 정보 사이트</h2>
        <p className="font-body mb-3 text-sm text-ink/60">
          시세 조회, 몬스터 정보 등 플레이에 도움되는 외부 사이트예요.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GAME_INFO_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-mint/30 p-3 font-body text-sm text-mintdeep shadow-sm transition hover:-translate-y-0.5 hover:bg-mint/60"
            >
              <p className="font-semibold">{link.label}</p>
              <p className="mt-0.5 hidden text-xs text-mintdeep/70 sm:block">
                {link.description}
              </p>
            </a>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;
