import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";

export const GET: RequestHandler = async ({ params }) => {
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
      return json({ error: "NOT_FOUND" }, { status: 404 });
    }

    return json({ schedule });
  } catch (error) {
    console.error("GET /api/admin/schedules/[id] error:", error);
    return json({ error: "FAILED_TO_FETCH_SCHEDULE" }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request, params }) => {
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

    return json({ schedule: updated });
  } catch (error) {
    return json({ error: "FAILED_TO_UPDATE_SCHEDULE" }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    await prisma.schedule.delete({
      where: { id: params.id },
    });
    return json({ success: true });
  } catch (error) {
    return json({ error: "FAILED_TO_DELETE_SCHEDULE" }, { status: 500 });
  }
};
