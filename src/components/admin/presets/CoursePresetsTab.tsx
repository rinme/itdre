"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2, BookOpen, Loader2 } from "lucide-react";
import { useAdminPresets } from "@/context/AdminPresetsContext";
import type { CoursePreset } from "@/context/AdminPresetsContext";
import CoursePresetModal from "./CoursePresetModal";
import { COLOR_THEMES, type ColorToken } from "@/lib/weekly-grid";

const COURSE_TYPE_LABELS: Record<string, string> = {
  LECTURE: "บรรยาย",
  LAB: "ปฏิบัติ",
  BOTH: "บรรยาย+ปฏิบัติ",
};

export default function CoursePresetsTab() {
  const { coursePresets, loading, error, refreshPresets } = useAdminPresets();
  const [modalPreset, setModalPreset] = useState<CoursePreset | null | "new">(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบ preset นี้ใช่ไหม?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/presets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await refreshPresets();
    } catch {
      alert("ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 text-brand-orange animate-spin" />
        <span className="ml-2 text-slate-400 text-sm">กำลังโหลด...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          {coursePresets.length} รายวิชา — คลิกรายวิชาเพื่อแก้ไข หรือกด + เพิ่มใหม่
        </p>
        <button
          onClick={() => setModalPreset("new")}
          className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-darkOrange text-white rounded-xl text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          เพิ่มรายวิชา
        </button>
      </div>

      {coursePresets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-500">
          <BookOpen className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">ยังไม่มี preset — กด &quot;เพิ่มรายวิชา&quot; เพื่อเพิ่มรายแรก</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {coursePresets.map((p) => {
            const theme = COLOR_THEMES[(p.color as ColorToken) ?? "orange"] ?? COLOR_THEMES["orange"];
            return (
              <div
                key={p.id}
                className={`relative rounded-xl border ${theme.cardBorder} ${theme.cardBg} p-4 group`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${theme.swatchBg}`} />
                      <span className={`font-mono text-xs font-semibold ${theme.cardText}`}>{p.courseCode}</span>
                      {p.credits && <span className="text-xs text-slate-500">{p.credits}</span>}
                    </div>
                    <p className={`text-sm font-medium ${theme.cardText} truncate`}>{p.courseName}</p>
                    <p className="text-xs text-slate-500 mt-1">{COURSE_TYPE_LABELS[p.courseType] ?? p.courseType}</p>
                  </div>
                  <div className="flex flex-col gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setModalPreset(p)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                      title="แก้ไข"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                      title="ลบ"
                    >
                      {deletingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalPreset !== null && (
        <CoursePresetModal
          preset={modalPreset === "new" ? null : modalPreset}
          onClose={() => setModalPreset(null)}
          onSaved={async () => {
            setModalPreset(null);
            await refreshPresets();
          }}
        />
      )}
    </div>
  );
}
