import { getDocumentProxy } from "unpdf";
import type { DayOfWeek, CourseType } from "@prisma/client";
import {
  THAI_DAYS,
  DAY_ORDER,
  THAI_MONTHS,
  COLOR_PALETTE,
  normalizeThai,
  parseCourseName,
  parseCredits,
  formatCourseNameByPreference,
  type CreditsBreakdown,
  type ExamInfo,
  type ParsedSlotSchedule,
  type ParsedSection,
  type ParsedCourse,
  type FormattedImportSlot,
  type ParsedTimetableResult,
} from "$lib/utils/timetable-utils";

export {
  THAI_DAYS,
  DAY_ORDER,
  THAI_MONTHS,
  COLOR_PALETTE,
  normalizeThai,
  parseCourseName,
  parseCredits,
  formatCourseNameByPreference,
  type CreditsBreakdown,
  type ExamInfo,
  type ParsedSlotSchedule,
  type ParsedSection,
  type ParsedCourse,
  type FormattedImportSlot,
  type ParsedTimetableResult,
};

const INSTRUCTOR_TITLE_RE =
  /^(?:ผู้ช่วยศาสตราจารย์|รองศาสตราจารย์|ศาสตราจารย์|อาจารย์|ผศ\.|รศ\.|ศ\.|อ\.)/;
const INSTRUCTOR_TITLE_PREFIX_RE =
  /^(?:ผู้ช่วยศาสตราจารย์|รองศาสตราจารย์|ศาสตราจารย์|อาจารย์|ผศ\.|รศ\.|ศ\.|อ\.)\s*(?:ดร\.\s*)?/;

export function parseInstructors(lines: string[]): string[] {
  const groups: string[][] = [];
  for (const rawLine of lines) {
    const line = rawLine.replace(/^[•·\-\s]+/, "").trim();
    if (!line) continue;
    if (INSTRUCTOR_TITLE_RE.test(line) || groups.length === 0) {
      groups.push([line]);
    } else {
      groups[groups.length - 1].push(line);
    }
  }

  const instructors: string[] = [];
  for (const grp of groups) {
    let combined = grp[0];
    for (const nxt of grp.slice(1)) {
      const remainder = combined.replace(INSTRUCTOR_TITLE_PREFIX_RE, "").trim();
      if (!remainder) {
        combined = `${combined} ${nxt}`;
      } else if (remainder.includes(" ") || nxt.includes(" ")) {
        combined = `${combined}${nxt}`;
      } else {
        combined = `${combined} ${nxt}`;
      }
    }
    // Add space between Thai and Latin letters (e.g. อาจารย์Thomas -> อาจารย์ Thomas)
    combined = combined.replace(/([\u0E00-\u0E7F])([A-Za-z])/g, "$1 $2");
    combined = combined.replace(/\s+/g, " ").trim();
    if (combined) instructors.push(combined);
  }
  return instructors;
}

export function parseSchedulesAndRooms(schedLines: string[], roomLines: string[]): ParsedSlotSchedule[] {
  let schedText = schedLines.join(" ");
  schedText = schedText.replace(/-\s+/g, "-").replace(/\s+-/g, "-");

  const slotPattern =
    /(?:([A-Z]\.\d+)\s*)?(พฤ\.|อา\.|จ\.|อ\.|พ\.|ศ\.|ส\.)\s*(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/g;
  const rawSlots: Array<{ sec?: string; dayAbbr: string; startTime: string; endTime: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = slotPattern.exec(schedText)) !== null) {
    rawSlots.push({
      sec: match[1],
      dayAbbr: match[2],
      startTime: match[3].padStart(5, "0"),
      endTime: match[4].padStart(5, "0"),
    });
  }

  const rooms: string[] = [];
  let i = 0;
  while (i < roomLines.length) {
    const token = roomLines[i].trim();
    if (token.endsWith("-") && i + 1 < roomLines.length) {
      rooms.push(token + roomLines[i + 1].trim());
      i += 2;
    } else {
      rooms.push(token);
      i += 1;
    }
  }
  const cleanedRooms = rooms.filter((r) => r && r !== "-");

  const schedules: ParsedSlotSchedule[] = [];
  for (let idx = 0; idx < rawSlots.length; idx++) {
    const s = rawSlots[idx];
    const dayInfo = THAI_DAYS[s.dayAbbr];
    if (!dayInfo) continue;

    let slotRooms: string[] = [];
    if (rawSlots.length === 1) {
      slotRooms = cleanedRooms;
    } else if (rooms.length === rawSlots.length) {
      const r = rooms[idx];
      slotRooms = r === "-" || !r ? [] : [r];
    } else {
      slotRooms = cleanedRooms;
    }

    schedules.push({
      day_th: dayInfo.th,
      day_abbr_th: s.dayAbbr,
      day_en: dayInfo.en,
      day_of_week: dayInfo.num,
      dayOfWeek: dayInfo.dayOfWeek,
      start_time: s.startTime,
      end_time: s.endTime,
      rooms: slotRooms,
    });
  }

  schedules.sort(
    (a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)
  );
  return schedules;
}

