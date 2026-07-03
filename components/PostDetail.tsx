"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import { BoardConfig, Comment, Post } from "@/lib/types";

type PostDetailProps = {
  board: BoardConfig;
  postId: string;
  currentUserId: string | null;
  isAdmin: boolean;
};

const PostDetail = ({
  board,
  postId,
  currentUserId,
  isAdmin,
}: PostDetailProps): JSX.Element => {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadComments = async () => {
    const res = await fetch(`/api/posts/${postId}/comments`, { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setComments(data.comments);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "게시글을 불러오지 못했습니다.");
        if (!cancelled) setPost(data.post);
        await loadComments();
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "게시글을 불러오지 못했습니다.");
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleDeletePost = async () => {
    if (!window.confirm("게시글을 삭제할까요?")) return;

    setActionError(null);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "삭제에 실패했습니다.");
      router.push(`/board/${board.type}`);
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("댓글을 삭제할까요?")) return;

    setActionError(null);
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "댓글 삭제에 실패했습니다.");
      await loadComments();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "댓글 삭제에 실패했습니다.");
    }
  };

  const handleCommentSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setActionError(null);
    setSubmittingComment(true);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "댓글 작성에 실패했습니다.");
      setCommentContent("");
      await loadComments();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "댓글 작성에 실패했습니다.");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loadError) {
    return (
      <section className="cute-card">
        <p className="font-body text-sm text-red-500">{loadError}</p>
        <Link href={`/board/${board.type}`} className="btn-secondary mt-4 inline-flex">
          목록으로
        </Link>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="cute-card">
        <p className="font-body p-6 text-center text-sm text-ink/50">불러오는 중...</p>
      </section>
    );
  }

  const isOwner = Boolean(currentUserId && post.user_id === currentUserId);

  return (
    <div className="space-y-4">
      <section className="cute-card">
        <p className="pill-badge mb-2">{board.label}</p>
        <h1 className="font-display text-2xl text-ink">{post.title}</h1>
        <div className="font-body mt-2 flex flex-wrap gap-3 text-xs text-ink/50">
          <span>{post.nickname}</span>
          <span>{formatDate(post.created_at)}</span>
          <span>조회 {post.views}</span>
        </div>
        <p className="font-body mt-5 whitespace-pre-wrap leading-7 text-ink/90">{post.content}</p>

        {actionError && <p className="font-body mt-3 text-sm text-red-500">{actionError}</p>}

        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/board/${board.type}`} className="btn-secondary">
            목록으로
          </Link>
          {isOwner && (
            <Link href={`/board/${board.type}/${postId}/edit`} className="btn-secondary">
              수정
            </Link>
          )}
          {(isOwner || isAdmin) && (
            <button type="button" onClick={handleDeletePost} className="btn-secondary">
              삭제
            </button>
          )}
        </div>
      </section>

      <section className="cute-card">
        <h2 className="title">댓글 {comments.length}</h2>

        <div className="mb-4 space-y-2">
          {comments.length === 0 && (
            <p className="font-body text-sm text-ink/50">아직 댓글이 없어요.</p>
          )}
          {comments.map((comment) => {
            const canDelete =
              isAdmin || Boolean(currentUserId && comment.user_id === currentUserId);
            return (
              <div key={comment.id} className="list-item">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-body text-sm font-semibold text-ink">
                    {comment.nickname}
                    <span className="ml-2 text-xs font-normal text-ink/40">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="font-body text-xs text-ink/40 hover:text-red-500"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <p className="font-body mt-1 whitespace-pre-wrap text-sm text-ink/80">
                  {comment.content}
                </p>
              </div>
            );
          })}
        </div>

        {currentUserId ? (
          <form onSubmit={handleCommentSubmit} className="space-y-2 border-t border-sand/60 pt-4">
            <textarea
              className="field-input min-h-[80px] resize-y"
              placeholder="댓글을 입력해주세요"
              value={commentContent}
              onChange={(event) => setCommentContent(event.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={submittingComment}>
              {submittingComment ? "등록 중..." : "댓글 등록"}
            </button>
          </form>
        ) : (
          <p className="font-body border-t border-sand/60 pt-4 text-sm text-ink/60">
            카카오 로그인 후 댓글을 쓸 수 있어요. 상단의 <b>카카오 로그인</b> 버튼을 눌러주세요.
          </p>
        )}
      </section>
    </div>
  );
};

export default PostDetail;
