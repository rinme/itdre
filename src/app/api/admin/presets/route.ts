import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CourseType } from "@prisma/client";

export const dynamic = "force-dynamic";

const VALID_TYPES: CourseType[] = ["LECTURE", "LAB", "BOTH"];
const VALID_COLORS = ["orange", "blue", "emerald", "purple", "rose", "amber", "sky"];

export async function GET() {
  try {
    const presets = await prisma.coursePreset.findMany({
      orderBy: { courseCode: "asc" },
    });
    return NextResponse.json({ presets });
  } catch (err) {
    console.error("GET /api/admin/presets error:", err);
    return NextResponse.json({ error: "Failed to load presets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const courseCode = typeof body.courseCode === "string" ? body.courseCode.trim() : "";
    const courseName = typeof body.courseName === "string" ? body.courseName.trim() : "";

    if (!courseCode || !courseName) {
      return NextResponse.json({ error: "courseCode and courseName are required" }, { status: 400 });
    }

    const courseType: CourseType = VALID_TYPES.includes(body.courseType) ? body.courseType : "LECTURE";
    const color = VALID_COLORS.includes(body.color) ? body.color : null;
    const credits = typeof body.credits === "string" && body.credits.trim() ? body.credits.trim() : null;

    const preset = await prisma.coursePreset.create({
      data: { courseCode, courseName, credits, courseType, color },
    });
    return NextResponse.json({ preset }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/presets error:", err);
    return NextResponse.json({ error: "Failed to create preset" }, { status: 500 });
  }
}
