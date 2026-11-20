import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  normalizeThai,
  parseCourseName,
  parseCredits,
  parseInstructors,
  parseSchedulesAndRooms,
  parseExam,
  formatCourseNameByPreference,
  parseJsonTimetable,
  parsePdfTimetable,
} from "$lib/server/pdf-timetable-parser";

describe("KMUTNB Timetable Parser Unit Tests", () => {
  it("normalizes decomposed Thai characters (nikhahit + sara aa -> sara am)", () => {
    // \u0e4d\u0e32 -> \u0e33 (สระอำ)
    const decomposed = "ทบทวนข\u0e4d\u0e32";
    const normalized = normalizeThai(decomposed);
    expect(normalized).toBe("ทบทวนขำ");

    // Tone mark between nikhahit and sara aa: \u0e4d\u0e48\u0e32 -> \u0e48\u0e33
    const decomposedTone = "คำว\u0e4d\u0e48\u0e32ย";
    const normalizedTone = normalizeThai(decomposedTone);
    expect(normalizedTone).toBe("คำว่ำย");
  });

  it("splits Thai and English course names properly", () => {
    const lines = ["ทักษะการฟังและการพูด", "ภาษาอังกฤษ", "English Listening and", "Speaking Skills"];
    const [th, en] = parseCourseName(lines);
    expect(th).toBe("ทักษะการฟังและการพูดภาษาอังกฤษ");
    expect(en).toBe("English Listening and Speaking Skills");
  });

  it("parses credit breakdown accurately", () => {
    const res1 = parseCredits("3(3-0-6)");
    expect(res1.total).toBe(3);
    expect(res1.lecture).toBe(3);
    expect(res1.lab).toBe(0);
    expect(res1.self_study).toBe(6);

    const res2 = parseCredits(" 3 ( 2 - 2 - 5 ) ");
    expect(res2.total).toBe(3);
    expect(res2.lecture).toBe(2);
    expect(res2.lab).toBe(2);
    expect(res2.self_study).toBe(5);

    const res3 = parseCredits("1");
    expect(res3.total).toBe(1);
    expect(res3.lecture).toBeNull();
  });

  it("reconstructs wrapped instructor names and fixes spacing", () => {
    const lines = [
      "อาจารย์",
      "Thomas Leclair",
      "ผู้ช่วยศาสตราจารย์",
      "ดร.ณฐพร อุตกฤษฏ์",
    ];
    const instructors = parseInstructors(lines);
    expect(instructors).toHaveLength(2);
    expect(instructors[0]).toBe("อาจารย์ Thomas Leclair");
    expect(instructors[1]).toBe("ผู้ช่วยศาสตราจารย์ ดร.ณฐพร อุตกฤษฏ์");
  });

  it("parses schedules and rooms properly", () => {
    const schedLines = ["S.1 อ.13:00-", "16:00"];
    const roomLines = ["31-", "4A04", "31-4A05"];
    const slots = parseSchedulesAndRooms(schedLines, roomLines);

    expect(slots).toHaveLength(1);
    expect(slots[0].day_abbr_th).toBe("อ.");
    expect(slots[0].dayOfWeek).toBe("TUESDAY");
    expect(slots[0].start_time).toBe("13:00");
    expect(slots[0].end_time).toBe("16:00");
    expect(slots[0].rooms).toEqual(["31-4A04", "31-4A05"]);
  });

  it("parses exam dates into ISO format", () => {
    const examLines = ["20 ส.ค. 2568 เวลา 09:00-11:00"];
    const exam = parseExam(examLines);

    expect(exam).not.toBeNull();
    expect(exam?.date_th).toBe("20 ส.ค. 2568");
    expect(exam?.date_iso).toBe("2025-08-20");
    expect(exam?.start_time).toBe("09:00");
    expect(exam?.end_time).toBe("11:00");
  });

  it("formats course names by preference", () => {
    const th = "ทักษะภาษาอังกฤษ";
    const en = "English Skills";

    expect(formatCourseNameByPreference(th, en, "THAI_EN")).toBe("ทักษะภาษาอังกฤษ (English Skills)");
    expect(formatCourseNameByPreference(th, en, "EN")).toBe("English Skills");
    expect(formatCourseNameByPreference(th, en, "TH")).toBe("ทักษะภาษาอังกฤษ");

    // Fallbacks if one is empty
    expect(formatCourseNameByPreference("", en, "TH")).toBe("English Skills");
    expect(formatCourseNameByPreference(th, "", "EN")).toBe("ทักษะภาษาอังกฤษ");
  });

  it("parses JSON exported from KMUTNB timetable converter", () => {
    const sampleJsonPath = "/home/rinme/.gemini/antigravity/brain/09e8696c-84e5-4e66-ac1e-f7ce9ca9b2e8/.user_uploaded/media_1795167527862_514aae03.json";
    if (fs.existsSync(sampleJsonPath)) {
      const jsonContent = fs.readFileSync(sampleJsonPath, "utf8");
      const result = parseJsonTimetable(jsonContent);

      expect(result.metadata.academic_year_be).toBe(2568);
      expect(result.metadata.semester).toBe(1);
      expect(result.courses.length).toBeGreaterThan(0);
      expect(result.detectedSlots.length).toBeGreaterThan(0);

      const firstCourse = result.courses[0];
      expect(firstCourse.course_code).toBe("070153101");
      expect(firstCourse.course_name_th).toBe("ทักษะการฟังและการพูดภาษาอังกฤษ");
      expect(firstCourse.course_name_en).toBe("English Listening and Speaking Skills");
    }
  });

  it("parses PDF timetable exported from KMUTNB registrar", async () => {
    const samplePdfPath = "/home/rinme/.gemini/antigravity/brain/09e8696c-84e5-4e66-ac1e-f7ce9ca9b2e8/.user_uploaded/media_1795167527833_59c320d6.pdf";
    if (fs.existsSync(samplePdfPath)) {
      const buf = new Uint8Array(fs.readFileSync(samplePdfPath));
      const result = await parsePdfTimetable(buf, "schd2:2568.pdf");

      expect(result.metadata.academic_year_be).toBe(2568);
      expect(result.metadata.semester).toBe(2);
      expect(result.metadata.total_courses).toBe(6);
      expect(result.metadata.total_sections).toBe(8);
      expect(result.detectedSlots.length).toBe(8);

      const writingCourse = result.courses.find((c) => c.course_code === "070153103");
      expect(writingCourse).toBeDefined();
      expect(writingCourse?.course_name_th).toBe("ทักษะการเขียนภาษาอังกฤษ");
      expect(writingCourse?.course_name_en).toBe("English Writing Skills");
    }
  });
});
