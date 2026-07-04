"use client";

import { Fragment, useEffect, useState } from "react";

type PostContentProps = {
  content: string;
  // 인라인에 포함되지 않은(구버전) 첨부 이미지들
  extraImages?: string[];
};

type Node =
  | { type: "text"; value: string }
  | { type: "image"; url: string }
  | { type: "link"; url: string };

const IMAGE_MD = /!\[[^\]]*\]\(([^)]+)\)/g;
const URL_RE = /(https?:\/\/[^\s<]+)/g;

// 텍스트 조각을 URL 기준으로 링크/텍스트 노드로 나눈다
const splitLinks = (text: string): Node[] => {
  const nodes: Node[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_RE)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push({ type: "text", value: text.slice(last, start) });
    nodes.push({ type: "link", url: match[1] });
    last = start + match[1].length;
  }
  if (last < text.length) nodes.push({ type: "text", value: text.slice(last) });
  return nodes;
};

// content 문자열을 이미지/링크/텍스트 노드 배열로 파싱
const parseContent = (content: string): Node[] => {
  const nodes: Node[] = [];
  let last = 0;
  for (const match of content.matchAll(IMAGE_MD)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(...splitLinks(content.slice(last, start)));
    nodes.push({ type: "image", url: match[1] });
    last = start + match[0].length;
  }
  if (last < content.length) nodes.push(...splitLinks(content.slice(last)));
  return nodes;
};

const PostContent = ({ content, extraImages = [] }: PostContentProps): JSX.Element => {
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  const nodes = parseContent(content);

  return (
    <>
      <div className="font-body mt-5 whitespace-pre-wrap break-words leading-7 text-ink/90">
        {nodes.map((node, index) => {
          if (node.type === "image") {
            return (
              <button
                key={index}
                type="button"
                onClick={() => setLightbox(node.url)}
                className="my-2 block w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={node.url}
                  alt="게시글 이미지"
                  className="max-h-[600px] w-auto max-w-full cursor-zoom-in rounded-2xl border border-sand object-contain"
                />
              </button>
            );
          }
          if (node.type === "link") {
            return (
              <a
                key={index}
                href={node.url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-skydeep underline hover:text-mintdeep"
              >
                {node.url}
              </a>
            );
          }
          return <Fragment key={index}>{node.value}</Fragment>;
        })}
      </div>

      {/* 구버전 글: content에 인라인되지 않은 첨부 이미지들 */}
      {extraImages.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {extraImages.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => setLightbox(url)}
              className="block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="게시글 첨부 이미지"
                className="w-full cursor-zoom-in rounded-2xl border border-sand object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="닫기"
            className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-lg text-white hover:bg-white/40"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="크게 보기"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />
        </div>
      )}
    </>
  );
};

export default PostContent;
