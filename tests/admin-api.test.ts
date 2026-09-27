import { describe, expect, it, beforeAll } from "bun:test";
import { POST as loginPost } from "../src/app/api/admin/auth/login/route";
import { POST as logoutPost } from "../src/app/api/admin/auth/logout/route";
import { POST as createSlotPost } from "../src/app/api/admin/schedules/[id]/slots/route";
import { PUT as updateSlotPut } from "../src/app/api/admin/schedules/[id]/slots/[slotId]/route";
import { COOKIE_NAME } from "../src/lib/auth";

describe("Admin API Auth & Validation", () => {
  beforeAll(() => {
    process.env.ADMIN_USERNAME = "test_admin";
    process.env.ADMIN_PASSWORD = "SecretPassword123!";
    process.env.ADMIN_JWT_SECRET = "01234567890123456789012345678901";
  });

  describe("POST /api/admin/auth/login", () => {
    it("returns 401 for invalid credentials", async () => {
      const req = new Request("http://localhost:3000/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "wrong", password: "wrong" }),
      });
      const res = await loginPost(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("INVALID_CREDENTIALS");
    });

    it("returns 200 and sets session cookie for valid credentials", async () => {
      const req = new Request("http://localhost:3000/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "test_admin", password: "SecretPassword123!" }),
      });
      const res = await loginPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.username).toBe("test_admin");

      const cookie = res.cookies.get(COOKIE_NAME);
      expect(cookie).toBeDefined();
      expect(cookie?.value).toBeTruthy();
    });
  });

  describe("POST /api/admin/auth/logout", () => {
    it("returns 200 and clears session cookie", async () => {
      const res = await logoutPost();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const cookie = res.cookies.get(COOKIE_NAME);
      expect(cookie).toBeDefined();
      expect(cookie?.value).toBe("");
    });
  });

  describe("Slot Time Validation", () => {
    it("POST /api/admin/schedules/[id]/slots rejects inverted time range", async () => {
      const req = new Request("http://localhost:3000/api/admin/schedules/sched-1/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: "060133101",
          courseName: "Programming I",
          dayOfWeek: "MONDAY",
          startTime: "14:00",
          endTime: "10:00",
        }),
      });
      const res = await createSlotPost(req, { params: { id: "sched-1" } });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("INVALID_TIME_RANGE");
    });

    it("POST /api/admin/schedules/[id]/slots rejects equal start and end time", async () => {
      const req = new Request("http://localhost:3000/api/admin/schedules/sched-1/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: "060133101",
          courseName: "Programming I",
          dayOfWeek: "MONDAY",
          startTime: "10:00",
          endTime: "10:00",
        }),
      });
      const res = await createSlotPost(req, { params: { id: "sched-1" } });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("INVALID_TIME_RANGE");
    });

    it("PUT /api/admin/schedules/[id]/slots/[slotId] rejects invalid time range", async () => {
      const req = new Request("http://localhost:3000/api/admin/schedules/sched-1/slots/slot-1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: "16:00",
          endTime: "15:00",
        }),
      });
      const res = await updateSlotPut(req, { params: { id: "sched-1", slotId: "slot-1" } });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("INVALID_TIME_RANGE");
    });
  });
});
