"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { COLOR_THEMES } from "@/lib/weekly-grid";
import type { CoursePreset } from "@/context/AdminPresetsContext";

const COURSE_TYPES = [
  { value: "LECTURE", labelTh: "บรรยาย", labelEn: "Lecture" },
  { value: "LAB", labelTh: "ปฏิบัติ", labelEn: "Lab" },
  { value: "BOTH", labelTh: "บรรยาย+ปฏิบัติ", labelEn: "Both" },
] as const;

interface CoursePresetModalProps {
  preset: CoursePreset | null; // null = create mode
  onClose: () => void;
  onSaved: () => void;
}

export default function CoursePresetModal({ preset, onClose, onSaved }: CoursePresetModalProps) {
  const isEdit = preset !== null;
  const [courseCode, setCourseCode] = useState(preset?.courseCode ?? "");
  const [courseName, setCourseName] = useState(preset?.courseName ?? "");
  const [credits, setCredits] = useState(preset?.credits ?? "");
  const [courseType, setCourseType] = useState<string>(preset?.courseType ?? "LECTURE");
  const [color, setColor] = useState<string>(preset?.color ?? "orange");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when preset changes
  useEffect(() => {
    setCourseCode(preset?.courseCode ?? "");
    setCourseName(preset?.courseName ?? "");
    setCredits(preset?.credits ?? "");
    setCourseType(preset?.courseType ?? "LECTURE");
    setColor(preset?.color ?? "orange");
    setError(null);
  }, [preset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) {
      setError("กรุณากรอกรหัสวิชาและชื่อวิชา");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url = isEdit ? `/api/admin/presets/${preset!.id}` : "/api/admin/presets";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: courseCode.trim(),
          courseName: courseName.trim(),
          credits: credits.trim() || null,
          courseType,
          color,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save preset");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1A1B20] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold font-mitr">
            {isEdit ? "แก้ไข Course Preset" : "เพิ่ม Course Preset"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">รหัสวิชา <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="060133101"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-orange/60 focus:ring-1 focus:ring-brand-orange/30"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">หน่วยกิต</label>
              <input
                type="text"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                placeholder="3(2-2-5)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-orange/60 focus:ring-1 focus:ring-brand-orange/30"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">ชื่อวิชา <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Web Application Development"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-orange/60 focus:ring-1 focus:ring-brand-orange/30"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">ประเภทวิชา</label>
            <div className="flex gap-2">
              {COURSE_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => setCourseType(ct.value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${
                    courseType === ct.value
                      ? "bg-brand-orange/20 text-brand-orange border-brand-orange/50"
                      : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {ct.labelTh}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">สีธีม</label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColor(key)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    color === key ? "scale-125 border-white" : "border-transparent hover:scale-110"
                  } ${theme.swatchBg}`}
                  title={key}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? "บันทึกการแก้ไข" : "เพิ่ม Preset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
