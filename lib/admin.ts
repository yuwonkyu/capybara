import { getSupabaseServerClient } from "@/lib/supabase";
import { ADMIN_ROLES, MemberRole } from "@/lib/types";

// 로그인한 사용자의 등급을 조회한다. members에 없으면 새싹으로 등록 후 반환.
export const getMemberRole = async (userId: string): Promise<MemberRole> => {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("members")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (data?.role) return data.role as MemberRole;

  // 첫 로그인 등 아직 등급이 없는 회원은 새싹으로 등록
  await supabase
    .from("members")
    .upsert({ user_id: userId, role: "sprout" }, { onConflict: "user_id" });

  return "sprout";
};

// 공지 작성·글 관리 권한이 있는 등급인지
export const isAdminUser = async (userId: string): Promise<boolean> => {
  const role = await getMemberRole(userId);
  return ADMIN_ROLES.includes(role);
};

// 길드마스터(회원 관리 권한)인지
export const isMasterUser = async (userId: string): Promise<boolean> => {
  const role = await getMemberRole(userId);
  return role === "master";
};