export function parseExam(lines: string[]): ExamInfo | null {
  if (!lines || lines.length === 0) return null;
  let text = lines.join(" ");
  text = text.replace(/-\s+/g, "-").replace(/\s+-/g, "-").replace(/\s+/g, " ").trim();
  if (!text || text === "-") return null;

  const m = text.match(
    /(\d{1,2})\s+([ก-ฮ]+\.?[ก-ฮ]*\.)\s+(\d{4})(?:\s*เวลา\s*(\d{1,2}:\d{2})-(\d{1,2}:\d{2}))?/
  );
  if (!m) {
    return { raw: text, date_th: null, date_iso: null, start_time: null, end_time: null };
  }
  const day = parseInt(m[1], 10);
  const monthAbbr = m[2];
  const yearBe = parseInt(m[3], 10);
  const monthNum = THAI_MONTHS[monthAbbr];
  const yearAd = yearBe > 2400 ? yearBe - 543 : yearBe;
  const dateIso = monthNum
    ? `${yearAd}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    : null;

  return {
    raw: text,
    date_th: `${day} ${monthAbbr} ${yearBe}`,
    date_iso: dateIso,
    start_time: m[4] ? m[4].padStart(5, "0") : null,
    end_time: m[5] ? m[5].padStart(5, "0") : null,
  };
}

export function parseBeDmyToIso(dmy: string): string | null {
  const m = dmy.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const yearBe = parseInt(m[3], 10);
  const yearAd = yearBe > 2400 ? yearBe - 543 : yearBe;
  return `${yearAd}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function buildFormattedSlots(courses: ParsedCourse[]): FormattedImportSlot[] {
  const slots: FormattedImportSlot[] = [];
  let slotIndex = 0;

  for (let cIdx = 0; cIdx < courses.length; cIdx++) {
    const course = courses[cIdx];
    const color = COLOR_PALETTE[cIdx % COLOR_PALETTE.length];

    for (const sec of course.sections) {
      for (const sched of sec.schedules) {
        slots.push({
          id: `slot_${slotIndex++}`,
          courseCode: course.course_code,
          courseNameTh: course.course_name_th,
          courseNameEn: course.course_name_en,
          section: sec.section,
          sectionType: sec.section_type,
          courseType: sec.courseType,
          dayOfWeek: sched.dayOfWeek,
          dayAbbrTh: sched.day_abbr_th,
          startTime: sched.start_time,
          endTime: sched.end_time,
          room: sched.rooms.join(", "),
          instructors: sec.instructors,
          creditsRaw: course.credits.raw,
          creditsTotal: course.credits.total,
          color,
          selected: true,
        });
      }
    }
  }

  return slots;
}

/**
 * Port of KMUTNB Registrar PDF Timetable parser to pure TypeScript.
 */
export async function parsePdfTimetable(
  buffer: Uint8Array,
  fileName: string = "timetable.pdf"
): Promise<ParsedTimetableResult> {
  const doc = await getDocumentProxy(buffer);

  // Metadata from Page 1
  const p1 = await doc.getPage(1);
  const vp1 = p1.getViewport({ scale: 1.0 });
  const c1 = await p1.getTextContent();
  const p1Items = c1.items
    .map((i: any) => ({
      str: i.str || "",
      x0: i.transform[4],
      x1: i.transform[4] + i.width,
      top: vp1.height - i.transform[5],
      bottom: vp1.height - i.transform[5] + i.height,
      w: i.width,
      h: i.height,
    }))
    .filter((i: any) => i.str && i.str.trim());

  let academicYearBe: number | null = null;
  let semester: number | null = null;
  let weekDateRangeObj: { raw: string; start_date_iso: string | null; end_date_iso: string | null } | null = null;
  let sourceUrl: string | null = null;
  let printedAt: string | null = null;

  for (const it of p1Items) {
    if (it.top < 165 && it.x0 < 110 && /^25\d{2}$/.test(it.str)) {
      academicYearBe = parseInt(it.str, 10);
    }
    const mRange = it.str.match(/(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/);
    if (it.top < 165 && mRange) {
      weekDateRangeObj = {
        raw: `${mRange[1]} - ${mRange[2]}`,
        start_date_iso: parseBeDmyToIso(mRange[1]),
        end_date_iso: parseBeDmyToIso(mRange[2]),
      };
    }
    if (it.top > vp1.height - 80 && it.str.startsWith("http")) {
      sourceUrl = it.str;
    }
    const mPrint = it.str.match(/(\d{2}\/\d{2}\/\d{2,4},?\s+\d{2}:\d{2})/);
    if (it.top > vp1.height - 80 && mPrint) {
      printedAt = mPrint[1];
    }
  }

  // Active semester button in button group
  const semItemsInOrder = c1.items.filter((i: any) => {
    const top = vp1.height - i.transform[5];
    const x = i.transform[4];
    return x >= 105 && x <= 190 && top >= 135 && top <= 160 && ["1", "2", "3"].includes(i.str);
  });
  if (semItemsInOrder.length > 0) {
    semester = parseInt((semItemsInOrder[semItemsInOrder.length - 1] as any).str, 10);
  } else {
    const m = fileName.match(/schd(\d)/i);
    if (m) semester = parseInt(m[1], 10);
  }

  // Rows extraction across pages
  const rawRows: Array<{
    course_code: string;
    course_name_th: string;
    course_name_en: string;
    credits: CreditsBreakdown;
    section: string;
    section_type: "lecture" | "lab" | "other";
    courseType: CourseType;
    instructors: string[];
    schedules: ParsedSlotSchedule[];
    midterm_exam: ExamInfo | null;
    final_exam: ExamInfo | null;
    remarks: string | null;
  }> = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 1.0 });
    const content = await page.getTextContent();
    const items = content.items
      .map((i: any) => ({
        str: i.str || "",
        x0: i.transform[4],
        x1: i.transform[4] + i.width,
        top: viewport.height - i.transform[5],
        bottom: viewport.height - i.transform[5] + i.height,
        w: i.width,
        h: i.height,
      }))
      .filter((i: any) => i.str && i.str.trim());

    // Find table header row on this page
    const thCode = items.find((i: any) => i.str === "รหัสวิชา" && i.x0 < 80);
    if (!thCode) continue;

    const headerItems = items.filter((i: any) => Math.abs(i.top - thCode.top) <= 25);
    const findX = (str: string) => headerItems.find((i: any) => i.str.includes(str))?.x0;

    const xSec = findX("ตอน") ?? 98;
    const xName = findX("รายวิชา") ?? 122;
    const xCred = findX("หน่วยกิต") ?? 255;
    const xInst = findX("อาจารย์ผู้สอน") ?? 290;
    const xSched = findX("วันเวลา") ?? 380;
    const xRoom = findX("ห้อง") ?? 422;
    const xMid =
      (findX("สอบ") && headerItems.find((i: any) => i.str.includes("กลาง"))?.x0) ?? 445;
    const xFin = headerItems.find((i: any) => i.str.includes("ปลาย"))?.x0 ?? 480;
    const xRem = findX("หมายเหตุ") ?? 513;

    const cols = [
      { name: "code", minX: 40, maxX: xSec - 3 },
      { name: "sec", minX: xSec - 3, maxX: xName - 3 },
      { name: "name", minX: xName - 3, maxX: xCred - 3 },
      { name: "cred", minX: xCred - 3, maxX: xInst - 3 },
      { name: "inst", minX: xInst - 3, maxX: xSched - 3 },
      { name: "sched", minX: xSched - 3, maxX: xRoom - 3 },
      { name: "room", minX: xRoom - 3, maxX: xMid - 3 },
      { name: "mid", minX: xMid - 3, maxX: xFin - 3 },
      { name: "fin", minX: xFin - 3, maxX: xRem - 3 },
      { name: "rem", minX: xRem - 3, maxX: viewport.width },
    ];

    // Find footer boundary on this page
    const footerMarkers = items.filter(
      (i: any) =>
        (i.str.includes("Visionnet") ||
          i.str.includes("@ 20") ||
          i.str.startsWith("http") ||
          i.str.startsWith("Page ")) &&
        i.top > thCode.top
    );
    const tableBottom =
      footerMarkers.length > 0
        ? Math.min(...footerMarkers.map((i: any) => i.top)) - 5
        : viewport.height - 60;

    const codeItems = items.filter(
      (i: any) =>
        /^\d{6,10}$/.test(i.str) &&
        i.x0 >= cols[0].minX &&
        i.x0 <= cols[0].maxX &&
        i.top > thCode.top + 20 &&
        i.top < tableBottom
    );
    codeItems.sort((a: any, b: any) => a.top - b.top);

    for (let rIdx = 0; rIdx < codeItems.length; rIdx++) {
      const codeItem = codeItems[rIdx];
      const rTop = codeItem.top - 6;
      const rBottom = rIdx + 1 < codeItems.length ? codeItems[rIdx + 1].top - 6 : tableBottom;

      const rowItems = items.filter(
        (i: any) => i.top >= rTop && i.top < rBottom && i.top > thCode.top + 20
      );

      const cellText = (colName: string): string[] => {
        const colDef = cols.find((c) => c.name === colName)!;
        const cItems = rowItems.filter((i: any) => i.x0 >= colDef.minX && i.x0 < colDef.maxX);
        if (cItems.length === 0) return [];
        const lineBuckets: Array<{ y: number; items: any[] }> = [];
        for (const item of cItems) {
          const cy = item.top;
          let placed = false;
          for (const b of lineBuckets) {
            if (Math.abs(cy - b.y) <= 4.0) {
              b.items.push(item);
              b.y = (b.y * (b.items.length - 1) + cy) / b.items.length;
              placed = true;
              break;
            }
          }
          if (!placed) lineBuckets.push({ y: cy, items: [item] });
        }
        lineBuckets.sort((a, b) => a.y - b.y);

        const resLines: string[] = [];
        for (const b of lineBuckets) {
          b.items.sort((a: any, b: any) => a.x0 - b.x0);
          const parts: string[] = [];
          let prevX1: number | null = null;
          for (const ch of b.items) {
            const txt = ch.str;
            const isCombining = /^[\u0e31\u0e34-\u0e3a\u0e47-\u0e4e]/.test(txt);
            if (prevX1 !== null && !isCombining && txt !== " ") {
              const gap = ch.x0 - prevX1;
              if (gap > 2.0 && (!parts.length || parts[parts.length - 1] !== " ")) {
                parts.push(" ");
              }
            }
            parts.push(txt);
            if (!isCombining) {
              prevX1 = prevX1 !== null ? Math.max(prevX1, ch.x1) : ch.x1;
            }
          }
          const lStr = normalizeThai(parts.join("").replace(/[ \t]+/g, " ").trim());
          if (lStr) resLines.push(lStr);
        }
        return resLines;
      };

      const codeLines = cellText("code");
      const secLines = cellText("sec");
      const nameLines = cellText("name");
      const credLines = cellText("cred");
      const instLines = cellText("inst");
      const schedLines = cellText("sched");
      const roomLines = cellText("room");
      const midLines = cellText("mid");
      const finLines = cellText("fin");
      const remLines = cellText("rem");

      const codeMatch = codeLines.join("").match(/\d{6,10}/);
      const courseCode = codeMatch ? codeMatch[0] : "";
      const section = secLines.join("").trim();
      const secPrefix = section.split(".")[0].toUpperCase();
      const [nameTh, nameEn] = parseCourseName(nameLines);
      const creditsObj = parseCredits(credLines.join(""));
      const instructors = parseInstructors(instLines);
      const schedules = parseSchedulesAndRooms(schedLines, roomLines);
      const midterm = parseExam(midLines);
      const final = parseExam(finLines);
      const remarks = remLines.join(" ").trim() || null;

      const secType: "lecture" | "lab" | "other" =
        secPrefix === "S" ? "lecture" : secPrefix === "L" ? "lab" : "other";
      const courseType: CourseType =
        secType === "lab" ? "LAB" : "LECTURE";

      rawRows.push({
        course_code: courseCode,
        course_name_th: nameTh,
        course_name_en: nameEn,
        credits: creditsObj,
        section,
        section_type: secType,
        courseType,
        instructors,
        schedules,
        midterm_exam: midterm,
        final_exam: final,
        remarks,
      });
    }
  }

  // Group by course_code so multi-section courses are unified
  const coursesMap = new Map<string, ParsedCourse>();
  for (const r of rawRows) {
    if (!coursesMap.has(r.course_code)) {
      coursesMap.set(r.course_code, {
        course_code: r.course_code,
        course_name_th: r.course_name_th,
        course_name_en: r.course_name_en,
        credits: r.credits,
        sections: [],
      });
    }
    coursesMap.get(r.course_code)!.sections.push({
      section: r.section,
      section_type: r.section_type,
      courseType: r.courseType,
      instructors: r.instructors,
      schedules: r.schedules,
      midterm_exam: r.midterm_exam,
      final_exam: r.final_exam,
      remarks: r.remarks,
    });
  }

  const courses = Array.from(coursesMap.values());
  const detectedSlots = buildFormattedSlots(courses);

  const totalCredits = courses.reduce(
    (sum, c) => sum + (typeof c.credits.total === "number" ? c.credits.total : 0),
    0
  );

  return {
    metadata: {
      source_file: fileName,
      source_url: sourceUrl,
      academic_year_be: academicYearBe,
      academic_year_ad: academicYearBe ? academicYearBe - 543 : null,
      semester,
      week_date_range: weekDateRangeObj,
      printed_at: printedAt,
      total_courses: courses.length,
      total_sections: rawRows.length,
      total_credits: totalCredits,
    },
    courses,
    detectedSlots,
  };
}

