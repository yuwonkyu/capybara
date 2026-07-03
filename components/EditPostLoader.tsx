"use client";

import { useEffect, useState } from "react";
import PostForm from "@/components/PostForm";
import { BoardConfig, Post } from "@/lib/types";

type EditPostLoaderProps = {
  board: BoardConfig;
  postId: string;
};

const EditPostLoader = ({ board, postId }: EditPostLoaderProps): JSX.Element => {
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "게시글을 불러오지 못했습니다.");
        if (!cancelled) setPost(data.post);
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
  }, [postId]);

  if (error) {
    return (
      <section className="cute-card">
        <p className="font-body text-sm text-red-500">{error}</p>
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

  return (
    <PostForm
      board={board}
      mode="edit"
      postId={postId}
      initialTitle={post.title}
      initialContent={post.content}
    />
  );
};

export default EditPostLoader;
