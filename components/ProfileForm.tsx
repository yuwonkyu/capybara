"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useAuthUser } from "@/lib/use-auth-user";
import {
  getAvatarUrl,
  getDisplayName,
  NICKNAME_MAX,
  validateNickname,
} from "@/lib/user";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

const ProfileForm = (): JSX.Element => {
  const router = useRouter();
  const { supabase, user, ready } = useAuthUser();

  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (user && !initialized) {
      setNickname(getDisplayName(user));
      setAvatarUrl(getAvatarUrl(user));
      setInitialized(true);
    }
  }, [user, initialized]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!ready) {
    return (
      <section className="cute-card">
        <p className="font-body p-6 text-center text-sm text-ink/50">불러오는 중...</p>
      </section>
    );
  }

  if (!supabase || !user) {
    return (
      <section className="cute-card">
        <h1 className="title">내 정보 관리</h1>
        <p className="font-body text-ink/70">
          카카오 로그인 후 이용할 수 있어요. 상단의 <b>카카오 로그인</b> 버튼을
          눌러주세요.
        </p>
      </section>
    );
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("이미지 파일만 올릴 수 있어요.");
      return;
    }
    if (selected.size > MAX_AVATAR_SIZE) {
      setError("프로필 사진은 5MB 이하만 올릴 수 있어요.");
      return;
    }

    setError(null);
    setFile(selected);
  };

  const handleRemoveAvatar = () => {
    setFile(null);
    setAvatarUrl(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const nicknameError = validateNickname(nickname);
    if (nicknameError) {
      setError(nicknameError);
      return;
    }

    setSaving(true);

    try {
      let newAvatarUrl = avatarUrl;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "프로필 사진 업로드에 실패했습니다.");
        newAvatarUrl = data.url;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          custom_nickname: nickname.trim(),
          custom_avatar_url: newAvatarUrl,
        },
      });

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      setFile(null);
      setSuccess("저장했어요! 새 글부터 바뀐 닉네임으로 표시됩니다.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const shownAvatar = preview ?? avatarUrl;

  return (
    <form onSubmit={handleSubmit} className="cute-card space-y-5">
      <h1 className="title">내 정보 관리</h1>

      <div>
        <label className="font-body mb-2 block text-sm text-ink/70">프로필 사진</label>
        <div className="flex items-center gap-4">
          {shownAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownAvatar}
              alt="프로필 사진 미리보기"
              className="h-20 w-20 rounded-full border border-sand object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-sand bg-cream font-display text-2xl text-mintdeep">
              {nickname.trim().charAt(0) || "?"}
            </div>
          )}
          <div className="space-y-2">
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={handleFileChange}
              className="font-body block w-full text-sm text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-mint file:px-4 file:py-2 file:font-body file:text-sm file:font-semibold file:text-mintdeep hover:file:bg-mint/80"
            />
            <p className="font-body text-xs text-ink/40">PNG, JPG, GIF, WEBP · 5MB 이하</p>
            {shownAvatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="font-body text-xs text-ink/40 underline hover:text-red-500"
              >
                사진 삭제
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="font-body mb-1 block text-sm text-ink/70">닉네임</label>
        <input
          className="field-input max-w-xs"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="게임 캐릭터 닉네임을 입력해주세요"
          maxLength={NICKNAME_MAX}
          required
        />
        <p className="font-body mt-1 text-xs text-mintdeep">
          💡 길드원들이 알아볼 수 있게 <b>메이플 플래닛 캐릭터 닉네임</b>으로
          설정하는 것을 권장해요!
        </p>
        <p className="font-body mt-1 text-xs text-ink/40">
          2~{NICKNAME_MAX}자 · 게시글과 댓글의 작성자명으로 표시됩니다. (이미 쓴 글의
          닉네임은 바뀌지 않아요)
        </p>
      </div>

      {error && <p className="font-body text-sm text-red-500">{error}</p>}
      {success && <p className="font-body text-sm text-mintdeep">{success}</p>}

      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "저장 중..." : "저장하기"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => router.back()}
          disabled={saving}
        >
          돌아가기
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
