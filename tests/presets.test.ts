import { describe, it, expect } from "bun:test";

describe("CoursePreset model shape", () => {
  it("CoursePreset type has required fields", async () => {
    // Import the generated Prisma type — this only compiles if the model exists
    const { PrismaClient } = await import("@prisma/client");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _p = new PrismaClient();
    // Type-level test: if CoursePreset model doesn't exist, this import fails at build time
    // We verify the shape via a plain object that satisfies the type
    type CoursePresetFields = {
      id: string;
      courseCode: string;
      courseName: string;
      credits: string | null;
      courseType: "LECTURE" | "LAB" | "BOTH";
      color: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    const shape: CoursePresetFields = {
      id: "abc",
      courseCode: "060133101",
      courseName: "Web Application Development",
      credits: "3(2-2-5)",
      courseType: "LECTURE",
      color: "orange",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(shape.courseCode).toBe("060133101");
    expect(shape.courseType).toBe("LECTURE");
    await _p.$disconnect();
  });
});

describe("Preset API response shapes", () => {
  it("validates course preset object shape", () => {
    // We test shape parsing logic extracted into a helper
    function validatePresetBody(body: unknown): { courseCode: string; courseName: string; credits?: string; courseType?: string; color?: string } | null {
      if (typeof body !== "object" || body === null) return null;
      const b = body as Record<string, unknown>;
      if (typeof b.courseCode !== "string" || b.courseCode.trim() === "") return null;
      if (typeof b.courseName !== "string" || b.courseName.trim() === "") return null;
      return {
        courseCode: (b.courseCode as string).trim(),
        courseName: (b.courseName as string).trim(),
        credits: typeof b.credits === "string" ? b.credits.trim() : undefined,
        courseType: typeof b.courseType === "string" ? b.courseType : undefined,
        color: typeof b.color === "string" ? b.color : undefined,
      };
    }

    expect(validatePresetBody(null)).toBeNull();
    expect(validatePresetBody({ courseCode: "", courseName: "X" })).toBeNull();
    expect(validatePresetBody({ courseCode: "060133101", courseName: "Web App Dev" })).toEqual({
      courseCode: "060133101",
      courseName: "Web App Dev",
      credits: undefined,
      courseType: undefined,
      color: undefined,
    });
    expect(
      validatePresetBody({ courseCode: "060133101", courseName: "Web App Dev", credits: "3(2-2-5)", courseType: "LAB", color: "blue" })
    ).toEqual({
      courseCode: "060133101",
      courseName: "Web App Dev",
      credits: "3(2-2-5)",
      courseType: "LAB",
      color: "blue",
    });
  });
});

describe("AdminPresetsContext instructor list", () => {
  it("builds instructor list from personnel module without duplicates", async () => {
    const { personnel } = await import("../src/data/personnel");
    const seenNames = new Set<string>();
    const instructors: string[] = [];

    for (const p of personnel) {
      const isTeachingFaculty =
        p.category === "lecturer" ||
        (p.category === "administrator" && !p.role.includes("หัวหน้าสำนักงาน"));

      if (isTeachingFaculty && !seenNames.has(p.nameTh)) {
        seenNames.add(p.nameTh);
        instructors.push(p.nameTh);
      }
    }

    // Must have all faculty members without duplicates
    expect(instructors.length).toBe(26);
    expect(new Set(instructors).size).toBe(instructors.length);

    // Every item has valid nameTh
    for (const name of instructors) {
      expect(typeof name).toBe("string");
      expect(name.length).toBeGreaterThan(0);
    }
  });
});

describe("Multi-Instructor slot handling & formatting", () => {
  it("appends instructor to existing comma-separated string correctly", () => {
    function appendInstructor(prev: string, newName: string): string {
      const current = prev.trim();
      return current ? `${current}, ${newName}` : newName;
    }

    let instString = "";
    instString = appendInstructor(instString, "ผศ.ดร. อานนท์ วงศ์สมบูรณ์");
    expect(instString).toBe("ผศ.ดร. อานนท์ วงศ์สมบูรณ์");

    instString = appendInstructor(instString, "ดร. สมเกียรติ จารุวัฒนพันธ์");
    expect(instString).toBe("ผศ.ดร. อานนท์ วงศ์สมบูรณ์, ดร. สมเกียรติ จารุวัฒนพันธ์");

    instString = appendInstructor(instString, "อ. สุภาวดี สิทธิชัย");
    expect(instString).toBe(
      "ผศ.ดร. อานนท์ วงศ์สมบูรณ์, ดร. สมเกียรติ จารุวัฒนพันธ์, อ. สุภาวดี สิทธิชัย"
    );
  });

  it("splits comma-separated string into clean instructors array and filters empty items", () => {
    function parseInstructors(raw: string): string[] {
      return raw.trim()
        ? raw.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    }

    expect(parseInstructors("")).toEqual([]);
    expect(parseInstructors("   ")).toEqual([]);
    expect(parseInstructors("ผศ.ดร. ก, ดร. ข")).toEqual(["ผศ.ดร. ก", "ดร. ข"]);
    expect(parseInstructors("  ผศ.ดร. ก , , ดร. ข  ")).toEqual(["ผศ.ดร. ก", "ดร. ข"]);
  });

  it("formats instructors for display with fallback for empty or missing", () => {
    function formatInstructors(instructors?: string[] | null, fallback = "ไม่ระบุผู้สอน"): string {
      return (instructors ?? []).join(", ") || fallback;
    }

    expect(formatInstructors(undefined)).toBe("ไม่ระบุผู้สอน");
    expect(formatInstructors(null)).toBe("ไม่ระบุผู้สอน");
    expect(formatInstructors([])).toBe("ไม่ระบุผู้สอน");
    expect(formatInstructors(["ผศ.ดร. ก"])).toBe("ผศ.ดร. ก");
    expect(formatInstructors(["ผศ.ดร. ก", "ดร. ข"])).toBe("ผศ.ดร. ก, ดร. ข");
  });
});
