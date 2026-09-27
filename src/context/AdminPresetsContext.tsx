"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { personnel } from "@/data/personnel";
import { getPersonEnglishName } from "@/lib/personnel-utils";

// Inline minimal type (avoids Prisma client import in context bundle)
export interface CoursePreset {
  id: string;
  courseCode: string;
  courseName: string;
  credits: string | null;
  courseType: "LECTURE" | "LAB" | "BOTH";
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorOption {
  id: string;
  nameTh: string;
  nameEn?: string;
  role: string;
}

export interface AdminPresetsContextValue {
  coursePresets: CoursePreset[];
  instructors: InstructorOption[];
  loading: boolean;
  error: string | null;
  refreshPresets: () => Promise<void>;
}

export const AdminPresetsContext = createContext<AdminPresetsContextValue>({
  coursePresets: [],
  instructors: [],
  loading: true,
  error: null,
  refreshPresets: async () => {},
});

// Build instructor list from personnel.ts (lecturer & administrator categories)
const INSTRUCTOR_LIST: InstructorOption[] = personnel
  .filter((p) => p.category === "lecturer" || p.category === "administrator")
  .map((p) => ({
    id: p.id,
    nameTh: p.nameTh,
    nameEn: getPersonEnglishName(p),
    role: p.role,
  }));

export function AdminPresetsProvider({ children }: { children: React.ReactNode }) {
  const [coursePresets, setCoursePresets] = useState<CoursePreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPresets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/presets");
      if (!res.ok) throw new Error("Failed to load presets");
      const data = await res.json();
      setCoursePresets(data.presets ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPresets();
  }, [refreshPresets]);

  const value = React.useMemo(
    () => ({
      coursePresets,
      instructors: INSTRUCTOR_LIST,
      loading,
      error,
      refreshPresets,
    }),
    [coursePresets, loading, error, refreshPresets]
  );

  return (
    <AdminPresetsContext.Provider value={value}>
      {children}
    </AdminPresetsContext.Provider>
  );
}

export function useAdminPresets(): AdminPresetsContextValue {
  return useContext(AdminPresetsContext);
}
