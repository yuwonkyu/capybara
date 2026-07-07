import Link from "next/link";
import { PopularPost } from "@/lib/posts";
import { getBoardConfig, isRecentPost } from "@/lib/types";

type PopularPostsProps = {
  posts: PopularPost[] | null;
};

const PopularPosts = ({ posts }: PopularPostsProps): JSX.Element => {
  return (
    <article className="cute-card">
      <h2 className="title mb-3">🔥 인기 게시글</h2>

      {!posts && (
        <p className="font-body text-sm text-ink/50">
          목록을 불러오지 못했어요. Supabase 연동 설정을 확인해주세요.
        </p>
      )}

      {posts && posts.length === 0 && (
        <p className="font-body text-sm text-ink/50">아직 인기 게시글이 없어요.</p>
      )}

      {posts && posts.length > 0 && (
        <ul className="space-y-2">
          {posts.map((post) => {
            const label = getBoardConfig(post.board_type)?.label ?? "";
            return (
              <li key={post.id}>
                <Link
                  href={`/board/${post.board_type}/${post.id}`}
                  className="list-item flex items-center justify-between gap-2"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="shrink-0 font-body text-[11px] font-semibold text-mintdeep">
                      [{label}]
                    </span>
                    <span className="truncate font-body text-sm text-ink">
                      {isRecentPost(post.created_at) && "✨ "}
                      {post.title}
                    </span>
                  </span>
                  <span className="shrink-0 font-body text-xs text-ink/40">
                    조회 {post.views}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
};

export default PopularPosts;
