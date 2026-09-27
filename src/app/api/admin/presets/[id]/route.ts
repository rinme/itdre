import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CourseType } from "@prisma/client";

export const dynamic = "force-dynamic";

const VALID_TYPES: CourseType[] = ["LECTURE", "LAB", "BOTH"];
const VALID_COLORS = ["orange", "blue", "emerald", "purple", "rose", "amber", "sky"];

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.coursePreset.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    const body = await request.json();
    const courseCode = typeof body.courseCode === "string" && body.courseCode.trim() ? body.courseCode.trim() : existing.courseCode;
    const courseName = typeof body.courseName === "string" && body.courseName.trim() ? body.courseName.trim() : existing.courseName;
    const courseType: CourseType = VALID_TYPES.includes(body.courseType) ? body.courseType : existing.courseType;
    const color = VALID_COLORS.includes(body.color) ? body.color : existing.color;
    const credits = typeof body.credits === "string" && body.credits.trim() ? body.credits.trim() : existing.credits;

    const preset = await prisma.coursePreset.update({
      where: { id: params.id },
      data: { courseCode, courseName, credits, courseType, color },
    });
    return NextResponse.json({ preset });
  } catch (err) {
    console.error("PUT /api/admin/presets/[id] error:", err);
    return NextResponse.json({ error: "Failed to update preset" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.coursePreset.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }
    await prisma.coursePreset.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/presets/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete preset" }, { status: 500 });
  }
}