/**
 * Parser for JSON exported from the KMUTNB Timetable Converter.
 * Supports single timetable object or { timetables: [...] } format.
 */
export function parseJsonTimetable(jsonString: string): ParsedTimetableResult {
  const parsed = JSON.parse(jsonString);

  // If payload contains multiple timetables, choose first or combine
  let target = parsed;
  if (parsed.timetables && Array.isArray(parsed.timetables) && parsed.timetables.length > 0) {
    target = parsed.timetables[0];
  }

  const rawMeta = target.metadata || {};
  const rawCourses = target.courses || [];

  const courses: ParsedCourse[] = rawCourses.map((c: any) => {
    return {
      course_code: String(c.course_code || ""),
      course_name_th: String(c.course_name_th || ""),
      course_name_en: String(c.course_name_en || ""),
      credits: {
        raw: String(c.credits?.raw || ""),
        total: c.credits?.total ?? null,
        lecture: c.credits?.lecture ?? null,
        lab: c.credits?.lab ?? null,
        self_study: c.credits?.self_study ?? null,
      },
      sections: (c.sections || []).map((s: any) => {
        const secType: "lecture" | "lab" | "other" =
          s.section_type === "lab"
            ? "lab"
            : s.section_type === "lecture"
              ? "lecture"
              : "other";
        const courseType: CourseType = secType === "lab" ? "LAB" : "LECTURE";

        return {
          section: String(s.section || ""),
          section_type: secType,
          courseType,
          instructors: Array.isArray(s.instructors) ? s.instructors : [],
          schedules: (s.schedules || []).map((sch: any) => {
            const dayAbbr = sch.day_abbr_th || "จ.";
            const dayInfo = THAI_DAYS[dayAbbr] || {
              th: sch.day_th || "จันทร์",
              en: sch.day_en || "Monday",
              num: sch.day_of_week || 1,
              dayOfWeek: "MONDAY" as DayOfWeek,
            };
            return {
              day_th: dayInfo.th,
              day_abbr_th: dayAbbr,
              day_en: dayInfo.en,
              day_of_week: dayInfo.num,
              dayOfWeek: dayInfo.dayOfWeek,
              start_time: String(sch.start_time || ""),
              end_time: String(sch.end_time || ""),
              rooms: Array.isArray(sch.rooms) ? sch.rooms : [],
            };
          }),
          midterm_exam: s.midterm_exam || null,
          final_exam: s.final_exam || null,
          remarks: s.remarks || null,
        };
      }),
    };
  });

  const detectedSlots = buildFormattedSlots(courses);
  const totalCredits =
    rawMeta.total_credits ??
    courses.reduce(
      (sum, c) => sum + (typeof c.credits.total === "number" ? c.credits.total : 0),
      0
    );

  return {
    metadata: {
      source_file: rawMeta.source_file || null,
      source_url: rawMeta.source_url || null,
      academic_year_be: rawMeta.academic_year_be ?? null,
      academic_year_ad: rawMeta.academic_year_ad ?? null,
      semester: rawMeta.semester ?? null,
      week_date_range: rawMeta.week_date_range || null,
      printed_at: rawMeta.printed_at || null,
      total_courses: courses.length,
      total_sections: courses.reduce((acc, c) => acc + c.sections.length, 0),
      total_credits: totalCredits,
    },
    courses,
    detectedSlots,
  };
}
