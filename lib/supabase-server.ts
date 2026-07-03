import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const getSupabaseCookieClient = async (): Promise<SupabaseClient | null> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // 서버 컴포넌트에서 호출되면 쿠키를 쓸 수 없음 — 미들웨어가 세션을 갱신함
        }
      },
    },
  });
};

export const getAuthUser = async (): Promise<User | null> => {
  const supabase = await getSupabaseCookieClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
};

export const getDisplayName = (user: User): string => {
  const metadata = user.user_metadata ?? {};
  return (
    metadata.name ??
    metadata.full_name ??
    metadata.preferred_username ??
    "길드원"
  );
};
