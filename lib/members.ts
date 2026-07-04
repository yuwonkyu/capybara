import { getSupabaseServerClient } from "@/lib/supabase";
import { MemberRole, ROLE_ORDER } from "@/lib/types";

export type MemberInfo = {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  role: MemberRole;
  joinedAt: string;
};

const pickNickname = (metadata: Record<string, unknown>): string =>
  (metadata.custom_nickname as string) ??
  (metadata.name as string) ??
  (metadata.full_name as string) ??
  (metadata.preferred_username as string) ??
  "길드원";

const pickAvatar = (metadata: Record<string, unknown>): string | null =>
  (metadata.custom_avatar_url as string) ??
  (metadata.avatar_url as string) ??
  null;

// 가입한 모든 회원을 등급과 함께 반환 (관리자 페이지용)
export const listMembers = async (): Promise<MemberInfo[]> => {
  const supabase = getSupabaseServerClient();

  const { data: authData, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) throw error;

  const { data: roleRows } = await supabase.from("members").select("user_id, role");
  const roleMap = new Map<string, MemberRole>(
    (roleRows ?? []).map((r) => [r.user_id as string, r.role as MemberRole])
  );

  const members: MemberInfo[] = authData.users.map((user) => {
    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
    return {
      userId: user.id,
      nickname: pickNickname(metadata),
      avatarUrl: pickAvatar(metadata),
      role: roleMap.get(user.id) ?? "sprout",
      joinedAt: user.created_at,
    };
  });

  // 등급 높은 순 → 같은 등급이면 가입 빠른 순
  members.sort((a, b) => {
    const roleDiff = ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role);
    if (roleDiff !== 0) return roleDiff;
    return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
  });

  return members;
};
