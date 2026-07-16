"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import {
  Donation,
  DonationSummary,
  GUILD_SKILLS,
  INVEST_UNIT_MAN,
  formatMan,
} from "@/lib/donations";
import { formatDate } from "@/lib/format";

type DonationBoardProps = {
  initialDonations: Donation[] | null;
  summary: DonationSummary | null;
  currentUserId: string;
  isAdmin: boolean;
};

const MEDALS = ["🥇", "🥈", "🥉"];

const DonationBoard = ({
  initialDonations,
  summary,
  currentUserId,
  isAdmin,
}: DonationBoardProps): JSX.Element => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amountMan, setAmountMan] = useState("");
  const [investCount, setInvestCount] = useState("1");
  const [skill, setSkill] = useState<string>(GUILD_SKILLS[0]);
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const donations = initialDonations;

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 올릴 수 있어요.");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "이미지 업로드에 실패했습니다.");
      setImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_man: Number(amountMan || 0),
          invest_count: Number(investCount || 0),
          skill,
          image_url: imageUrl,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "기부 등록에 실패했습니다.");

      setAmountMan("");
      setInvestCount("1");
      setNote("");
      setImageUrl(null);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "기부 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("이 기부 기록을 삭제할까요?")) return;
    try {
      const res = await fetch(`/api/donations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "삭제에 실패했습니다.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  // 투자 횟수를 입력하면 기본 메소를 자동 채워준다 (1회 = 500만)
  const handleCountChange = (value: string) => {
    setInvestCount(value);
    const n = Number(value);
    if (Number.isInteger(n) && n > 0) {
      setAmountMan(String(n * INVEST_UNIT_MAN));
    }
  };

  return (
    <div className="space-y-4">
      <section className="cute-card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="title mb-1">길드 기부현황</h1>
            <p className="font-body text-sm text-ink/60">
              길드 스킬 투자 기록이에요. 투자 후 인증샷과 함께 등록해주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="btn-primary"
          >
            {open ? "닫기" : "기부 등록"}
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-mint/30 p-3 text-center">
              <p className="font-body text-xs text-mintdeep/70">누적 기부</p>
              <p className="font-display text-lg text-mintdeep sm:text-xl">
                {formatMan(summary.totalMan)}
              </p>
            </div>
            <div className="rounded-xl bg-sky/30 p-3 text-center">
              <p className="font-body text-xs text-skydeep/70">총 투자 횟수</p>
              <p className="font-display text-lg text-skydeep sm:text-xl">
                {summary.totalCount}회
              </p>
            </div>
            <div className="rounded-xl bg-cream p-3 text-center">
              <p className="font-body text-xs text-ink/50">참여 인원</p>
              <p className="font-display text-lg text-ink/80 sm:text-xl">
                {summary.donorCount}명
              </p>
            </div>
          </div>
        )}

        {error && <p className="font-body mt-3 text-sm text-red-500">{error}</p>}

        {open && (
          <form
            onSubmit={handleSubmit}
            className="mt-4 space-y-3 border-t border-sand/60 pt-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="font-body mb-1 block text-sm text-ink/70">
                  투자 횟수
                </label>
                <input
                  type="number"
                  min={0}
                  className="field-input"
                  value={investCount}
                  onChange={(e) => handleCountChange(e.target.value)}
                  placeholder="예: 2"
                />
                <p className="font-body mt-1 text-xs text-ink/40">
                  횟수를 넣으면 메소가 자동 계산돼요 (1회 = {INVEST_UNIT_MAN}만)
                </p>
              </div>

              <div>
                <label className="font-body mb-1 block text-sm text-ink/70">
                  기부 메소 (만 단위)
                </label>
                <input
                  type="number"
                  min={0}
                  className="field-input"
                  value={amountMan}
                  onChange={(e) => setAmountMan(e.target.value)}
                  placeholder="예: 1000 (= 1,000만)"
                />
              </div>
            </div>

            <div>
              <label className="font-body mb-1 block text-sm text-ink/70">
                투자한 길드 스킬
              </label>
              <div className="flex flex-wrap gap-2">
                {GUILD_SKILLS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSkill(s)}
                    className={`font-body rounded-full px-4 py-1.5 text-sm transition ${
                      skill === s
                        ? "bg-mint font-semibold text-mintdeep"
                        : "border border-sand bg-white text-ink/60 hover:bg-cream"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-body mb-1 block text-sm text-ink/70">
                인증 스크린샷
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleImageChange}
                className="font-body block w-full text-sm text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-mint file:px-4 file:py-2 file:font-body file:text-sm file:font-semibold file:text-mintdeep hover:file:bg-mint/80"
              />
              {uploading && (
                <p className="font-body mt-1 text-xs text-mintdeep">업로드 중...</p>
              )}
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="인증 스크린샷 미리보기"
                  className="mt-2 max-h-40 rounded-xl border border-sand object-contain"
                />
              )}
            </div>

            <div>
              <label className="font-body mb-1 block text-sm text-ink/70">
                메모 (선택)
              </label>
              <input
                className="field-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="예: 부캐길드 투자분"
                maxLength={200}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting || uploading}>
              {submitting ? "등록 중..." : "등록하기"}
            </button>
          </form>
        )}
      </section>

      {summary && summary.ranks.length > 0 && (
        <section className="cute-card">
          <h2 className="title mb-3">🏆 기부 랭킹</h2>
          <ul className="space-y-2">
            {summary.ranks.map((rank, index) => (
              <li
                key={rank.nickname}
                className="list-item flex items-center justify-between gap-2"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="w-6 shrink-0 text-center font-body text-sm text-ink/50">
                    {MEDALS[index] ?? index + 1}
                  </span>
                  <span className="truncate font-body text-sm font-semibold text-ink">
                    {rank.nickname}
                  </span>
                </span>
                <span className="shrink-0 font-body text-xs text-ink/60">
                  <span className="font-semibold text-mintdeep">
                    {formatMan(rank.totalMan)}
                  </span>
                  <span className="ml-2">{rank.totalCount}회</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="cute-card">
        <h2 className="title mb-3">최근 기부 내역</h2>

        {!donations && (
          <p className="font-body rounded-xl bg-sky/20 p-4 text-sm text-skydeep">
            기부 내역을 불러오지 못했어요. Supabase 연동 설정을 확인해주세요.
          </p>
        )}

        {donations && donations.length === 0 && (
          <p className="font-body p-6 text-center text-sm text-ink/50">
            아직 등록된 기부가 없어요. 첫 기부를 등록해보세요!
          </p>
        )}

        {donations && donations.length > 0 && (
          <ul className="divide-y divide-sand/60 overflow-hidden rounded-2xl border border-sand/70">
            {donations.map((d) => {
              const canDelete = isAdmin || d.user_id === currentUserId;
              return (
                <li key={d.id} className="px-3 py-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                      <span className="font-body text-sm font-semibold text-ink">
                        {d.nickname}
                      </span>
                      {d.skill && (
                        <span className="font-body text-xs font-semibold text-skydeep">
                          [{d.skill}]
                        </span>
                      )}
                      <span className="font-body text-sm font-semibold text-mintdeep">
                        {formatMan(d.amount_man)}
                      </span>
                      {d.invest_count > 0 && (
                        <span className="font-body text-xs text-ink/50">
                          · {d.invest_count}회
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 font-body text-xs text-ink/45">
                      <span>{formatDate(d.created_at)}</span>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
                          className="text-ink/40 hover:text-red-500"
                        >
                          삭제
                        </button>
                      )}
                    </span>
                  </div>

                  {d.note && (
                    <p className="font-body mt-1 text-xs text-ink/60">{d.note}</p>
                  )}

                  {d.image_url && (
                    <a
                      href={d.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={d.image_url}
                        alt="기부 인증 스크린샷"
                        className="max-h-32 rounded-lg border border-sand object-contain"
                      />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default DonationBoard;
