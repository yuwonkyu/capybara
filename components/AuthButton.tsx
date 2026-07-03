"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const displayName = (user: User): string => {
  const metadata = user.user_metadata ?? {};
  return (
    metadata.name ??
    metadata.full_name ??
    metadata.preferred_username ??
    "길드원"
  );
};

const AuthButton = (): JSX.Element | null => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // 세션 확인 중에는 잠깐 숨겨서 로그인/로그아웃 버튼이 깜빡이지 않게 한다
  if (supabase && !ready) return null;

  const handleLogin = async () => {
    if (!supabase) {
      window.alert(
        "로그인 설정이 아직 완료되지 않았어요.\nNEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수를 확인해주세요."
      );
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(pathname)}`,
      },
    });
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.refresh();
  };

  if (!user) {
    return (
      <button
        type="button"
        onClick={handleLogin}
        className="font-body inline-flex items-center gap-1.5 rounded-full bg-[#FEE500] px-4 py-2 text-sm font-semibold text-[#191919] transition hover:-translate-y-0.5"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 3C6.48 3 2 6.54 2 10.9c0 2.8 1.86 5.26 4.66 6.66-.15.52-.97 3.36-1 3.58 0 0-.02.17.09.24.11.07.24.02.24.02.32-.05 3.66-2.4 4.24-2.81.58.08 1.17.13 1.77.13 5.52 0 10-3.54 10-7.82S17.52 3 12 3z" />
        </svg>
        카카오 로그인
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-body text-sm text-ink/80">
        <span className="font-semibold text-mintdeep">{displayName(user)}</span> 님
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="font-body rounded-full border border-sand bg-white px-3 py-1.5 text-xs text-ink/70 transition hover:bg-cream"
      >
        로그아웃
      </button>
    </div>
  );
};

export default AuthButton;
