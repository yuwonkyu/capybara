"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import { BoardType } from "@/lib/types";

type PostSummary = {
  id: string;
  title: string;
  nickname: string;
  created_at: string;
};

type LatestPostsProps = {
  board: BoardType;
  title: string;
  limit?: number;
};

const LatestPosts = ({ board, title, limit = 5 }: LatestPostsProps): JSX.Element => {
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/posts?type=${board}`, { cache: "no-store" })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setError(true);
          return;
        }
        setPosts(data.posts.slice(0, limit));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [board, limit]);

  return (
    <article className="cute-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="title mb-0">{title}</h2>
        <Link href={`/board/${board}`} className="font-body text-xs text-mintdeep hover:underline">
          전체보기
        </Link>
      </div>

      {error && (
        <p className="font-body text-sm text-ink/50">
          목록을 불러오지 못했어요. Supabase 연동 설정을 확인해주세요.
        </p>
      )}

      {!error && !posts && <p className="font-body text-sm text-ink/50">불러오는 중...</p>}

      {!error && posts && posts.length === 0 && (
        <p className="font-body text-sm text-ink/50">아직 등록된 글이 없어요.</p>
      )}

      {!error && posts && posts.length > 0 && (
        <ul className="space-y-2">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/board/${board}/${post.id}`}
                className="list-item flex items-center justify-between gap-2"
              >
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

export default LatestPosts;
