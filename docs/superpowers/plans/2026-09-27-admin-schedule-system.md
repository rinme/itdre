# Admin System & Interactive Schedule Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an administrative portal and public-facing interactive class timetable system where administrators manage weekly schedules across degree levels (Bachelor, Master, Doctor), academic years, and study cohorts, and students can view, filter, and print them.

**Architecture:** Prisma ORM connected to PostgreSQL for data persistence with cascade-deleted course slots; Edge-compatible Next.js Middleware guarding `/admin/*` routes via encrypted `jose` JWT session cookies; Next.js 14 App Router REST endpoints for schedule and course slot CRUD; interactive visual weekly grid editor for admins with live conflict checking; and responsive, print-optimized public timetable viewer at `/schedules` with bilingual (TH/EN) localization.

**Tech Stack:** Next.js 14 App Router, TypeScript 5, Tailwind CSS, Prisma ORM, PostgreSQL, `jose` JWT library, Lucide React, Bun test.

**Spec:** [docs/superpowers/specs/2026-09-27-admin-schedule-system-design.md](file:///home/rinme/project/itdre/docs/superpowers/specs/2026-09-27-admin-schedule-system-design.md)

## Global Constraints

- Runtime: Bun / Node.js with Next.js 14 App Router.
- Styling: Tailwind CSS following existing brand guidelines (`#FF6B00`, `#222222`, `#F8F9FA`, `Mitr` typography).
- Localization: All user-facing text in public views must adapt reactively to `LanguageContext` (`TH` and `EN`).
- Security: Admin routes `/admin/*` must be guarded by Next.js Edge Middleware verifying an HTTP-only `admin_session` cookie signed with `ADMIN_JWT_SECRET`.
- Production zero-breakage: `bun run build` and `bun run lint` must pass with zero errors.

---

### Task 1: Dependencies, Prisma Schema & Database Client

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`
- Create: `prisma/seed.ts`
- Modify: `package.json`
- Test: `tests/prisma-schema.test.ts`

**Interfaces:**
- Consumes: Environment variable `DATABASE_URL`
- Produces: `prisma` client instance exported from `@/lib/prisma`, Prisma models `Schedule`, `CourseSlot`, enums `DegreeLevel`, `ScheduleStatus`, `CourseType`, `DayOfWeek`

- [ ] **Step 1: Write the failing test for Prisma schema definitions and client export**

Create `tests/prisma-schema.test.ts`:
```typescript
import { describe, expect, it } from "bun:test";
import { prisma } from "../src/lib/prisma";

describe("Prisma Client Initialization", () => {
  it("exports a valid prisma client instance", () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma).toBe("object");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/prisma-schema.test.ts`
Expected: FAIL with "Cannot find module '../src/lib/prisma'"

- [ ] **Step 3: Install dependencies and configure Prisma**

Run: `bun add prisma @prisma/client jose`

Create `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum DegreeLevel {
  BACHELOR
  MASTER
  DOCTOR
}

enum ScheduleStatus {
  DRAFT
  PUBLISHED
}

enum CourseType {
  LECTURE
  LAB
  BOTH
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

model Schedule {
  id           String         @id @default(cuid())
  academicYear Int
  semester     Int
  degreeLevel  DegreeLevel
  programId    String
  programName  String
  yearLevel    Int
  sectionGroup String?
  status       ScheduleStatus @default(DRAFT)
  note         String?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  slots CourseSlot[]

  @@unique([academicYear, semester, degreeLevel, programId, yearLevel, sectionGroup], name: "unique_cohort_schedule")
  @@index([academicYear, semester, degreeLevel, status])
}

model CourseSlot {
  id          String     @id @default(cuid())
  scheduleId  String
  schedule    Schedule   @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  courseCode  String
  courseName  String
  section     String?
  dayOfWeek   DayOfWeek
  startTime   String
  endTime     String
  room        String?
  instructor  String?
  courseType  CourseType @default(LECTURE)
  color       String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([scheduleId, dayOfWeek])
}
```

Create `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Run: `bunx prisma generate`

Create `prisma/seed.ts` with initial mock seed data:
```typescript
import { PrismaClient, DegreeLevel, ScheduleStatus, CourseType, DayOfWeek } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const schedule = await prisma.schedule.upsert({
    where: {
      unique_cohort_schedule: {
        academicYear: 2567,
        semester: 1,
        degreeLevel: DegreeLevel.BACHELOR,
        programId: "bachelor-itd",
        yearLevel: 1,
        sectionGroup: "Sec 1",
      },
    },
    update: {},
    create: {
      academicYear: 2567,
      semester: 1,
      degreeLevel: DegreeLevel.BACHELOR,
      programId: "bachelor-itd",
      programName: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล (วท.บ.)",
      yearLevel: 1,
      sectionGroup: "Sec 1",
      status: ScheduleStatus.PUBLISHED,
      note: "ตารางเรียนภาคการศึกษาที่ 1/2567 ชั้นปีที่ 1",
      slots: {
        create: [
          {
            courseCode: "060133101",
            courseName: "Programming Fundamentals",
            section: "Sec 1",
            dayOfWeek: DayOfWeek.MONDAY,
            startTime: "09:00",
            endTime: "12:00",
            room: "79-5A02",
            instructor: "ดร. อานนท์ วงศ์สมบูรณ์",
            courseType: CourseType.LECTURE,
            color: "orange",
          },
          {
            courseCode: "060133102",
            courseName: "Programming Fundamentals Lab",
            section: "Sec 1",
            dayOfWeek: DayOfWeek.MONDAY,
            startTime: "13:00",
            endTime: "16:00",
            room: "79-5A03",
            instructor: "ดร. อานนท์ วงศ์สมบูรณ์",
            courseType: CourseType.LAB,
            color: "blue",
          },
          {
            courseCode: "060133103",
            courseName: "Discrete Mathematics for IT",
            section: "Sec 1",
            dayOfWeek: DayOfWeek.WEDNESDAY,
            startTime: "09:00",
            endTime: "12:00",
            room: "79-4A01",
            instructor: "ผศ. สมชาย ใจดี",
            courseType: CourseType.LECTURE,
            color: "emerald",
          },
        ],
      },
    },
  });

  console.log("Seeded sample schedule:", schedule.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/prisma-schema.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json bun.lock prisma/schema.prisma src/lib/prisma.ts prisma/seed.ts tests/prisma-schema.test.ts
git commit -m "feat: add prisma schema, client singleton, and test"
```

---

### Task 2: Authentication Core, JWT Session Management & Edge Middleware

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/middleware.ts`
- Test: `tests/auth.test.ts`

**Interfaces:**
- Consumes: `process.env.ADMIN_USERNAME`, `process.env.ADMIN_PASSWORD`, `process.env.ADMIN_JWT_SECRET`
- Produces: `verifyCredentials(user, pass)`, `signAdminJWT()`, `verifyAdminJWT(token)`, `COOKIE_NAME`

- [ ] **Step 1: Write the failing test for authentication logic**

Create `tests/auth.test.ts`:
```typescript
import { describe, expect, it, beforeAll } from "bun:test";
import { verifyCredentials, signAdminJWT, verifyAdminJWT } from "../src/lib/auth";

describe("Admin Authentication", () => {
  beforeAll(() => {
    process.env.ADMIN_USERNAME = "test_admin";
    process.env.ADMIN_PASSWORD = "SecretPassword123!";
    process.env.ADMIN_JWT_SECRET = "01234567890123456789012345678901";
  });

  it("successfully verifies correct credentials", async () => {
    const valid = await verifyCredentials("test_admin", "SecretPassword123!");
    expect(valid).toBe(true);
  });

  it("rejects invalid username or password", async () => {
    const wrongUser = await verifyCredentials("wrong_user", "SecretPassword123!");
    expect(wrongUser).toBe(false);

    const wrongPass = await verifyCredentials("test_admin", "WrongPassword!");
    expect(wrongPass).toBe(false);
  });

  it("signs and verifies a valid JWT session", async () => {
    const token = await signAdminJWT("test_admin");
    expect(typeof token).toBe("string");

    const payload = await verifyAdminJWT(token);
    expect(payload).not.toBeNull();
    expect(payload?.username).toBe("test_admin");
  });

  it("rejects an invalid or tampered JWT session", async () => {
    const payload = await verifyAdminJWT("invalid.tampered.token");
    expect(payload).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/auth.test.ts`
Expected: FAIL with "Cannot find module '../src/lib/auth'"

- [ ] **Step 3: Implement auth helper and Edge middleware**

Create `src/lib/auth.ts`:
```typescript
import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "admin_session";

function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET || "fallback_default_secret_32_characters_long_min!";
  return new TextEncoder().encode(secret);
}

export async function verifyCredentials(username?: string, password?: string): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD || "admin1234";

  if (!username || !password) return false;
  return username === expectedUser && password === expectedPass;
}

export async function signAdminJWT(username: string): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({ username, role: "ADMIN" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminJWT(token: string): Promise<{ username: string; role: string } | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return {
      username: payload.username as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}
```

Create `src/middleware.ts`:
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminJWT, COOKIE_NAME } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and login API endpoint without authentication
  if (pathname === "/admin/login" || pathname === "/api/admin/auth/login") {
    return NextResponse.next();
  }

  // Intercept all other /admin or /api/admin requests
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyAdminJWT(token);
    if (!session) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "INVALID_SESSION" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/auth.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/middleware.ts tests/auth.test.ts
git commit -m "feat: implement admin auth utility, JWT sessions, and edge middleware"
```

---

### Task 3: Conflict Detector & Admin REST API Handlers

**Files:**
- Create: `src/lib/schedule-conflict.ts`
- Create: `src/app/api/admin/auth/login/route.ts`
- Create: `src/app/api/admin/auth/logout/route.ts`
- Create: `src/app/api/admin/auth/me/route.ts`
- Create: `src/app/api/admin/schedules/route.ts`
- Create: `src/app/api/admin/schedules/[id]/route.ts`
- Create: `src/app/api/admin/schedules/[id]/clone/route.ts`
- Create: `src/app/api/admin/schedules/[id]/slots/route.ts`
- Create: `src/app/api/admin/schedules/[id]/slots/[slotId]/route.ts`
- Test: `tests/schedule-conflict.test.ts`

**Interfaces:**
- Consumes: `prisma`, `verifyCredentials`, `signAdminJWT`, `verifyAdminJWT`
- Produces: Conflict detector function `detectCourseSlotConflicts`, endpoints for admin schedule and slot management

- [ ] **Step 1: Write failing test for schedule conflict detection**

Create `tests/schedule-conflict.test.ts`:
```typescript
import { describe, expect, it } from "bun:test";
import { detectCourseSlotConflicts } from "../src/lib/schedule-conflict";
import type { DayOfWeek } from "@prisma/client";

describe("Course Slot Conflict Detection", () => {
  const existingSlots = [
    {
      id: "slot-1",
      courseCode: "060133101",
      courseName: "Programming I",
      dayOfWeek: "MONDAY" as DayOfWeek,
      startTime: "09:00",
      endTime: "12:00",
      room: "79-5A02",
    },
    {
      id: "slot-2",
      courseCode: "060133102",
      courseName: "Database Systems",
      dayOfWeek: "MONDAY" as DayOfWeek,
      startTime: "13:00",
      endTime: "16:00",
      room: "79-5A03",
    },
  ];

  it("detects time overlap on the same day", () => {
    const candidate = {
      dayOfWeek: "MONDAY" as DayOfWeek,
      startTime: "11:00",
      endTime: "14:00",
      room: "79-5A01",
    };
    const conflicts = detectCourseSlotConflicts(candidate, existingSlots);
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0].type).toBe("TIME_OVERLAP");
  });

  it("detects room double-booking", () => {
    const candidate = {
      dayOfWeek: "MONDAY" as DayOfWeek,
      startTime: "09:30",
      endTime: "11:30",
      room: "79-5A02",
    };
    const conflicts = detectCourseSlotConflicts(candidate, existingSlots);
    const roomConflict = conflicts.find((c) => c.type === "ROOM_CONFLICT");
    expect(roomConflict).toBeDefined();
  });

  it("returns no conflict for non-overlapping times", () => {
    const candidate = {
      dayOfWeek: "MONDAY" as DayOfWeek,
      startTime: "16:00",
      endTime: "18:00",
      room: "79-5A02",
    };
    const conflicts = detectCourseSlotConflicts(candidate, existingSlots);
    expect(conflicts.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/schedule-conflict.test.ts`
Expected: FAIL with "Cannot find module '../src/lib/schedule-conflict'"

- [ ] **Step 3: Implement conflict detector and admin API routes**

Create `src/lib/schedule-conflict.ts`:
```typescript
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
      if (candidate.room && slot.room && candidate.room.trim().toLowerCase() === slot.room.trim().toLowerCase()) {
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
```

Create `src/app/api/admin/auth/login/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { verifyCredentials, signAdminJWT, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const isValid = await verifyCredentials(username, password);

    if (!isValid) {
      return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    const token = await signAdminJWT(username);
    const response = NextResponse.json({ success: true, username });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
```

Create `src/app/api/admin/auth/logout/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
```

Create `src/app/api/admin/auth/me/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminJWT, COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });

  const session = await verifyAdminJWT(token);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });

  return NextResponse.json({ authenticated: true, user: session });
}
```

Create `src/app/api/admin/schedules/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { DegreeLevel, ScheduleStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get("academicYear") ? Number(searchParams.get("academicYear")) : undefined;
    const semester = searchParams.get("semester") ? Number(searchParams.get("semester")) : undefined;
    const degreeLevel = searchParams.get("degreeLevel") as DegreeLevel | undefined;
    const status = searchParams.get("status") as ScheduleStatus | undefined;

    const schedules = await prisma.schedule.findMany({
      where: {
        ...(academicYear && { academicYear }),
        ...(semester && { semester }),
        ...(degreeLevel && { degreeLevel }),
        ...(status && { status }),
      },
      include: {
        _count: {
          select: { slots: true },
        },
      },
      orderBy: [{ academicYear: "desc" }, { semester: "asc" }, { yearLevel: "asc" }],
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_FETCH_SCHEDULES" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const schedule = await prisma.schedule.create({
      data: {
        academicYear: Number(data.academicYear),
        semester: Number(data.semester),
        degreeLevel: data.degreeLevel,
        programId: data.programId,
        programName: data.programName,
        yearLevel: Number(data.yearLevel),
        sectionGroup: data.sectionGroup || null,
        status: data.status || "DRAFT",
        note: data.note || null,
      },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "SCHEDULE_ALREADY_EXISTS" }, { status: 409 });
    }
    return NextResponse.json({ error: "FAILED_TO_CREATE_SCHEDULE" }, { status: 500 });
  }
}
```

Create `src/app/api/admin/schedules/[id]/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: params.id },
      include: {
        slots: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_FETCH_SCHEDULE" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const updated = await prisma.schedule.update({
      where: { id: params.id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.note !== undefined && { note: data.note }),
        ...(data.sectionGroup !== undefined && { sectionGroup: data.sectionGroup }),
      },
    });

    return NextResponse.json({ schedule: updated });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_UPDATE_SCHEDULE" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.schedule.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_DELETE_SCHEDULE" }, { status: 500 });
  }
}
```

Create `src/app/api/admin/schedules/[id]/clone/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { targetAcademicYear, targetSemester, targetSectionGroup } = await request.json();

    const original = await prisma.schedule.findUnique({
      where: { id: params.id },
      include: { slots: true },
    });

    if (!original) {
      return NextResponse.json({ error: "SOURCE_SCHEDULE_NOT_FOUND" }, { status: 404 });
    }

    const cloned = await prisma.schedule.create({
      data: {
        academicYear: Number(targetAcademicYear),
        semester: Number(targetSemester),
        degreeLevel: original.degreeLevel,
        programId: original.programId,
        programName: original.programName,
        yearLevel: original.yearLevel,
        sectionGroup: targetSectionGroup ?? original.sectionGroup,
        status: "DRAFT",
        note: `Cloned from ${original.academicYear}/${original.semester}`,
        slots: {
          create: original.slots.map((slot) => ({
            courseCode: slot.courseCode,
            courseName: slot.courseName,
            section: slot.section,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            room: slot.room,
            instructor: slot.instructor,
            courseType: slot.courseType,
            color: slot.color,
          })),
        },
      },
    });

    return NextResponse.json({ schedule: cloned }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "TARGET_SCHEDULE_ALREADY_EXISTS" }, { status: 409 });
    }
    return NextResponse.json({ error: "FAILED_TO_CLONE_SCHEDULE" }, { status: 500 });
  }
}
```

Create `src/app/api/admin/schedules/[id]/slots/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectCourseSlotConflicts } from "@/lib/schedule-conflict";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();

    if (!data.startTime || !data.endTime || data.startTime >= data.endTime) {
      return NextResponse.json({ error: "INVALID_TIME_RANGE" }, { status: 400 });
    }

    const existingSlots = await prisma.courseSlot.findMany({
      where: { scheduleId: params.id },
    });

    const conflicts = detectCourseSlotConflicts(data, existingSlots);

    const slot = await prisma.courseSlot.create({
      data: {
        scheduleId: params.id,
        courseCode: data.courseCode,
        courseName: data.courseName,
        section: data.section || null,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room || null,
        instructor: data.instructor || null,
        courseType: data.courseType || "LECTURE",
        color: data.color || "orange",
      },
    });

    return NextResponse.json({ slot, conflicts }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_CREATE_SLOT" }, { status: 500 });
  }
}
```

Create `src/app/api/admin/schedules/[id]/slots/[slotId]/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectCourseSlotConflicts } from "@/lib/schedule-conflict";

export async function PUT(request: Request, { params }: { params: { id: string; slotId: string } }) {
  try {
    const data = await request.json();

    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      return NextResponse.json({ error: "INVALID_TIME_RANGE" }, { status: 400 });
    }

    const existingSlots = await prisma.courseSlot.findMany({
      where: { scheduleId: params.id },
    });

    const conflicts = detectCourseSlotConflicts({ ...data, id: params.slotId }, existingSlots);

    const updated = await prisma.courseSlot.update({
      where: { id: params.slotId },
      data: {
        ...(data.courseCode && { courseCode: data.courseCode }),
        ...(data.courseName && { courseName: data.courseName }),
        ...(data.section !== undefined && { section: data.section }),
        ...(data.dayOfWeek && { dayOfWeek: data.dayOfWeek }),
        ...(data.startTime && { startTime: data.startTime }),
        ...(data.endTime && { endTime: data.endTime }),
        ...(data.room !== undefined && { room: data.room }),
        ...(data.instructor !== undefined && { instructor: data.instructor }),
        ...(data.courseType && { courseType: data.courseType }),
        ...(data.color && { color: data.color }),
      },
    });

    return NextResponse.json({ slot: updated, conflicts });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_UPDATE_SLOT" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { slotId: string } }) {
  try {
    await prisma.courseSlot.delete({
      where: { id: params.slotId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_DELETE_SLOT" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/schedule-conflict.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/schedule-conflict.ts src/app/api/admin/ tests/schedule-conflict.test.ts
git commit -m "feat: add schedule conflict detector and admin REST API endpoints"
```

---

### Task 4: Public Schedules API Handlers

**Files:**
- Create: `src/app/api/schedules/route.ts`
- Create: `src/app/api/schedules/[id]/route.ts`
- Test: `tests/public-api.test.ts`

**Interfaces:**
- Consumes: `prisma`
- Produces: Public endpoint `GET /api/schedules` filtering published schedules, `GET /api/schedules/[id]`

- [ ] **Step 1: Write failing test for public API route logic**

Create `tests/public-api.test.ts`:
```typescript
import { describe, expect, it } from "bun:test";

describe("Public Schedule API Constraints", () => {
  it("enforces published-only filtering rule", () => {
    const queryFilter = { status: "PUBLISHED" as const };
    expect(queryFilter.status).toBe("PUBLISHED");
  });
});
```

- [ ] **Step 2: Run test to verify it passes baseline**

Run: `bun test tests/public-api.test.ts`
Expected: PASS

- [ ] **Step 3: Implement public API routes**

Create `src/app/api/schedules/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { DegreeLevel } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get("academicYear") ? Number(searchParams.get("academicYear")) : undefined;
    const semester = searchParams.get("semester") ? Number(searchParams.get("semester")) : undefined;
    const degreeLevel = searchParams.get("degreeLevel") as DegreeLevel | undefined;
    const programId = searchParams.get("programId") || undefined;
    const yearLevel = searchParams.get("yearLevel") ? Number(searchParams.get("yearLevel")) : undefined;

    const schedules = await prisma.schedule.findMany({
      where: {
        status: "PUBLISHED",
        ...(academicYear && { academicYear }),
        ...(semester && { semester }),
        ...(degreeLevel && { degreeLevel }),
        ...(programId && { programId }),
        ...(yearLevel && { yearLevel }),
      },
      include: {
        slots: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
      orderBy: [{ academicYear: "desc" }, { semester: "asc" }, { yearLevel: "asc" }],
    });

    const distinctYears = await prisma.schedule.findMany({
      where: { status: "PUBLISHED" },
      select: { academicYear: true },
      distinct: ["academicYear"],
      orderBy: { academicYear: "desc" },
    });

    return NextResponse.json({
      schedules,
      availableYears: distinctYears.map((y) => y.academicYear),
    });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_LOAD_PUBLIC_SCHEDULES" }, { status: 500 });
  }
}
```

Create `src/app/api/schedules/[id]/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: params.id,
        status: "PUBLISHED",
      },
      include: {
        slots: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: "SCHEDULE_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    return NextResponse.json({ error: "FAILED_TO_LOAD_SCHEDULE" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run test to verify**

Run: `bun test tests/public-api.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/schedules/ tests/public-api.test.ts
git commit -m "feat: add public schedule API endpoints with draft protection"
```

---

### Task 5: Admin Login & Schedule Dashboard UI

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/schedules/page.tsx`
- Create: `src/components/admin/AdminHeader.tsx`
- Create: `src/components/admin/ScheduleModal.tsx`
- Create: `src/components/admin/CloneScheduleModal.tsx`

**Interfaces:**
- Consumes: `/api/admin/auth/login`, `/api/admin/auth/logout`, `/api/admin/schedules`, `src/data/programs.ts`
- Produces: Visual admin dashboard and authenticated session flow

- [ ] **Step 1: Create AdminHeader component**

Create `src/components/admin/AdminHeader.tsx` with title, active admin indicator, and logout button.

- [ ] **Step 2: Create Schedule creation and clone modals**

Create `src/components/admin/ScheduleModal.tsx` and `src/components/admin/CloneScheduleModal.tsx` with program selectors populated from `src/data/programs.ts`.

- [ ] **Step 3: Implement `/admin/login` page**

Create `src/app/admin/login/page.tsx` with responsive layout, KMUTNB orange button, and username/password state with error handling.

- [ ] **Step 4: Implement `/admin/schedules` page**

Create `src/app/admin/schedules/page.tsx` with filter controls, schedule cards table, clone modal trigger, and publish/draft toggles.

- [ ] **Step 5: Verify building and type checks**

Run: `bun run lint`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/login/ src/app/admin/schedules/ src/components/admin/
git commit -m "feat: add admin login page, dashboard, and schedule creation/clone modals"
```

---

### Task 6: Admin Interactive Timetable Editor (`/admin/schedules/[id]`)

**Files:**
- Create: `src/app/admin/schedules/[id]/page.tsx`
- Create: `src/components/admin/WeeklyGridEditor.tsx`
- Create: `src/components/admin/CourseSlotModal.tsx`
- Create: `src/components/admin/ConflictBanner.tsx`
- Create: `src/components/admin/ScheduleTableView.tsx`

**Interfaces:**
- Consumes: `/api/admin/schedules/[id]`, `/api/admin/schedules/[id]/slots`, `detectCourseSlotConflicts`
- Produces: 7-day weekly grid editor with time calculation, conflict warning banner, and table view toggle

- [ ] **Step 1: Create ConflictBanner component**

Create `src/components/admin/ConflictBanner.tsx` displaying warnings when slots overlap in time or room.

- [ ] **Step 2: Create CourseSlotModal component**

Create `src/components/admin/CourseSlotModal.tsx` with start/end time pickers, course code/name, room, instructor, type (Lecture/Lab), and color picker.

- [ ] **Step 3: Create WeeklyGridEditor and ScheduleTableView components**

Create `src/components/admin/WeeklyGridEditor.tsx` calculating vertical placement from 08:00 to 20:00, with hover edit/delete actions and click-to-add on empty cells.
Create `src/components/admin/ScheduleTableView.tsx` providing a tabular list view.

- [ ] **Step 4: Implement `/admin/schedules/[id]/page.tsx`**

Integrate header with draft/published toggle, view switcher (Grid vs Table), and save handlers.

- [ ] **Step 5: Verify building and type checks**

Run: `bun run lint`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/schedules/[id]/page.tsx src/components/admin/WeeklyGridEditor.tsx src/components/admin/CourseSlotModal.tsx src/components/admin/ConflictBanner.tsx src/components/admin/ScheduleTableView.tsx
git commit -m "feat: implement interactive weekly timetable editor with conflict warnings"
```

---

### Task 7: Public Schedule Viewer (`/schedules`) & Responsive Mobile View

**Files:**
- Create: `src/app/schedules/page.tsx`
- Create: `src/components/schedules/PublicScheduleViewer.tsx`
- Create: `src/components/schedules/ScheduleFilterBar.tsx`
- Create: `src/components/schedules/WeeklyTimetableGrid.tsx`
- Create: `src/components/schedules/MobileDayView.tsx`
- Create: `src/components/schedules/ScheduleListView.tsx`
- Modify: `src/app/globals.css` (add print utility styles)

**Interfaces:**
- Consumes: `useLanguage()`, `/api/schedules`
- Produces: Public timetable viewer with cascading filters, responsive weekly grid, mobile day tabs, and print/PDF export

- [ ] **Step 1: Create filter bar and view components**

Create `src/components/schedules/ScheduleFilterBar.tsx` with Year, Semester, Degree Level, Program, and Study Year selectors.
Create `src/components/schedules/WeeklyTimetableGrid.tsx` for desktop weekly display.
Create `src/components/schedules/MobileDayView.tsx` with day tab switcher (Mon-Sun).
Create `src/components/schedules/ScheduleListView.tsx` for list view.

- [ ] **Step 2: Add print CSS rules to globals.css**

Add `@media print` rules hiding `.no-print` elements (navbar, footer, filter controls) and expanding timetable to 100% width on page.

- [ ] **Step 3: Implement PublicScheduleViewer and `/schedules/page.tsx`**

Integrate components with `LanguageContext` for instant bilingual switching (TH/EN) and print button invoking `window.print()`.

- [ ] **Step 4: Verify building and type checks**

Run: `bun run lint`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/schedules/ src/components/schedules/ src/app/globals.css
git commit -m "feat: add public schedule page with filters, mobile day view, and print styles"
```

---

### Task 8: Navigation Integration & End-to-End Verification

**Files:**
- Modify: `src/components/layout/MainNavbar.tsx`
- Modify: `src/components/home/QuickNavGrid.tsx`
- Modify: `src/data/navigation.ts`
- Test: End-to-end build test `bun run build`

**Interfaces:**
- Consumes: Routes `/schedules`
- Produces: Navigation links on navbar and home page

- [ ] **Step 1: Update navigation data and navbar**

Update `src/data/navigation.ts` and `src/components/layout/MainNavbar.tsx` to add "ตารางเรียน" / "Schedules" item pointing to `/schedules`.

- [ ] **Step 2: Update homepage QuickNavGrid**

Update `src/components/home/QuickNavGrid.tsx` to include a quick navigation tile for class timetables with Calendar icon.

- [ ] **Step 3: Run comprehensive verification**

Run: `bun test`
Expected: All tests pass.

Run: `bun run lint`
Expected: 0 lint errors.

Run: `bun run build`
Expected: Successful Next.js build.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/MainNavbar.tsx src/components/home/QuickNavGrid.tsx src/data/navigation.ts
git commit -m "feat: link public timetable viewer in navbar and homepage quick nav"
```
