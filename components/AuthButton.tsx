"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { optimizedImageUrl } from "@/lib/optimized-image";
import { useAuthUser } from "@/lib/use-auth-user";
import { getAvatarUrl, getDisplayName } from "@/lib/user";

const AuthButton = (): JSX.Element | null => {
  const router = useRouter();
  const pathname = usePathname();
  const { supabase, user, ready } = useAuthUser();
  const [isMaster, setIsMaster] = useState(false);

  // 로그인 사용자의 등급을 확인해 길드마스터에게만 관리자 링크를 노출.
  // 등급은 자주 바뀌지 않으므로 세션 동안 캐시해 페이지마다 재조회하지 않는다.
  useEffect(() => {
    if (!user) {
      setIsMaster(false);
      return;
    }

    const cacheKey = `role_${user.id}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setIsMaster(cached === "master");
      return;
    }

    let cancelled = false;
    fetch("/api/me/role")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.role) sessionStorage.setItem(cacheKey, data.role);
        setIsMaster(data.role === "master");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  // 세션 확인 중에는 잠깐 숨겨서 로그인/로그아웃 버튼이 깜빡이지 않게 한다
  if (supabase && !ready) return null;

  const handleLogin = async (provider: "kakao" | "discord") => {
    if (!supabase) {
      window.alert(
        "로그인 설정이 아직 완료되지 않았어요.\nNEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수를 확인해주세요."
      );
      return;
    }
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(pathname)}`;
    if (provider === "kakao") {
      await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo,
          // 카카오 앱에 설정된 동의항목만 요청한다 — 미설정 항목을 요청하면 KOE205 발생
          scopes: "profile_nickname",
        },
      });
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo },
    });
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.refresh();
  };

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleLogin("kakao")}
          className="font-body inline-flex items-center gap-1.5 rounded-full border border-sand bg-white px-3 py-1.5 text-xs text-ink/70 transition hover:bg-cream"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 3C6.48 3 2 6.54 2 10.9c0 2.8 1.86 5.26 4.66 6.66-.15.52-.97 3.36-1 3.58 0 0-.02.17.09.24.11.07.24.02.24.02.32-.05 3.66-2.4 4.24-2.81.58.08 1.17.13 1.77.13 5.52 0 10-3.54 10-7.82S17.52 3 12 3z" />
          </svg>
          카카오 로그인
        </button>
        <button
          type="button"
          onClick={() => handleLogin("discord")}
          className="font-body inline-flex items-center gap-1.5 rounded-full border border-sand bg-white px-3 py-1.5 text-xs text-ink/70 transition hover:bg-cream"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.45.87-.61 1.26a18.3 18.3 0 0 0-5.48 0 12.6 12.6 0 0 0-.62-1.26.08.08 0 0 0-.08-.04c-1.7.29-3.36.8-4.89 1.52a.07.07 0 0 0-.03.03C.53 8.09-.32 11.7.1 15.26a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 6 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-2a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.9.08.08 0 0 1-.01-.13c.13-.09.25-.19.37-.28a.07.07 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08.01c.12.1.24.19.37.28a.08.08 0 0 1-.01.13c-.6.35-1.22.65-1.87.9a.08.08 0 0 0-.04.11c.36.7.78 1.37 1.23 2a.08.08 0 0 0 .08.03 19.8 19.8 0 0 0 6.01-3.03.08.08 0 0 0 .03-.06c.5-4.13-.42-7.7-1.77-10.86a.06.06 0 0 0-.03-.03zM8.02 13.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42z" />
          </svg>
          디스코드 로그인
        </button>
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(user);

  return (
    <div className="flex items-center gap-2">
      {avatarUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={optimizedImageUrl(avatarUrl, 96)}
          alt="프로필 사진"
          loading="lazy"
          decoding="async"
          className="h-7 w-7 rounded-full border border-sand object-cover"
        />
      )}
      <span className="font-body text-sm text-ink/80">
        <span className="font-semibold text-mintdeep">{getDisplayName(user)}</span> 님
      </span>
      {isMaster && (
        <Link
          href="/admin"
          className="font-body rounded-full border border-mintdeep/40 bg-mint/40 px-3 py-1.5 text-xs font-semibold text-mintdeep transition hover:bg-mint/60"
        >
          관리자
        </Link>
      )}
      <Link
        href="/profile"
        className="font-body rounded-full border border-sand bg-white px-3 py-1.5 text-xs text-ink/70 transition hover:bg-cream"
      >
        내 정보
      </Link>
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
