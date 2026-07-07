"use client";

import { getVisibleLinks } from "@/lib/links";
import { useAuthUser } from "@/lib/use-auth-user";

// 홈 "바로가기" 섹션 — 로그인 여부에 따라 회원 전용 링크(디스코드)를 노출.
// 클라이언트에서 판단하므로 홈 페이지 자체는 정적으로 캐시할 수 있다.
const ShortcutLinks = (): JSX.Element => {
  const { user } = useAuthUser();
  const links = getVisibleLinks(Boolean(user));

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-sky/30 p-3 font-body text-sm text-skydeep shadow-sm transition hover:-translate-y-0.5 hover:bg-sky/60"
        >
          <p className="font-semibold">{link.label}</p>
          <p className="mt-0.5 text-xs text-skydeep/70">{link.description}</p>
        </a>
      ))}
    </div>
  );
};

export default ShortcutLinks;
