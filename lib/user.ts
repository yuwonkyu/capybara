import type { User } from "@supabase/supabase-js";

// 서버/클라이언트 공용 사용자 표시 헬퍼
// custom_* 값은 개인정보 관리 페이지에서 수정한 값이며 카카오 프로필보다 우선한다.

export const getDisplayName = (user: User): string => {
  const metadata = user.user_metadata ?? {};
  return (
    metadata.custom_nickname ??
    metadata.name ??
    metadata.full_name ??
    metadata.preferred_username ??
    "길드원"
  );
};

export const getAvatarUrl = (user: User): string | null => {
  const metadata = user.user_metadata ?? {};
  return metadata.custom_avatar_url ?? metadata.avatar_url ?? null;
};

export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 12;

export const validateNickname = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed.length < NICKNAME_MIN || trimmed.length > NICKNAME_MAX) {
    return `닉네임은 ${NICKNAME_MIN}~${NICKNAME_MAX}자로 입력해주세요.`;
  }
  return null;
};
