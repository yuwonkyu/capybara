"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthUser } from "@/lib/use-auth-user";
import { getAvatarUrl, getDisplayName } from "@/lib/user";

const AuthButton = (): JSX.Element | null => {
  const router = useRouter();
  const pathname = usePathname();
  const { supabase, user, ready } = useAuthUser();
  const [isMaster, setIsMaster] = useState(false);

  // 로그인 사용자의 등급을 확인해 길드마스터에게만 관리자 링크를 노출
  useEffect(() => {
    if (!user) {
      setIsMaster(false);
      return;
    }
    let cancelled = false;
    fetch("/api/me/role")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setIsMaster(data.role === "master");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

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
        // 카카오 앱에 설정된 동의항목만 요청한다 — 미설정 항목을 요청하면 KOE205 발생
        scopes: "profile_nickname",
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
        className="font-body inline-flex items-center gap-1.5 rounded-full border border-sand bg-white px-3 py-1.5 text-xs text-ink/70 transition hover:bg-cream"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 3C6.48 3 2 6.54 2 10.9c0 2.8 1.86 5.26 4.66 6.66-.15.52-.97 3.36-1 3.58 0 0-.02.17.09.24.11.07.24.02.24.02.32-.05 3.66-2.4 4.24-2.81.58.08 1.17.13 1.77.13 5.52 0 10-3.54 10-7.82S17.52 3 12 3z" />
        </svg>
        카카오 로그인
      </button>
    );
  }

  const avatarUrl = getAvatarUrl(user);

  return (
    <div className="flex items-center gap-2">
      {avatarUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt="프로필 사진"
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
