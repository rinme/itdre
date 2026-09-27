# Design Specification: Admin System & Interactive Schedule Management

- **Date:** 2026-09-27
- **Project:** ITD KMUTNB Modern Web Portal (`itdre`)
- **Status:** Approved
- **Author:** Antigravity & Engineering Team

---

## 1. Executive Summary

This specification outlines the architecture, database schema, security mechanism, administration portal, and public-facing interface for the **Admin System and Interactive Class Timetable Management** for the Faculty of Information Technology and Digital Innovation (ITD), KMUTNB.

The system empowers administrators to manage class timetables across all degree levels (Bachelor, Master, Doctor), academic years, semesters, programs/majors, and study cohorts (Years 1 to 4). Timetables are structured into an interactive weekly schedule matrix with conflict warnings, duplicate/clone semester capabilities, and draft/publish controls. Students and faculty can filter, view, toggle between visual weekly grids and lists, and print or export to PDF with full bilingual (Thai/English) support.

---

## 2. Architecture & Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14 App Router | Seamless integration with existing SSR/SSG codebase and React 18 |
| **Language** | TypeScript 5 | Strict end-to-end type safety |
| **Styling** | Tailwind CSS + Lucide Icons | Matches existing KMUTNB brand design system (`#FF6B00`, `#222222`, `#F8F9FA`, `Mitr`) |
| **Database ORM** | Prisma ORM with PostgreSQL | Compatible with Vercel Postgres, Supabase, Neon, or local Docker |
| **Authentication** | `jose` (JWT) + HTTP-only Secure Cookies | Zero external auth lock-in; 100% compatible with Next.js Edge Middleware |
| **Route Protection**| Next.js Edge Middleware (`middleware.ts`)| Intercepts `/admin/*` routes to guarantee unauthorized requests never hit admin pages |

---

## 3. Database Schema (Prisma)

