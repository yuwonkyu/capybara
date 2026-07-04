import { NextResponse } from "next/server";
import { getMemberRole } from "@/lib/admin";
import { getAuthUser } from "@/lib/supabase-server";

// 현재 로그인 사용자의 등급을 반환 (헤더에서 관리자 링크 노출 판단용)
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ role: null });
  }

  try {
    const role = await getMemberRole(user.id);
    return NextResponse.json({ role });
  } catch {
    return NextResponse.json({ role: "sprout" });
  }
}
