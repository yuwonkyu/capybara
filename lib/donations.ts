import { getSupabaseServerClient } from "@/lib/supabase";
import { MemberRole } from "@/lib/types";

// 길드 스킬 투자 1회당 기부 메소 (고정)
export const INVEST_UNIT_MAN = 500;

export const GUILDS = ["카피", "카피랜드"] as const;
export type GuildName = (typeof GUILDS)[number];

export const isGuildName = (value: unknown): value is GuildName =>
  typeof value === "string" && (GUILDS as readonly string[]).includes(value);

export type Donation = {
  id: string;
  user_id: string | null;
  nickname: string;
  guild: string;
  /** 만 메소 단위 (투자 횟수 × 500) */
  amount_man: number;
  invest_count: number;
  image_url: string | null;
  note: string | null;
  discord_user_id: string | null;
  discord_name: string | null;
  /** 인증 당시 디스코드에 쓴 메시지 원문 */
  discord_content: string | null;
  discord_message_id: string | null;
  discord_channel_id: string | null;
  /** 자동으로 횟수를 확정하지 못해 길마 확인이 필요한 기록 */
  needs_review: boolean;
  created_at: string;
};

/** 길마가 엑셀로 옮길 집계 행: 아이디 / 투자횟수 / 회원등급 */
export type DonorRow = {
  nickname: string;
  totalCount: number;
  totalMan: number;
  role: MemberRole | null;
};

export type DonationSummary = {
  totalMan: number;
  totalCount: number;
  donorCount: number;
  rows: DonorRow[];
};

const DONATION_FIELDS =
  "id, user_id, nickname, guild, amount_man, invest_count, image_url, note, discord_user_id, discord_name, discord_content, discord_message_id, discord_channel_id, needs_review, created_at";

export const fetchDonations = async (
  guild: GuildName,
  limit = 300
): Promise<Donation[] | null> => {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("donations")
      .select(DONATION_FIELDS)
      .eq("guild", guild)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Donation[];
  } catch {
    return null;
  }
};

// 디스코드 계정 ↔ 사이트 회원등급 매핑을 가져온다.
const fetchRoleMap = async (): Promise<{
  byDiscord: Map<string, MemberRole>;
  byUser: Map<string, MemberRole>;
}> => {
  const byDiscord = new Map<string, MemberRole>();
  const byUser = new Map<string, MemberRole>();

  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("members")
      .select("user_id, role, discord_user_id");

    for (const row of data ?? []) {
      const role = row.role as MemberRole;
      if (row.user_id) byUser.set(row.user_id as string, role);
      if (row.discord_user_id) byDiscord.set(row.discord_user_id as string, role);
    }
  } catch {
    // 등급 정보를 못 가져와도 집계는 계속한다
  }

  return { byDiscord, byUser };
};

// 기부 내역을 사람별로 합산해 엑셀용 표를 만든다.
export const summarize = async (
  donations: Donation[]
): Promise<DonationSummary> => {
  const { byDiscord, byUser } = await fetchRoleMap();

  // 같은 사람은 디스코드 ID → 사이트 계정 → 닉네임 순으로 묶는다
  const map = new Map<string, DonorRow>();

  for (const d of donations) {
    const key = d.discord_user_id ?? d.user_id ?? d.nickname;
    const role =
      (d.discord_user_id && byDiscord.get(d.discord_user_id)) ||
      (d.user_id && byUser.get(d.user_id)) ||
      null;

    const prev =
      map.get(key) ??
      ({ nickname: d.nickname, totalCount: 0, totalMan: 0, role } as DonorRow);

    prev.totalCount += d.invest_count;
    prev.totalMan += d.amount_man;
    if (!prev.role && role) prev.role = role;
    map.set(key, prev);
  }

  const rows = [...map.values()].sort(
    (a, b) => b.totalCount - a.totalCount || b.totalMan - a.totalMan
  );

  return {
    totalMan: donations.reduce((sum, d) => sum + d.amount_man, 0),
    totalCount: donations.reduce((sum, d) => sum + d.invest_count, 0),
    donorCount: rows.length,
    rows,
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
