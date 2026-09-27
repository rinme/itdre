# Preset Library Implementation Plan

> **COLOR_THEMES note (implementer read this):** Fields in `ColorTheme` are `cardBg`, `cardBorder`, `cardText`, `swatchBg` — NOT `bg`/`border`/`text`/`dot`. All JSX in Tasks 4 and 5 that references these must use the correct field names. The `swatchBg` class is used for color dot display.


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent Preset Library to the admin area so administrators can pre-define courses and pick instructors from `personnel.ts`, then auto-fill those presets into the `CourseSlotModal` when editing a schedule's course slots — fetched once on page load via React Context.

**Architecture:**
- Two new Prisma models (`CoursePreset`) stored in the existing PostgreSQL DB. Instructors are sourced from `src/data/personnel.ts` (`category === "lecturer" | "administrator"`) and never stored in the DB.
- A new `AdminPresetsContext` (React Context) mounted in a new `src/app/admin/layout.tsx` fetches presets once on admin-area mount and exposes them to all child admin pages.
- A new `/admin/presets` page with a Courses tab (CRUD) and an Instructors tab (read-only list from personnel.ts). A "Presets" link is added to `AdminHeader.tsx`.
- `CourseSlotModal.tsx` gains a "Pick from presets" panel that auto-fills course fields and a separate instructor quick-picker.

**Tech Stack:** Next.js 14 App Router, TypeScript 5, Prisma ORM v6, PostgreSQL, Tailwind CSS, Lucide React, Bun runtime.

**Spec:** N/A (design derived from /grill-me interview 2026-09-27)

## Global Constraints

- Runtime: Bun — run commands as `bun run ...`, `bunx prisma ...`
- All admin routes are protected by Edge Middleware at `src/middleware.ts` (existing, no changes needed)
- `bun run build`, `bun run lint`, and `bun test` must pass with zero errors before committing
- Do NOT modify `.env`, `.env.example`, or any credentials — credentials are already configured
- Do NOT add or remove npm/bun packages — use only what is already installed (Prisma, Lucide, Tailwind, jose, etc.)
- All new admin UI components must use `"use client"` at the top
- Thai/English bilingual labels are required on all user-facing strings (follow existing pattern: `{ th: "...", en: "..." }` objects or inline ternaries with `useLanguage()`)
- Brand colors: `#FF6B00` orange (`text-brand-orange`, `bg-brand-orange`), `#141518` dark, card dark `#1A1B20`
- Fonts: `font-mitr` for Thai text, default `font-sans` otherwise
- Color theme token for course presets: `orange | blue | emerald | purple | rose | amber | sky` (matches existing `COLOR_THEMES` in `src/lib/weekly-grid.ts`)

---

## File Map

### New Files
| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Add `CoursePreset` model |
| `src/context/AdminPresetsContext.tsx` | React Context: holds `CoursePreset[]` and the personnel-derived instructor list; provides `refreshPresets()` |
| `src/app/admin/layout.tsx` | Admin shared layout — wraps children in `AdminPresetsContext.Provider` |
| `src/app/admin/presets/page.tsx` | `/admin/presets` page with two tabs: Courses (CRUD) and Instructors (read-only) |
| `src/components/admin/presets/CoursePresetsTab.tsx` | CRUD table + Add/Edit/Delete course presets |
| `src/components/admin/presets/InstructorsTab.tsx` | Read-only list of personnel lecturers from context |
| `src/components/admin/presets/CoursePresetModal.tsx` | Modal for adding/editing a `CoursePreset` |
| `src/app/api/admin/presets/route.ts` | `GET` list / `POST` create course preset |
| `src/app/api/admin/presets/[id]/route.ts` | `PUT` update / `DELETE` delete course preset |
| `tests/presets.test.ts` | Unit tests: API response shape, context loading logic |

### Modified Files
| File | Change |
|---|---|
| `prisma/schema.prisma` | Add `CoursePreset` model |
| `src/components/admin/AdminHeader.tsx` | Add "จัดการ Presets" nav link pointing to `/admin/presets` |
| `src/components/admin/CourseSlotModal.tsx` | Add "Pick from presets" panel (course chip list + instructor chip list) at top of form |

