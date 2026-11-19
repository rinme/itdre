import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import { detectCourseSlotConflicts } from "$lib/utils/schedule-conflict";

export const PUT: RequestHandler = async ({ request, params }) => {
  try {
    const data = await request.json();

    const existingSlot = await prisma.courseSlot.findFirst({
      where: { id: params.slotId, scheduleId: params.id },
    });

    if (!existingSlot) {
      return json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const effectiveStartTime = data.startTime ?? existingSlot.startTime;
    const effectiveEndTime = data.endTime ?? existingSlot.endTime;
    const effectiveDayOfWeek = data.dayOfWeek ?? existingSlot.dayOfWeek;
    const effectiveRoom = data.room !== undefined ? data.room : existingSlot.room;

    if (!effectiveStartTime || !effectiveEndTime || effectiveStartTime >= effectiveEndTime) {
      return json({ error: "INVALID_TIME_RANGE" }, { status: 400 });
    }

    const otherSlots = await prisma.courseSlot.findMany({
      where: { scheduleId: params.id },
    });

    const conflicts = detectCourseSlotConflicts(
      {
        id: params.slotId,
        dayOfWeek: effectiveDayOfWeek,
        startTime: effectiveStartTime,
        endTime: effectiveEndTime,
        room: effectiveRoom,
      },
      otherSlots
    );

    const updated = await prisma.courseSlot.update({
      where: { id: params.slotId },
      data: {
        ...(data.courseCode && { courseCode: data.courseCode }),
        ...(data.courseName && { courseName: data.courseName }),
        ...(data.section !== undefined && { section: data.section }),
        ...(data.dayOfWeek && { dayOfWeek: data.dayOfWeek }),
        ...(data.startTime && { startTime: data.startTime }),
        ...(data.endTime && { endTime: data.endTime }),
        ...(data.room !== undefined && { room: data.room }),
        ...(data.instructors !== undefined && {
          instructors: Array.isArray(data.instructors) ? data.instructors.filter(Boolean) : [],
        }),
        ...(data.courseType && { courseType: data.courseType }),
        ...(data.color && { color: data.color }),
      },
    });

    return json({ slot: updated, conflicts });
  } catch (error) {
    return json({ error: "FAILED_TO_UPDATE_SLOT" }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const existingSlot = await prisma.courseSlot.findFirst({
      where: { id: params.slotId, scheduleId: params.id },
    });

    if (!existingSlot) {
      return json({ error: "NOT_FOUND" }, { status: 404 });
    }

    await prisma.courseSlot.delete({
      where: { id: params.slotId },
    });
    return json({ success: true });
  } catch (error) {
    return json({ error: "FAILED_TO_DELETE_SLOT" }, { status: 500 });
  }
};
