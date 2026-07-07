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

// 길드 소셜 링크와는 별개로, 게임 플레이에 도움되는 외부 정보 사이트 모음
export const GAME_INFO_LINKS: ExternalLink[] = [
  {
    label: "플래닛 헬퍼",
    href: "https://planet-helper.com/",
    description: "메이플 플래닛 공략·정보 도우미 사이트",
  },
  {
    label: "플래닛지지",
    href: "https://mapleplanet.gg/",
    description: "메이플 플래닛 경매장 실시간 시세",
  },
  {
    label: "마플래닛",
    href: "https://maplanet.net/",
    description: "메이플 플래닛 시세 확인 및 기타 정보",
  },
  {
    label: "메이플노트클래식",
    href: "https://xn--o80b01o9mlw3kdzc.com/monsternote",
    description: "몬스터 정보 등 게임 정보 모음",
  },
];
