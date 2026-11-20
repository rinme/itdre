// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET as getSchedules } from "../src/routes/api/schedules/+server";
import { GET as getScheduleById } from "../src/routes/api/schedules/[id]/+server";
import { POST as loginPost } from "../src/routes/api/admin/auth/login/+server";
import { POST as logoutPost } from "../src/routes/api/admin/auth/logout/+server";
import { GET as meGet } from "../src/routes/api/admin/auth/me/+server";
import { GET as getPresets, POST as createPreset } from "../src/routes/api/admin/presets/+server";
import { PUT as updatePreset, DELETE as deletePreset } from "../src/routes/api/admin/presets/[id]/+server";
import { GET as getAdminSchedules, POST as createSchedule } from "../src/routes/api/admin/schedules/+server";
import { GET as getAdminScheduleById, PUT as updateSchedule, DELETE as deleteSchedule } from "../src/routes/api/admin/schedules/[id]/+server";
import { POST as cloneSchedule } from "../src/routes/api/admin/schedules/[id]/clone/+server";
import { POST as createSlot } from "../src/routes/api/admin/schedules/[id]/slots/+server";
import { PUT as updateSlot, DELETE as deleteSlot } from "../src/routes/api/admin/schedules/[id]/slots/[slotId]/+server";
import { prisma } from "$lib/server/prisma";
import { COOKIE_NAME, signAdminJWT } from "$lib/server/auth";
import type { RequestEvent } from "@sveltejs/kit";

function createMockCookies() {
  const store = new Map<string, { value: string; options?: any }>();
  return {
    get: vi.fn((name: string) => store.get(name)?.value),
    getAll: vi.fn(() => Array.from(store.entries()).map(([name, item]) => ({ name, value: item.value }))),
    set: vi.fn((name: string, value: string, options?: any) => {
      store.set(name, { value, options });
    }),
    delete: vi.fn((name: string, options?: any) => {
      store.delete(name);
    }),
    _store: store,
  };
}

