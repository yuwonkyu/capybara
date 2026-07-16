import { getSupabaseServerClient } from "@/lib/supabase";

export type Donation = {
  id: string;
  user_id: string | null;
  nickname: string;
  /** 만 메소 단위 (예: 500 = 500만 메소) */
  amount_man: number;
  invest_count: number;
  skill: string | null;
  image_url: string | null;
  note: string | null;
  created_at: string;
};

export type DonorRank = {
  nickname: string;
  totalMan: number;
  totalCount: number;
};

export type DonationSummary = {
  totalMan: number;
  totalCount: number;
  donorCount: number;
  ranks: DonorRank[];
};

// 길드 스킬 투자 1회 기준 메소 (안내용)
export const INVEST_UNIT_MAN = 500;

export const GUILD_SKILLS = [
  "경험치 증가",
  "보스 공격력 증가",
  "기타",
] as const;

export const fetchDonations = async (
  limit = 100
): Promise<Donation[] | null> => {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("donations")
      .select(
        "id, user_id, nickname, amount_man, invest_count, skill, image_url, note, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Donation[];
  } catch {
    return null;
  }
};

// 기부 내역을 닉네임 기준으로 합산해 랭킹과 총계를 만든다.
export const summarize = (donations: Donation[]): DonationSummary => {
  const map = new Map<string, DonorRank>();

  for (const d of donations) {
    const key = d.nickname;
    const prev = map.get(key) ?? { nickname: key, totalMan: 0, totalCount: 0 };
    prev.totalMan += d.amount_man;
    prev.totalCount += d.invest_count;
    map.set(key, prev);
  }

  const ranks = [...map.values()].sort(
    (a, b) => b.totalMan - a.totalMan || b.totalCount - a.totalCount
  );

  return {
    totalMan: donations.reduce((sum, d) => sum + d.amount_man, 0),
    totalCount: donations.reduce((sum, d) => sum + d.invest_count, 0),
    donorCount: ranks.length,
    ranks,
  };
};

// 만 메소를 읽기 좋게 표시 (예: 12,345만 / 1억 2,345만)
export const formatMan = (man: number): string => {
  if (man >= 10000) {
    const eok = Math.floor(man / 10000);
    const rest = man % 10000;
    return rest === 0
      ? `${eok.toLocaleString()}억`
      : `${eok.toLocaleString()}억 ${rest.toLocaleString()}만`;
  }
  return `${man.toLocaleString()}만`;
};
