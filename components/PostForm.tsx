"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, ClipboardEvent, FormEvent, useRef, useState } from "react";
import { BOARD_CATEGORIES, BoardConfig } from "@/lib/types";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

type PostFormProps = {
  board: BoardConfig;
  mode: "create" | "edit";
  postId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialImageUrls?: string[];
  initialCategory?: string | null;
};

const PostForm = ({
  board,
  mode,
  postId,
  initialTitle = "",
  initialContent = "",
  initialImageUrls = [],
  initialCategory = null,
}: PostFormProps): JSX.Element => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const categories = BOARD_CATEGORIES[board.type];
  const [category, setCategory] = useState<string>(
    initialCategory ?? categories?.[0] ?? ""
  );
  // content에 인라인 삽입된 이미지 URL 모음 (썸네일/OG용)
  const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const needsCategory = Boolean(categories);

  // 커서 위치에 텍스트를 삽입한다
  const insertAtCursor = (text: string) => {
    const el = textareaRef.current;
    if (!el) {
      setContent((prev) => prev + text);
      return;
    }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = content.slice(0, start) + text + content.slice(end);
    setContent(next);
    // 삽입 후 커서를 삽입한 텍스트 뒤로 이동
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "이미지 업로드에 실패했습니다.");
    return data.url as string;
  };

  const handleImageFiles = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;

    for (const file of images) {
      if (file.size > MAX_IMAGE_SIZE) {
        setError("이미지는 장당 5MB 이하만 올릴 수 있어요.");
        return;
      }
    }

    setError(null);
    setUploading(true);
    try {
      for (const file of images) {
        const url = await uploadImage(file);
        insertAtCursor(`\n![이미지](${url})\n`);
        setImageUrls((prev) => [...prev, url]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleImageFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleContentPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(event.clipboardData?.items ?? []);
    const imageFiles = items
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (imageFiles.length === 0) return; // 일반 텍스트/링크 붙여넣기는 그대로 둔다
    event.preventDefault();
    handleImageFiles(imageFiles);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      title,
      content,
      image_urls: imageUrls,
      category: needsCategory ? category : null,
    };

    try {
      if (mode === "create") {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ board_type: board.type, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "게시글을 작성하지 못했습니다.");
        router.push(`/board/${board.type}/${data.id}`);
        router.refresh();
      } else {
        const res = await fetch(`/api/posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "게시글을 수정하지 못했습니다.");
        router.push(`/board/${board.type}/${postId}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청에 실패했습니다.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cute-card space-y-4">
      <h1 className="title">
        {board.label} · {mode === "create" ? "글쓰기" : "글 수정"}
      </h1>

      {needsCategory && (
        <div>
          <label className="font-body mb-1 block text-sm text-ink/70">말머리</label>
          <div className="flex flex-wrap gap-2">
            {categories?.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`font-body rounded-full px-4 py-1.5 text-sm transition ${
                  category === c
                    ? "bg-mint font-semibold text-mintdeep"
                    : "border border-sand bg-white text-ink/60 hover:bg-cream"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
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
        <div className="mb-1 flex items-center justify-between">
          <label className="font-body block text-sm text-ink/70">내용</label>
          <label className="font-body inline-flex cursor-pointer items-center gap-1 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-mintdeep hover:bg-mint/80">
            🖼️ 이미지 넣기
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        <textarea
          ref={textareaRef}
          className="field-input min-h-[300px] resize-y"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onPaste={handleContentPaste}
          placeholder="내용을 입력해주세요.&#10;- 이미지: 커서 위치에 Ctrl+V로 붙여넣거나 위 [이미지 넣기] 버튼 사용&#10;- 링크: 주소(https://...)를 그대로 붙여넣으면 자동으로 연결돼요"
          required
        />
        <p className="font-body mt-1 text-xs text-ink/40">
          이미지는 원하는 위치(커서)에 삽입돼요. PNG·JPG·GIF·WEBP, 장당 5MB 이하.
        </p>
        {uploading && (
          <p className="font-body mt-1 text-xs text-mintdeep">이미지 업로드 중...</p>
        )}
      </div>

      {error && <p className="font-body text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={submitting || uploading}>
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
