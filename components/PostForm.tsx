"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { BoardConfig } from "@/lib/types";

type PostFormProps = {
  board: BoardConfig;
  mode: "create" | "edit";
  postId?: string;
  initialTitle?: string;
  initialContent?: string;
};

const PostForm = ({
  board,
  mode,
  postId,
  initialTitle = "",
  initialContent = "",
}: PostFormProps): JSX.Element => {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "create") {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ board_type: board.type, title, content, nickname, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "게시글을 작성하지 못했습니다.");
        router.push(`/board/${board.type}/${data.id}`);
        router.refresh();
      } else {
        const res = await fetch(`/api/posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "게시글을 수정하지 못했습니다.");
        router.push(`/board/${board.type}/${postId}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cute-card space-y-4">
      <h1 className="title">
        {board.label} · {mode === "create" ? "글쓰기" : "글 수정"}
      </h1>

      {mode === "create" && (
        <div>
          <label className="font-body mb-1 block text-sm text-ink/70">닉네임</label>
          <input
            className="field-input"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="닉네임을 입력해주세요"
            required
          />
        </div>
      )}

      <div>
        <label className="font-body mb-1 block text-sm text-ink/70">제목</label>
        <input
          className="field-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="제목을 입력해주세요"
          required
        />
      </div>

      <div>
        <label className="font-body mb-1 block text-sm text-ink/70">내용</label>
        <textarea
          className="field-input min-h-[220px] resize-y"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="내용을 입력해주세요"
          required
        />
      </div>

      <div>
        <label className="font-body mb-1 block text-sm text-ink/70">
          비밀번호 ({mode === "create" ? "글 수정/삭제 시 필요" : "확인용"})
        </label>
        <input
          type="password"
          className="field-input"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="4자 이상 입력해주세요"
          minLength={4}
          required
        />
      </div>

      {error && <p className="font-body text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "처리 중..." : mode === "create" ? "등록하기" : "수정하기"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => router.back()}
          disabled={submitting}
        >
          취소
        </button>
      </div>
    </form>
  );
};

export default PostForm;
