import Image from "next/image";
import Link from "next/link";
import LatestPosts from "@/components/LatestPosts";
import PopularPosts from "@/components/PopularPosts";
import ShortcutLinks from "@/components/ShortcutLinks";
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

const ExternalIcon = (): JSX.Element => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className="inline-block"
  >
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

const Home = async (): Promise<JSX.Element> => {
  const [notices, popular] = await Promise.all([
    fetchBoardPosts("notice", 5),
    fetchPopularPosts(5),
  ]);

  return (
    <>
      <section className="mb-5 overflow-hidden rounded-3xl border border-sand bg-gradient-to-br from-[#fbf8f1] via-[#e9f6ee] to-[#e7f2fa] shadow-candy">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-8">
          <div>
            <p className="font-body mb-2 inline-block rounded-full bg-white px-3 py-1 text-xs text-mintdeep">
              길드 전용 페이지
            </p>
            <h1 className="font-display text-5xl leading-tight text-mintdeep sm:text-6xl">
              같이 성장하는 카피 길드
            </h1>
            <p className="font-body mt-3 max-w-2xl text-base leading-7 text-ink/80">
              방송인 친절한 카피바라씨의 길드입니다. 제재나 딱딱한 룰보다 서로
              도와가며 성장하는 분위기를 먼저 생각하고, 메이플 플래닛 안에서
              친목과 보스 사냥을 적극적으로 즐기는 길드예요.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white px-4 py-2 font-body text-sm text-ink/80 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] bg-mint" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-4 shadow-[0_18px_60px_rgba(79,157,130,0.2)]">
              <Image
                src="/images/hi.png"
                alt="귀여운 카피바라 캐릭터"
                width={480}
                height={480}
                className="h-auto w-full rounded-[1.5rem] object-cover"
                priority
              />
              <p className="font-body mt-4 text-center text-sm text-ink/70">
                귀여운 카피바라와 함께, 천천히 하지만 확실하게 성장하는 길드
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {BOARD_TYPES.map((board) =>
          board.externalUrl ? (
            <a
              key={board.type}
              href={board.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cute-card block transition hover:-translate-y-1"
            >
              <p className="font-display text-xl text-mintdeep flex items-center gap-1.5">
                {board.label}
                <ExternalIcon />
              </p>
              <p className="font-body mt-1 flex items-center gap-1 text-sm text-mintdeep/80">
                업데이트 내용 보러가기
                <ExternalIcon />
              </p>
            </a>
          ) : (
            <Link
              key={board.type}
              href={`/board/${board.type}`}
              className="cute-card block transition hover:-translate-y-1"
            >
              <p className="font-display text-xl text-mintdeep">{board.label}</p>
              <p className="font-body mt-1 text-sm text-ink/60">{board.description}</p>
            </Link>
          )
        )}
      </section>

      <section className="mb-5 grid gap-4 md:grid-cols-2">
        <LatestPosts board="notice" title="최근 공지" posts={notices} />
        <PopularPosts posts={popular} />
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
              <p className="mt-0.5 text-xs text-mintdeep/70">{link.description}</p>
            </a>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;
