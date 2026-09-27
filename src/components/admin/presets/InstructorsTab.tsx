"use client";

import React, { useState } from "react";
import { Users, Search } from "lucide-react";
import { useAdminPresets } from "@/context/AdminPresetsContext";

export default function InstructorsTab() {
  const { instructors, loading } = useAdminPresets();
  const [query, setQuery] = useState("");

  const filtered = instructors.filter(
    (i) =>
      i.nameTh.includes(query) ||
      (i.nameEn?.toLowerCase().includes(query.toLowerCase()) ?? false) ||
      i.role.includes(query)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <span className="text-slate-400 text-sm">กำลังโหลด...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          {instructors.length} คน — รายชื่อดึงมาจากข้อมูลบุคลากรของคณะโดยอัตโนมัติ
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่ออาจารย์..."
            className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange/60 w-56"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-500">
          <Users className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">ไม่พบผู้สอนที่ค้นหา</p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((inst) => (
            <div
              key={inst.id}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
            >
              <div className="w-8 h-8 rounded-full bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center text-brand-orange text-xs font-bold flex-shrink-0">
                {inst.nameTh.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate font-mitr">{inst.nameTh}</p>
                {inst.nameEn && <p className="text-slate-500 text-xs truncate">{inst.nameEn}</p>}
                <p className="text-slate-600 text-xs truncate">{inst.role}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
