import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import type { DegreeLevel, CourseType, DayOfWeek } from "@prisma/client";
import { formatCourseNameByPreference } from "$lib/server/pdf-timetable-parser";

interface CommitSlotPayload {
  courseCode: string;
  courseNameTh: string;
  courseNameEn: string;
  section?: string | null;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string | null;
  instructors?: string[];
  courseType?: CourseType;
  creditsRaw?: string | null;
  color?: string | null;
}

interface CommitImportPayload {
  scheduleId?: string;
  academicYear?: number;
  semester?: number;
  degreeLevel?: DegreeLevel;
  programId?: string;
  programName?: string;
  yearLevel?: number;
  sectionGroup?: string | null;
  namingPreference?: "THAI_EN" | "EN" | "TH";
  mode?: "REPLACE" | "APPEND";
  slots: CommitSlotPayload[];
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = (await request.json()) as CommitImportPayload;

    if (!Array.isArray(data.slots) || data.slots.length === 0) {
      return json({ error: "NO_SLOTS_TO_IMPORT", message: "ไม่พบรายวิชาที่เลือกสำหรับการนำเข้า" }, { status: 400 });
    }

    const namingPreference = data.namingPreference || "THAI_EN";
    const mode = data.mode || "REPLACE";

    let targetScheduleId = data.scheduleId;

    if (targetScheduleId) {
      const existing = await prisma.schedule.findUnique({
        where: { id: targetScheduleId },
      });
      if (!existing) {
        return json({ error: "SCHEDULE_NOT_FOUND", message: "ไม่พบตารางเรียนที่ระบุ" }, { status: 404 });
      }
    } else {
      if (
        !data.academicYear ||
        !data.semester ||
        !data.degreeLevel ||
        !data.programId ||
        !data.programName ||
        !data.yearLevel
      ) {
        return json(
          {
            error: "MISSING_REQUIRED_SCHEDULE_FIELDS",
            message: "กรุณาระบุข้อมูลหลักสูตร ปีการศึกษา ภาคการศึกษา และชั้นปีให้ครบถ้วน",
          },
          { status: 400 }
        );
      }

      // Upsert / Find or create schedule
      const academicYear = Number(data.academicYear);
      const semester = Number(data.semester);
      const yearLevel = Number(data.yearLevel);
      const sectionGroup = data.sectionGroup ? data.sectionGroup.trim() : null;

      let schedule = await prisma.schedule.findFirst({
        where: {
          academicYear,
          semester,
          degreeLevel: data.degreeLevel,
          programId: data.programId,
          yearLevel,
          sectionGroup,
        },
      });

      if (!schedule) {
        schedule = await prisma.schedule.create({
          data: {
            academicYear,
            semester,
            degreeLevel: data.degreeLevel,
            programId: data.programId,
            programName: data.programName,
            yearLevel,
            sectionGroup,
            status: "DRAFT",
          },
        });
      }

      targetScheduleId = schedule.id;
    }

    // Replace or Append
    if (mode === "REPLACE") {
      await prisma.courseSlot.deleteMany({
        where: { scheduleId: targetScheduleId },
      });
    }

    // Insert course slots
    let createdSlotsCount = 0;
    const presetsToSync = new Map<
      string,
      {
        courseCode: string;
        courseName: string;
        credits?: string | null;
        courseType: CourseType;
        color?: string | null;
      }
    >();

    for (const slot of data.slots) {
      const formattedName = formatCourseNameByPreference(
        slot.courseNameTh || "",
        slot.courseNameEn || "",
        namingPreference
      );

      const courseType: CourseType = slot.courseType || "LECTURE";
      const color = slot.color || "orange";

      await prisma.courseSlot.create({
        data: {
          scheduleId: targetScheduleId,
          courseCode: slot.courseCode.trim(),
          courseName: formattedName,
          section: slot.section ? slot.section.trim() : null,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          room: slot.room ? slot.room.trim() : null,
          instructors: Array.isArray(slot.instructors)
            ? slot.instructors.map((i) => i.trim()).filter(Boolean)
            : [],
          courseType,
          color,
        },
      });
      createdSlotsCount++;

      // Track preset
      if (!presetsToSync.has(slot.courseCode.trim())) {
        presetsToSync.set(slot.courseCode.trim(), {
          courseCode: slot.courseCode.trim(),
          courseName: formattedName,
          credits: slot.creditsRaw || null,
          courseType,
          color,
        });
      }
    }

    // Auto-sync CoursePreset records
    let syncedPresetsCount = 0;
    for (const presetItem of presetsToSync.values()) {
      const existingPreset = await prisma.coursePreset.findFirst({
        where: { courseCode: presetItem.courseCode },
      });

      if (existingPreset) {
        await prisma.coursePreset.update({
          where: { id: existingPreset.id },
          data: {
            courseName: presetItem.courseName || existingPreset.courseName,
            credits: presetItem.credits || existingPreset.credits,
            courseType: presetItem.courseType || existingPreset.courseType,
            color: presetItem.color || existingPreset.color,
          },
        });
      } else {
        await prisma.coursePreset.create({
          data: {
            courseCode: presetItem.courseCode,
            courseName: presetItem.courseName,
            credits: presetItem.credits,
            courseType: presetItem.courseType,
            color: presetItem.color || "orange",
          },
        });
      }
      syncedPresetsCount++;
    }

    const updatedSchedule = await prisma.schedule.findUnique({
      where: { id: targetScheduleId },
      include: {
        slots: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    return json({
      success: true,
      schedule: updatedSchedule,
      createdSlotsCount,
      syncedPresetsCount,
    });
  } catch (error: any) {
    console.error("POST /api/admin/schedules/import/commit error:", error);
    return json(
      {
        error: "FAILED_TO_COMMIT_IMPORT",
        message: error?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลตารางเรียน",
      },
      { status: 500 }
    );
  }
};
