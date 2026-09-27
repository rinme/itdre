"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Clock,
  DoorClosed,
  ChevronDown,
  ChevronUp,
  X,
  Info,
} from "lucide-react";
import type { ConflictResult } from "@/lib/schedule-conflict";

interface ConflictBannerProps {
  conflicts: ConflictResult[];
  className?: string;
  onDismiss?: () => void;
  title?: string;
  compact?: boolean;
}

export default function ConflictBanner({
  conflicts,
  className = "",
  onDismiss,
  title,
  compact = false,
}: ConflictBannerProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!conflicts || conflicts.length === 0) {
    return null;
  }

  const roomConflicts = conflicts.filter((c) => c.type === "ROOM_CONFLICT");
  const timeOverlaps = conflicts.filter((c) => c.type === "TIME_OVERLAP");

  return (
    <div
      className={`rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-amber-950/60 p-4 text-amber-200 shadow-lg shadow-amber-950/20 backdrop-blur-sm transition-all duration-200 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-amber-100">
                {title ||
                  `พบข้อขัดแย้งในตารางเรียน (${conflicts.length} รายการ)`}
              </h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-300 border border-amber-500/30">
                <Info className="h-3 w-3" />
                คำเตือนแบบไม่บล็อก (Non-blocking warning)
              </span>
            </div>
            <p className="mt-0.5 text-xs text-amber-300/80">
              {roomConflicts.length > 0 && timeOverlaps.length > 0
                ? `พบห้องเรียนซ้ำซ้อน ${roomConflicts.length} จุด และเวลาเรียนทับซ้อน ${timeOverlaps.length} จุด`
                : roomConflicts.length > 0
                ? `พบห้องเรียนซ้ำซ้อน ${roomConflicts.length} จุด`
                : `พบช่วงเวลาเรียนทับซ้อนกัน ${timeOverlaps.length} จุด`}
              {" — "}คุณยังสามารถบันทึกได้หากได้รับการอนุญาตใช้งานร่วมกัน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-amber-300/90 hover:bg-amber-500/20 hover:text-white transition-colors"
            aria-label={isExpanded ? "ย่อรายละเอียด" : "ดูรายละเอียด"}
          >
            {isExpanded ? (
              <>
                <span className="hidden sm:inline">ย่อ</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span className="hidden sm:inline">แสดง ({conflicts.length})</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg p-1 text-amber-400/80 hover:bg-amber-500/20 hover:text-white transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div
          className={`mt-3 pt-3 border-t border-amber-500/20 space-y-2 ${
            compact ? "max-h-48 overflow-y-auto" : ""
          }`}
        >
          {conflicts.map((conflict, idx) => {
            const isRoom = conflict.type === "ROOM_CONFLICT";
            return (
              <div
                key={`${conflict.type}-${conflict.conflictingSlot.id}-${idx}`}
                className="flex items-start gap-2.5 rounded-xl bg-amber-950/40 border border-amber-500/20 p-2.5 text-xs text-amber-200/90 hover:bg-amber-950/60 transition-colors"
              >
                <div
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                    isRoom
                      ? "bg-red-500/20 border-red-500/40 text-red-300"
                      : "bg-orange-500/20 border-orange-500/40 text-orange-300"
                  }`}
                >
                  {isRoom ? (
                    <DoorClosed className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isRoom
                          ? "bg-red-500/25 text-red-200 border border-red-500/30"
                          : "bg-orange-500/25 text-orange-200 border border-orange-500/30"
                      }`}
                    >
                      {isRoom ? "ห้องเรียนซ้อน" : "เวลาซ้อน"}
                    </span>
                    <span className="font-semibold text-white">
                      {conflict.conflictingSlot.courseCode} -{" "}
                      {conflict.conflictingSlot.courseName}
                    </span>
                  </div>
                  <p className="mt-0.5 text-amber-300/80 leading-relaxed break-words">
                    {conflict.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
