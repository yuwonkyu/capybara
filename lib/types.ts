export type BoardType = "notice" | "update" | "free" | "guide" | "hunt" | "share";

export type BoardConfig = {
  type: BoardType;
  label: string;
  description: string;
  /** 있으면 내부 게시판 대신 이 외부 주소로 바로 이동한다 (글쓰기 없음) */
  externalUrl?: string;
};

export const BOARD_TYPES: BoardConfig[] = [
  {
    type: "notice",
    label: "공지사항",
    description: "길드 운영진이 전달하는 공지를 확인하세요.",
  },
  {
    type: "free",
    label: "게시판",
    description: "자유·공략·파티·거래 메뉴로 나눠 이야기해요.",
  },
];

export const getBoardConfig = (type: string): BoardConfig | undefined =>
  BOARD_TYPES.find((board) => board.type === type);

export const ADMIN_ONLY_BOARDS: BoardType[] = ["notice"];

// 게시판별 말머리 목록 (여기 등록된 게시판만 말머리 사용)
export const BOARD_CATEGORIES: Partial<Record<BoardType, readonly string[]>> = {
  free: ["자유", "공략", "파티", "거래"],
};

export const CATEGORY_BOARDS = Object.keys(BOARD_CATEGORIES) as BoardType[];

export const isValidCategory = (
  boardType: BoardType,
  category: unknown
): boolean => {
  const categories = BOARD_CATEGORIES[boardType];
  if (!categories) return true; // 말머리 없는 게시판
  return typeof category === "string" && categories.includes(category);
};

// 회원 등급 (권한 높은 순)
export type MemberRole = "master" | "submaster" | "staff" | "member" | "sprout";

export const ROLE_LABELS: Record<MemberRole, string> = {
  master: "길드마스터",
  submaster: "부마스터",
  staff: "STAFF",
  member: "친절한카피",
  sprout: "새싹",
};

export const ROLE_ORDER: MemberRole[] = [
  "master",
  "submaster",
  "staff",
  "member",
  "sprout",
];

// 공지 작성·글 관리 권한을 가진 등급
export const ADMIN_ROLES: MemberRole[] = ["master", "submaster", "staff"];

export type Post = {
  id: string;
  board_type: BoardType;
  title: string;
  content: string;
  nickname: string;
  user_id: string | null;
  image_urls: string[] | null;
  category: string | null;
  views: number;
  created_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  nickname: string;
  content: string;
  user_id: string | null;
  created_at: string;
};

// created_at이 최근 며칠 이내인지 판단 (신규글 ✨ 표시용)
export const isRecentPost = (createdAt: string, days = 7): boolean => {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  return now - created <= days * 24 * 60 * 60 * 1000;
};
