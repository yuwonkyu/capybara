import type { Metadata } from "next";
import { Do_Hyeon, Gowun_Dodum } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const doHyeon = Do_Hyeon({
  weight: "400",
  subsets: ["latin"],
});

const gowunDodum = Gowun_Dodum({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "친절한 카피바라씨 길드 | 메이플 플래닛",
  description:
    "방송인 친절한 카피바라씨의 메이플 플래닛 길드 홈페이지. 공지사항, 업데이트, 자유게시판, 보스 사냥 게시판을 운영합니다.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps): JSX.Element => {
  return (
    <html lang="ko">
      <body
        className={`${doHyeon.className} ${gowunDodum.className} antialiased`}
      >
        <main className="relative mx-auto min-h-screen w-full max-w-6xl px-4 pb-12 pt-6 sm:px-8">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="blob-left" />
            <div className="blob-right" />
            <div className="sprinkle" />
          </div>

          <Header />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
};

export default RootLayout;
