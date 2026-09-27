import { describe, expect, it } from "bun:test";
import { prisma } from "../src/lib/prisma";

describe("Prisma Client Initialization", () => {
  it("exports a valid prisma client instance", () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma).toBe("object");
  });

  it("exports Prisma enums correctly", async () => {
    const { DegreeLevel, ScheduleStatus, CourseType, DayOfWeek } = await import("@prisma/client");
    expect(DegreeLevel.BACHELOR).toBe("BACHELOR");
    expect(ScheduleStatus.DRAFT).toBe("DRAFT");
    expect(ScheduleStatus.PUBLISHED).toBe("PUBLISHED");
    expect(CourseType.LECTURE).toBe("LECTURE");
    expect(DayOfWeek.MONDAY).toBe("MONDAY");
  });
});
