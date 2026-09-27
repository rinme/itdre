import type { DayOfWeek, CourseType } from "@prisma/client";
import {
  detectCourseSlotConflicts,
  type ExistingSlot,
  type ConflictResult,
} from "./schedule-conflict";

export type { ExistingSlot, ConflictResult } from "./schedule-conflict";

export const GRID_START_HOUR = 8;
export const GRID_END_HOUR = 20;
export const GRID_TOTAL_HOURS = GRID_END_HOUR - GRID_START_HOUR; // 12
export const GRID_START_MINUTES = 8 * 60; // 480
export const GRID_END_MINUTES = 20 * 60; // 1200
export const GRID_TOTAL_MINUTES = GRID_END_MINUTES - GRID_START_MINUTES; // 720

export const DAYS_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export interface DayInfo {
  key: DayOfWeek;
  th: string;
  en: string;
  shortTh: string;
  shortEn: string;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
}

export const DAY_METADATA: Record<DayOfWeek, DayInfo> = {
  MONDAY: {
    key: "MONDAY",
    th: "วันจันทร์",
    en: "Monday",
    shortTh: "จ.",
    shortEn: "Mon",
    colorHex: "#EAB308",
    badgeBg: "bg-yellow-500/15",
    badgeText: "text-yellow-400",
    borderClass: "border-yellow-500/30",
  },
  TUESDAY: {
    key: "TUESDAY",
    th: "วันอังคาร",
    en: "Tuesday",
    shortTh: "อ.",
    shortEn: "Tue",
    colorHex: "#EC4899",
    badgeBg: "bg-pink-500/15",
    badgeText: "text-pink-400",
    borderClass: "border-pink-500/30",
  },
  WEDNESDAY: {
    key: "WEDNESDAY",
    th: "วันพุธ",
    en: "Wednesday",
    shortTh: "พ.",
    shortEn: "Wed",
    colorHex: "#22C55E",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-400",
    borderClass: "border-emerald-500/30",
  },
  THURSDAY: {
    key: "THURSDAY",
    th: "วันพฤหัสบดี",
    en: "Thursday",
    shortTh: "พฤ.",
    shortEn: "Thu",
    colorHex: "#F97316",
    badgeBg: "bg-orange-500/15",
    badgeText: "text-orange-400",
    borderClass: "border-orange-500/30",
  },
  FRIDAY: {
    key: "FRIDAY",
    th: "วันศุกร์",
    en: "Friday",
    shortTh: "ศ.",
    shortEn: "Fri",
    colorHex: "#3B82F6",
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-400",
    borderClass: "border-blue-500/30",
  },
  SATURDAY: {
    key: "SATURDAY",
    th: "วันเสาร์",
    en: "Saturday",
    shortTh: "ส.",
    shortEn: "Sat",
    colorHex: "#A855F7",
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-400",
    borderClass: "border-purple-500/30",
  },
  SUNDAY: {
    key: "SUNDAY",
    th: "วันอาทิตย์",
    en: "Sunday",
    shortTh: "อา.",
    shortEn: "Sun",
    colorHex: "#EF4444",
    badgeBg: "bg-red-500/15",
    badgeText: "text-red-400",
    borderClass: "border-red-500/30",
  },
};

export type ColorToken =
  | "orange"
  | "blue"
  | "emerald"
  | "purple"
  | "rose"
  | "amber"
  | "sky";

export interface ColorTheme {
  name: ColorToken;
  label: string;
  cardBg: string;
  cardBorder: string;
  cardText: string;
  accentBar: string;
  badgeBg: string;
  badgeText: string;
  swatchBg: string;
}

export const COLOR_THEMES: Record<ColorToken, ColorTheme> = {
  orange: {
    name: "orange",
    label: "ส้ม (Orange)",
    cardBg: "bg-orange-950/40 hover:bg-orange-950/60",
    cardBorder: "border-orange-500/40 hover:border-orange-500/70",
    cardText: "text-orange-200",
    accentBar: "bg-orange-500",
    badgeBg: "bg-orange-500/20",
    badgeText: "text-orange-300",
    swatchBg: "bg-orange-500",
  },
  blue: {
    name: "blue",
    label: "น้ำเงิน (Blue)",
    cardBg: "bg-blue-950/40 hover:bg-blue-950/60",
    cardBorder: "border-blue-500/40 hover:border-blue-500/70",
    cardText: "text-blue-200",
    accentBar: "bg-blue-500",
    badgeBg: "bg-blue-500/20",
    badgeText: "text-blue-300",
    swatchBg: "bg-blue-500",
  },
  emerald: {
    name: "emerald",
    label: "เขียว (Emerald)",
    cardBg: "bg-emerald-950/40 hover:bg-emerald-950/60",
    cardBorder: "border-emerald-500/40 hover:border-emerald-500/70",
    cardText: "text-emerald-200",
    accentBar: "bg-emerald-500",
    badgeBg: "bg-emerald-500/20",
    badgeText: "text-emerald-300",
    swatchBg: "bg-emerald-500",
  },
  purple: {
    name: "purple",
    label: "ม่วง (Purple)",
    cardBg: "bg-purple-950/40 hover:bg-purple-950/60",
    cardBorder: "border-purple-500/40 hover:border-purple-500/70",
    cardText: "text-purple-200",
    accentBar: "bg-purple-500",
    badgeBg: "bg-purple-500/20",
    badgeText: "text-purple-300",
    swatchBg: "bg-purple-500",
  },
  rose: {
    name: "rose",
    label: "ชมพู/กุหลาบ (Rose)",
    cardBg: "bg-rose-950/40 hover:bg-rose-950/60",
    cardBorder: "border-rose-500/40 hover:border-rose-500/70",
    cardText: "text-rose-200",
    accentBar: "bg-rose-500",
    badgeBg: "bg-rose-500/20",
    badgeText: "text-rose-300",
    swatchBg: "bg-rose-500",
  },
  amber: {
    name: "amber",
    label: "อำพัน/ทอง (Amber)",
    cardBg: "bg-amber-950/40 hover:bg-amber-950/60",
    cardBorder: "border-amber-500/40 hover:border-amber-500/70",
    cardText: "text-amber-200",
    accentBar: "bg-amber-500",
    badgeBg: "bg-amber-500/20",
    badgeText: "text-amber-300",
    swatchBg: "bg-amber-500",
  },
  sky: {
    name: "sky",
    label: "ฟ้า (Sky)",
    cardBg: "bg-sky-950/40 hover:bg-sky-950/60",
    cardBorder: "border-sky-500/40 hover:border-sky-500/70",
    cardText: "text-sky-200",
    accentBar: "bg-sky-500",
    badgeBg: "bg-sky-500/20",
    badgeText: "text-sky-300",
    swatchBg: "bg-sky-500",
  },
};

