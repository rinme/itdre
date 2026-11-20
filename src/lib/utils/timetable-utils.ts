import type { DayOfWeek, CourseType } from "@prisma/client";

export const THAI_DAYS: Record<string, { th: string; en: string; num: number; dayOfWeek: DayOfWeek }> = {
  "จ.": { th: "จันทร์", en: "Monday", num: 1, dayOfWeek: "MONDAY" },
  "อ.": { th: "อังคาร", en: "Tuesday", num: 2, dayOfWeek: "TUESDAY" },
  "พ.": { th: "พุธ", en: "Wednesday", num: 3, dayOfWeek: "WEDNESDAY" },
  "พฤ.": { th: "พฤหัสบดี", en: "Thursday", num: 4, dayOfWeek: "THURSDAY" },
  "ศ.": { th: "ศุกร์", en: "Friday", num: 5, dayOfWeek: "FRIDAY" },
  "ส.": { th: "เสาร์", en: "Saturday", num: 6, dayOfWeek: "SATURDAY" },
  "อา.": { th: "อาทิตย์", en: "Sunday", num: 7, dayOfWeek: "SUNDAY" },
};

export const DAY_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const THAI_MONTHS: Record<string, number> = {
  "ม.ค.": 1,
  "ก.พ.": 2,
  "มี.ค.": 3,
  "เม.ย.": 4,
  "พ.ค.": 5,
  "มิ.ย.": 6,
  "ก.ค.": 7,
  "ส.ค.": 8,
  "ก.ย.": 9,
  "ต.ค.": 10,
  "พ.ย.": 11,
  "ธ.ค.": 12,
};

export const COLOR_PALETTE = [
  "orange",
  "blue",
  "emerald",
  "purple",
  "rose",
  "amber",
  "indigo",
  "cyan",
];

const THAI_CHAR_RE = /[\u0E00-\u0E7F]/;

export interface CreditsBreakdown {
  raw: string;
  total: number | null;
  lecture: number | null;
  lab: number | null;
  self_study: number | null;
}

export interface ExamInfo {
  raw: string;
  date_th: string | null;
  date_iso: string | null;
  start_time: string | null;
  end_time: string | null;
}

export interface ParsedSlotSchedule {
  day_th: string;
  day_abbr_th: string;
  day_en: string;
  day_of_week: number;
  dayOfWeek: DayOfWeek;
  start_time: string;
  end_time: string;
  rooms: string[];
}

export interface ParsedSection {
  section: string;
  section_type: "lecture" | "lab" | "other";
  courseType: CourseType;
  instructors: string[];
  schedules: ParsedSlotSchedule[];
  midterm_exam: ExamInfo | null;
  final_exam: ExamInfo | null;
  remarks: string | null;
}

export interface ParsedCourse {
  course_code: string;
  course_name_th: string;
  course_name_en: string;
  credits: CreditsBreakdown;
  sections: ParsedSection[];
}

export interface FormattedImportSlot {
  id: string; // client temporary id
  courseCode: string;
  courseNameTh: string;
  courseNameEn: string;
  section: string;
  sectionType: "lecture" | "lab" | "other";
  courseType: CourseType;
  dayOfWeek: DayOfWeek;
  dayAbbrTh: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  room: string;
  instructors: string[];
  creditsRaw: string;
  creditsTotal: number | null;
  color: string;
  selected: boolean;
}

export interface ParsedTimetableResult {
  metadata: {
    source_file: string | null;
    source_url: string | null;
    academic_year_be: number | null;
    academic_year_ad: number | null;
    semester: number | null;
    week_date_range?: {
      raw: string;
      start_date_iso: string | null;
      end_date_iso: string | null;
    } | null;
    printed_at?: string | null;
    total_courses: number;
    total_sections: number;
    total_credits: number;
  };
  courses: ParsedCourse[];
  detectedSlots: FormattedImportSlot[];
}

export function normalizeThai(text: string): string {
  if (!text) return "";
  // Fix decomposed Thai sara am: nikhahit + sara aa (\u0e4d\u0e32) -> sara am (\u0e33)
  text = text.replace(/\u0e4d\u0e32/g, "\u0e33");
  // Tone marks between nikhahit and sara aa
  text = text.replace(/\u0e4d([\u0e48-\u0e4b])\u0e32/g, "$1\u0e33");
  return text.trim();
}

export function parseCourseName(lines: string[]): [string, string] {
  const thLines: string[] = [];
  const enLines: string[] = [];
  for (const line of lines) {
    if (THAI_CHAR_RE.test(line)) {
      thLines.push(line);
    } else {
      enLines.push(line);
    }
  }
  const th = thLines.join("").trim();
  const en = enLines.join(" ").trim();
  return [th, en];
}

export function parseCredits(text: string): CreditsBreakdown {
  const raw = text.replace(/\s+/g, "");
  const m = raw.match(/^(\d+)\((\d+)-(\d+)-(\d+)\)$/);
  if (m) {
    return {
      raw,
      total: parseInt(m[1], 10),
      lecture: parseInt(m[2], 10),
      lab: parseInt(m[3], 10),
      self_study: parseInt(m[4], 10),
    };
  }
  const simpleMatch = raw.match(/^(\d+)$/);
  if (simpleMatch) {
    return {
      raw,
      total: parseInt(simpleMatch[1], 10),
      lecture: null,
      lab: null,
      self_study: null,
    };
  }
  return { raw, total: null, lecture: null, lab: null, self_study: null };
}

/**
 * Format course name based on user naming preference.
 */
export function formatCourseNameByPreference(
  nameTh: string,
  nameEn: string,
  preference: "THAI_EN" | "EN" | "TH"
): string {
  const th = nameTh.trim();
  const en = nameEn.trim();

  switch (preference) {
    case "EN":
      return en || th;
    case "TH":
      return th || en;
    case "THAI_EN":
    default:
      if (th && en) return `${th} (${en})`;
      return th || en;
  }
}