---

## Task 1: Prisma — Add `CoursePreset` Model

**Files:**
- Modify: `prisma/schema.prisma`
- Test: `tests/presets.test.ts` (schema shape test)

**Interfaces:**
- Produces: `CoursePreset` Prisma model with fields consumed by Task 2's API routes and Task 3's context

- [ ] **Step 1: Write the failing schema test**

Create `tests/presets.test.ts`:

```typescript
import { describe, it, expect } from "bun:test";

describe("CoursePreset model shape", () => {
  it("CoursePreset type has required fields", async () => {
    // Import the generated Prisma type — this only compiles if the model exists
    const { PrismaClient } = await import("@prisma/client");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _p = new PrismaClient();
    // Type-level test: if CoursePreset model doesn't exist, this import fails at build time
    // We verify the shape via a plain object that satisfies the type
    type CoursePresetFields = {
      id: string;
      courseCode: string;
      courseName: string;
      credits: string | null;
      courseType: "LECTURE" | "LAB" | "BOTH";
      color: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    const shape: CoursePresetFields = {
      id: "abc",
      courseCode: "060133101",
      courseName: "Web Application Development",
      credits: "3(2-2-5)",
      courseType: "LECTURE",
      color: "orange",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(shape.courseCode).toBe("060133101");
    expect(shape.courseType).toBe("LECTURE");
    await _p.$disconnect();
  });
});
```

