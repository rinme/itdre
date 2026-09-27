import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectCourseSlotConflicts } from "@/lib/schedule-conflict";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();

    if (!data.startTime || !data.endTime || data.startTime >= data.endTime) {
      return NextResponse.json({ error: "INVALID_TIME_RANGE" }, { status: 400 });
    }

    const existingSlots = await prisma.courseSlot.findMany({
      where: { scheduleId: params.id },
    });

    const conflicts = detectCourseSlotConflicts(data, existingSlots);

    const slot = await prisma.courseSlot.create({
      data: {
        scheduleId: params.id,
        courseCode: data.courseCode,
        courseName: data.courseName,
        section: data.section || null,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room || null,
        instructor: data.instructor || null,
        courseType: data.courseType || "LECTURE",
        color: data.color || "orange",
      },
    });

    return NextResponse.json({ slot, conflicts }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_CREATE_SLOT" }, { status: 500 });
  }
}
