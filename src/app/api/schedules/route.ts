import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { DegreeLevel } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get("academicYear") ? Number(searchParams.get("academicYear")) : undefined;
    const semester = searchParams.get("semester") ? Number(searchParams.get("semester")) : undefined;
    const degreeLevel = searchParams.get("degreeLevel") as DegreeLevel | undefined;
    const programId = searchParams.get("programId") || undefined;
    const yearLevel = searchParams.get("yearLevel") ? Number(searchParams.get("yearLevel")) : undefined;

    const schedules = await prisma.schedule.findMany({
      where: {
        status: "PUBLISHED",
        ...(academicYear && { academicYear }),
        ...(semester && { semester }),
        ...(degreeLevel && { degreeLevel }),
        ...(programId && { programId }),
        ...(yearLevel && { yearLevel }),
      },
      include: {
        slots: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
      orderBy: [{ academicYear: "desc" }, { semester: "asc" }, { yearLevel: "asc" }],
    });

    const distinctYears = await prisma.schedule.findMany({
      where: { status: "PUBLISHED" },
      select: { academicYear: true },
      distinct: ["academicYear"],
      orderBy: { academicYear: "desc" },
    });

    return NextResponse.json({
      schedules,
      availableYears: distinctYears.map((y) => y.academicYear),
    });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_LOAD_PUBLIC_SCHEDULES" }, { status: 500 });
  }
}
