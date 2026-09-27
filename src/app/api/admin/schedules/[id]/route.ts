import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: params.id },
      include: {
        slots: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_FETCH_SCHEDULE" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const updated = await prisma.schedule.update({
      where: { id: params.id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.note !== undefined && { note: data.note }),
        ...(data.sectionGroup !== undefined && { sectionGroup: data.sectionGroup }),
      },
    });

    return NextResponse.json({ schedule: updated });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_UPDATE_SCHEDULE" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.schedule.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_DELETE_SCHEDULE" }, { status: 500 });
  }
}
