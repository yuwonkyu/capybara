import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { isAdminUser } from "@/lib/admin";
import { GUILDS, fetchDonations, summarize } from "@/lib/donations";
import { getAuthUser } from "@/lib/supabase-server";
import { ROLE_LABELS } from "@/lib/types";

// 카피/카피랜드를 각각 시트로 담은 엑셀(.xlsx) 파일을 생성한다.
// (CSV는 시트 개념이 없어 길드별로 탭을 나눌 수 없다)
// 전체 회원의 등급·투자 내역이 파일로 나가는 기능이라 관리자 전용으로 제한한다.
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "카카오 로그인이 필요합니다." }, { status: 401 });
  }
  if (!(await isAdminUser(user.id))) {
    return NextResponse.json(
      { error: "엑셀 다운로드는 관리자만 이용할 수 있어요." },
      { status: 403 }
    );
  }

  try {
    const workbook = XLSX.utils.book_new();

    for (const guild of GUILDS) {
      const donations = (await fetchDonations(guild, 1000)) ?? [];
      const summary = await summarize(donations);

      const rows = [
        ["아이디", "투자횟수", "회원등급"],
        ...summary.rows.map((r) => [
          r.nickname,
          r.totalCount,
          r.role ? ROLE_LABELS[r.role] : "미연동",
        ]),
      ];

      const sheet = XLSX.utils.aoa_to_sheet(rows);
      sheet["!cols"] = [{ wch: 16 }, { wch: 10 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(workbook, sheet, guild);
    }

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          "길드기부현황.xlsx"
        )}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "엑셀 파일을 만들지 못했습니다.",
      },
      { status: 500 }
    );
  }
}
