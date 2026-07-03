import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getAuthUser } from "@/lib/supabase-server";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "카카오 로그인 후 이미지를 올릴 수 있어요." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "이미지 파일을 선택해주세요." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "PNG, JPG, GIF, WEBP 이미지만 올릴 수 있어요." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "이미지는 5MB 이하만 올릴 수 있어요." },
        { status: 400 }
      );
    }

    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = getSupabaseServerClient();
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(path, buffer, { contentType: file.type });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("post-images").getPublicUrl(path);

    return NextResponse.json({ url: data.publicUrl }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "이미지를 올리지 못했습니다." },
      { status: 500 }
    );
  }
}
