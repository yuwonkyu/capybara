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
  metadataBase: new URL("https://capyguild.vercel.app"),
  title: {
    default: "친절한 카피바라씨 길드 | 메이플 플래닛",
    template: "%s | 친절한 카피바라씨 길드",
  },
  description:
    "방송인 친절한 카피바라씨의 메이플 플래닛 길드 홈페이지. 공지사항, 업데이트, 자유게시판, 공략, 사냥, 거래 게시판을 운영하는 길드원 전용 커뮤니티입니다.",
  keywords: [
    "친절한 카피바라씨",
    "카피바라 길드",
    "메이플 플래닛",
    "메이플랜드",
    "길드 홈페이지",
    "카피 길드",
  ],
  applicationName: "친절한 카피바라씨 길드",
  openGraph: {
    type: "website",
    siteName: "친절한 카피바라씨 길드",
    title: "친절한 카피바라씨 길드 | 메이플 플래닛",
    description:
      "방송인 친절한 카피바라씨의 메이플 플래닛 길드 홈페이지. 공지·공략·사냥·거래를 함께하는 길드 커뮤니티예요.",
    locale: "ko_KR",
    images: [
      {
        url: "/images/hi.png",
        width: 480,
        height: 480,
        alt: "친절한 카피바라씨 길드 마스코트",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "친절한 카피바라씨 길드 | 메이플 플래닛",
    description:
      "방송인 친절한 카피바라씨의 메이플 플래닛 길드 홈페이지.",
    images: ["/images/hi.png"],
  },
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
