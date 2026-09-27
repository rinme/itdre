import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { DegreeLevel, ScheduleStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get("academicYear") ? Number(searchParams.get("academicYear")) : undefined;
    const semester = searchParams.get("semester") ? Number(searchParams.get("semester")) : undefined;
    const degreeLevel = searchParams.get("degreeLevel") as DegreeLevel | undefined;
    const status = searchParams.get("status") as ScheduleStatus | undefined;

    const schedules = await prisma.schedule.findMany({
      where: {
        ...(academicYear && { academicYear }),
        ...(semester && { semester }),
        ...(degreeLevel && { degreeLevel }),
        ...(status && { status }),
      },
      include: {
        _count: {
          select: { slots: true },
        },
      },
      orderBy: [{ academicYear: "desc" }, { semester: "asc" }, { yearLevel: "asc" }],
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_FETCH_SCHEDULES" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const schedule = await prisma.schedule.create({
      data: {
        academicYear: Number(data.academicYear),
        semester: Number(data.semester),
        degreeLevel: data.degreeLevel,
        programId: data.programId,
        programName: data.programName,
        yearLevel: Number(data.yearLevel),
        sectionGroup: data.sectionGroup || null,
        status: data.status || "DRAFT",
        note: data.note || null,
      },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "SCHEDULE_ALREADY_EXISTS" }, { status: 409 });
    }
    return NextResponse.json({ error: "FAILED_TO_CREATE_SCHEDULE" }, { status: 500 });
  }
}