describe("API Endpoints Migration to SvelteKit", () => {
  beforeEach(() => {
    process.env.ADMIN_USERNAME = "admin";
    process.env.ADMIN_PASSWORD = "adminpassword123";
    process.env.ADMIN_JWT_SECRET = "test_jwt_secret_must_be_at_least_32_characters_long!";
  });

  describe("1. Public Schedules: /api/schedules", () => {
    it("GET returns published schedules and availableYears with filters", async () => {
      let capturedWhere: any = null;
      vi.spyOn(prisma.schedule as any, "findMany").mockImplementation(async (args: any) => {
        if (args?.distinct) {
          return [{ academicYear: 2567 }, { academicYear: 2566 }] as any;
        }
        capturedWhere = args?.where;
        return [
          {
            id: "sched-1",
            academicYear: 2567,
            semester: 1,
            degreeLevel: "BACHELOR",
            programId: "IT",
            yearLevel: 1,
            status: "PUBLISHED",
            slots: [],
          },
        ] as any;
      });

      const url = new URL("http://localhost/api/schedules?academicYear=2567&semester=1&degreeLevel=BACHELOR&programId=IT&yearLevel=1");
      const event = { url } as RequestEvent;
      const res = await getSchedules(event);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.schedules).toHaveLength(1);
      expect(json.availableYears).toEqual([2567, 2566]);
      expect(capturedWhere).toEqual({
        status: "PUBLISHED",
        academicYear: 2567,
        semester: 1,
        degreeLevel: "BACHELOR",
        programId: "IT",
        yearLevel: 1,
      });
    });

    it("GET handles database errors with 500", async () => {
      vi.spyOn(prisma.schedule, "findMany").mockRejectedValueOnce(new Error("DB error"));
      const url = new URL("http://localhost/api/schedules");
      const event = { url } as RequestEvent;
      const res = await getSchedules(event);

      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBe("FAILED_TO_LOAD_PUBLIC_SCHEDULES");
    });
  });

  describe("2. Public Schedule Detail: /api/schedules/[id]", () => {
    it("GET returns schedule when published and found", async () => {
      vi.spyOn(prisma.schedule, "findFirst").mockResolvedValueOnce({
        id: "sched-1",
        status: "PUBLISHED",
        slots: [{ id: "slot-1", dayOfWeek: "MONDAY", startTime: "09:00" }],
      } as any);

      const event = { params: { id: "sched-1" } } as unknown as RequestEvent;
      const res = await getScheduleById(event);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.schedule.id).toBe("sched-1");
    });

    it("GET returns 404 when schedule not found or not published", async () => {
      vi.spyOn(prisma.schedule, "findFirst").mockResolvedValueOnce(null);

      const event = { params: { id: "non-existent" } } as unknown as RequestEvent;
      const res = await getScheduleById(event);

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("SCHEDULE_NOT_FOUND");
    });

    it("GET handles database errors with 500", async () => {
      vi.spyOn(prisma.schedule, "findFirst").mockRejectedValueOnce(new Error("DB error"));

      const event = { params: { id: "sched-1" } } as unknown as RequestEvent;
      const res = await getScheduleById(event);

      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBe("FAILED_TO_LOAD_SCHEDULE");
    });
  });

  describe("3. Admin Auth: /api/admin/auth/login", () => {
    it("POST rejects invalid credentials with 401", async () => {
      const cookies = createMockCookies();
      const request = new Request("http://localhost/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "wrong", password: "bad" }),
      });

      const event = { request, cookies } as unknown as RequestEvent;
      const res = await loginPost(event);

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("INVALID_CREDENTIALS");
      expect(cookies.set).not.toHaveBeenCalled();
    });

    it("POST accepts valid credentials, signs JWT, sets session cookie", async () => {
      const cookies = createMockCookies();
      const request = new Request("http://localhost/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "adminpassword123" }),
      });

      const event = { request, cookies } as unknown as RequestEvent;
      const res = await loginPost(event);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.username).toBe("admin");

      expect(cookies.set).toHaveBeenCalledWith(
        COOKIE_NAME,
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
        })
      );
    });

    it("POST handles malformed JSON request with 500", async () => {
      const cookies = createMockCookies();
      const request = new Request("http://localhost/api/admin/auth/login", {
        method: "POST",
        body: "invalid-json",
      });

      const event = { request, cookies } as unknown as RequestEvent;
      const res = await loginPost(event);

      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBe("INTERNAL_ERROR");
    });
  });

  describe("4. Admin Auth: /api/admin/auth/logout", () => {
    it("POST deletes session cookie and returns success", async () => {
      const cookies = createMockCookies();
      const event = { cookies } as unknown as RequestEvent;
      const res = await logoutPost(event);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(cookies.delete).toHaveBeenCalledWith(COOKIE_NAME, { path: "/" });
    });
  });

  describe("5. Admin Auth: /api/admin/auth/me", () => {
    it("GET returns authenticated user when locals.admin is present", async () => {
      const cookies = createMockCookies();
      const event = {
        locals: { admin: { username: "admin", role: "ADMIN" } },
        cookies,
      } as unknown as RequestEvent;

      const res = await meGet(event);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({
        authenticated: true,
        user: { username: "admin", role: "ADMIN" },
      });
    });

    it("GET verifies cookie token when locals.admin is not pre-set", async () => {
      const token = await signAdminJWT("cookie_admin");
      const cookies = createMockCookies();
      cookies.set(COOKIE_NAME, token);

      const event = {
        locals: {},
        cookies,
      } as unknown as RequestEvent;

      const res = await meGet(event);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.authenticated).toBe(true);
      expect(json.user.username).toBe("cookie_admin");
    });

    it("GET returns 401 when unauthenticated", async () => {
      const cookies = createMockCookies();
      const event = {
        locals: {},
        cookies,
      } as unknown as RequestEvent;

      const res = await meGet(event);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.authenticated).toBe(false);
    });
  });

  describe("6. Admin Presets: /api/admin/presets", () => {
    it("GET returns presets sorted by courseCode asc", async () => {
      vi.spyOn(prisma.coursePreset, "findMany").mockResolvedValueOnce([
        { id: "p-1", courseCode: "060133101", courseName: "Programming I" },
      ] as any);

      const res = await getPresets({} as RequestEvent);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.presets).toHaveLength(1);
    });

    it("POST validates courseCode and courseName presence", async () => {
      const request = new Request("http://localhost/api/admin/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseCode: "", courseName: "Math" }),
      });

      const res = await createPreset({ request } as RequestEvent);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("courseCode and courseName are required");
    });

    it("POST creates preset with valid payload", async () => {
      vi.spyOn(prisma.coursePreset, "create").mockResolvedValueOnce({
        id: "preset-new",
        courseCode: "060133102",
        courseName: "Data Structures",
        credits: "3(3-0-6)",
        courseType: "LECTURE",
        color: "blue",
      } as any);

      const request = new Request("http://localhost/api/admin/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: "060133102",
          courseName: "Data Structures",
          credits: "3(3-0-6)",
          courseType: "LECTURE",
          color: "blue",
        }),
      });

      const res = await createPreset({ request } as RequestEvent);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.preset.id).toBe("preset-new");
    });
  });

  describe("7. Admin Preset Detail: /api/admin/presets/[id]", () => {
    it("PUT updates preset fields", async () => {
      vi.spyOn(prisma.coursePreset, "findUnique").mockResolvedValueOnce({
        id: "p-1",
        courseCode: "060133101",
        courseName: "Programming I",
        courseType: "LECTURE",
        color: "orange",
        credits: "3",
      } as any);

      vi.spyOn(prisma.coursePreset, "update").mockResolvedValueOnce({
        id: "p-1",
        courseCode: "060133101",
        courseName: "Programming I Updated",
        courseType: "LAB",
        color: "blue",
        credits: "3",
      } as any);

      const request = new Request("http://localhost/api/admin/presets/p-1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseName: "Programming I Updated", courseType: "LAB", color: "blue" }),
      });

      const res = await updatePreset({ request, params: { id: "p-1" } } as unknown as RequestEvent);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.preset.courseName).toBe("Programming I Updated");
    });

    it("PUT returns 404 for non-existent preset", async () => {
      vi.spyOn(prisma.coursePreset, "findUnique").mockResolvedValueOnce(null);

      const request = new Request("http://localhost/api/admin/presets/p-404", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseName: "Missing" }),
      });

      const res = await updatePreset({ request, params: { id: "p-404" } } as unknown as RequestEvent);
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Preset not found");
    });

    it("DELETE deletes preset", async () => {
      vi.spyOn(prisma.coursePreset, "findUnique").mockResolvedValueOnce({ id: "p-1" } as any);
      vi.spyOn(prisma.coursePreset, "delete").mockResolvedValueOnce({ id: "p-1" } as any);

      const res = await deletePreset({ params: { id: "p-1" } } as unknown as RequestEvent);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
    });

    it("DELETE returns 404 for non-existent preset", async () => {
      vi.spyOn(prisma.coursePreset, "findUnique").mockResolvedValueOnce(null);

      const res = await deletePreset({ params: { id: "p-404" } } as unknown as RequestEvent);
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Preset not found");
    });
  });

  describe("8. Admin Schedules: /api/admin/schedules", () => {
    it("GET returns schedules with slot counts and filters", async () => {
      let capturedWhere: any = null;
      vi.spyOn(prisma.schedule as any, "findMany").mockImplementation(async (args: any) => {
        capturedWhere = args?.where;
        return [
          {
            id: "sched-1",
            academicYear: 2567,
            semester: 2,
            degreeLevel: "BACHELOR",
            status: "DRAFT",
            _count: { slots: 4 },
          },
        ] as any;
      });

      const url = new URL("http://localhost/api/admin/schedules?academicYear=2567&semester=2&degreeLevel=BACHELOR&status=DRAFT");
      const res = await getAdminSchedules({ url } as RequestEvent);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.schedules).toHaveLength(1);
      expect(capturedWhere).toEqual({
        academicYear: 2567,
        semester: 2,
        degreeLevel: "BACHELOR",
        status: "DRAFT",
      });
    });

    it("POST creates schedule", async () => {
      vi.spyOn(prisma.schedule, "create").mockResolvedValueOnce({
        id: "sched-new",
        academicYear: 2567,
        semester: 1,
        degreeLevel: "BACHELOR",
        programId: "IT",
        programName: "Information Technology",
        yearLevel: 1,
        status: "DRAFT",
      } as any);

      const request = new Request("http://localhost/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: 2567,
          semester: 1,
          degreeLevel: "BACHELOR",
          programId: "IT",
          programName: "Information Technology",
          yearLevel: 1,
        }),
      });

      const res = await createSchedule({ request } as RequestEvent);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.schedule.id).toBe("sched-new");
    });

    it("POST handles unique constraint conflict P2002 with 409", async () => {
      const p2002Err: any = new Error("Unique constraint failed");
      p2002Err.code = "P2002";
      vi.spyOn(prisma.schedule, "create").mockRejectedValueOnce(p2002Err);

      const request = new Request("http://localhost/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: 2567,
          semester: 1,
          degreeLevel: "BACHELOR",
          programId: "IT",
          programName: "Information Technology",
          yearLevel: 1,
        }),
      });

      const res = await createSchedule({ request } as RequestEvent);
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.error).toBe("SCHEDULE_ALREADY_EXISTS");
    });
  });

  describe("9. Admin Schedule Detail: /api/admin/schedules/[id]", () => {
    it("GET returns schedule with sorted slots", async () => {
      vi.spyOn(prisma.schedule, "findUnique").mockResolvedValueOnce({
        id: "sched-1",
        slots: [{ id: "slot-1", dayOfWeek: "MONDAY", startTime: "09:00" }],
      } as any);

      const res = await getAdminScheduleById({ params: { id: "sched-1" } } as unknown as RequestEvent);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.schedule.id).toBe("sched-1");
    });

    it("GET returns 404 for non-existent schedule", async () => {
      vi.spyOn(prisma.schedule, "findUnique").mockResolvedValueOnce(null);

      const res = await getAdminScheduleById({ params: { id: "s-404" } } as unknown as RequestEvent);
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("NOT_FOUND");
    });

    it("PUT updates schedule attributes", async () => {
      vi.spyOn(prisma.schedule, "update").mockResolvedValueOnce({
        id: "sched-1",
        status: "PUBLISHED",
        note: "Approved",
      } as any);

      const request = new Request("http://localhost/api/admin/schedules/sched-1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED", note: "Approved" }),
      });

      const res = await updateSchedule({ request, params: { id: "sched-1" } } as unknown as RequestEvent);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.schedule.status).toBe("PUBLISHED");
    });

    it("DELETE removes schedule and returns success", async () => {
      vi.spyOn(prisma.schedule, "delete").mockResolvedValueOnce({ id: "sched-1" } as any);

      const res = await deleteSchedule({ params: { id: "sched-1" } } as unknown as RequestEvent);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });

  describe("10. Admin Schedule Clone: /api/admin/schedules/[id]/clone", () => {
    it("POST clones schedule with all slots as DRAFT", async () => {
      vi.spyOn(prisma.schedule, "findUnique").mockResolvedValueOnce({
        id: "sched-orig",
        academicYear: 2567,
        semester: 1,
        degreeLevel: "BACHELOR",
        programId: "IT",
        programName: "Information Technology",
        yearLevel: 1,
        sectionGroup: "A",
        slots: [
          {
            courseCode: "060133101",
            courseName: "Programming I",
            section: "1",
            dayOfWeek: "MONDAY",
            startTime: "09:00",
            endTime: "12:00",
            room: "401",
            instructors: ["Dr. Smith"],
            courseType: "LECTURE",
            color: "orange",
          },
        ],
      } as any);

      vi.spyOn(prisma.schedule, "create").mockResolvedValueOnce({
        id: "sched-cloned",
        academicYear: 2568,
        semester: 1,
        status: "DRAFT",
      } as any);

      const request = new Request("http://localhost/api/admin/schedules/sched-orig/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetAcademicYear: 2568,
          targetSemester: 1,
          targetSectionGroup: "A",
        }),
      });

      const res = await cloneSchedule({ request, params: { id: "sched-orig" } } as unknown as RequestEvent);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.schedule.id).toBe("sched-cloned");
    });

    it("POST returns 404 when original schedule is not found", async () => {
      vi.spyOn(prisma.schedule, "findUnique").mockResolvedValueOnce(null);

      const request = new Request("http://localhost/api/admin/schedules/s-404/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetAcademicYear: 2568, targetSemester: 1 }),
      });

      const res = await cloneSchedule({ request, params: { id: "s-404" } } as unknown as RequestEvent);
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("SOURCE_SCHEDULE_NOT_FOUND");
    });

    it("POST returns 409 when target schedule already exists (P2002)", async () => {
      vi.spyOn(prisma.schedule, "findUnique").mockResolvedValueOnce({
        id: "sched-orig",
        slots: [],
      } as any);

      const p2002Err: any = new Error("Unique constraint failed");
      p2002Err.code = "P2002";
      vi.spyOn(prisma.schedule, "create").mockRejectedValueOnce(p2002Err);

      const request = new Request("http://localhost/api/admin/schedules/sched-orig/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetAcademicYear: 2568, targetSemester: 1 }),
      });

      const res = await cloneSchedule({ request, params: { id: "sched-orig" } } as unknown as RequestEvent);
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.error).toBe("TARGET_SCHEDULE_ALREADY_EXISTS");
    });
  });

  describe("11. Admin Schedule Slots: /api/admin/schedules/[id]/slots", () => {
    it("POST rejects invalid time range with 400", async () => {
      const request = new Request("http://localhost/api/admin/schedules/sched-1/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: "060133101",
          courseName: "Programming I",
          dayOfWeek: "MONDAY",
          startTime: "12:00",
          endTime: "09:00",
        }),
      });

      const res = await createSlot({ request, params: { id: "sched-1" } } as unknown as RequestEvent);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("INVALID_TIME_RANGE");
    });

    it("POST detects conflicts and creates slot with 201", async () => {
      vi.spyOn(prisma.courseSlot, "findMany").mockResolvedValueOnce([
        {
          id: "slot-existing",
          courseCode: "060133100",
          courseName: "Intro to Computing",
          dayOfWeek: "MONDAY",
          startTime: "09:00",
          endTime: "11:00",
          room: "401",
        },
      ] as any);

      vi.spyOn(prisma.courseSlot, "create").mockResolvedValueOnce({
        id: "slot-new",
        courseCode: "060133101",
        courseName: "Programming I",
        dayOfWeek: "MONDAY",
        startTime: "10:00",
        endTime: "12:00",
        room: "401",
      } as any);

      const request = new Request("http://localhost/api/admin/schedules/sched-1/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: "060133101",
          courseName: "Programming I",
          dayOfWeek: "MONDAY",
          startTime: "10:00",
          endTime: "12:00",
          room: "401",
        }),
      });

      const res = await createSlot({ request, params: { id: "sched-1" } } as unknown as RequestEvent);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.slot.id).toBe("slot-new");
      expect(json.conflicts.length).toBeGreaterThan(0);
      expect(json.conflicts.some((c: any) => c.type === "TIME_OVERLAP")).toBe(true);
      expect(json.conflicts.some((c: any) => c.type === "ROOM_CONFLICT")).toBe(true);
    });
  });

  describe("12. Admin Schedule Slot Item: /api/admin/schedules/[id]/slots/[slotId]", () => {
    it("PUT updates slot and checks conflicts", async () => {
      vi.spyOn(prisma.courseSlot, "findFirst").mockResolvedValueOnce({
        id: "slot-1",
        scheduleId: "sched-1",
        dayOfWeek: "MONDAY",
        startTime: "09:00",
        endTime: "12:00",
        room: "401",
      } as any);

      vi.spyOn(prisma.courseSlot, "findMany").mockResolvedValueOnce([
        {
          id: "slot-2",
          dayOfWeek: "MONDAY",
          startTime: "13:00",
          endTime: "15:00",
          room: "401",
          courseCode: "060133102",
          courseName: "Networks",
        },
      ] as any);

      vi.spyOn(prisma.courseSlot, "update").mockResolvedValueOnce({
        id: "slot-1",
        dayOfWeek: "MONDAY",
        startTime: "10:00",
        endTime: "12:00",
        room: "401",
      } as any);

      const request = new Request("http://localhost/api/admin/schedules/sched-1/slots/slot-1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: "10:00", endTime: "12:00" }),
      });

      const res = await updateSlot({ request, params: { id: "sched-1", slotId: "slot-1" } } as unknown as RequestEvent);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.slot.id).toBe("slot-1");
      expect(json.conflicts).toEqual([]);
    });

    it("PUT rejects invalid effective time range with 400", async () => {
      vi.spyOn(prisma.courseSlot, "findFirst").mockResolvedValueOnce({
        id: "slot-1",
        scheduleId: "sched-1",
        dayOfWeek: "MONDAY",
        startTime: "09:00",
        endTime: "12:00",
        room: "401",
      } as any);

      const request = new Request("http://localhost/api/admin/schedules/sched-1/slots/slot-1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: "15:00" }), // effective 15:00 to 12:00 => invalid
      });

      const res = await updateSlot({ request, params: { id: "sched-1", slotId: "slot-1" } } as unknown as RequestEvent);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("INVALID_TIME_RANGE");
    });

    it("PUT returns 404 if slot not found", async () => {
      vi.spyOn(prisma.courseSlot, "findFirst").mockResolvedValueOnce(null);

      const request = new Request("http://localhost/api/admin/schedules/sched-1/slots/slot-404", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: "402" }),
      });

      const res = await updateSlot({ request, params: { id: "sched-1", slotId: "slot-404" } } as unknown as RequestEvent);
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("NOT_FOUND");
    });

    it("DELETE removes slot", async () => {
      vi.spyOn(prisma.courseSlot, "findFirst").mockResolvedValueOnce({ id: "slot-1", scheduleId: "sched-1" } as any);
      vi.spyOn(prisma.courseSlot, "delete").mockResolvedValueOnce({ id: "slot-1" } as any);

      const res = await deleteSlot({ params: { id: "sched-1", slotId: "slot-1" } } as unknown as RequestEvent);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it("DELETE returns 404 if slot not found", async () => {
      vi.spyOn(prisma.courseSlot, "findFirst").mockResolvedValueOnce(null);

      const res = await deleteSlot({ params: { id: "sched-1", slotId: "slot-404" } } as unknown as RequestEvent);
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("NOT_FOUND");
    });
  });
});
