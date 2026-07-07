import Link from "next/link";
import { formatDate } from "@/lib/format";
import { MyPost } from "@/lib/posts";
import { getBoardConfig } from "@/lib/types";

type MyPostsProps = {
  posts: MyPost[];
};

const MyPosts = ({ posts }: MyPostsProps): JSX.Element => {
  return (
    <section className="cute-card">
      <h2 className="title mb-3">내가 쓴 글 ({posts.length})</h2>

      {posts.length === 0 ? (
        <p className="font-body text-sm text-ink/50">아직 작성한 글이 없어요.</p>
      ) : (
        <ul className="divide-y divide-sand/60 overflow-hidden rounded-2xl border border-sand/70">
          {posts.map((post) => {
            const label = getBoardConfig(post.board_type)?.label ?? "";
            return (
              <li key={post.id}>
                <Link
                  href={`/board/${post.board_type}/${post.id}`}
                  className="flex flex-col gap-1 px-3 py-3 transition hover:bg-mint/10 sm:flex-row sm:items-center sm:gap-3"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-1.5">
                    <span className="shrink-0 font-body text-xs font-semibold text-skydeep">
                      [{label}]
                    </span>
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
                    <span>{formatDate(post.created_at)}</span>
                    <span>·</span>
                    <span>조회 {post.views}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default MyPosts;
