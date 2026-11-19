import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import type { CourseType } from "@prisma/client";

const VALID_TYPES: CourseType[] = ["LECTURE", "LAB", "BOTH"];
const VALID_COLORS = ["orange", "blue", "emerald", "purple", "rose", "amber", "sky"];

export const PUT: RequestHandler = async ({ request, params }) => {
  try {
    const id = params.id!;
    const existing = await prisma.coursePreset.findUnique({ where: { id } });
    if (!existing) {
      return json({ error: "Preset not found" }, { status: 404 });
    }

    const body = await request.json();
    const courseCode = typeof body.courseCode === "string" && body.courseCode.trim() ? body.courseCode.trim() : existing.courseCode;
    const courseName = typeof body.courseName === "string" && body.courseName.trim() ? body.courseName.trim() : existing.courseName;
    const courseType: CourseType = VALID_TYPES.includes(body.courseType) ? body.courseType : existing.courseType;
    const color =
      body.color !== undefined
        ? VALID_COLORS.includes(body.color)
          ? body.color
          : null
        : existing.color;
    const credits =
      body.credits !== undefined
        ? typeof body.credits === "string" && body.credits.trim()
          ? body.credits.trim()
          : null
        : existing.credits;

    const preset = await prisma.coursePreset.update({
      where: { id },
      data: { courseCode, courseName, credits, courseType, color },
    });
    return json({ preset });
  } catch (err) {
    console.error("PUT /api/admin/presets/[id] error:", err);
    return json({ error: "Failed to update preset" }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const id = params.id!;
    const existing = await prisma.coursePreset.findUnique({ where: { id } });
    if (!existing) {
      return json({ error: "Preset not found" }, { status: 404 });
    }
    await prisma.coursePreset.delete({ where: { id } });
    return json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/presets/[id] error:", err);
    return json({ error: "Failed to delete preset" }, { status: 500 });
  }
};
