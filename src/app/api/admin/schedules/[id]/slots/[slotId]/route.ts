import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectCourseSlotConflicts } from "@/lib/schedule-conflict";

export async function PUT(request: Request, { params }: { params: { id: string; slotId: string } }) {
  try {
    const data = await request.json();

    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      return NextResponse.json({ error: "INVALID_TIME_RANGE" }, { status: 400 });
    }

    const existingSlots = await prisma.courseSlot.findMany({
      where: { scheduleId: params.id },
    });

    const conflicts = detectCourseSlotConflicts({ ...data, id: params.slotId }, existingSlots);

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
        ...(data.instructor !== undefined && { instructor: data.instructor }),
        ...(data.courseType && { courseType: data.courseType }),
        ...(data.color && { color: data.color }),
      },
    });

    return NextResponse.json({ slot: updated, conflicts });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_UPDATE_SLOT" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string; slotId: string } }) {
  try {
    await prisma.courseSlot.delete({
      where: { id: params.slotId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_DELETE_SLOT" }, { status: 500 });
  }
}
