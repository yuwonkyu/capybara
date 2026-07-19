"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import { PostSummary } from "@/lib/posts";
import { BOARD_CATEGORIES, BoardConfig, isRecentPost } from "@/lib/types";

type BoardListProps = {
  board: BoardConfig;
  posts: PostSummary[] | null;
};

const BoardList = ({ board, posts }: BoardListProps): JSX.Element => {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = BOARD_CATEGORIES[board.type];

  const filtered = useMemo(() => {
    if (!posts) return posts;
    const kw = keyword.trim().toLowerCase();
    return posts.filter((p) => {
      if (category && p.category !== category) return false;
      if (!kw) return true;
      return (
        p.title.toLowerCase().includes(kw) ||
        (p.category?.toLowerCase().includes(kw) ?? false) ||
        p.nickname.toLowerCase().includes(kw)
      );
    });
  }, [posts, keyword, category]);

  return (
    <section className="cute-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="title mb-1">{board.label}</h1>
          <p className="font-body text-sm text-ink/60">{board.description}</p>
        </div>
        {!board.externalUrl && (
          <Link href={`/board/${board.type}/write`} className="btn-primary">
            글쓰기
          </Link>
        )}
      </div>

      {categories && posts && posts.length > 0 && (
        <nav className="mb-4 flex gap-1 border-b border-sand/70">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={`font-body -mb-px border-b-2 px-3 py-2 text-sm transition ${
              category === null
                ? "border-mintdeep font-semibold text-mintdeep"
                : "border-transparent text-ink/50 hover:text-ink/80"
            }`}
          >
            전체
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(category === c ? null : c)}
              className={`font-body -mb-px border-b-2 px-3 py-2 text-sm transition ${
                category === c
                  ? "border-mintdeep font-semibold text-mintdeep"
                  : "border-transparent text-ink/50 hover:text-ink/80"
              }`}
            >
              {c}
            </button>
          ))}
        </nav>
      )}

      {posts && posts.length > 0 && (
        <div className="mb-3">
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="제목·작성자로 검색"
            className="field-input"
          />
        </div>
      )}

      {!posts && (
        <p className="font-body rounded-xl bg-sky/20 p-4 text-sm text-skydeep">
          게시글을 불러오지 못했습니다. (Supabase 연동 설정이 필요할 수 있어요.
          README를 확인해주세요.)
        </p>
      )}

      {posts && posts.length === 0 && (
        <p className="font-body p-6 text-center text-sm text-ink/50">
          아직 등록된 글이 없어요. 첫 글을 남겨보세요!
        </p>
      )}

      {filtered && posts && posts.length > 0 && filtered.length === 0 && (
        <p className="font-body p-6 text-center text-sm text-ink/50">
          {keyword.trim()
            ? `‘${keyword}’ 검색 결과가 없어요.`
            : `${category ?? ""} 게시글이 없어요.`}
        </p>
      )}

      {filtered && filtered.length > 0 && (
        <ul className="divide-y divide-sand/60 overflow-hidden rounded-2xl border border-sand/70">
          {filtered.map((post) => (
            <li key={post.id}>
              <Link
                href={`/board/${board.type}/${post.id}`}
                className="flex flex-col gap-1 px-3 py-3 transition hover:bg-mint/10 sm:flex-row sm:items-center sm:gap-3"
              >
                <span className="flex min-w-0 flex-1 items-center gap-1.5">
                  {isRecentPost(post.created_at) && (
                    <span title="최근 1주일 이내 게시글">✨</span>
                  )}
                  <span className="truncate font-body text-sm font-semibold text-ink">
                    {post.title}
                  </span>
                  {post.comment_count > 0 && (
                    <span className="shrink-0 font-body text-xs font-semibold text-mintdeep">
                      [{post.comment_count}]
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-2 font-body text-xs text-ink/45">
                  <span className="truncate max-w-[8rem]">{post.nickname}</span>
                  <span>·</span>
                  <span>{formatDate(post.created_at)}</span>
                  <span>·</span>
                  <span>조회 {post.views}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default BoardList;
