import type { Metadata } from "next";
import { Do_Hyeon, Gowun_Dodum } from "next/font/google";
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
    "방송인 친절한 카피바라씨의 메이플 플래닛 길드 소개 페이지. 친목, 보스 사냥, 성장 지원 중심의 신생 길드입니다.",
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
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
