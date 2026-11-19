import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import type { DegreeLevel } from "@prisma/client";

export const GET: RequestHandler = async ({ url }) => {
  try {
    const academicYear = url.searchParams.get("academicYear") ? Number(url.searchParams.get("academicYear")) : undefined;
    const semester = url.searchParams.get("semester") ? Number(url.searchParams.get("semester")) : undefined;
    const degreeLevel = url.searchParams.get("degreeLevel") as DegreeLevel | undefined;
    const programId = url.searchParams.get("programId") || undefined;
    const yearLevel = url.searchParams.get("yearLevel") ? Number(url.searchParams.get("yearLevel")) : undefined;

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

    return json({
      schedules,
      availableYears: distinctYears.map((y) => y.academicYear),
    });
  } catch (error) {
    return json({ error: "FAILED_TO_LOAD_PUBLIC_SCHEDULES" }, { status: 500 });
  }
};