Location: `prisma/schema.prisma`

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
  academicYear Int            // e.g. 2567
  semester     Int            // 1, 2, or 3 (Summer)
  degreeLevel  DegreeLevel
  programId    String         // Matches src/data/programs.ts (e.g. "bachelor-itd", "bachelor-net-security")
  programName  String         // e.g. "วท.บ. เทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล"
  yearLevel    Int            // 1, 2, 3, or 4
  sectionGroup String?        // e.g. "Group 1 / ภาคปกติ" or "Special / ภาคนอกเวลา"
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
  courseCode  String     // e.g. "060133101"
  courseName  String     // e.g. "Web Application Development"
  section     String?    // e.g. "Sec 1"
  dayOfWeek   DayOfWeek
  startTime   String     // "09:00" (24h format HH:mm)
  endTime     String     // "12:00" (24h format HH:mm)
  room        String?    // e.g. "79-5A02"
  instructor  String?    // e.g. "ผศ.ดร. นริศรา / Dr. Narisara"
  courseType  CourseType @default(LECTURE)
  color       String?    // Preset color token e.g. "orange", "blue", "emerald", "purple", "rose", "amber"
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([scheduleId, dayOfWeek])
}
```

---

## 4. Security & Authentication Architecture

### 4.1 Environment Configuration (`.env`)
```bash
DATABASE_URL="postgresql://user:password@host:5432/itd_db?sslmode=require"
ADMIN_USERNAME="itd_admin"
ADMIN_PASSWORD="StrongSecurePassword123!"
ADMIN_JWT_SECRET="super-secret-random-key-at-least-32-chars-long"
```

### 4.2 Auth Flow & Session Management
1. **Login (`/admin/login`)**:
   - Submits credentials (`username`, `password`) via `POST /api/admin/auth/login`.
   - The handler compares username and password against `ADMIN_USERNAME` and `ADMIN_PASSWORD` (using constant-time timing safe comparison).
   - Upon verification, an encrypted JWT token is generated using `jose` with a 7-day expiration.
   - The token is placed into an `admin_session` cookie with flags:
     - `httpOnly: true` (inaccessible to JavaScript)
     - `secure: process.env.NODE_ENV === "production"`
     - `sameSite: "lax"`
     - `path: "/"`
     - `maxAge: 60 * 60 * 24 * 7`
2. **Route Protection (`middleware.ts`)**:
   - Matches: `/admin/:path*` (except `/admin/login` and `/api/admin/auth/login`).
   - Reads `admin_session` cookie and verifies the JWT signature with `ADMIN_JWT_SECRET`.
   - If invalid or absent:
     - For web pages: Redirects to `/admin/login?from=[destination]`.
     - For API routes (`/api/admin/*`): Returns `401 Unauthorized`.
3. **Logout (`POST /api/admin/auth/logout`)**:
   - Clears the `admin_session` cookie immediately.

---

## 5. API Route Handlers

### 5.1 Admin Endpoints
- `POST /api/admin/auth/login`: Authenticates credentials and sets session cookie.
- `POST /api/admin/auth/logout`: Clears session cookie.
- `GET /api/admin/auth/me`: Validates session and returns admin status.
- `GET /api/admin/schedules`: Lists schedules with filters (`academicYear`, `semester`, `degreeLevel`, `status`). Returns metadata and slot count.
- `POST /api/admin/schedules`: Creates a new schedule header.
- `GET /api/admin/schedules/[id]`: Returns full schedule details and all associated `CourseSlot` entries sorted by day and time.
- `PUT /api/admin/schedules/[id]`: Updates schedule metadata, status (`DRAFT` / `PUBLISHED`), or notes.
- `DELETE /api/admin/schedules/[id]`: Deletes a schedule and cascades deletion to all its course slots.
- `POST /api/admin/schedules/[id]/clone`: Clones the schedule and all its course slots into a new academic year, semester, or section.
- `POST /api/admin/schedules/[id]/slots`: Adds a course slot. Validates time format (`HH:mm`), checks that `startTime < endTime`, and warns if overlapping.
- `PUT /api/admin/schedules/[id]/slots/[slotId]`: Updates an individual course slot.
- `DELETE /api/admin/schedules/[id]/slots/[slotId]`: Removes an individual course slot.

### 5.2 Public Endpoints
- `GET /api/schedules`: Returns distinct available academic years, semesters, levels, programs, and published schedule headers.
- `GET /api/schedules/[id]`: Returns published schedule details and course slots (returns 404 if schedule is in `DRAFT` status).

---

## 6. Admin Portal UI & User Experience

### 6.1 Admin Login Page (`/admin/login`)
- Clean, brand-aligned card styled with KMUTNB orange and slate tones.
- Form inputs for Username and Password with eye toggle.
- Error alerts on invalid credentials with auto-focus.

### 6.2 Admin Schedule Dashboard (`/admin/schedules`)
- **Top Navigation Bar**: Admin header with system status, active user badge, and Logout button.
- **Filter & Search Controls**:
  - Academic Year dropdown
  - Semester selector (Term 1, Term 2, Summer)
  - Degree Level tabs (Bachelor, Master, Doctor)
  - Status toggle (All, Published, Draft)
- **Primary Actions**:
  - `+ Create New Schedule` modal: Prompting for Academic Year, Semester, Degree Level, Program, Year Level, and Section Group.
- **Schedule Table & Cards**:
  - Showing Program Name, Study Year, Section, Slot Count, Status Badge (`Published` in emerald, `Draft` in amber).
  - Quick action buttons: **Edit Timetable**, **Clone / Duplicate**, **Toggle Publish**, and **Delete**.

### 6.3 Timetable Visual Editor (`/admin/schedules/[id]`)
- **Header & Meta Bar**:
  - Schedule title, degree level badge, year level, and live draft/published switch.
  - Back to list navigation and View Mode toggle (Weekly Grid vs Table List).
- **Weekly Matrix View**:
  - Horizontal headers: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.
  - Vertical time axis: 08:00 to 20:00 (1-hour grid rows with 30-min dashed sub-divisions).
  - Course slot blocks positioned and scaled by start and end times.
  - Hover reveals: Edit button (pencil) and Delete button (trash).
  - Click on empty cell or `+ Add Class` button launches the Course Slot Modal with the selected day and time pre-filled.
- **Course Slot Modal**:
  - Inputs: Course Code, Course Name, Section, Day of Week, Start Time, End Time, Room, Instructor, Type (Lecture, Lab, Both), and Color Picker.
  - **Live Conflict Detector**: Compares entered day/time against existing slots in the schedule; displays a non-blocking warning banner if an overlap is detected.
- **Tabular List View**:
  - Direct editable table view for admins who prefer rapid keyboard data entry.

---

## 7. Public Timetable Viewer & Portal Integration

### 7.1 Public Timetable Page (`/schedules`)
- **Hero & Title Banner**: Page heading "ตารางเรียนและตารางสอน / Class Timetables & Schedules" with breadcrumb and bilingual description.
- **Cascading Filter Bar**:
  - Academic Year dropdown (defaults to latest published year)
  - Semester buttons (1, 2, Summer)
  - Degree Level tabs (ปริญญาตรี / Bachelor, ปริญญาโท / Master, ปริญญาเอก / Doctor)
  - Program / Major selector (populated dynamically from published schedules)
  - Study Year tabs (ชั้นปีที่ 1, 2, 3, 4)
- **Visual Timetable Matrix (Desktop)**:
  - High-readability weekly schedule layout.
  - Course cards rendered with distinct color coding, bold course codes, course names in Thai/English, room pills with icon, instructor name, and section badges.
- **Mobile Responsive Experience**:
  - Automatically switches to a day-segmented tab bar (Mon, Tue, Wed...) or vertical course cards, avoiding unreadable squished columns on small viewports.
- **View Toggle & Export**:
  - Toggle between **Visual Grid View** and **Detailed List View**.
  - **Print / Save PDF Button**: Applies `@media print` CSS rules hiding site headers, footers, and filters, printing an A4 schedule document.

### 7.2 Site-Wide Integration
- **Main Navigation (`src/components/layout/MainNavbar.tsx`)**:
  - Add "ตารางเรียน / Schedules" item linking to `/schedules`.
- **Homepage Quick Navigation (`src/components/home/QuickNavGrid.tsx`)**:
  - Add a dedicated Quick Nav tile with a Calendar icon.
- **Bilingual Synchronization**:
  - All labels, days of the week, semesters, and degree titles respect `LanguageContext` (TH/EN).

---

## 8. Error Handling & Edge Cases

1. **Database Unavailability / Cold Start**:
   - If PostgreSQL connection fails, API returns standard JSON error `{ error: "DATABASE_UNAVAILABLE" }` with graceful error fallback screens.
2. **Duplicate Schedule Prevention**:
   - Attempting to create a schedule for the same Cohort (Year + Semester + Program + Year Level + Section) triggers an HTTP 409 Conflict with a clear user prompt to edit the existing schedule or choose a different section.
3. **Time Validation**:
   - `startTime` must be strictly earlier than `endTime`. Server rejects invalid time ranges with HTTP 400.
4. **Draft Privacy**:
   - Unauthenticated public queries to `/api/schedules` strictly filter by `status: "PUBLISHED"`. Draft schedules cannot be leaked to the public.

---

## 9. Verification & Testing Plan

1. **Unit & API Testing**:
   - Test login with valid vs invalid credentials; verify JWT session cookie attributes.
   - Test route protection: ensure unauthenticated requests to `/admin/*` redirect or return 401.
   - Test schedule CRUD and cascade deletion of course slots.
   - Test cloning functionality: ensure course slots duplicate correctly with fresh IDs.
2. **UI & Responsive Verification**:
   - Verify weekly grid layout on desktop (1920x1080 and 1366x768).
   - Verify day-by-day responsive display on mobile viewport (375px / 414px).
   - Test print stylesheet (`window.print()`) in browser print preview.
3. **Bilingual Verification**:
   - Toggle language between TH and EN; ensure all days, filters, and UI labels translate reactively without page reloads.
