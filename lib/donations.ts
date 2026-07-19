import { getSupabaseServerClient } from "@/lib/supabase";
import { DONATION_TIER_ROLES, MemberRole, donationTierRole } from "@/lib/types";

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

export type TopDonor = { nickname: string; totalCount: number };

// 홈 노출용: 길드별 기부 TOP N (닉네임 기준 투자 횟수 합산).
// 등급 매핑 없이 가볍게 집계한다.
export const fetchTopDonors = async (
  guild: GuildName,
  limit = 3
): Promise<TopDonor[]> => {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("donations")
      .select("nickname, invest_count, discord_user_id, user_id")
      .eq("guild", guild)
      .limit(1000);

    if (error) throw error;

    const map = new Map<string, TopDonor>();
    for (const d of data ?? []) {
      const key =
        (d.discord_user_id as string) ??
        (d.user_id as string) ??
        (d.nickname as string);
      const prev = map.get(key) ?? { nickname: d.nickname as string, totalCount: 0 };
      prev.totalCount += (d.invest_count as number) ?? 0;
      map.set(key, prev);
    }

    return [...map.values()]
      .filter((d) => d.totalCount > 0)
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, limit);
  } catch {
    return [];
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

/**
 * 누적 기부액(전 길드 합산)에 따라 회원 등급을 재계산한다.
 * 5천만 이상 → 카피바라, 1천만 이상 → 카피, 그 외 → 새싹.
 * 길드마스터/부마스터 등 관리자 등급은 건드리지 않는다.
 * 기부 등록·수정·삭제, 디스코드 동기화 뒤에 호출한다.
 */
export const syncDonationRoles = async (): Promise<{ updated: number }> => {
  try {
    const supabase = getSupabaseServerClient();

    const [{ data: donations }, { data: members }] = await Promise.all([
      supabase.from("donations").select("user_id, discord_user_id, amount_man"),
      supabase.from("members").select("user_id, role, discord_user_id"),
    ]);

    if (!members) return { updated: 0 };

    const discordToUser = new Map<string, string>(
      members
        .filter((m) => m.discord_user_id)
        .map((m) => [m.discord_user_id as string, m.user_id as string])
    );

    // 사이트 계정(user_id) 기준으로 총 기부액을 합산한다.
    // 디스코드 전용 기록은 discord_user_id가 연결된 계정에만 반영된다.
    const totals = new Map<string, number>();
    for (const d of donations ?? []) {
      const uid =
        (d.user_id as string | null) ??
        (d.discord_user_id ? discordToUser.get(d.discord_user_id as string) : undefined);
      if (!uid) continue;
      totals.set(uid, (totals.get(uid) ?? 0) + ((d.amount_man as number) ?? 0));
    }

    let updated = 0;
    for (const m of members) {
      const role = m.role as MemberRole;
      if (!DONATION_TIER_ROLES.includes(role)) continue; // 관리자 등급은 건너뜀

      const nextRole = donationTierRole(totals.get(m.user_id as string) ?? 0);
      if (nextRole === role) continue;

      const { error } = await supabase
        .from("members")
        .update({ role: nextRole })
        .eq("user_id", m.user_id);

      if (!error) updated += 1;
    }

    return { updated };
  } catch {
    return { updated: 0 };
  }
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
