import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import type { CourseType } from "@prisma/client";

const VALID_TYPES: CourseType[] = ["LECTURE", "LAB", "BOTH"];
const VALID_COLORS = ["orange", "blue", "emerald", "purple", "rose", "amber", "sky"];

export const GET: RequestHandler = async () => {
  try {
    const presets = await prisma.coursePreset.findMany({
      orderBy: { courseCode: "asc" },
    });
    return json({ presets });
  } catch (err) {
    console.error("GET /api/admin/presets error:", err);
    return json({ error: "Failed to load presets" }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const courseCode = typeof body.courseCode === "string" ? body.courseCode.trim() : "";
    const courseName = typeof body.courseName === "string" ? body.courseName.trim() : "";

    if (!courseCode || !courseName) {
      return json({ error: "courseCode and courseName are required" }, { status: 400 });
    }

    const courseType: CourseType = VALID_TYPES.includes(body.courseType) ? body.courseType : "LECTURE";
    const color = VALID_COLORS.includes(body.color) ? body.color : null;
    const credits = typeof body.credits === "string" && body.credits.trim() ? body.credits.trim() : null;

    const preset = await prisma.coursePreset.create({
      data: { courseCode, courseName, credits, courseType, color },
    });
    return json({ preset }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/presets error:", err);
    return json({ error: "Failed to create preset" }, { status: 500 });
  }
};
