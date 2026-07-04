import Link from "next/link";
import { formatDate } from "@/lib/format";
import { PostSummary } from "@/lib/posts";
import { BoardType, isRecentPost } from "@/lib/types";

type LatestPostsProps = {
  board: BoardType;
  title: string;
  posts: PostSummary[] | null;
};

const LatestPosts = ({ board, title, posts }: LatestPostsProps): JSX.Element => {
  return (
    <article className="cute-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="title mb-0">{title}</h2>
        <Link href={`/board/${board}`} className="font-body text-xs text-mintdeep hover:underline">
          전체보기
        </Link>
      </div>

      {!posts && (
        <p className="font-body text-sm text-ink/50">
          목록을 불러오지 못했어요. Supabase 연동 설정을 확인해주세요.
        </p>
      )}

      {posts && posts.length === 0 && (
        <p className="font-body text-sm text-ink/50">아직 등록된 글이 없어요.</p>
      )}

      {posts && posts.length > 0 && (
        <ul className="space-y-2">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/board/${board}/${post.id}`}
                className="list-item flex items-center justify-between gap-2"
              >
                <span className="truncate font-body text-sm text-ink">
                  {isRecentPost(post.created_at) && "✨ "}
                  {post.title}
                </span>
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
