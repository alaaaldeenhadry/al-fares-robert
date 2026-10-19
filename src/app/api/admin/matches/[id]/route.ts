import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    // تغيير الحالة (فتح/إغلاق/إنهاء)
    if (body.action === "change_status") {
      const result = await sql`
        update matches
        set status = ${body.status}
        where id = ${id}
        returning *
      `;
      return NextResponse.json({ data: result[0] });
    }

    // إنهاء المباراة مع النتيجة
    if (body.action === "finish") {
      const { final_score1, final_score2 } = body;
      const result = await sql`
        update matches
        set status = 'finished',
            final_score1 = ${final_score1},
            final_score2 = ${final_score2}
        where id = ${id}
        returning *
      `;
      return NextResponse.json({ data: result[0] });
    }

    // تعديل عادي
    const {
      team1, team2, team1_logo, team2_logo, league,
      match_date, predictions_close_at,
    } = body;

    const result = await sql`
      update matches
      set team1 = ${team1},
          team2 = ${team2},
          team1_logo = ${team1_logo || ""},
          team2_logo = ${team2_logo || ""},
          league = ${league || ""},
          match_date = ${match_date},
          predictions_close_at = ${predictions_close_at}
      where id = ${id}
      returning *
    `;

    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await sql`delete from matches where id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}