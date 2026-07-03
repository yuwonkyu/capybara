import Image from "next/image";
import Link from "next/link";
import LatestPosts from "@/components/LatestPosts";
import { getVisibleLinks } from "@/lib/links";
import { fetchBoardPosts } from "@/lib/posts";
import { getAuthUser } from "@/lib/supabase-server";
import { BOARD_TYPES } from "@/lib/types";

export const dynamic = "force-dynamic";

const highlights = [
  "방송인 친절한 카피바라씨의 길드",
  "치지직과 유튜브에서 활동 중",
  "길드 스킬로 경험치 향상 지원 예정",
];

const Home = async (): Promise<JSX.Element> => {
  const [user, notices, updates] = await Promise.all([
    getAuthUser(),
    fetchBoardPosts("notice", 5),
    fetchBoardPosts("update", 5),
  ]);
  const shortcutLinks = getVisibleLinks(Boolean(user));

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
        {BOARD_TYPES.map((board) => (
          <Link
            key={board.type}
            href={`/board/${board.type}`}
            className="cute-card block transition hover:-translate-y-1"
          >
            <p className="font-display text-xl text-mintdeep">{board.label}</p>
            <p className="font-body mt-1 text-sm text-ink/60">{board.description}</p>
          </Link>
        ))}
      </section>

      <section className="mb-5 grid gap-4 md:grid-cols-2">
        <LatestPosts board="notice" title="최근 공지" posts={notices} />
        <LatestPosts board="update" title="최근 업데이트" posts={updates} />
      </section>

      <section className="cute-card">
        <h2 className="title">바로가기</h2>
        <p className="font-body mb-3 text-sm text-ink/60">
          방송과 길드 채팅방은 아래 링크에서 만나볼 수 있어요.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {shortcutLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-sky/30 p-3 font-body text-sm text-skydeep shadow-sm transition hover:-translate-y-0.5 hover:bg-sky/60"
            >
              <p className="font-semibold">{link.label}</p>
              <p className="mt-0.5 text-xs text-skydeep/70">{link.description}</p>
            </a>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;
