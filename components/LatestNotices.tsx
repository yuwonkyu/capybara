"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";

type PostSummary = {
  id: string;
  title: string;
  nickname: string;
  created_at: string;
};

const LatestNotices = (): JSX.Element => {
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/posts?type=notice", { cache: "no-store" })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setError(true);
          return;
        }
        setPosts(data.posts.slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <article className="cute-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="title mb-0">최근 공지</h2>
        <Link href="/board/notice" className="font-body text-xs text-mintdeep hover:underline">
          전체보기
        </Link>
      </div>

      {error && (
        <p className="font-body text-sm text-ink/50">
          공지 목록을 불러오지 못했어요. Supabase 연동 설정을 확인해주세요.
        </p>
      )}

      {!error && !posts && <p className="font-body text-sm text-ink/50">불러오는 중...</p>}

      {!error && posts && posts.length === 0 && (
        <p className="font-body text-sm text-ink/50">아직 등록된 공지가 없어요.</p>
      )}

      {!error && posts && posts.length > 0 && (
        <ul className="space-y-2">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/board/notice/${post.id}`} className="list-item flex items-center justify-between gap-2">
                <span className="truncate font-body text-sm text-ink">{post.title}</span>
                <span className="shrink-0 font-body text-xs text-ink/40">
                  {formatDate(post.created_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};

export default LatestNotices;
