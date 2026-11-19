import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";

export const POST: RequestHandler = async ({ request, params }) => {
  try {
    const { targetAcademicYear, targetSemester, targetSectionGroup } = await request.json();

    const original = await prisma.schedule.findUnique({
      where: { id: params.id },
      include: { slots: true },
    });

    if (!original) {
      return json({ error: "SOURCE_SCHEDULE_NOT_FOUND" }, { status: 404 });
    }

    const cloned = await prisma.schedule.create({
      data: {
        academicYear: Number(targetAcademicYear),
        semester: Number(targetSemester),
        degreeLevel: original.degreeLevel,
        programId: original.programId,
        programName: original.programName,
        yearLevel: original.yearLevel,
        sectionGroup: targetSectionGroup ?? original.sectionGroup,
        status: "DRAFT",
        note: `Cloned from ${original.academicYear}/${original.semester}`,
        slots: {
          create: original.slots.map((slot) => ({
            courseCode: slot.courseCode,
            courseName: slot.courseName,
            section: slot.section,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            room: slot.room,
            instructors: slot.instructors,
            courseType: slot.courseType,
            color: slot.color,
          })),
        },
      },
    });

    return json({ schedule: cloned }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return json({ error: "TARGET_SCHEDULE_ALREADY_EXISTS" }, { status: 409 });
    }
    return json({ error: "FAILED_TO_CLONE_SCHEDULE" }, { status: 500 });
  }
};
