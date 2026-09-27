import { describe, expect, it } from "bun:test";
import { detectCourseSlotConflicts } from "../src/lib/schedule-conflict";
import type { DayOfWeek } from "@prisma/client";

describe("Course Slot Conflict Detection", () => {
  const existingSlots = [
    {
      id: "slot-1",
      courseCode: "060133101",
      courseName: "Programming I",
      dayOfWeek: "MONDAY" as DayOfWeek,
      startTime: "09:00",
      endTime: "12:00",
      room: "79-5A02",
    },
    {
      id: "slot-2",
      courseCode: "060133102",
      courseName: "Database Systems",
      dayOfWeek: "MONDAY" as DayOfWeek,
      startTime: "13:00",
      endTime: "16:00",
      room: "79-5A03",
    },
  ];

  it("detects time overlap on the same day", () => {
    const candidate = {
      dayOfWeek: "MONDAY" as DayOfWeek,
      startTime: "11:00",
      endTime: "14:00",
      room: "79-5A01",
    };
    const conflicts = detectCourseSlotConflicts(candidate, existingSlots);
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0].type).toBe("TIME_OVERLAP");
  });

  it("detects room double-booking", () => {
    const candidate = {
      dayOfWeek: "MONDAY" as DayOfWeek,
      startTime: "09:30",
      endTime: "11:30",
      room: "79-5A02",
    };
    const conflicts = detectCourseSlotConflicts(candidate, existingSlots);
    const roomConflict = conflicts.find((c) => c.type === "ROOM_CONFLICT");
    expect(roomConflict).toBeDefined();
  });

  it("returns no conflict for non-overlapping times", () => {
    const candidate = {
      dayOfWeek: "MONDAY" as DayOfWeek,
      startTime: "16:00",
      endTime: "18:00",
      room: "79-5A02",
    };
    const conflicts = detectCourseSlotConflicts(candidate, existingSlots);
    expect(conflicts.length).toBe(0);
  });

  it("returns no conflict for adjacent times (touching boundaries)", () => {
    const candidate = {
      dayOfWeek: "MONDAY" as DayOfWeek,
      startTime: "12:00",
      endTime: "13:00",
      room: "79-5A02",
    };
    const conflicts = detectCourseSlotConflicts(candidate, existingSlots);
    expect(conflicts.length).toBe(0);
  });

  it("ignores slots on different days of the week", () => {
    const candidate = {
      dayOfWeek: "TUESDAY" as DayOfWeek,
      startTime: "09:00",
      endTime: "12:00",
      room: "79-5A02",
    };
    const conflicts = detectCourseSlotConflicts(candidate, existingSlots);
    expect(conflicts.length).toBe(0);
  });

  it("ignores slot being updated (same id)", () => {
    const candidate = {
      id: "slot-1",
      dayOfWeek: "MONDAY" as DayOfWeek,
      startTime: "09:00",
      endTime: "12:00",
      room: "79-5A02",
    };
    const conflicts = detectCourseSlotConflicts(candidate, existingSlots);
    expect(conflicts.length).toBe(0);
  });

  it("handles room comparison case-insensitively and with trimmed whitespace", () => {
    const candidate = {
      dayOfWeek: "MONDAY" as DayOfWeek,
      startTime: "10:00",
      endTime: "11:00",
      room: " 79-5a02 ",
    };
    const conflicts = detectCourseSlotConflicts(candidate, existingSlots);
    const roomConflict = conflicts.find((c) => c.type === "ROOM_CONFLICT");
    expect(roomConflict).toBeDefined();
  });

  it("does not report room conflict if candidate or slot room is null or empty", () => {
    const candidate = {
      dayOfWeek: "MONDAY" as DayOfWeek,
      startTime: "10:00",
      endTime: "11:00",
      room: null,
    };
    const conflicts = detectCourseSlotConflicts(candidate, existingSlots);
    const roomConflict = conflicts.find((c) => c.type === "ROOM_CONFLICT");
    expect(roomConflict).toBeUndefined();
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].type).toBe("TIME_OVERLAP");
  });
});
