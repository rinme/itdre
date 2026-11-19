import { personnel } from "$lib/data/personnel";
import { getPersonEnglishName } from "$lib/utils/personnel-utils";

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

// Build instructor list from personnel.ts (deduplicated by nameTh, sorted alphabetically)
const seenInstructorNames = new Set<string>();
export const INSTRUCTOR_LIST: InstructorOption[] = [];

for (const p of personnel) {
  const isTeachingFaculty =
    p.category === "lecturer" ||
    (p.category === "administrator" && !p.role.includes("หัวหน้าสำนักงาน"));

  if (isTeachingFaculty && !seenInstructorNames.has(p.nameTh)) {
    seenInstructorNames.add(p.nameTh);
    INSTRUCTOR_LIST.push({
      id: p.id,
      nameTh: p.nameTh,
      nameEn: getPersonEnglishName(p),
      role: p.role,
    });
  }
}

INSTRUCTOR_LIST.sort((a, b) => a.nameTh.localeCompare(b.nameTh, "th"));

export class AdminPresetsState {
  coursePresets = $state<CoursePreset[]>([]);
  instructors = $state<InstructorOption[]>(INSTRUCTOR_LIST);
  loading = $state<boolean>(false);
  error = $state<string | null>(null);

  refreshPresets = async (customFetch?: typeof fetch): Promise<void> => {
    const fetchFn = customFetch || (typeof fetch !== "undefined" ? fetch : undefined);
    if (!fetchFn) return;

    try {
      this.loading = true;
      const res = await fetchFn("/api/admin/presets");
      if (!res.ok) throw new Error("Failed to load presets");
      const data = await res.json();
      this.coursePresets = data.presets ?? [];
      this.error = null;
    } catch (err) {
      this.error = err instanceof Error ? err.message : "Unknown error";
    } finally {
      this.loading = false;
    }
  };
}

export const adminPresetsState = new AdminPresetsState();
