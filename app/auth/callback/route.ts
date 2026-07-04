import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getSupabaseCookieClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") ? next : "/";

  if (code) {
    const supabase = await getSupabaseCookieClient();
    if (supabase) {
      const { data } = await supabase.auth.exchangeCodeForSession(code);

      // 첫 로그인이면 회원 등급을 새싹으로 등록 (이미 있으면 유지)
      const userId = data.user?.id;
      if (userId) {
        try {
          const admin = getSupabaseServerClient();
          await admin
            .from("members")
            .upsert(
              { user_id: userId, role: "sprout" },
              { onConflict: "user_id", ignoreDuplicates: true }
            );
        } catch {
          // 등급 등록 실패는 로그인 흐름을 막지 않는다
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
