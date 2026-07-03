export type BoardType = "notice" | "update" | "free" | "guide" | "hunt" | "share";

export type BoardConfig = {
  type: BoardType;
  label: string;
  description: string;
};

export const BOARD_TYPES: BoardConfig[] = [
  {
    type: "notice",
    label: "공지사항",
    description: "길드 운영진이 전달하는 공지를 확인하세요.",
  },
  {
    type: "update",
    label: "업데이트",
    description: "길드 소식과 변경 사항을 기록합니다.",
  },
  {
    type: "free",
    label: "자유게시판",
    description: "길드원들의 자유로운 이야기 공간이에요.",
  },
  {
    type: "guide",
    label: "공략",
    description: "보스·사냥터 공략과 팁을 공유해요.",
  },
  {
    type: "hunt",
    label: "사냥",
    description: "사냥 파티, 보스 파티 모집은 여기에!",
  },
  {
    type: "share",
    label: "나눔",
    description: "아이템 나눔과 교환 이야기 공간이에요.",
  },
];

export const getBoardConfig = (type: string): BoardConfig | undefined =>
  BOARD_TYPES.find((board) => board.type === type);

export const ADMIN_ONLY_BOARDS: BoardType[] = ["notice"];

export type Post = {
  id: string;
  board_type: BoardType;
  title: string;
  content: string;
  nickname: string;
  user_id: string | null;
  image_urls: string[] | null;
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
