// Supabase Storage 공개 URL만 Vercel 이미지 최적화(/_next/image)를 거치게 한다.
// 최적화 결과는 Vercel CDN에 캐시되므로 반복 조회가 Supabase 이그레스(캐시드 이그레스)를
// 소모하지 않는다. 카카오 프로필 등 외부 URL은 원본 그대로 반환한다.
const SUPABASE_STORAGE_PATH = "/storage/v1/object/public/";

// next.config images의 기본 허용 폭(deviceSizes/imageSizes)에 있는 값만 쓸 수 있다.
export type OptimizedWidth = 96 | 256 | 640 | 1080 | 1920;

export const optimizedImageUrl = (url: string, width: OptimizedWidth): string => {
  try {
    const parsed = new URL(url);
    const isSupabaseStorage =
      parsed.hostname.endsWith(".supabase.co") &&
      parsed.pathname.includes(SUPABASE_STORAGE_PATH);
    if (!isSupabaseStorage) return url;
  } catch {
    return url;
  }
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;
};
