export type ExternalLink = {
  label: string;
  href: string;
  description: string;
  /** true면 로그인한 회원에게만 노출 */
  membersOnly?: boolean;
};

export const EXTERNAL_LINKS: ExternalLink[] = [
  {
    label: "유튜브",
    href: "https://www.youtube.com/@kindcapybara",
    description: "친절한 카피바라씨 유튜브 채널",
  },
  {
    label: "치지직",
    href: "https://chzzk.naver.com/9b2596904acf13abf2ffb071118b3c71",
    description: "친절한 카피바라씨 치지직 방송",
  },
  {
    label: "카톡 자유채팅",
    href: "https://open.kakao.com/o/gGJ0OWAi",
    description: "길드원 자유 채팅방",
  },
  {
    label: "카톡 공지방",
    href: "https://open.kakao.com/o/gh9HKWAi",
    description: "길드 공지 전용 채팅방",
  },
  {
    label: "디스코드",
    href: "https://discord.com/invite/BCznYgcBZ",
    description: "길드 디스코드 서버 (회원 전용)",
    membersOnly: true,
  },
];

export const getVisibleLinks = (isLoggedIn: boolean): ExternalLink[] =>
  EXTERNAL_LINKS.filter((link) => !link.membersOnly || isLoggedIn);
