import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import type { DegreeLevel, ScheduleStatus } from "@prisma/client";

export const GET: RequestHandler = async ({ url }) => {
  try {
    const academicYear = url.searchParams.get("academicYear") ? Number(url.searchParams.get("academicYear")) : undefined;
    const semester = url.searchParams.get("semester") ? Number(url.searchParams.get("semester")) : undefined;
    const degreeLevel = url.searchParams.get("degreeLevel") as DegreeLevel | undefined;
    const status = url.searchParams.get("status") as ScheduleStatus | undefined;

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

    return json({ schedules });
  } catch (error) {
    console.error("GET /api/admin/schedules error:", error);
    return json({ error: "FAILED_TO_FETCH_SCHEDULES" }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
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

    return json({ schedule }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return json({ error: "SCHEDULE_ALREADY_EXISTS" }, { status: 409 });
    }
    return json({ error: "FAILED_TO_CREATE_SCHEDULE" }, { status: 500 });
  }
};
