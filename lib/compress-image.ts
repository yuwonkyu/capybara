// 업로드 전 브라우저에서 이미지를 리사이즈하고 WebP로 변환해
// Storage 저장 용량과 이후 이그레스를 줄인다.
// GIF(애니메이션 보존)와 변환 실패·역효과(용량 증가) 시에는 원본을 그대로 반환한다.
export const compressImage = async (
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<File> => {
  if (file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality)
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
};