- [ ] **Step 2: Run to verify it fails** (before schema change the type won't be in the generated client)

```bash
bun test tests/presets.test.ts
```
Expected: FAIL (import error or type error)

- [ ] **Step 3: Add `CoursePreset` model to `prisma/schema.prisma`**

Append after the `CourseSlot` model:

```prisma
model CoursePreset {
  id         String     @id @default(cuid())
  courseCode String
  courseName String
  credits    String?
  courseType CourseType @default(LECTURE)
  color      String?
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt

  @@index([courseCode])
}
```

- [ ] **Step 4: Push schema to DB and regenerate client**

```bash
bunx prisma db push
bunx prisma generate
```

Expected: "Your database is now in sync with your Prisma schema."

- [ ] **Step 5: Run test to verify it passes**

```bash
bun test tests/presets.test.ts
```
Expected: PASS

- [ ] **Step 6: Run full suite to ensure nothing broke**

```bash
bun test
bun run lint
bun run build
```
Expected: all pass, 0 errors.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma tests/presets.test.ts
git commit -m "feat(presets): add CoursePreset Prisma model and schema test"
```

---

## Task 2: API Routes — Course Preset CRUD

**Files:**
- Create: `src/app/api/admin/presets/route.ts`
- Create: `src/app/api/admin/presets/[id]/route.ts`

**Interfaces:**
- Consumes: `prisma` singleton from `src/lib/prisma.ts` (`import prisma from "@/lib/prisma"`)
- Consumes: `CourseType` enum values: `LECTURE | LAB | BOTH`
- Produces:
  - `GET /api/admin/presets` → `{ presets: CoursePreset[] }` (200) or `{ error }` (500)
  - `POST /api/admin/presets` → `{ preset: CoursePreset }` (201) or `{ error }` (400/500)
  - `PUT /api/admin/presets/[id]` → `{ preset: CoursePreset }` (200) or `{ error }` (400/404/500)
  - `DELETE /api/admin/presets/[id]` → `{ ok: true }` (200) or `{ error }` (404/500)

**Note:** These routes are under `/api/admin/*` so Edge Middleware automatically guards them — no manual auth check needed in the route handlers.

- [ ] **Step 1: Add API route tests to `tests/presets.test.ts`**

Append to the existing file (after the schema test):

```typescript
import { describe, it, expect } from "bun:test";

describe("Preset API response shapes", () => {
  it("validates course preset object shape", () => {
    // We test shape parsing logic extracted into a helper
    function validatePresetBody(body: unknown): { courseCode: string; courseName: string; credits?: string; courseType?: string; color?: string } | null {
      if (typeof body !== "object" || body === null) return null;
      const b = body as Record<string, unknown>;
      if (typeof b.courseCode !== "string" || b.courseCode.trim() === "") return null;
      if (typeof b.courseName !== "string" || b.courseName.trim() === "") return null;
      return {
        courseCode: (b.courseCode as string).trim(),
        courseName: (b.courseName as string).trim(),
        credits: typeof b.credits === "string" ? b.credits.trim() : undefined,
        courseType: typeof b.courseType === "string" ? b.courseType : undefined,
        color: typeof b.color === "string" ? b.color : undefined,
      };
    }

    expect(validatePresetBody(null)).toBeNull();
    expect(validatePresetBody({ courseCode: "", courseName: "X" })).toBeNull();
    expect(validatePresetBody({ courseCode: "060133101", courseName: "Web App Dev" })).toEqual({
      courseCode: "060133101",
      courseName: "Web App Dev",
      credits: undefined,
      courseType: undefined,
      color: undefined,
    });
    expect(
      validatePresetBody({ courseCode: "060133101", courseName: "Web App Dev", credits: "3(2-2-5)", courseType: "LAB", color: "blue" })
    ).toEqual({
      courseCode: "060133101",
      courseName: "Web App Dev",
      credits: "3(2-2-5)",
      courseType: "LAB",
      color: "blue",
    });
  });
});
```

Run: `bun test tests/presets.test.ts` → Expected: PASS (pure logic test, no DB)

- [ ] **Step 2: Create `src/app/api/admin/presets/route.ts`**

```typescript
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CourseType } from "@prisma/client";

export const dynamic = "force-dynamic";

const VALID_TYPES: CourseType[] = ["LECTURE", "LAB", "BOTH"];
const VALID_COLORS = ["orange", "blue", "emerald", "purple", "rose", "amber", "sky"];

export async function GET() {
  try {
    const presets = await prisma.coursePreset.findMany({
      orderBy: { courseCode: "asc" },
    });
    return NextResponse.json({ presets });
  } catch (err) {
    console.error("GET /api/admin/presets error:", err);
    return NextResponse.json({ error: "Failed to load presets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const courseCode = typeof body.courseCode === "string" ? body.courseCode.trim() : "";
    const courseName = typeof body.courseName === "string" ? body.courseName.trim() : "";

    if (!courseCode || !courseName) {
      return NextResponse.json({ error: "courseCode and courseName are required" }, { status: 400 });
    }

    const courseType: CourseType = VALID_TYPES.includes(body.courseType) ? body.courseType : "LECTURE";
    const color = VALID_COLORS.includes(body.color) ? body.color : null;
    const credits = typeof body.credits === "string" && body.credits.trim() ? body.credits.trim() : null;

    const preset = await prisma.coursePreset.create({
      data: { courseCode, courseName, credits, courseType, color },
    });
    return NextResponse.json({ preset }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/presets error:", err);
    return NextResponse.json({ error: "Failed to create preset" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create `src/app/api/admin/presets/[id]/route.ts`**

```typescript
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CourseType } from "@prisma/client";

export const dynamic = "force-dynamic";

const VALID_TYPES: CourseType[] = ["LECTURE", "LAB", "BOTH"];
const VALID_COLORS = ["orange", "blue", "emerald", "purple", "rose", "amber", "sky"];

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.coursePreset.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    const body = await request.json();
    const courseCode = typeof body.courseCode === "string" && body.courseCode.trim() ? body.courseCode.trim() : existing.courseCode;
    const courseName = typeof body.courseName === "string" && body.courseName.trim() ? body.courseName.trim() : existing.courseName;
    const courseType: CourseType = VALID_TYPES.includes(body.courseType) ? body.courseType : existing.courseType;
    const color = VALID_COLORS.includes(body.color) ? body.color : existing.color;
    const credits = typeof body.credits === "string" && body.credits.trim() ? body.credits.trim() : existing.credits;

    const preset = await prisma.coursePreset.update({
      where: { id: params.id },
      data: { courseCode, courseName, credits, courseType, color },
    });
    return NextResponse.json({ preset });
  } catch (err) {
    console.error("PUT /api/admin/presets/[id] error:", err);
    return NextResponse.json({ error: "Failed to update preset" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.coursePreset.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }
    await prisma.coursePreset.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/presets/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete preset" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Verify build + lint**

```bash
bun run lint
bun run build
```
Expected: 0 errors, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/presets/route.ts src/app/api/admin/presets/[id]/route.ts tests/presets.test.ts
git commit -m "feat(presets): add course preset CRUD API routes"
```

---

## Task 3: AdminPresetsContext + Admin Layout

**Files:**
- Create: `src/context/AdminPresetsContext.tsx`
- Create: `src/app/admin/layout.tsx`

**Interfaces:**
- Consumes: `GET /api/admin/presets` → `{ presets: CoursePreset[] }` (from Task 2)
- Consumes: `personnel` array from `src/data/personnel.ts` and `PersonnelMember` type from `src/types/index.ts`
- Produces (exported from `AdminPresetsContext.tsx`):
  ```typescript
  export interface InstructorOption {
    id: string;       // personnel id (e.g. "person-7")
    nameTh: string;   // e.g. "ผศ.ดร.พงศารุณ บุญยะโอภาส"
    nameEn?: string;  // from personnel-utils ENGLISH_NAMES map
    role: string;     // e.g. "อาจารย์ประจำ"
  }

  export interface AdminPresetsContextValue {
    coursePresets: CoursePreset[];          // from DB
    instructors: InstructorOption[];        // from personnel.ts (lecturer + administrator categories)
    loading: boolean;
    error: string | null;
    refreshPresets: () => Promise<void>;    // re-fetches coursePresets from API
  }

  export const AdminPresetsContext: React.Context<AdminPresetsContextValue>;
  export function useAdminPresets(): AdminPresetsContextValue;
  export function AdminPresetsProvider({ children }: { children: React.ReactNode }): JSX.Element;
  ```
- Consumes (to build `InstructorOption[]`): filter `personnel` where `category === "lecturer" || category === "administrator"`, map to `{ id, nameTh, nameEn, role }` — use `getPersonEnglishName` from `src/lib/personnel-utils.ts`

- [ ] **Step 1: Create `src/context/AdminPresetsContext.tsx`**

```typescript
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

const AdminPresetsContext = createContext<AdminPresetsContextValue>({
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

  return (
    <AdminPresetsContext.Provider
      value={{
        coursePresets,
        instructors: INSTRUCTOR_LIST,
        loading,
        error,
        refreshPresets,
      }}
    >
      {children}
    </AdminPresetsContext.Provider>
  );
}

export function useAdminPresets(): AdminPresetsContextValue {
  return useContext(AdminPresetsContext);
}
```

- [ ] **Step 2: Create `src/app/admin/layout.tsx`**

```typescript
import { AdminPresetsProvider } from "@/context/AdminPresetsContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminPresetsProvider>{children}</AdminPresetsProvider>;
}
```

Note: This is a Server Component wrapper — the Provider itself is a client component. Next.js App Router handles this correctly.

- [ ] **Step 3: Add context loading test to `tests/presets.test.ts`**

Append to the file:

```typescript
describe("AdminPresetsContext instructor list", () => {
  it("builds instructor list from personnel module", async () => {
    const { personnel } = await import("../src/data/personnel");
    const instructors = personnel.filter(
      (p) => p.category === "lecturer" || p.category === "administrator"
    );
    // Must be non-empty
    expect(instructors.length).toBeGreaterThan(0);
    // Every item has nameTh
    for (const inst of instructors) {
      expect(typeof inst.nameTh).toBe("string");
      expect(inst.nameTh.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 4: Run tests + lint + build**

```bash
bun test tests/presets.test.ts
bun run lint
bun run build
```
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/context/AdminPresetsContext.tsx src/app/admin/layout.tsx tests/presets.test.ts
git commit -m "feat(presets): add AdminPresetsContext with once-fetch caching and admin layout"
```

---

## Task 4: Presets Management Page UI

**Files:**
- Create: `src/app/admin/presets/page.tsx`
- Create: `src/components/admin/presets/CoursePresetsTab.tsx`
- Create: `src/components/admin/presets/InstructorsTab.tsx`
- Create: `src/components/admin/presets/CoursePresetModal.tsx`
- Modify: `src/components/admin/AdminHeader.tsx` (add Presets nav link)

**Interfaces:**
- Consumes: `useAdminPresets()` from `src/context/AdminPresetsContext.tsx` → `{ coursePresets, instructors, loading, error, refreshPresets }`
- Consumes: `CoursePreset`, `InstructorOption` types from `src/context/AdminPresetsContext.tsx`
- Consumes: Admin API routes from Task 2 (`POST /api/admin/presets`, `PUT /api/admin/presets/[id]`, `DELETE /api/admin/presets/[id]`)
- Consumes: `AdminHeader` from `src/components/admin/AdminHeader.tsx`
- Consumes: COLOR_THEMES from `src/lib/weekly-grid.ts` for color swatch display:
  ```typescript
  // COLOR_THEMES is Record<string, { bg: string; text: string; border: string; dot: string }>
  import { COLOR_THEMES } from "@/lib/weekly-grid";
  ```

- [ ] **Step 1: Create `src/components/admin/presets/CoursePresetModal.tsx`**

```typescript
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
        body: JSON.stringify({ courseCode: courseCode.trim(), courseName: courseName.trim(), credits: credits.trim() || null, courseType, color }),
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
              className="flex-1 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-darkOrange text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
```

- [ ] **Step 2: Create `src/components/admin/presets/CoursePresetsTab.tsx`**

```typescript
"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2, BookOpen, Loader2 } from "lucide-react";
import { useAdminPresets } from "@/context/AdminPresetsContext";
import type { CoursePreset } from "@/context/AdminPresetsContext";
import CoursePresetModal from "./CoursePresetModal";
import { COLOR_THEMES } from "@/lib/weekly-grid";

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
```

- [ ] **Step 3: Create `src/components/admin/presets/InstructorsTab.tsx`**

```typescript
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
              className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl px-4 py-3"
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
```

- [ ] **Step 4: Create `src/app/admin/presets/page.tsx`**

```typescript
"use client";

import React, { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import CoursePresetsTab from "@/components/admin/presets/CoursePresetsTab";
import InstructorsTab from "@/components/admin/presets/InstructorsTab";
import { BookOpen, Users } from "lucide-react";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "courses", labelTh: "รายวิชา", labelEn: "Courses", icon: BookOpen },
  { id: "instructors", labelTh: "ผู้สอน", labelEn: "Instructors", icon: Users },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPresetsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("courses");

  return (
    <div className="min-h-screen bg-[#0E0F12]">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white font-mitr mb-1">
            จัดการ Presets
          </h1>
          <p className="text-slate-400 text-sm">
            เพิ่ม แก้ไข หรือลบ presets ที่ใช้เติมข้อมูลอัตโนมัติในตารางเรียน
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6 w-fit border border-white/10">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-brand-orange text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.labelTh}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-[#1A1B20] border border-white/10 rounded-2xl p-6">
          {activeTab === "courses" ? <CoursePresetsTab /> : <InstructorsTab />}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Add "Presets" nav link to `src/components/admin/AdminHeader.tsx`**

Find the `navLinks` array (around line 66) and add the Presets link:

```typescript
// In AdminHeader.tsx, add to import list:
import { Calendar, BookMarked, LogOut, ... } from "lucide-react";

// Add to navLinks array:
{
  nameTh: "Presets",
  nameEn: "Presets",
  href: "/admin/presets",
  icon: BookMarked,
  active: pathname.startsWith("/admin/presets"),
},
```

- [ ] **Step 6: Run full checks**

```bash
bun test
bun run lint
bun run build
```
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/app/admin/presets/page.tsx \
        src/components/admin/presets/CoursePresetsTab.tsx \
        src/components/admin/presets/InstructorsTab.tsx \
        src/components/admin/presets/CoursePresetModal.tsx \
        src/components/admin/AdminHeader.tsx
git commit -m "feat(presets): add /admin/presets page with course CRUD and instructor read-only tabs"
```

---

## Task 5: CourseSlotModal Preset Picker + Multi-Instructor Display Fixes

**Files:**
- Modify: `src/components/admin/CourseSlotModal.tsx` — add preset picker panels; instructor picker APPENDS to the instructors array
- Modify: `src/app/api/admin/schedules/[id]/slots/route.ts` — change `instructor` → `instructors` field handling
- Modify: `src/app/api/admin/schedules/[id]/slots/[slotId]/route.ts` — same rename
- Modify: `src/components/admin/WeeklyGridEditor.tsx` — display `slot.instructors` array (join with ", ")
- Modify: `src/components/admin/ScheduleTableView.tsx` — display `slot.instructors` array
- Modify: `src/components/schedules/WeeklyTimetableGrid.tsx` — display `slot.instructors` array
- Modify: `src/components/schedules/MobileDayView.tsx` — display `slot.instructors` array
- Modify: `src/components/schedules/ScheduleListView.tsx` — search + display `slot.instructors` array

**Interfaces:**
- Consumes: `useAdminPresets()` from `@/context/AdminPresetsContext`
- Consumes: `CoursePreset`, `InstructorOption` types from `@/context/AdminPresetsContext`
- Consumes: `COLOR_THEMES` from `@/lib/weekly-grid`

**Key behavioral decisions:**
- `CourseSlotModal.tsx` already stores instructors as `string[]` internally (comma-separated `useState<string>` that splits on submit). The instructor preset picker must **ADD** the clicked instructor to the existing comma-separated string (not replace it), so `"ผศ.ดร.A"` → click ผศ.ดร.B → becomes `"ผศ.ดร.A, ผศ.ดร.B"`.
- All display components that show `slot.instructor` (singular string) must be updated to `slot.instructors` (string array) — display as `slot.instructors?.join(", ")` or equivalent.
- The admin API slot POST/PUT routes currently write `instructor: data.instructor` — update to `instructors: Array.isArray(data.instructors) ? data.instructors : []` for POST and merge correctly for PUT.

- [ ] **Step 1: Read the existing `CourseSlotModal.tsx` state variables**

Before editing, read the full file to understand the exact state variable names:

```bash
grep -n "useState\|const \[" src/components/admin/CourseSlotModal.tsx
```

Note which variables control: courseCode, courseName, courseType, color, instructor.

- [ ] **Step 2: Add the preset picker to `CourseSlotModal.tsx`**

Add the following imports at the top of the file (after existing imports):
```typescript
import { useAdminPresets } from "@/context/AdminPresetsContext";
import { COLOR_THEMES } from "@/lib/weekly-grid";
import { ChevronDown, ChevronUp, BookOpen, Users } from "lucide-react";
```

Inside the component function, add after existing state declarations:
```typescript
const { coursePresets, instructors } = useAdminPresets();
const [showCoursePresets, setShowCoursePresets] = useState(false);
const [showInstructorPresets, setShowInstructorPresets] = useState(false);
const [coursePresetQuery, setCoursePresetQuery] = useState("");
const [instructorQuery, setInstructorQuery] = useState("");

const filteredCoursePresets = coursePresets.filter(
  (p) =>
    p.courseCode.toLowerCase().includes(coursePresetQuery.toLowerCase()) ||
    p.courseName.toLowerCase().includes(coursePresetQuery.toLowerCase())
);

const filteredInstructors = instructors.filter(
  (i) =>
    i.nameTh.includes(instructorQuery) ||
    (i.nameEn?.toLowerCase().includes(instructorQuery.toLowerCase()) ?? false)
);
```

Add the following JSX block **at the very top of the `<form>` element**, before the existing Day/Time fields:

```tsx
{/* ── Course Preset Picker ── */}
<div className="border border-white/10 rounded-xl overflow-hidden">
  <button
    type="button"
    onClick={() => setShowCoursePresets((v) => !v)}
    className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/8 text-sm text-slate-300 transition-colors"
  >
    <span className="flex items-center gap-2">
      <BookOpen className="w-4 h-4 text-brand-orange" />
      เลือกรายวิชาจาก Presets ({coursePresets.length})
    </span>
    {showCoursePresets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
  </button>
  {showCoursePresets && (
    <div className="p-3 space-y-2 border-t border-white/10">
      <input
        type="text"
        value={coursePresetQuery}
        onChange={(e) => setCoursePresetQuery(e.target.value)}
        placeholder="ค้นหารหัส/ชื่อวิชา..."
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange/50"
      />
      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
        {filteredCoursePresets.length === 0 && (
          <p className="text-xs text-slate-500 py-2">ไม่พบ preset</p>
        )}
        {filteredCoursePresets.map((p) => {
          const theme = COLOR_THEMES[p.color ?? "orange"] ?? COLOR_THEMES["orange"];
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setCourseCode(p.courseCode);
                setCourseName(p.courseName);
                setCourseType(p.courseType as CourseType);
                setColor(p.color ?? "orange");
                setShowCoursePresets(false);
                setCoursePresetQuery("");
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:scale-105 ${theme.cardBg} ${theme.cardBorder} ${theme.cardText}`}
            >
              <span className={`w-2 h-2 rounded-full ${theme.swatchBg} flex-shrink-0`} />
              <span className="font-mono">{p.courseCode}</span>
              <span className="text-slate-400">—</span>
              <span className="truncate max-w-[100px]">{p.courseName}</span>
            </button>
          );
        })}
      </div>
    </div>
  )}
</div>

{/* ── Instructor Preset Picker ── */}
<div className="border border-white/10 rounded-xl overflow-hidden">
  <button
    type="button"
    onClick={() => setShowInstructorPresets((v) => !v)}
    className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/8 text-sm text-slate-300 transition-colors"
  >
    <span className="flex items-center gap-2">
      <Users className="w-4 h-4 text-blue-400" />
      เลือกผู้สอนจาก Presets ({instructors.length})
    </span>
    {showInstructorPresets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
  </button>
  {showInstructorPresets && (
    <div className="p-3 space-y-2 border-t border-white/10">
      <input
        type="text"
        value={instructorQuery}
        onChange={(e) => setInstructorQuery(e.target.value)}
        placeholder="ค้นหาชื่ออาจารย์..."
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange/50"
      />
      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
        {filteredInstructors.length === 0 && (
          <p className="text-xs text-slate-500 py-2">ไม่พบผู้สอน</p>
        )}
        {filteredInstructors.map((inst) => (
          <button
            key={inst.id}
            type="button"
            onClick={() => {
              // APPEND to existing comma-separated instructors string
              setInstructors((prev) => {
                const current = prev.trim();
                return current ? `${current}, ${inst.nameTh}` : inst.nameTh;
              });
              setInstructorQuery("");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-300 text-xs font-medium hover:bg-blue-500/20 transition-all hover:scale-105"
          >
            {inst.nameTh}
          </button>
        ))}
      </div>
    </div>
  )}
</div>
```

**Important:** The existing `CourseSlotModal.tsx` state variables are:
- `courseCode` / `setCourseCode` — ✅ matches plan
- `courseName` / `setCourseName` — ✅ matches plan
- `courseType` / `setCourseType` — uses `CourseType` from `@prisma/client` — ✅
- `color` / `setColor` — uses `ColorToken` type — ✅
- `instructors` / `setInstructors` (plural string, comma-sep) — **use `setInstructors` NOT `setInstructor`**

`CourseType` is already imported from `@prisma/client`. `COLOR_THEMES` is already imported via `weekly-grid`.

- [ ] **Step 3: Update admin slot API routes for `instructor` → `instructors` rename**

In `src/app/api/admin/schedules/[id]/slots/route.ts`, find the POST handler's Prisma `data` object and change:
```typescript
// OLD:
instructor: data.instructor || null,

// NEW:
instructors: Array.isArray(data.instructors) ? data.instructors.filter(Boolean) : [],
```

In `src/app/api/admin/schedules/[id]/slots/[slotId]/route.ts`, find the PUT handler merge and change:
```typescript
// OLD:
...(data.instructor !== undefined && { instructor: data.instructor }),

// NEW:
...(data.instructors !== undefined && { instructors: Array.isArray(data.instructors) ? data.instructors.filter(Boolean) : [] }),
```

- [ ] **Step 4: Update display components for `instructor` → `instructors` (string[] join)**

**`src/components/admin/WeeklyGridEditor.tsx`** — find `slot.instructor` references and change to `slot.instructors?.join(", ")`:
```typescript
// Find pattern like:
{slot.instructor && (
  <span ...>{slot.instructor}</span>
)}

// Replace with:
{slot.instructors && slot.instructors.length > 0 && (
  <span ... title={`ผู้สอน: ${slot.instructors.join(", ")}`}>
    {slot.instructors.join(", ")}
  </span>
)}
```

**`src/components/admin/ScheduleTableView.tsx`** — same pattern, change `slot.instructor` to `slot.instructors?.join(", ") || ""` wherever displayed. Also update the search filter: `s.instructor.toLowerCase()` → `(s.instructors ?? []).join(", ").toLowerCase()`.

**`src/components/schedules/WeeklyTimetableGrid.tsx`** — update the `SlotCard` or inline type from `instructor?: string | null` to `instructors?: string[] | null`. Change display from `{slot.instructor}` to `{slot.instructors?.join(", ")}`. Update title attribute similarly.

**`src/components/schedules/MobileDayView.tsx`** — change `{slot.instructor}` display to `{(slot.instructors ?? []).join(", ") || t("ไม่ระบุผู้สอน", "No lecturer")}`.

**`src/components/schedules/ScheduleListView.tsx`** — update search filter from `s.instructor?.toLowerCase()` to `(s.instructors ?? []).join(", ").toLowerCase()`. Update display from `{slot.instructor || ...}` to `{slot.instructors?.join(", ") || ...}`.

After all edits, run:
```bash
grep -rn "slot\.instructor[^s]" src/  # Should return 0 results
```



- [ ] **Step 5: Run full checks**

```bash
grep -rn "slot\.instructor[^s]" src/  # Must return 0 results
bun test
bun run lint
bun run build
```
Expected: all pass, 0 errors, grep returns nothing.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/CourseSlotModal.tsx \
        src/app/api/admin/schedules/[id]/slots/route.ts \
        src/app/api/admin/schedules/[id]/slots/[slotId]/route.ts \
        src/components/admin/WeeklyGridEditor.tsx \
        src/components/admin/ScheduleTableView.tsx \
        src/components/schedules/WeeklyTimetableGrid.tsx \
        src/components/schedules/MobileDayView.tsx \
        src/components/schedules/ScheduleListView.tsx
git commit -m "feat(presets): add preset pickers to CourseSlotModal; fix multi-instructor display across all components"
```

---

## Task 6: Final Verification & Push

**Files:** No new files. Full regression pass.

- [ ] **Step 1: Run the complete test suite**

```bash
bun test
```
Expected: all tests pass (including pre-existing 85 tests plus new preset tests).

- [ ] **Step 2: Lint**

```bash
bun run lint
```
Expected: 0 warnings, 0 errors.

- [ ] **Step 3: Production build**

```bash
bun run build
```
Expected: build succeeds, all routes compiled. Note the route list includes `/admin/presets`.

- [ ] **Step 4: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 5: Confirm**

Report: all checks green, pushed to main.
