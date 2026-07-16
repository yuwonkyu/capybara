"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import {
  Donation,
  DonationSummary,
  GUILDS,
  GuildName,
  INVEST_UNIT_MAN,
  formatMan,
} from "@/lib/donations";
import { formatDate } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/types";

type DonationBoardProps = {
  guild: GuildName;
  donations: Donation[] | null;
  summary: DonationSummary | null;
  currentUserId: string;
  isAdmin: boolean;
};

const DonationBoard = ({
  guild,
  donations,
  summary,
  currentUserId,
  isAdmin,
}: DonationBoardProps): JSX.Element => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [investCount, setInvestCount] = useState("1");
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          guild,
          invest_count: Number(investCount || 0),
          image_url: imageUrl,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "기부 등록에 실패했습니다.");

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

  const handleSync = async () => {
    setError(null);
    setMessage(null);
    setSyncing(true);
    try {
      const res = await fetch("/api/discord/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "동기화에 실패했습니다.");
      setMessage(`디스코드에서 ${data.imported}건을 새로 가져왔어요.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "동기화에 실패했습니다.");
    } finally {
      setSyncing(false);
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

  // 길마가 엑셀에 붙여넣을 수 있도록 CSV로 내려받는다 (엑셀 한글 깨짐 방지 BOM 포함)
  const handleDownloadCsv = () => {
    if (!summary) return;
    const header = ["아이디", "투자횟수", "회원등급"];
    const rows = summary.rows.map((r) => [
      r.nickname,
      String(r.totalCount),
      r.role ? ROLE_LABELS[r.role] : "미연동",
    ]);
    const csv = [header, ...rows]
      .map((cols) => cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${guild}_길드기부현황.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <section className="cute-card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="title mb-1">길드 기부현황</h1>
            <p className="font-body text-sm text-ink/60">
              길드 스킬 투자 1회 = {INVEST_UNIT_MAN}만 메소 기준으로 집계돼요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={handleSync}
                className="btn-secondary"
                disabled={syncing}
              >
                {syncing ? "동기화 중..." : "디스코드 동기화"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="btn-primary"
            >
              {open ? "닫기" : "직접 등록"}
            </button>
          </div>
        </div>

        {/* 길드 탭 */}
        <div className="mb-3 flex flex-wrap gap-2">
          {GUILDS.map((g) => (
            <Link
              key={g}
              href={`/donations?guild=${encodeURIComponent(g)}`}
              className={`font-body rounded-full px-4 py-1.5 text-sm transition ${
                guild === g
                  ? "bg-mintdeep font-semibold text-white"
                  : "border border-sand bg-white text-ink/60 hover:bg-cream"
              }`}
            >
              {g}
            </Link>
          ))}
        </div>

        {summary && (
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-sky/30 p-3 text-center">
              <p className="font-body text-xs text-skydeep/70">총 투자 횟수</p>
              <p className="font-display text-lg text-skydeep sm:text-xl">
                {summary.totalCount}회
              </p>
            </div>
            <div className="rounded-xl bg-mint/30 p-3 text-center">
              <p className="font-body text-xs text-mintdeep/70">누적 기부</p>
              <p className="font-display text-lg text-mintdeep sm:text-xl">
                {formatMan(summary.totalMan)}
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

        {message && <p className="font-body mt-3 text-sm text-mintdeep">{message}</p>}
        {error && <p className="font-body mt-3 text-sm text-red-500">{error}</p>}

        {open && (
          <form
            onSubmit={handleSubmit}
            className="mt-4 space-y-3 border-t border-sand/60 pt-4"
          >
            <p className="font-body text-xs text-ink/50">
              디스코드에 올리지 못했을 때만 사용하세요. 보통은 디스코드에{" "}
              <b>!투자 2</b> + 인증샷을 올리면 자동으로 집계됩니다.
            </p>

            <div>
              <label className="font-body mb-1 block text-sm text-ink/70">
                투자 횟수 ({guild})
              </label>
              <input
                type="number"
                min={1}
                className="field-input max-w-[10rem]"
                value={investCount}
                onChange={(e) => setInvestCount(e.target.value)}
              />
              <p className="font-body mt-1 text-xs text-ink/40">
                {Number(investCount || 0) * INVEST_UNIT_MAN}만 메소로 기록됩니다.
              </p>
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
                maxLength={200}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || uploading}
            >
              {submitting ? "등록 중..." : "등록하기"}
            </button>
          </form>
        )}
      </section>

      {/* 길마용 엑셀 표 */}
      {summary && summary.rows.length > 0 && (
        <section className="cute-card">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="title mb-0">{guild} 길드 기부 집계</h2>
            <button type="button" onClick={handleDownloadCsv} className="btn-secondary">
              엑셀(CSV) 다운로드
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-body text-sm">
              <thead>
                <tr className="border-b-2 border-mintdeep/30 bg-mint/20 text-left text-xs text-ink/70">
                  <th className="px-3 py-2 font-semibold">아이디</th>
                  <th className="px-3 py-2 font-semibold">투자횟수</th>
                  <th className="px-3 py-2 font-semibold">회원등급</th>
                </tr>
              </thead>
              <tbody>
                {summary.rows.map((row) => (
                  <tr key={row.nickname} className="border-b border-sand/60">
                    <td className="px-3 py-2 text-ink">{row.nickname}</td>
                    <td className="px-3 py-2 font-semibold text-mintdeep">
                      {row.totalCount}회
                    </td>
                    <td className="px-3 py-2 text-ink/70">
                      {row.role ? (
                        ROLE_LABELS[row.role]
                      ) : (
                        <span className="text-ink/35">미연동</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-body mt-2 text-xs text-ink/40">
            회원등급은 디스코드 계정과 사이트 계정이 연결된 경우에만 표시됩니다.
          </p>
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
            아직 등록된 기부가 없어요.
            {isAdmin && " [디스코드 동기화]를 눌러 가져와보세요."}
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
                      <span className="font-body text-sm font-semibold text-mintdeep">
                        {d.invest_count}회
                      </span>
                      <span className="font-body text-xs text-ink/50">
                        · {formatMan(d.amount_man)}
                      </span>
                      {d.discord_user_id && (
                        <span className="font-body text-[11px] text-skydeep">
                          디스코드
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