export const COLOR_TOKEN_KEYS: ColorToken[] = [
  "orange",
  "blue",
  "emerald",
  "purple",
  "rose",
  "amber",
  "sky",
];

export function getColorTheme(color?: string | null): ColorTheme {
  if (color && color in COLOR_THEMES) {
    return COLOR_THEMES[color as ColorToken];
  }
  return COLOR_THEMES.orange;
}

export function timeToMinutes(time: string): number {
  if (!time || !time.includes(":")) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function calculateSlotPosition(
  startTime: string,
  endTime: string,
  startMinutesOffset: number = GRID_START_MINUTES,
  totalMinutes: number = GRID_TOTAL_MINUTES
): { topPercent: number; heightPercent: number } {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);

  const clampedStart = Math.max(
    startMinutesOffset,
    Math.min(startMinutesOffset + totalMinutes, startMin)
  );
  const clampedEnd = Math.max(
    clampedStart,
    Math.min(startMinutesOffset + totalMinutes, endMin)
  );

  const topPercent =
    ((clampedStart - startMinutesOffset) / totalMinutes) * 100;
  const heightPercent =
    ((clampedEnd - clampedStart) / totalMinutes) * 100;

  return {
    topPercent: Number(topPercent.toFixed(3)),
    heightPercent: Number(heightPercent.toFixed(3)),
  };
}

export function sortCourseSlots<
  T extends { dayOfWeek: DayOfWeek; startTime: string; courseCode?: string }
>(slots: T[]): T[] {
  const dayOrderMap = Object.fromEntries(
    DAYS_ORDER.map((day, idx) => [day, idx])
  );
  return [...slots].sort((a, b) => {
    const dayDiff =
      (dayOrderMap[a.dayOfWeek] ?? 99) - (dayOrderMap[b.dayOfWeek] ?? 99);
    if (dayDiff !== 0) return dayDiff;
    const timeDiff = a.startTime.localeCompare(b.startTime);
    if (timeDiff !== 0) return timeDiff;
    return (a.courseCode || "").localeCompare(b.courseCode || "");
  });
}

export const COURSE_TYPE_META: Record<
  CourseType,
  { th: string; en: string; badgeClass: string }
> = {
  LECTURE: {
    th: "ทฤษฎี",
    en: "Lecture",
    badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  },
  LAB: {
    th: "ปฏิบัติ",
    en: "Lab",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  BOTH: {
    th: "ทฤษฎี & ปฏิบัติ",
    en: "Lecture & Lab",
    badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
};

export function detectAllScheduleConflicts(
  slots: ExistingSlot[]
): ConflictResult[] {
  const allConflicts: ConflictResult[] = [];
  const seenPairs = new Set<string>();

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const conflicts = detectCourseSlotConflicts(slot, slots);

    for (const c of conflicts) {
      // Deduplicate pair (slot.id <-> conflictingSlot.id)
      const pairKey = [c.type, slot.id, c.conflictingSlot.id].sort().join("::");
      if (!seenPairs.has(pairKey)) {
        seenPairs.add(pairKey);
        allConflicts.push({
          type: c.type,
          conflictingSlot: c.conflictingSlot,
          message:
            c.type === "ROOM_CONFLICT"
              ? `ห้อง ${slot.room || "-"} ชนกันระหว่าง ${slot.courseCode} และ ${c.conflictingSlot.courseCode} (${slot.startTime}-${slot.endTime})`
              : `เวลาทับซ้อนระหว่าง ${slot.courseCode} (${slot.startTime}-${slot.endTime}) และ ${c.conflictingSlot.courseCode} (${c.conflictingSlot.startTime}-${c.conflictingSlot.endTime})`,
        });
      }
    }
  }

  return allConflicts;
}
