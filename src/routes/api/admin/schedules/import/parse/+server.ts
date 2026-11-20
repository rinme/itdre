import { json, type RequestHandler } from "@sveltejs/kit";
import {
  parsePdfTimetable,
  parseJsonTimetable,
  type ParsedTimetableResult,
  type FormattedImportSlot,
} from "$lib/server/pdf-timetable-parser";
import { detectCourseSlotConflicts, type ExistingSlot } from "$lib/utils/schedule-conflict";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const contentType = request.headers.get("content-type") || "";
    let parseResult: ParsedTimetableResult;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!file || !(file instanceof File)) {
        return json({ error: "NO_FILE_PROVIDED", message: "กรุณาเลือกไฟล์ PDF หรือ JSON สำหรับนำเข้า" }, { status: 400 });
      }

      const fileName = file.name.toLowerCase();
      if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
        const buffer = new Uint8Array(await file.arrayBuffer());
        parseResult = await parsePdfTimetable(buffer, file.name);
      } else if (fileName.endsWith(".json") || file.type === "application/json") {
        const text = await file.text();
        parseResult = parseJsonTimetable(text);
      } else {
        return json(
          {
            error: "UNSUPPORTED_FILE_TYPE",
            message: "รองรับเฉพาะไฟล์ .pdf (ตารางเรียนจาก Reg) หรือ .json เท่านั้น",
          },
          { status: 400 }
        );
      }
    } else {
      // JSON body
      const body = await request.json();
      const jsonString = typeof body === "string" ? body : JSON.stringify(body);
      parseResult = parseJsonTimetable(jsonString);
    }

    // Detect internal conflicts among detected slots
    const internalConflicts: Array<{
      slotAId: string;
      slotBId: string;
      message: string;
    }> = [];

    const existingSlotFormat: ExistingSlot[] = parseResult.detectedSlots.map((s) => ({
      id: s.id,
      courseCode: s.courseCode,
      courseName: s.courseNameTh,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room || null,
    }));

    for (let i = 0; i < parseResult.detectedSlots.length; i++) {
      const slot = parseResult.detectedSlots[i];
      const otherSlots = existingSlotFormat.filter((_, idx) => idx > i);
      const conflicts = detectCourseSlotConflicts(
        {
          id: slot.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          room: slot.room,
        },
        otherSlots
      );

      for (const conf of conflicts) {
        internalConflicts.push({
          slotAId: slot.id,
          slotBId: conf.conflictingSlot.id,
          message: `${slot.courseCode} (${slot.startTime}-${slot.endTime}) ซ้อนทับกับ ${conf.conflictingSlot.courseCode} (${conf.conflictingSlot.startTime}-${conf.conflictingSlot.endTime})`,
        });
      }
    }

    return json({
      success: true,
      metadata: parseResult.metadata,
      courses: parseResult.courses,
      detectedSlots: parseResult.detectedSlots,
      internalConflicts,
    });
  } catch (error: any) {
    console.error("POST /api/admin/schedules/import/parse error:", error);
    return json(
      {
        error: "FAILED_TO_PARSE_TIMETABLE",
        message: error?.message || "ไม่สามารถแยกวิเคราะห์ตารางเรียนได้ โปรดตรวจสอบความถูกต้องของไฟล์",
      },
      { status: 400 }
    );
  }
};
