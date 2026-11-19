import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import { detectCourseSlotConflicts } from "$lib/utils/schedule-conflict";

export const POST: RequestHandler = async ({ request, params }) => {
  try {
    const data = await request.json();

    if (!data.startTime || !data.endTime || data.startTime >= data.endTime) {
      return json({ error: "INVALID_TIME_RANGE" }, { status: 400 });
    }

    const existingSlots = await prisma.courseSlot.findMany({
      where: { scheduleId: params.id },
    });

    const conflicts = detectCourseSlotConflicts(data, existingSlots);

    const slot = await prisma.courseSlot.create({
      data: {
        scheduleId: params.id!,
        courseCode: data.courseCode,
        courseName: data.courseName,
        section: data.section || null,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room || null,
        instructors: Array.isArray(data.instructors) ? data.instructors.filter(Boolean) : [],
        courseType: data.courseType || "LECTURE",
        color: data.color || "orange",
      },
    });

    return json({ slot, conflicts }, { status: 201 });
  } catch (error) {
    return json({ error: "FAILED_TO_CREATE_SLOT" }, { status: 500 });
  }
};
