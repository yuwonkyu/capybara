import Image from "next/image";
import heroImage from "../hi.png";

const notices = [
  "성장 중심 길드 운영",
  "메이플 플래닛 내 친목과 보스 사냥 적극 권장",
  "신생 길드라서 길드 스킬과 경험치 지원을 준비 중"
];

const schedules = [
  { day: "상시", activity: "친목 채팅 / 합류 사냥", time: "자율" },
  { day: "상시", activity: "보스 사냥 지원", time: "협의" },
  { day: "상시", activity: "경험치 성장 지원", time: "우선" }
];

const rules = [
  "딱딱한 제재보다는 서로 즐겁게 성장하는 분위기를 우선해요",
  "메이플 플래닛 안에서 같이 놀고, 같이 사냥하고, 같이 커가는 걸 좋아해요",
  "조용한 지원보다는 적극적인 참여가 더 잘 맞는 길드예요"
];

const highlights = [
  "방송인 친절한 카피바라씨의 길드",
  "치지직과 유튜브에서 활동 중",
  "길드 스킬로 경험치 향상 지원 예정"
];

const Home = (): JSX.Element => {
  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl px-4 pb-12 pt-6 sm:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="blob-left" />
        <div className="blob-right" />
        <div className="sprinkle" />
      </div>

      <header className="mb-5 flex flex-col gap-3 rounded-3xl border border-white/50 bg-cream/70 p-5 shadow-candy backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-4xl text-[#ff5f7c]">친절한 카피바라씨</p>
          <p className="font-body text-sm text-[#315f73]">Maple Planet Guild Home</p>
        </div>
        <a
          href="#join"
          className="font-body inline-flex w-fit items-center rounded-full bg-berry px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
        >
          길드 문의 바로가기
        </a>
      </header>

      <section className="mb-5 overflow-hidden rounded-3xl border border-[#ffd7df] bg-gradient-to-br from-[#fff8de] via-[#ffe9ef] to-[#eaf8ff] shadow-candy">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-8">
          <div>
            <p className="font-body mb-2 inline-block rounded-full bg-white px-3 py-1 text-xs text-[#e35d78]">길드 전용 페이지</p>
            <h1 className="font-display text-5xl leading-tight text-[#f86384] sm:text-6xl">같이 성장하는 카피 길드</h1>
            <p className="font-body mt-3 max-w-2xl text-base leading-7 text-[#365f70]">
              방송인 친절한 카피바라씨의 길드입니다. 제재나 딱딱한 룰보다 서로 도와가며 성장하는 분위기를 먼저 생각하고,
              메이플 플래닛 안에서 친목과 보스 사냥을 적극적으로 즐기는 길드예요.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {highlights.map((item) => (
                <span key={item} className="rounded-full bg-white px-4 py-2 font-body text-sm text-[#365f70] shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] bg-[#ffbfd0]" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-4 shadow-[0_18px_60px_rgba(255,141,161,0.25)]">
              <Image
                src={heroImage}
                alt="귀여운 카피바라 캐릭터"
                className="h-auto w-full rounded-[1.5rem] object-cover"
                priority
              />
              <p className="font-body mt-4 text-center text-sm text-[#365f70]">
                귀여운 카피바라와 함께, 천천히 하지만 확실하게 성장하는 길드
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="cute-card">
          <h2 className="title">오늘의 공지</h2>
          <ul className="space-y-2 font-body text-[#365f70]">
            {notices.map((item) => (
              <li key={item} className="list-item">
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="cute-card">
          <h2 className="title">이번 주 일정</h2>
          <p className="font-body mb-3 text-sm text-[#6a8693]">정해진 강제 일정보다, 같이 모여서 즐기는 흐름을 우선합니다.</p>
          <ul className="space-y-2">
            {schedules.map((schedule) => (
              <li key={`${schedule.day}-${schedule.activity}`} className="font-body grid grid-cols-[40px_1fr] gap-2 text-[#365f70]">
                <span className="day-pill">{schedule.day}</span>
                <p className="pt-1">{schedule.activity} ({schedule.time})</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="cute-card">
          <h2 className="title">길드 규칙</h2>
          <ol className="font-body list-decimal space-y-2 pl-5 text-[#365f70]">
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </article>

        <article id="join" className="cute-card animate-floaty">
          <h2 className="title">가입 안내</h2>
          <p className="font-body text-[#365f70]">
            성장 의지가 있고, 메이플 플래닛에서 같이 친목도 하고 보스도 잡고 싶은 분이라면 누구나 환영해요.
            방송은 치지직과 유튜브에서 만나볼 수 있어요.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="https://www.youtube.com/@kindcapybara" className="font-body inline-flex items-center rounded-xl bg-white px-4 py-2 text-[#365f70] shadow-sm transition hover:-translate-y-0.5">
              유튜브 채널 보기
            </a>
            <span className="font-display inline-flex items-center rounded-xl border-2 border-dashed border-[#ff9eb0] bg-white px-4 py-2 text-xl text-[#ff6383]">
              CAPI_GUILD#PLANET
            </span>
          </div>
        </article>
      </section>
    </main>
  );
};

export default Home;
