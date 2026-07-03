"use client";

import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  ClipboardEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BoardConfig } from "@/lib/types";

const MAX_IMAGES = 5;

type PostFormProps = {
  board: BoardConfig;
  mode: "create" | "edit";
  postId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialImageUrls?: string[];
};

const PostForm = ({
  board,
  mode,
  postId,
  initialTitle = "",
  initialContent = "",
  initialImageUrls = [],
}: PostFormProps): JSX.Element => {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  );

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const totalImages = imageUrls.length + files.length;

  const addFiles = (selected: File[]) => {
    if (selected.length === 0) return;

    const remaining = MAX_IMAGES - totalImages;
    if (remaining <= 0) {
      setError(`이미지는 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.`);
      return;
    }

    setError(null);
    setFiles((prev) => [...prev, ...selected.slice(0, remaining)]);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleContentPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(event.clipboardData?.items ?? []);
    const imageFiles = items
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (imageFiles.length === 0) return;

    // 이미지가 붙여넣기되면 텍스트로는 아무것도 들어가지 않으니 기본 동작을 막을 필요는 없지만,
    // 혹시 모를 파일 경로 텍스트 삽입을 방지하기 위해 막아둔다.
    event.preventDefault();
    addFiles(imageFiles);
  };

  const removeExistingImage = (url: string) => {
    setImageUrls((prev) => prev.filter((item) => item !== url));
  };

  const removeNewFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "이미지 업로드에 실패했습니다.");
      urls.push(data.url);
    }
    return urls;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const uploadedUrls = await uploadFiles();
      const allImageUrls = [...imageUrls, ...uploadedUrls];

      if (mode === "create") {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            board_type: board.type,
            title,
            content,
            image_urls: allImageUrls,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "게시글을 작성하지 못했습니다.");
        router.push(`/board/${board.type}/${data.id}`);
        router.refresh();
      } else {
        const res = await fetch(`/api/posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, image_urls: allImageUrls }),
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
          onPaste={handleContentPaste}
          placeholder="내용을 입력해주세요 (이미지를 복사한 뒤 Ctrl+V로 바로 붙여넣을 수 있어요)"
          required
        />
      </div>

      <div>
        <label className="font-body mb-1 block text-sm text-ink/70">
          이미지 첨부 ({totalImages}/{MAX_IMAGES})
        </label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          multiple
          onChange={handleFileChange}
          className="font-body block w-full text-sm text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-mint file:px-4 file:py-2 file:font-body file:text-sm file:font-semibold file:text-mintdeep hover:file:bg-mint/80"
        />
        <p className="font-body mt-1 text-xs text-ink/40">
          PNG, JPG, GIF, WEBP · 장당 5MB 이하 · 최대 {MAX_IMAGES}장
        </p>

        {(imageUrls.length > 0 || files.length > 0) && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {imageUrls.map((url) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="첨부 이미지"
                  className="aspect-square w-full rounded-xl border border-sand object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(url)}
                  className="absolute right-1 top-1 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white hover:bg-black/70"
                  aria-label="이미지 삭제"
                >
                  ✕
                </button>
              </div>
            ))}
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews[index]}
                  alt="첨부 예정 이미지"
                  className="aspect-square w-full rounded-xl border border-mintdeep/40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeNewFile(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white hover:bg-black/70"
                  aria-label="이미지 삭제"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
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
