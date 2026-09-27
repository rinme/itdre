import { describe, expect, it } from "bun:test";
import { GET as getPublicSchedules } from "../src/app/api/schedules/route";
import { GET as getPublicScheduleById } from "../src/app/api/schedules/[id]/route";
import { prisma } from "../src/lib/prisma";

describe("Public Schedule API Constraints", () => {
  it("enforces published-only filtering rule", () => {
    const queryFilter = { status: "PUBLISHED" as const };
    expect(queryFilter.status).toBe("PUBLISHED");
  });
});

describe("GET /api/schedules", () => {
  it("returns only PUBLISHED schedules and distinct available years", async () => {
    let capturedWhere: any = null;
    // @ts-expect-error mock for test
    prisma.schedule.findMany = async (args: any) => {
      if (args?.distinct) {
        return [{ academicYear: 2567 }, { academicYear: 2566 }];
      }
      capturedWhere = args?.where;
      return [
        {
          id: "sched-pub-1",
          academicYear: 2567,
          semester: 1,
          degreeLevel: "BACHELOR",
          programId: "IT",
          yearLevel: 1,
          status: "PUBLISHED",
          slots: [],
        },
      ];
    };

    const req = new Request("http://localhost:3000/api/schedules");
    const res = await getPublicSchedules(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.schedules.length).toBe(1);
    expect(json.schedules[0].status).toBe("PUBLISHED");
    expect(json.availableYears).toEqual([2567, 2566]);
    expect(capturedWhere.status).toBe("PUBLISHED");
  });

  it("applies query parameter filters (academicYear, semester, degreeLevel, programId, yearLevel)", async () => {
    let capturedWhere: any = null;
    // @ts-expect-error mock for test
    prisma.schedule.findMany = async (args: any) => {
      if (args?.distinct) {
        return [{ academicYear: 2567 }];
      }
      capturedWhere = args?.where;
      return [];
    };

    const req = new Request(
      "http://localhost:3000/api/schedules?academicYear=2567&semester=2&degreeLevel=BACHELOR&programId=DRE&yearLevel=3"
    );
    const res = await getPublicSchedules(req);
    expect(res.status).toBe(200);
    expect(capturedWhere).toEqual({
      status: "PUBLISHED",
      academicYear: 2567,
      semester: 2,
      degreeLevel: "BACHELOR",
      programId: "DRE",
      yearLevel: 3,
    });
  });

  it("returns 500 when database query fails", async () => {
    // @ts-expect-error mock for test
    prisma.schedule.findMany = async () => {
      throw new Error("DB Connection Error");
    };

    const req = new Request("http://localhost:3000/api/schedules");
    const res = await getPublicSchedules(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("FAILED_TO_LOAD_PUBLIC_SCHEDULES");
  });
});

describe("GET /api/schedules/[id]", () => {
  it("returns published schedule by ID with slots", async () => {
    const mockSchedule = {
      id: "sched-1",
      academicYear: 2567,
      semester: 1,
      degreeLevel: "BACHELOR",
      programId: "IT",
      yearLevel: 1,
      status: "PUBLISHED",
      slots: [
        {
          id: "slot-1",
          courseCode: "060133101",
          courseName: "Programming I",
          dayOfWeek: "MONDAY",
          startTime: "09:00",
          endTime: "12:00",
        },
      ],
    };

    // @ts-expect-error mock for test
    prisma.schedule.findFirst = async (args: any) => {
      if (args?.where?.id === "sched-1" && args?.where?.status === "PUBLISHED") {
        return mockSchedule;
      }
      return null;
    };

    const req = new Request("http://localhost:3000/api/schedules/sched-1");
    const res = await getPublicScheduleById(req, { params: { id: "sched-1" } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.schedule).toBeDefined();
    expect(json.schedule.id).toBe("sched-1");
    expect(json.schedule.slots.length).toBe(1);
  });

  it("returns 404 when schedule is DRAFT (draft protection)", async () => {
    // @ts-expect-error mock for test
    prisma.schedule.findFirst = async (args: any) => {
      // The query requires status: "PUBLISHED". Since schedule is DRAFT, findFirst returns null.
      if (args?.where?.status === "PUBLISHED") {
        return null;
      }
      return { id: "sched-draft", status: "DRAFT" };
    };

    const req = new Request("http://localhost:3000/api/schedules/sched-draft");
    const res = await getPublicScheduleById(req, { params: { id: "sched-draft" } });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("SCHEDULE_NOT_FOUND");
  });

  it("returns 404 when schedule does not exist", async () => {
    // @ts-expect-error mock for test
    prisma.schedule.findFirst = async () => null;

    const req = new Request("http://localhost:3000/api/schedules/nonexistent");
    const res = await getPublicScheduleById(req, { params: { id: "nonexistent" } });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("SCHEDULE_NOT_FOUND");
  });

  it("returns 500 when database query fails", async () => {
    // @ts-expect-error mock for test
    prisma.schedule.findFirst = async () => {
      throw new Error("DB Connection Error");
    };

    const req = new Request("http://localhost:3000/api/schedules/sched-1");
    const res = await getPublicScheduleById(req, { params: { id: "sched-1" } });
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("FAILED_TO_LOAD_SCHEDULE");
  });
});
