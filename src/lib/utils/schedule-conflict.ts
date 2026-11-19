import type { DayOfWeek } from "@prisma/client";

export interface CandidateSlot {
  id?: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  room?: string | null;
}

export interface ExistingSlot {
  id: string;
  courseCode: string;
  courseName: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string | null;
}

export interface ConflictResult {
  type: "TIME_OVERLAP" | "ROOM_CONFLICT";
  conflictingSlot: ExistingSlot;
  message: string;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function detectCourseSlotConflicts(
  candidate: CandidateSlot,
  existingSlots: ExistingSlot[]
): ConflictResult[] {
  const conflicts: ConflictResult[] = [];
  const candStart = timeToMinutes(candidate.startTime);
  const candEnd = timeToMinutes(candidate.endTime);

  for (const slot of existingSlots) {
    if (candidate.id && slot.id === candidate.id) continue;
    if (slot.dayOfWeek !== candidate.dayOfWeek) continue;

    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);

    // Overlap formula: startA < endB && endA > startB
    const hasOverlap = candStart < slotEnd && candEnd > slotStart;

    if (hasOverlap) {
      if (
        candidate.room &&
        slot.room &&
        candidate.room.trim().length > 0 &&
        slot.room.trim().length > 0 &&
        candidate.room.trim().toLowerCase() === slot.room.trim().toLowerCase()
      ) {
        conflicts.push({
          type: "ROOM_CONFLICT",
          conflictingSlot: slot,
          message: `Room ${candidate.room} is already booked by ${slot.courseCode} (${slot.startTime}-${slot.endTime})`,
        });
      }

      conflicts.push({
        type: "TIME_OVERLAP",
        conflictingSlot: slot,
        message: `Time overlaps with ${slot.courseCode}: ${slot.courseName} (${slot.startTime}-${slot.endTime})`,
      });
    }
  }

  return conflicts;
}
