import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";

export const GET: RequestHandler = async ({ params }) => {
  try {
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: params.id,
        status: "PUBLISHED",
      },
      include: {
        slots: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!schedule) {
      return json({ error: "SCHEDULE_NOT_FOUND" }, { status: 404 });
    }

    return json({ schedule });
  } catch (error) {
    return json({ error: "FAILED_TO_LOAD_SCHEDULE" }, { status: 500 });
  }
};
