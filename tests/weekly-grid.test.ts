import { describe, expect, it } from "bun:test";
import {
  GRID_START_HOUR,
  GRID_END_HOUR,
  GRID_START_MINUTES,
  GRID_TOTAL_MINUTES,
  DAYS_ORDER,
  DAY_METADATA,
  COLOR_THEMES,
  COLOR_TOKEN_KEYS,
  getColorTheme,
  timeToMinutes,
  minutesToTime,
  calculateSlotPosition,
  sortCourseSlots,
  detectAllScheduleConflicts,
} from "../src/lib/weekly-grid";
import type { DayOfWeek, CourseType } from "@prisma/client";
import type { ExistingSlot } from "../src/lib/schedule-conflict";

describe("Weekly Grid Calculations & Helpers", () => {
  describe("timeToMinutes & minutesToTime", () => {
    it("converts 24-hour string to total minutes correctly", () => {
      expect(timeToMinutes("08:00")).toBe(480);
      expect(timeToMinutes("09:30")).toBe(570);
      expect(timeToMinutes("12:00")).toBe(720);
      expect(timeToMinutes("20:00")).toBe(1200);
      expect(timeToMinutes("00:00")).toBe(0);
    });

    it("handles invalid or empty time string gracefully", () => {
      expect(timeToMinutes("")).toBe(0);
      expect(timeToMinutes("invalid")).toBe(0);
    });

    it("converts total minutes back to HH:mm string", () => {
      expect(minutesToTime(480)).toBe("08:00");
      expect(minutesToTime(570)).toBe("09:30");
      expect(minutesToTime(720)).toBe("12:00");
      expect(minutesToTime(1200)).toBe("20:00");
    });
  });

  describe("calculateSlotPosition (proportional positioning)", () => {
    it("computes top and height percentages correctly for 08:00 to 20:00 (12 hours)", () => {
      // Full grid span: 08:00 - 20:00
      const full = calculateSlotPosition("08:00", "20:00");
      expect(full.topPercent).toBe(0);
      expect(full.heightPercent).toBe(100);

      // Morning 3-hour class: 09:00 - 12:00
      // 09:00 is 1 hour (60 min) after 08:00 => 60 / 720 = 8.333%
      // 3 hours duration => 180 / 720 = 25%
      const morning = calculateSlotPosition("09:00", "12:00");
      expect(morning.topPercent).toBeCloseTo(8.333, 2);
      expect(morning.heightPercent).toBeCloseTo(25, 2);

      // Afternoon 3-hour class: 13:00 - 16:00
      // 13:00 is 5 hours (300 min) after 08:00 => 300 / 720 = 41.667%
      // 3 hours duration => 180 / 720 = 25%
      const afternoon = calculateSlotPosition("13:00", "16:00");
      expect(afternoon.topPercent).toBeCloseTo(41.667, 2);
      expect(afternoon.heightPercent).toBeCloseTo(25, 2);

      // Evening 3-hour class: 16:30 - 19:30
      // 16:30 is 8.5 hours (510 min) after 08:00 => 510 / 720 = 70.833%
      // 3 hours duration => 180 / 720 = 25%
      const evening = calculateSlotPosition("16:30", "19:30");
      expect(evening.topPercent).toBeCloseTo(70.833, 2);
      expect(evening.heightPercent).toBeCloseTo(25, 2);
    });

    it("clamps times outside the grid boundary safely", () => {
      // Starts before 08:00 (e.g. 07:00)
      const clampedEarly = calculateSlotPosition("07:00", "10:00");
      expect(clampedEarly.topPercent).toBe(0);
      // Duration from 08:00 to 10:00 is 2 hours (120 min) => 120 / 720 = 16.667%
      expect(clampedEarly.heightPercent).toBeCloseTo(16.667, 2);

      // Ends after 20:00 (e.g. 21:00)
      const clampedLate = calculateSlotPosition("18:00", "21:00");
      // 18:00 is 10 hours (600 min) => 600 / 720 = 83.333%
      expect(clampedLate.topPercent).toBeCloseTo(83.333, 2);
      // Duration from 18:00 to 20:00 is 2 hours => 16.667%
      expect(clampedLate.heightPercent).toBeCloseTo(16.667, 2);
    });
  });

  describe("DAYS_ORDER and DAY_METADATA", () => {
    it("contains all 7 days from Monday to Sunday in correct weekly order", () => {
      expect(DAYS_ORDER).toEqual([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ]);
    });

    it("provides complete metadata for every day of the week", () => {
      DAYS_ORDER.forEach((day) => {
        const meta = DAY_METADATA[day];
        expect(meta).toBeDefined();
        expect(meta.key).toBe(day);
        expect(meta.th.length).toBeGreaterThan(0);
        expect(meta.en.length).toBeGreaterThan(0);
        expect(meta.shortTh.length).toBeGreaterThan(0);
        expect(meta.shortEn.length).toBeGreaterThan(0);
        expect(meta.colorHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe("COLOR_THEMES and getColorTheme", () => {
    it("supports all 7 required color tokens", () => {
      const requiredTokens = [
        "orange",
        "blue",
        "emerald",
        "purple",
        "rose",
        "amber",
        "sky",
      ];
      requiredTokens.forEach((token) => {
        expect(COLOR_TOKEN_KEYS).toContain(token as any);
        expect(COLOR_THEMES[token as keyof typeof COLOR_THEMES]).toBeDefined();
      });
    });

    it("returns correct theme object and falls back to orange when invalid", () => {
      const emeraldTheme = getColorTheme("emerald");
      expect(emeraldTheme.name).toBe("emerald");
      expect(emeraldTheme.cardBorder).toContain("emerald");

      const fallback = getColorTheme("non-existent");
      expect(fallback.name).toBe("orange");

      const nullFallback = getColorTheme(null);
      expect(nullFallback.name).toBe("orange");
    });
  });

  describe("sortCourseSlots", () => {
    it("sorts slots primarily by day of week", () => {
      const slots = [
        { dayOfWeek: "FRIDAY" as DayOfWeek, startTime: "09:00", courseCode: "C3" },
        { dayOfWeek: "MONDAY" as DayOfWeek, startTime: "09:00", courseCode: "C1" },
        { dayOfWeek: "WEDNESDAY" as DayOfWeek, startTime: "09:00", courseCode: "C2" },
      ];

      const sorted = sortCourseSlots(slots);
      expect(sorted.map((s) => s.dayOfWeek)).toEqual([
        "MONDAY",
        "WEDNESDAY",
        "FRIDAY",
      ]);
    });

    it("sorts slots on the same day by start time ascending", () => {
      const slots = [
        { dayOfWeek: "MONDAY" as DayOfWeek, startTime: "13:00", courseCode: "AFTERNOON" },
        { dayOfWeek: "MONDAY" as DayOfWeek, startTime: "09:00", courseCode: "MORNING" },
        { dayOfWeek: "MONDAY" as DayOfWeek, startTime: "16:30", courseCode: "EVENING" },
      ];

      const sorted = sortCourseSlots(slots);
      expect(sorted.map((s) => s.courseCode)).toEqual([
        "MORNING",
        "AFTERNOON",
        "EVENING",
      ]);
    });

    it("sorts slots with identical times by courseCode", () => {
      const slots = [
        { dayOfWeek: "TUESDAY" as DayOfWeek, startTime: "09:00", courseCode: "060133202" },
        { dayOfWeek: "TUESDAY" as DayOfWeek, startTime: "09:00", courseCode: "060133101" },
      ];

      const sorted = sortCourseSlots(slots);
      expect(sorted[0].courseCode).toBe("060133101");
      expect(sorted[1].courseCode).toBe("060133202");
    });
  });

  describe("detectAllScheduleConflicts", () => {
    it("returns empty array when there are no conflicts", () => {
      const slots: ExistingSlot[] = [
        {
          id: "slot-1",
          courseCode: "060133101",
          courseName: "Web App Dev",
          dayOfWeek: "MONDAY",
          startTime: "09:00",
          endTime: "12:00",
          room: "79-5A01",
        },
        {
          id: "slot-2",
          courseCode: "060133102",
          courseName: "Database Systems",
          dayOfWeek: "MONDAY",
          startTime: "13:00",
          endTime: "16:00",
          room: "79-5A01",
        },
        {
          id: "slot-3",
          courseCode: "060133103",
          courseName: "Cloud Computing",
          dayOfWeek: "TUESDAY",
          startTime: "09:00",
          endTime: "12:00",
          room: "79-5A01",
        },
      ];

      const conflicts = detectAllScheduleConflicts(slots);
      expect(conflicts.length).toBe(0);
    });

    it("detects time overlap conflict on the same day and deduplicates mutual pairs", () => {
      const slots: ExistingSlot[] = [
        {
          id: "slot-1",
          courseCode: "060133101",
          courseName: "Web App Dev",
          dayOfWeek: "MONDAY",
          startTime: "09:00",
          endTime: "12:00",
          room: "79-5A01",
        },
        {
          id: "slot-2",
          courseCode: "060133102",
          courseName: "Database Systems",
          dayOfWeek: "MONDAY",
          startTime: "10:00",
          endTime: "13:00",
          room: "79-5A02", // different room, but time overlap
        },
      ];

      const conflicts = detectAllScheduleConflicts(slots);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].type).toBe("TIME_OVERLAP");
      expect(conflicts[0].message).toContain("060133101");
      expect(conflicts[0].message).toContain("060133102");
    });

    it("detects room double-booking conflict on the same day and time", () => {
      const slots: ExistingSlot[] = [
        {
          id: "slot-1",
          courseCode: "060133101",
          courseName: "Web App Dev",
          dayOfWeek: "WEDNESDAY",
          startTime: "09:00",
          endTime: "12:00",
          room: "79-5A01",
        },
        {
          id: "slot-2",
          courseCode: "060133102",
          courseName: "Database Systems",
          dayOfWeek: "WEDNESDAY",
          startTime: "09:00",
          endTime: "12:00",
          room: " 79-5A01 ", // same room with whitespace
        },
      ];

      const conflicts = detectAllScheduleConflicts(slots);
      // Expect both ROOM_CONFLICT and TIME_OVERLAP (deduplicated per type)
      const roomConflict = conflicts.find((c) => c.type === "ROOM_CONFLICT");
      const timeConflict = conflicts.find((c) => c.type === "TIME_OVERLAP");

      expect(roomConflict).toBeDefined();
      expect(timeConflict).toBeDefined();
      expect(roomConflict?.message).toContain("79-5A01");
    });
  });

  describe("Grid Scale Alignment & Color Swatches", () => {
    it("matches 12 hourly intervals with total grid minutes (720px = 720min)", () => {
      const markers: string[] = [];
      for (let h = GRID_START_HOUR; h < GRID_END_HOUR; h++) {
        markers.push(`${String(h).padStart(2, "0")}:00`);
      }

      // Exactly 12 hourly rows
      expect(markers.length).toBe(12);
      expect(markers[0]).toBe("08:00");
      expect(markers[11]).toBe("19:00");

      // 12 rows of 60px = 720px height exactly matching GRID_TOTAL_MINUTES (720 min)
      const totalPixels = markers.length * 60;
      expect(totalPixels).toBe(GRID_TOTAL_MINUTES);
    });

    it("verifies all color themes have valid swatchBg Tailwind classes", () => {
      COLOR_TOKEN_KEYS.forEach((token) => {
        const theme = COLOR_THEMES[token];
        expect(theme.swatchBg).toMatch(/^bg-[a-z]+-500$/);
      });
    });
  });
});
