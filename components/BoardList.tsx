"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import { BoardConfig } from "@/lib/types";

type PostSummary = {
  id: string;
  title: string;
  nickname: string;
  views: number;
  created_at: string;
};

type BoardListProps = {
  board: BoardConfig;
};

const BoardList = ({ board }: BoardListProps): JSX.Element => {
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/posts?type=${board.type}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "게시글을 불러오지 못했습니다.");
        if (!cancelled) setPosts(data.posts);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "게시글을 불러오지 못했습니다.");
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [board.type]);

  return (
    <section className="cute-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="title mb-1">{board.label}</h1>
          <p className="font-body text-sm text-ink/60">{board.description}</p>
        </div>
        <Link href={`/board/${board.type}/write`} className="btn-primary">
          글쓰기
        </Link>
      </div>

      {error && (
        <p className="font-body rounded-xl bg-sky/20 p-4 text-sm text-skydeep">
          {error} (Supabase 연동 설정이 필요할 수 있어요. README를 확인해주세요.)
        </p>
      )}

      {!error && !posts && (
        <p className="font-body p-6 text-center text-sm text-ink/50">불러오는 중...</p>
      )}

      {!error && posts && posts.length === 0 && (
        <p className="font-body p-6 text-center text-sm text-ink/50">
          아직 등록된 글이 없어요. 첫 글을 남겨보세요!
        </p>
      )}

      {!error && posts && posts.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-sand/70">
          <div className="board-row-head">
            <span>번호</span>
            <span>제목</span>
            <span className="hidden sm:inline">닉네임</span>
            <span>날짜</span>
            <span>조회</span>
          </div>
          {posts.map((post, index) => (
            <Link
              key={post.id}
              href={`/board/${board.type}/${post.id}`}
              className="board-row"
            >
              <span className="text-ink/50">{posts.length - index}</span>
              <span className="truncate font-semibold">{post.title}</span>
              <span className="hidden truncate text-ink/60 sm:inline">{post.nickname}</span>
              <span className="text-ink/50">{formatDate(post.created_at)}</span>
              <span className="text-ink/50">{post.views}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default BoardList;
