// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST as parsePost } from "../src/routes/api/admin/schedules/import/parse/+server";
import { POST as commitPost } from "../src/routes/api/admin/schedules/import/commit/+server";
import { prisma } from "$lib/server/prisma";
import type { RequestEvent } from "@sveltejs/kit";

describe("Reg Import API Endpoints", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/admin/schedules/import/parse", () => {
    it("parses JSON timetable payload and detects internal conflicts", async () => {
      const mockTimetableJson = {
        metadata: {
          academic_year_be: 2568,
          semester: 1,
        },
        courses: [
          {
            course_code: "070153101",
            course_name_th: "ทักษะภาษาอังกฤษ",
            course_name_en: "English Skills",
            credits: { raw: "3(3-0-6)", total: 3 },
            sections: [
              {
                section: "S.1",
                section_type: "lecture",
                instructors: ["อาจารย์ Thomas"],
                schedules: [
                  {
                    day_abbr_th: "อ.",
                    day_th: "อังคาร",
                    day_en: "Tuesday",
                    day_of_week: 2,
                    start_time: "09:00",
                    end_time: "12:00",
                    rooms: ["31-4A07"],
                  },
                ],
              },
            ],
          },
          {
            course_code: "070153102",
            course_name_th: "การอ่านภาษาอังกฤษ",
            course_name_en: "Reading Skills",
            credits: { raw: "3(3-0-6)", total: 3 },
            sections: [
              {
                section: "S.1",
                section_type: "lecture",
                instructors: ["อาจารย์ Thomas"],
                schedules: [
                  {
                    day_abbr_th: "อ.",
                    day_th: "อังคาร",
                    day_en: "Tuesday",
                    day_of_week: 2,
                    start_time: "10:00", // Overlaps with 09:00 - 12:00!
                    end_time: "13:00",
                    rooms: ["31-4A07"],
                  },
                ],
              },
            ],
          },
        ],
      };

      const request = new Request("http://localhost/api/admin/schedules/import/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockTimetableJson),
      });

      const response = await parsePost({ request } as unknown as RequestEvent);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metadata.academic_year_be).toBe(2568);
      expect(data.detectedSlots).toHaveLength(2);
      expect(data.internalConflicts.length).toBeGreaterThan(0);
    });

    it("returns 400 when no file is provided in multipart form", async () => {
      const formData = new FormData();
      const request = new Request("http://localhost/api/admin/schedules/import/parse", {
        method: "POST",
        body: formData,
      });

      const response = await parsePost({ request } as unknown as RequestEvent);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe("NO_FILE_PROVIDED");
    });
  });

  describe("POST /api/admin/schedules/import/commit", () => {
    it("creates schedule, slots, and syncs course presets in REPLACE mode", async () => {
      let createdSlots: any[] = [];
      let deletedSlotsForScheduleId: string | null = null;
      let createdPresets: any[] = [];

      vi.spyOn(prisma.schedule, "findFirst").mockResolvedValueOnce(null);
      vi.spyOn(prisma.schedule, "create").mockResolvedValueOnce({
        id: "new-sched-1",
        academicYear: 2568,
        semester: 1,
        degreeLevel: "BACHELOR",
        programId: "bachelor-itd",
        programName: "สาขาวิชาเทคโนโลยีสารสนเทศ",
        yearLevel: 1,
        sectionGroup: "Sec 1",
        status: "DRAFT",
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      vi.spyOn(prisma.courseSlot, "deleteMany").mockImplementation(async (args: any) => {
        deletedSlotsForScheduleId = args.where.scheduleId;
        return { count: 0 };
      });

      vi.spyOn(prisma.courseSlot, "create").mockImplementation(async (args: any) => {
        createdSlots.push(args.data);
        return { id: `slot-${createdSlots.length}`, ...args.data };
      });

      vi.spyOn(prisma.coursePreset, "findFirst").mockResolvedValue(null);
      vi.spyOn(prisma.coursePreset, "create").mockImplementation(async (args: any) => {
        createdPresets.push(args.data);
        return { id: `preset-${createdPresets.length}`, ...args.data };
      });

      vi.spyOn(prisma.schedule, "findUnique").mockResolvedValueOnce({
        id: "new-sched-1",
        academicYear: 2568,
        semester: 1,
        degreeLevel: "BACHELOR",
        programId: "bachelor-itd",
        programName: "สาขาวิชาเทคโนโลยีสารสนเทศ",
        yearLevel: 1,
        sectionGroup: "Sec 1",
        status: "DRAFT",
        slots: createdSlots,
      } as any);

      const payload = {
        academicYear: 2568,
        semester: 1,
        degreeLevel: "BACHELOR",
        programId: "bachelor-itd",
        programName: "สาขาวิชาเทคโนโลยีสารสนเทศ",
        yearLevel: 1,
        sectionGroup: "Sec 1",
        namingPreference: "THAI_EN",
        mode: "REPLACE",
        slots: [
          {
            courseCode: "070153101",
            courseNameTh: "ทักษะภาษาอังกฤษ",
            courseNameEn: "English Skills",
            section: "S.1",
            dayOfWeek: "TUESDAY",
            startTime: "09:00",
            endTime: "12:00",
            room: "31-4A07",
            instructors: ["อาจารย์ Thomas"],
            courseType: "LECTURE",
            creditsRaw: "3(3-0-6)",
            color: "orange",
          },
        ],
      };

      const request = new Request("http://localhost/api/admin/schedules/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const response = await commitPost({ request } as unknown as RequestEvent);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.createdSlotsCount).toBe(1);
      expect(data.syncedPresetsCount).toBe(1);
      expect(deletedSlotsForScheduleId).toBe("new-sched-1");
      expect(createdSlots[0].courseName).toBe("ทักษะภาษาอังกฤษ (English Skills)");
      expect(createdPresets[0].courseCode).toBe("070153101");
    });

    it("returns 400 when no slots are provided", async () => {
      const request = new Request("http://localhost/api/admin/schedules/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: [] }),
      });

      const response = await commitPost({ request } as unknown as RequestEvent);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe("NO_SLOTS_TO_IMPORT");
    });
  });
});
