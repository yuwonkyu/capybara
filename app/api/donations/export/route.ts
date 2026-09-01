import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { isAdminUser } from "@/lib/admin";
import { Donation, GUILDS, fetchDonations, summarize } from "@/lib/donations";
import { getAuthUser } from "@/lib/supabase-server";
import { ROLE_LABELS } from "@/lib/types";

// 디스코드 업로드 시각(created_at)을 KST 기준으로 포맷한다.
const formatKST = (iso: string, opts: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", ...opts }).format(
    new Date(iso)
  );

const monthKey = (iso: string) =>
  formatKST(iso, { year: "numeric", month: "2-digit" });

const dateTimeLabel = (iso: string) =>
  formatKST(iso, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const buildGuildSheets = (workbook: XLSX.WorkBook, donations: Record<string, Donation[]>) =>
  Promise.all(
    GUILDS.map(async (guild) => {
      const summary = await summarize(donations[guild] ?? []);

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
    })
  );

// 디스코드 업로드 날짜(created_at, KST 기준) 기준으로 월별 시트를 나눠
// 건별 원본 내역을 담는다. 길드 구분은 시트 안 컬럼으로 표시한다.
const buildMonthlySheets = (workbook: XLSX.WorkBook, allDonations: Donation[]) => {
  const byMonth = new Map<string, Donation[]>();
  for (const d of allDonations) {
    const key = monthKey(d.created_at);
    const list = byMonth.get(key) ?? [];
    list.push(d);
    byMonth.set(key, list);
  }

  const months = [...byMonth.keys()].sort();
  for (const month of months) {
    const list = byMonth.get(month)!.sort(
      (a, b) => a.created_at.localeCompare(b.created_at)
    );

    const rows = [
      ["날짜", "닉네임", "길드", "투자횟수", "기부액(만메소)", "디스코드 작성자", "검토필요", "메시지 원문"],
      ...list.map((d) => [
        dateTimeLabel(d.created_at),
        d.nickname,
        d.guild,
        d.invest_count,
        d.amount_man,
        d.discord_name ?? "",
        d.needs_review ? "O" : "",
        d.discord_content ?? "",
      ]),
    ];

    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet["!cols"] = [
      { wch: 16 },
      { wch: 14 },
      { wch: 10 },
      { wch: 10 },
      { wch: 14 },
      { wch: 14 },
      { wch: 8 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(workbook, sheet, month);
  }
};

// 카피/카피랜드를 각각 시트로 담거나(기본), 디스코드 업로드 날짜 기준 월별
// 시트로 나눈(?by=month) 엑셀(.xlsx) 파일을 생성한다.
// (CSV는 시트 개념이 없어 탭을 나눌 수 없다)
// 전체 회원의 등급·투자 내역이 파일로 나가는 기능이라 관리자 전용으로 제한한다.
export async function GET(request: NextRequest) {
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

  const byMonth = request.nextUrl.searchParams.get("by") === "month";

  try {
    const workbook = XLSX.utils.book_new();
    const donationsByGuild: Record<string, Donation[]> = {};
    for (const guild of GUILDS) {
      donationsByGuild[guild] = (await fetchDonations(guild, 1000)) ?? [];
    }

    if (byMonth) {
      buildMonthlySheets(workbook, Object.values(donationsByGuild).flat());
    } else {
      await buildGuildSheets(workbook, donationsByGuild);
    }

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
    const filename = byMonth ? "월별기부내역.xlsx" : "길드기부현황.xlsx";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          filename
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
