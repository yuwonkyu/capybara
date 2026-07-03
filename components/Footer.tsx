import { EXTERNAL_LINKS } from "@/lib/links";

const Footer = (): JSX.Element => {
  return (
    <footer className="mt-8 rounded-3xl border border-white/60 bg-cream/70 p-5 text-center shadow-candy backdrop-blur">
      <p className="font-display text-lg text-mintdeep">친절한 카피바라씨 길드</p>
      <p className="font-body mt-1 text-xs text-ink/60">
        메이플 플래닛 · 친목과 보스 사냥을 함께하는 길드
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-3 font-body text-xs text-ink/50">
        {EXTERNAL_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-skydeep hover:underline"
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
