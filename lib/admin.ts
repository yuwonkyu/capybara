import { getSupabaseServerClient } from "@/lib/supabase";

export const isAdminUser = async (userId: string): Promise<boolean> => {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  return Boolean(data);
};
