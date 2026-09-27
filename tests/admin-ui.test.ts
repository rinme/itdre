import { describe, expect, it } from "bun:test";
import { programs } from "../src/data/programs";
import type { DegreeLevel, ScheduleStatus } from "@prisma/client";

describe("Admin Schedule UI Helpers & Logic", () => {
  it("filters programs correctly based on degree level", () => {
    const filterProgramsByDegree = (degreeLevel: DegreeLevel) => {
      const degreeStr = degreeLevel.toLowerCase();
      return programs.filter((p) => p.degree.toLowerCase() === degreeStr);
    };

    const bachelorPrograms = filterProgramsByDegree("BACHELOR");
    expect(bachelorPrograms.length).toBeGreaterThan(0);
    expect(bachelorPrograms.every((p) => p.degree === "bachelor")).toBe(true);

    const masterPrograms = filterProgramsByDegree("MASTER");
    expect(masterPrograms.length).toBeGreaterThan(0);
    expect(masterPrograms.every((p) => p.degree === "master")).toBe(true);

    const doctorPrograms = filterProgramsByDegree("DOCTOR");
    expect(doctorPrograms.length).toBeGreaterThan(0);
    expect(doctorPrograms.every((p) => p.degree === "doctor")).toBe(true);
  });

  it("validates schedule creation payload properly", () => {
    const validateSchedulePayload = (data: {
      academicYear?: number | string;
      semester?: number | string;
      degreeLevel?: string;
      programId?: string;
      yearLevel?: number | string;
    }) => {
      if (!data.academicYear || isNaN(Number(data.academicYear))) return "INVALID_ACADEMIC_YEAR";
      if (!data.semester || ![1, 2, 3].includes(Number(data.semester))) return "INVALID_SEMESTER";
      if (!data.degreeLevel || !["BACHELOR", "MASTER", "DOCTOR"].includes(data.degreeLevel))
        return "INVALID_DEGREE_LEVEL";
      if (!data.programId) return "MISSING_PROGRAM";
      if (!data.yearLevel || Number(data.yearLevel) < 1 || Number(data.yearLevel) > 4)
        return "INVALID_YEAR_LEVEL";
      return null;
    };

    expect(
      validateSchedulePayload({
        academicYear: 2567,
        semester: 1,
        degreeLevel: "BACHELOR",
        programId: "bachelor-itd",
        yearLevel: 1,
      })
    ).toBeNull();

    expect(
      validateSchedulePayload({
        academicYear: "invalid",
        semester: 1,
        degreeLevel: "BACHELOR",
        programId: "bachelor-itd",
        yearLevel: 1,
      })
    ).toBe("INVALID_ACADEMIC_YEAR");

    expect(
      validateSchedulePayload({
        academicYear: 2567,
        semester: 5,
        degreeLevel: "BACHELOR",
        programId: "bachelor-itd",
        yearLevel: 1,
      })
    ).toBe("INVALID_SEMESTER");
  });

  it("toggles schedule status between DRAFT and PUBLISHED", () => {
    const toggleStatus = (current: ScheduleStatus): ScheduleStatus => {
      return current === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    };

    expect(toggleStatus("DRAFT")).toBe("PUBLISHED");
    expect(toggleStatus("PUBLISHED")).toBe("DRAFT");
  });

  it("builds query parameters for schedule dashboard filters", () => {
    const buildQueryParams = (filters: {
      academicYear?: string | number;
      semester?: string | number;
      degreeLevel?: string;
      status?: string;
    }) => {
      const params = new URLSearchParams();
      if (filters.academicYear && filters.academicYear !== "ALL") {
        params.set("academicYear", String(filters.academicYear));
      }
      if (filters.semester && filters.semester !== "ALL") {
        params.set("semester", String(filters.semester));
      }
      if (filters.degreeLevel && filters.degreeLevel !== "ALL") {
        params.set("degreeLevel", filters.degreeLevel);
      }
      if (filters.status && filters.status !== "ALL") {
        params.set("status", filters.status);
      }
      return params.toString();
    };

    const empty = buildQueryParams({ academicYear: "ALL", semester: "ALL", degreeLevel: "ALL", status: "ALL" });
    expect(empty).toBe("");

    const filtered = buildQueryParams({
      academicYear: 2567,
      semester: 1,
      degreeLevel: "BACHELOR",
      status: "PUBLISHED",
    });
    expect(filtered).toContain("academicYear=2567");
    expect(filtered).toContain("semester=1");
    expect(filtered).toContain("degreeLevel=BACHELOR");
    expect(filtered).toContain("status=PUBLISHED");
  });
});
