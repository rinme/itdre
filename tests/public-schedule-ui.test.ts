import { describe, it, expect } from "bun:test";
import type { DayOfWeek, DegreeLevel, CourseType } from "@prisma/client";
import {
  cascadeFilterUpdate,
  type ScheduleFilterState,
  DEGREE_OPTIONS,
  SEMESTER_OPTIONS,
} from "../src/components/schedules/ScheduleFilterBar";
import {
  DAYS_ORDER,
  DAY_METADATA,
  PUBLIC_COLOR_THEMES,
  getPublicColorTheme,
  COURSE_TYPE_META,
  calculateTotalHours,
  getCurrentDayOfWeek,
  sortCourseSlots,
  calculateSlotPosition,
} from "../src/lib/weekly-grid";
import { programs } from "../src/data/programs";
import type { PublicCourseSlot } from "../src/components/schedules/WeeklyTimetableGrid";

describe("Public Schedule UI & Cascading Logic", () => {
  describe("Filter Cascading Transitions", () => {
    const initialBachelorState: ScheduleFilterState = {
      academicYear: 2567,
      semester: 1,
      degreeLevel: "BACHELOR",
      programId: "bachelor-itd",
      yearLevel: 4,
    };

    it("cascades degreeLevel change from BACHELOR to MASTER and adjusts programId & yearLevel", () => {
      const next = cascadeFilterUpdate(initialBachelorState, {
        degreeLevel: "MASTER",
      });

      // Degree level updated
      expect(next.degreeLevel).toBe("MASTER");
      // Program auto-switched to a valid master program
      const masterPrograms = programs.filter((p) => p.degree === "master");
      expect(masterPrograms.map((p) => p.id)).toContain(next.programId);
      expect(next.programId).toBe("master-it");

      // Clamped yearLevel: Master has max 2 years, so Year 4 resets to 1
      expect(next.yearLevel).toBe(1);
      // Preserved academicYear & semester
      expect(next.academicYear).toBe(2567);
      expect(next.semester).toBe(1);
    });

    it("cascades degreeLevel change from MASTER to DOCTOR and picks doctoral program", () => {
      const masterState: ScheduleFilterState = {
        academicYear: 2567,
        semester: 2,
        degreeLevel: "MASTER",
        programId: "master-mis",
        yearLevel: 2,
      };

      const next = cascadeFilterUpdate(masterState, {
        degreeLevel: "DOCTOR",
      });

      expect(next.degreeLevel).toBe("DOCTOR");
      expect(next.programId).toBe("doctor-it");
      // Year 2 is valid for doctor (max 3 years), so preserved
      expect(next.yearLevel).toBe(2);
      expect(next.semester).toBe(2);
    });

    it("preserves valid programId if it already matches the new degree level", () => {
      const state: ScheduleFilterState = {
        academicYear: 2568,
        semester: 1,
        degreeLevel: "BACHELOR",
        programId: "bachelor-net-security",
        yearLevel: 2,
      };

      // Change semester only
      const updatedSem = cascadeFilterUpdate(state, { semester: 2 });
      expect(updatedSem.programId).toBe("bachelor-net-security");
      expect(updatedSem.semester).toBe(2);

      // Change academicYear only
      const updatedYear = cascadeFilterUpdate(state, { academicYear: 2569 });
      expect(updatedYear.academicYear).toBe(2569);
      expect(updatedYear.programId).toBe("bachelor-net-security");
    });

    it("updates sectionGroup cleanly", () => {
      const state: ScheduleFilterState = {
        academicYear: 2567,
        semester: 1,
        degreeLevel: "BACHELOR",
        programId: "bachelor-itd",
        yearLevel: 1,
      };

      const withSec = cascadeFilterUpdate(state, { sectionGroup: "Sec 2" });
      expect(withSec.sectionGroup).toBe("Sec 2");
    });

    it("resets orphaned sectionGroup to undefined when degreeLevel, programId, or yearLevel changes", () => {
      const stateWithSection: ScheduleFilterState = {
        academicYear: 2567,
        semester: 1,
        degreeLevel: "BACHELOR",
        programId: "bachelor-itd",
        yearLevel: 1,
        sectionGroup: "Sec 2",
      };

      // 1. Changing degreeLevel clears sectionGroup
      const switchedDegree = cascadeFilterUpdate(stateWithSection, {
        degreeLevel: "MASTER",
      });
      expect(switchedDegree.sectionGroup).toBeUndefined();

      // 2. Changing programId clears sectionGroup
      const switchedProg = cascadeFilterUpdate(stateWithSection, {
        programId: "bachelor-net-security",
      });
      expect(switchedProg.sectionGroup).toBeUndefined();

      // 3. Changing yearLevel clears sectionGroup
      const switchedYear = cascadeFilterUpdate(stateWithSection, {
        yearLevel: 2,
      });
      expect(switchedYear.sectionGroup).toBeUndefined();

      // 4. Changing semester does NOT clear sectionGroup
      const switchedSem = cascadeFilterUpdate(stateWithSection, {
        semester: 2,
      });
      expect(switchedSem.sectionGroup).toBe("Sec 2");

      // 5. Explicitly passing a new sectionGroup is preserved
      const updatedWithExplicitSec = cascadeFilterUpdate(stateWithSection, {
        yearLevel: 2,
        sectionGroup: "Sec 1",
      });
      expect(updatedWithExplicitSec.sectionGroup).toBe("Sec 1");
    });
  });

  describe("Bilingual Day Labels and Metadata", () => {
    it("contains all 7 days with Thai and English labels and distinct color codes", () => {
      expect(DAYS_ORDER.length).toBe(7);

      const seenColors = new Set<string>();

      DAYS_ORDER.forEach((day) => {
        const meta = DAY_METADATA[day];
        expect(meta).toBeDefined();
        expect(meta.th.length).toBeGreaterThan(0);
        expect(meta.en.length).toBeGreaterThan(0);
        expect(meta.shortTh.length).toBeGreaterThan(0);
        expect(meta.shortEn.length).toBeGreaterThan(0);
        expect(meta.colorHex).toMatch(/^#[0-9A-Fa-f]{6}$/);

        // Every day of the week in Thailand has a distinct traditional color
        expect(seenColors.has(meta.colorHex)).toBe(false);
        seenColors.add(meta.colorHex);
      });

      // Thai day color convention checks
      expect(DAY_METADATA.MONDAY.colorHex).toBe("#EAB308"); // Yellow
      expect(DAY_METADATA.TUESDAY.colorHex).toBe("#EC4899"); // Pink
      expect(DAY_METADATA.WEDNESDAY.colorHex).toBe("#22C55E"); // Green
      expect(DAY_METADATA.THURSDAY.colorHex).toBe("#F97316"); // Orange
      expect(DAY_METADATA.FRIDAY.colorHex).toBe("#3B82F6"); // Blue
      expect(DAY_METADATA.SATURDAY.colorHex).toBe("#A855F7"); // Purple
      expect(DAY_METADATA.SUNDAY.colorHex).toBe("#EF4444"); // Red
    });

    it("provides bilingual course type metadata", () => {
      const types: CourseType[] = ["LECTURE", "LAB", "BOTH"];

      types.forEach((t) => {
        const meta = COURSE_TYPE_META[t];
        expect(meta).toBeDefined();
        expect(meta.th).toBeTruthy();
        expect(meta.en).toBeTruthy();
        expect(meta.badgeClass).toBeTruthy();
      });

      expect(COURSE_TYPE_META.LECTURE.th).toBe("ทฤษฎี");
      expect(COURSE_TYPE_META.LECTURE.en).toBe("Lecture");
      expect(COURSE_TYPE_META.LAB.th).toBe("ปฏิบัติ");
      expect(COURSE_TYPE_META.LAB.en).toBe("Lab");
      expect(COURSE_TYPE_META.BOTH.th).toBe("ทฤษฎี & ปฏิบัติ");
      expect(COURSE_TYPE_META.BOTH.en).toBe("Lecture & Lab");
    });

    it("provides public pastel color themes for all supported color tokens", () => {
      const tokens = Object.keys(PUBLIC_COLOR_THEMES);
      expect(tokens.length).toBe(7);

      tokens.forEach((token) => {
        const theme = getPublicColorTheme(token);
        expect(theme.cardBg).toContain("bg-");
        expect(theme.cardBorder).toContain("border-");
        expect(theme.cardText).toContain("text-");
        expect(theme.accentBar).toContain("bg-");
        expect(theme.badgeBg).toContain("bg-");
      });

      // Fallback for null or unknown color returns orange theme
      const fallback = getPublicColorTheme(null);
      expect(fallback.name).toBe("orange");

      const unknownFallback = getPublicColorTheme("non-existent-color");
      expect(unknownFallback.name).toBe("orange");
    });
  });

  describe("Empty State & Course Slot Processing", () => {
    const mockSlots: PublicCourseSlot[] = [
      {
        id: "slot-1",
        courseCode: "040613101",
        courseName: "Web Application Development",
        section: "Sec 1",
        dayOfWeek: "MONDAY",
        startTime: "09:00",
        endTime: "12:00",
        room: "79-5A01",
        instructors: ["ผศ.ดร.สมชาย ใจดี"],
        courseType: "LECTURE",
        color: "orange",
      },
      {
        id: "slot-2",
        courseCode: "040613102",
        courseName: "Web Application Lab",
        section: "Sec 1",
        dayOfWeek: "MONDAY",
        startTime: "13:00",
        endTime: "16:00",
        room: "79-LAB1",
        instructors: ["อ.สมศักดิ์ นวัตกรรม"],
        courseType: "LAB",
        color: "emerald",
      },
      {
        id: "slot-3",
        courseCode: "040613103",
        courseName: "Database Systems",
        section: "Sec 1",
        dayOfWeek: "WEDNESDAY",
        startTime: "09:00",
        endTime: "12:00",
        room: "79-5A02",
        instructors: ["รศ.ดร.วิชาญ ข้อมูล"],
        courseType: "LECTURE",
        color: "blue",
      },
    ];

    it("calculates total contact hours correctly", () => {
      // Slot 1: 09:00-12:00 = 3 hrs
      // Slot 2: 13:00-16:00 = 3 hrs
      // Slot 3: 09:00-12:00 = 3 hrs
      // Total = 9.0 hours
      const total = calculateTotalHours(mockSlots);
      expect(total).toBe(9.0);

      // Empty list returns 0
      expect(calculateTotalHours([])).toBe(0);
    });

    it("sorts slots by day of week then start time", () => {
      const unordered = [mockSlots[2], mockSlots[1], mockSlots[0]];
      const sorted = sortCourseSlots(unordered);

      expect(sorted[0].id).toBe("slot-1"); // Monday 09:00
      expect(sorted[1].id).toBe("slot-2"); // Monday 13:00
      expect(sorted[2].id).toBe("slot-3"); // Wednesday 09:00
    });

    it("returns a valid current DayOfWeek", () => {
      const monday = new Date("2026-09-28T09:00:00Z"); // Monday
      expect(getCurrentDayOfWeek(monday)).toBe("MONDAY");

      const sunday = new Date("2026-09-27T09:00:00Z"); // Sunday
      expect(getCurrentDayOfWeek(sunday)).toBe("SUNDAY");
    });

    it("computes slot proportional positioning percentages safely", () => {
      // 08:00 to 11:00 (3 hours = 180 min out of 720 min = 25%)
      const pos = calculateSlotPosition("08:00", "11:00");
      expect(pos.topPercent).toBe(0);
      expect(pos.heightPercent).toBe(25);

      // 14:00 to 17:00 (360 min offset = 50%, 180 min height = 25%)
      const midPos = calculateSlotPosition("14:00", "17:00");
      expect(midPos.topPercent).toBe(50);
      expect(midPos.heightPercent).toBe(25);
    });
  });

  describe("Degree & Semester Options Constants", () => {
    it("defines standard bachelor, master, and doctoral degree options", () => {
      expect(DEGREE_OPTIONS.length).toBe(3);
      expect(DEGREE_OPTIONS[0].key).toBe("BACHELOR");
      expect(DEGREE_OPTIONS[0].maxYear).toBe(4);

      expect(DEGREE_OPTIONS[1].key).toBe("MASTER");
      expect(DEGREE_OPTIONS[1].maxYear).toBe(2);

      expect(DEGREE_OPTIONS[2].key).toBe("DOCTOR");
      expect(DEGREE_OPTIONS[2].maxYear).toBe(3);
    });

    it("defines 3 semesters (Semester 1, Semester 2, Summer)", () => {
      expect(SEMESTER_OPTIONS.length).toBe(3);
      expect(SEMESTER_OPTIONS[0].value).toBe(1);
      expect(SEMESTER_OPTIONS[1].value).toBe(2);
      expect(SEMESTER_OPTIONS[2].value).toBe(3);
    });
  });
});
