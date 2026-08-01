import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage 공개 이미지를 /_next/image 로 최적화·프록시하기 위한 허용 목록
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // 업로드 파일명이 UUID(불변)이므로 최적화 결과를 31일간 캐시해도 안전하다
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
