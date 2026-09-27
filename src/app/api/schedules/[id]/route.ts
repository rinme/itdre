import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: params.id,
        status: "PUBLISHED",
      },
      include: {
        slots: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: "SCHEDULE_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_LOAD_SCHEDULE" }, { status: 500 });
  }
}
