"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButton from "@/components/AuthButton";
import { BOARD_TYPES } from "@/lib/types";
import { EXTERNAL_LINKS } from "@/lib/links";

const NAV_LINKS = [
  { href: "/", label: "홈" },
  ...BOARD_TYPES.map((board) => ({
    href: `/board/${board.type}`,
    label: board.label,
  })),
];

const Header = (): JSX.Element => {
  const pathname = usePathname();

  return (
    <header className="mb-5 rounded-3xl border border-white/60 bg-cream/80 p-4 shadow-candy backdrop-blur sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="shrink-0">
          <p className="font-display text-3xl text-mintdeep">친절한 카피바라씨</p>
          <p className="font-body text-xs text-ink/60">Maple Planet Guild Home</p>
        </Link>

        <div className="flex flex-col gap-2 md:items-end">
          <nav className="flex flex-wrap gap-1.5">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${isActive ? "nav-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <AuthButton />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-sand/60 pt-3">
        {EXTERNAL_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={link.description}
            className="font-body inline-flex items-center rounded-full bg-sky/50 px-3 py-1 text-xs font-semibold text-skydeep transition hover:-translate-y-0.5 hover:bg-sky/80"
          >
            {link.label}
          </a>
        ))}
      </div>
    </header>
  );
};

export default Header;
