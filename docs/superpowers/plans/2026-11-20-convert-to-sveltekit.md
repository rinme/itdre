# Svelte 5 and SvelteKit Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Next.js 14 App Router project `itd-kmutnb` to a modern Svelte 5 and SvelteKit web application with `@sveltejs/adapter-auto`, Tailwind CSS v4, and Vitest.

**Architecture:** Replace Next.js App Router and React components with SvelteKit file-based routing (`src/routes`), Svelte 5 runes (`$state`, `$derived`, `$props`), and universal reactive state modules (`.svelte.ts`). Server-only logic (Prisma and JWT authentication) is isolated in `$lib/server/` and guarded via `src/hooks.server.ts`. API endpoints are preserved as `+server.ts` request handlers for seamless backend operations.

**Tech Stack:** Svelte 5, SvelteKit, `@sveltejs/adapter-auto`, Vite, `@tailwindcss/vite`, Tailwind CSS v4, `@sveltejs/enhanced-img`, `lucide-svelte`, `swiper/element`, `jose`, `@prisma/client`, `vitest`, `@testing-library/svelte`, `bun`.

**Spec:** Alignment decisions confirmed during `/grill-me` session.

## Global Constraints

- Svelte 5 Runes syntax must be used for reactivity (`$state`, `$derived`, `$props`, `$effect` when needed, snippets). Do not use Svelte 4 legacy `export let` or `$:` reactive statements.
- Server secrets and Prisma client must reside in `$lib/server/` (`src/lib/server/prisma.ts`, `src/lib/server/auth.ts`) to prevent leakage into client bundles.
- Icons must use `lucide-svelte` instead of `lucide-react`.
- Hero carousel must use `swiper/element/bundle` custom elements to preserve exact swiper behavior.
- Tailwind CSS v4 is bundled via `@tailwindcss/vite` in `vite.config.ts`, retaining `@theme` design tokens in `src/app.css` (or `globals.css`).
- Existing public REST endpoints under `/api/...` must be faithfully ported as `+server.ts` handlers so client components and external consumers work without interruption.
- Tests must pass via Vitest (`bun run test`).

---

### Task 1: Package & Configuration Scaffolding

**Files:**
- Create: `svelte.config.js`
- Create: `vite.config.ts`
- Create: `src/app.html`
- Create: `src/app.d.ts`
- Modify: `package.json`
- Modify: `tsconfig.json`
- Remove: `next.config.mjs`, `.eslintrc.json`, `postcss.config.js`

**Interfaces:**
- Produces: Working Vite + SvelteKit build toolchain with `@sveltejs/adapter-auto`, `@tailwindcss/vite`, and `@sveltejs/enhanced-img`.

- [x] **Step 1: Update package.json dependencies**
Remove `next`, `react`, `react-dom`, `lucide-react`, `@types/react`, `@types/react-dom`, `eslint-config-next`, `@tailwindcss/postcss`, and `postcss`.
Add `@sveltejs/kit`, `@sveltejs/adapter-auto`, `@sveltejs/vite-plugin-svelte`, `@sveltejs/enhanced-img`, `svelte@^5.0.0`, `@tailwindcss/vite`, `lucide-svelte`, `vite`, `vitest`, `@testing-library/svelte`, `jsdom`.

- [x] **Step 2: Create svelte.config.js and vite.config.ts**
Configure SvelteKit with `adapter-auto()`, Vite with `@tailwindcss/vite()`, `enhancedImages()`, and `sveltekit()`.

- [x] **Step 3: Create src/app.html and src/app.d.ts**
Configure standard SvelteKit HTML shell with `%sveltekit.head%` and `%sveltekit.body%`, and declare `App.Locals` with `admin?: { username: string; role: string }`.

- [x] **Step 4: Update tsconfig.json and install dependencies**
Run `bun install` and verify `bunx svelte-kit sync` succeeds.

- [x] **Step 5: Commit**
`git add package.json svelte.config.js vite.config.ts tsconfig.json src/app.html src/app.d.ts`
`git commit -m "chore: scaffold sveltekit with svelte 5 and tailwind v4"`

---

### Task 2: Core Server Layer, Auth, Prisma & Hooks

**Files:**
- Create: `src/lib/server/prisma.ts`
- Create: `src/lib/server/auth.ts`
- Create: `src/hooks.server.ts`
- Test: `tests/server-auth.test.ts`

**Interfaces:**
- Produces:
  - `prisma`: PrismaClient instance from `$lib/server/prisma`
  - `COOKIE_NAME`, `verifyCredentials`, `signAdminJWT`, `verifyAdminJWT`, `getSafeRedirect` from `$lib/server/auth`
  - `handle`: SvelteKit Handle hook in `src/hooks.server.ts` validating admin session cookies and protecting `/admin` and `/api/admin` routes

- [x] **Step 1: Write tests for server auth & redirect sanitation**
Create `tests/server-auth.test.ts` testing `signAdminJWT`, `verifyAdminJWT`, `verifyCredentials`, and `getSafeRedirect`.

- [x] **Step 2: Implement src/lib/server/prisma.ts and src/lib/server/auth.ts**
Port Prisma singleton and JWT verification logic using `jose` and Node `crypto`.

- [x] **Step 3: Implement src/hooks.server.ts**
Implement `handle` hook to intercept requests starting with `/admin` and `/api/admin` (exempting `/admin/login` and `/api/admin/auth/login`). Set `event.locals.admin` if token is valid; return 401 JSON for unauthenticated API requests or redirect 303 to `/admin/login` for page requests.

- [x] **Step 4: Run tests to verify**
Run `bunx vitest run tests/server-auth.test.ts`.

- [x] **Step 5: Commit**
`git add src/lib/server/ src/hooks.server.ts tests/server-auth.test.ts`
`git commit -m "feat(server): port prisma, auth helpers, and hooks.server.ts"`

---

### Task 3: Global Reactive State, Data & Utility Libraries

**Files:**
- Create: `src/lib/data/` (banners.ts, contact.ts, facilities.ts, navigation.ts, news.ts, personnel.ts, programs.ts, services.ts)
- Create: `src/lib/utils/` (facility-utils.ts, news-utils.ts, personnel-utils.ts, schedule-conflict.ts, weekly-grid.ts)
- Create: `src/lib/state/language.svelte.ts`
- Create: `src/lib/state/admin-presets.svelte.ts`
- Test: `tests/schedule-conflict.test.ts`, `tests/weekly-grid.test.ts`

**Interfaces:**
- Produces:
  - `languageState`: Svelte 5 universal reactive store with `language`, `setLanguage`, `t(th, en)`
  - `adminPresetsState`: Svelte 5 universal reactive store with `coursePresets`, `instructors`, `loading`, `refreshPresets()`
  - Utility helpers in `$lib/utils`

- [x] **Step 1: Copy and adjust data and utility files**
Port data files from `src/data/*` to `src/lib/data/*` and utility files from `src/lib/*` to `src/lib/utils/*` with updated import aliases (`$lib/...`).

- [x] **Step 2: Implement language.svelte.ts and admin-presets.svelte.ts**
Create reactive state stores using Svelte 5 `$state()` runes with SSR safety.

- [x] **Step 3: Run Vitest on ported utils**
Run `bunx vitest run tests/schedule-conflict.test.ts tests/weekly-grid.test.ts`.

- [x] **Step 4: Commit**
`git add src/lib/data/ src/lib/utils/ src/lib/state/ tests/`
`git commit -m "feat(state): port data, utils, and svelte 5 universal runes"`

---

### Task 4: API Endpoints Migration

**Files:**
- Create: `src/routes/api/schedules/+server.ts`
- Create: `src/routes/api/schedules/[id]/+server.ts`
- Create: `src/routes/api/admin/auth/login/+server.ts`
- Create: `src/routes/api/admin/auth/logout/+server.ts`
- Create: `src/routes/api/admin/auth/me/+server.ts`
- Create: `src/routes/api/admin/presets/+server.ts`
- Create: `src/routes/api/admin/presets/[id]/+server.ts`
- Create: `src/routes/api/admin/schedules/+server.ts`
- Create: `src/routes/api/admin/schedules/[id]/+server.ts`
- Create: `src/routes/api/admin/schedules/[id]/clone/+server.ts`
- Create: `src/routes/api/admin/schedules/[id]/slots/+server.ts`
- Create: `src/routes/api/admin/schedules/[id]/slots/[slotId]/+server.ts`
- Test: `tests/api-endpoints.test.ts`

**Interfaces:**
- Consumes: Prisma from `$lib/server/prisma`, Auth from `$lib/server/auth`
- Produces: SvelteKit `RequestHandler` functions (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) returning SvelteKit `json(...)`.

- [x] **Step 1: Port public schedule endpoints**
Port `GET` for `/api/schedules` and `/api/schedules/[id]` using Prisma.

- [x] **Step 2: Port admin auth endpoints**
Port `/api/admin/auth/login`, `/api/admin/auth/logout`, `/api/admin/auth/me` using SvelteKit `cookies.set` and `cookies.delete`.

- [x] **Step 3: Port admin presets and schedules CRUD endpoints**
Port presets endpoints and schedule slots endpoints (`GET`, `POST`, `PUT`, `DELETE`).

- [x] **Step 4: Run tests to verify endpoints**
Run `bunx vitest run tests/api-endpoints.test.ts`.

- [x] **Step 5: Commit**
`git add src/routes/api/ tests/api-endpoints.test.ts`
`git commit -m "feat(api): migrate all next.js api routes to sveltekit +server.ts"`

---

### Task 5: Root Layout, Global CSS & Shared Navigation Components

**Files:**
- Create: `src/app.css` (retaining Tailwind v4 theme and custom styles from `globals.css`)
- Create: `src/lib/components/layout/TopHeader.svelte`
- Create: `src/lib/components/layout/MainNavbar.svelte`
- Create: `src/lib/components/layout/Footer.svelte`
- Create: `src/lib/components/demo/DemoBanner.svelte`
- Create: `src/lib/components/demo/DemoFeedbackModal.svelte`
- Create: `src/routes/+layout.svelte`

**Interfaces:**
- Consumes: `languageState` from `$lib/state/language.svelte`
- Produces: Standard responsive shell with active link detection, language switching, and mobile drawer.

- [x] **Step 1: Port globals.css to src/app.css**
Import `@import "tailwindcss";` and preserve `@theme` tokens, glassmorphism, scrollbars, and print styles.

- [x] **Step 2: Implement TopHeader, MainNavbar, and Footer in Svelte 5**
Convert React JSX to Svelte 5 runes (`$props()`, `$state()`, snippets). Replace `lucide-react` with `lucide-svelte`.

- [x] **Step 3: Implement DemoBanner and DemoFeedbackModal**
Convert interactive banner and feedback modal with Svelte 5 state bindings.

- [x] **Step 4: Implement src/routes/+layout.svelte**
Assemble the global layout with navigation, slot `<slot />` / `{@render children()}`, and demo banners.

- [x] **Step 5: Commit**
`git add src/app.css src/lib/components/layout/ src/lib/components/demo/ src/routes/+layout.svelte`
`git commit -m "feat(ui): port global layout, css, and navigation components"`

---

### Task 6: Public Pages & Domain Components

**Files:**
- Create: `src/lib/components/home/` (HeroBannerSlider.svelte, ProgramsOverview.svelte, QuickNavGrid.svelte, NewsSection.svelte, VideoHighlight.svelte)
- Create: `src/lib/components/about/` (AboutOverviewContent.svelte, AboutHistoryContent.svelte)
- Create: `src/lib/components/facilities/` (FacilitiesExplorer.svelte, FacilityCard.svelte, FacilityModal.svelte)
- Create: `src/lib/components/news/` (NewsCard.svelte, NewsFilter.svelte, NewsArchiveContent.svelte, NewsDetailContent.svelte)
- Create: `src/lib/components/personnel/` (PersonnelCard.svelte, PersonnelDirectoryContent.svelte, AdministratorsContent.svelte, LecturersContent.svelte, StaffContent.svelte)
- Create: `src/lib/components/services/` (ServicesContent.svelte)
- Create: `src/lib/components/contact/` (ContactContent.svelte)
- Create: `src/lib/components/schedules/` (PublicScheduleViewer.svelte, WeeklyTimetableGrid.svelte, ScheduleFilterBar.svelte, ScheduleListView.svelte, MobileDayView.svelte)
- Create: `src/routes/+page.svelte` (Home)
- Create: `src/routes/about/+page.svelte` & `src/routes/about/history/+page.svelte`
- Create: `src/routes/facilities/+page.svelte`
- Create: `src/routes/news/+page.svelte` & `src/routes/news/[id]/+page.svelte`
- Create: `src/routes/personnel/+page.svelte`
- Create: `src/routes/services/+page.svelte`
- Create: `src/routes/contact/+page.svelte`
- Create: `src/routes/schedules/+page.svelte`

**Interfaces:**
- Consumes: SvelteKit `$lib/data`, `$lib/state/language.svelte`, `lucide-svelte`, `swiper/element/bundle`
- Produces: Full public-facing departmental portal.

- [x] **Step 1: Port HeroBannerSlider and Home page components**
Implement `HeroBannerSlider.svelte` with `swiper-container` custom element, and home sections in `src/routes/+page.svelte`.

- [x] **Step 2: Port About, Facilities, News, Personnel, Services, and Contact pages**
Port static/dynamic page components to Svelte 5.

- [x] **Step 3: Port Public Schedule Viewer and timetable grid**
Convert `PublicScheduleViewer.svelte`, `WeeklyTimetableGrid.svelte`, and filter components to Svelte 5.

- [x] **Step 4: Verify build for public pages**
Run `bun run check` / build preview.

- [x] **Step 5: Commit**
`git add src/lib/components/ src/routes/`
`git commit -m "feat(pages): port all public departmental pages and schedule viewer to svelte 5"`

---

### Task 7: Admin Portal Pages & Components

**Files:**
- Create: `src/lib/components/admin/` (AdminHeader.svelte, ScheduleTableView.svelte, WeeklyGridEditor.svelte, CourseSlotModal.svelte, ScheduleModal.svelte, CloneScheduleModal.svelte, ConflictBanner.svelte)
- Create: `src/lib/components/admin/presets/` (CoursePresetModal.svelte, CoursePresetsTab.svelte, InstructorsTab.svelte)
- Create: `src/routes/admin/+layout.svelte`
- Create: `src/routes/admin/login/+page.svelte`
- Create: `src/routes/admin/schedules/+page.svelte`
- Create: `src/routes/admin/schedules/[id]/+page.svelte`
- Create: `src/routes/admin/presets/+page.svelte`

**Interfaces:**
- Consumes: Admin API endpoints, `adminPresetsState`, `languageState`
- Produces: Protected admin dashboard for timetable scheduling, conflict detection, presets management, and authentication.

- [x] **Step 1: Port Admin layout and Login page**
Implement `src/routes/admin/+layout.svelte` and `src/routes/admin/login/+page.svelte` with form submission and redirect handling.

- [x] **Step 2: Port Admin schedules dashboard and detail timetable editor**
Convert `src/components/admin/*` to Svelte 5 in `src/lib/components/admin/`, and hook up `schedules` dashboard and `schedules/[id]` page.

- [x] **Step 3: Port Admin Presets management tab**
Convert course presets and instructors tabs/modals to Svelte 5.

- [x] **Step 4: Verify admin flows**
Run `bunx vitest run`.

- [x] **Step 5: Commit**
`git add src/lib/components/admin/ src/routes/admin/`
`git commit -m "feat(admin): port admin dashboard, schedule timetable editor, and presets"`

---

### Task 8: Cleanup, End-to-End Verification & Final Build

**Files:**
- Remove: `src/app/`, `src/components/`, `src/context/`, `src/data/`, `src/lib/` (legacy Next.js files replaced by SvelteKit equivalents)
- Modify: `README.md` (update documentation to SvelteKit / Bun commands)

**Interfaces:**
- Produces: Clean, pure SvelteKit repository passing all type checks, lint checks, and test suites.

- [x] **Step 1: Remove legacy Next.js files**
Remove leftover Next.js App Router files and React components.

- [x] **Step 2: Run test suite**
Run `bun run test` (Vitest) to verify all tests pass.

- [x] **Step 3: Run production build**
Run `bun run build` to verify SvelteKit generates a production build without errors or warnings.

- [x] **Step 4: Commit**
`git add -A`
`git commit -m "chore: clean up legacy next.js files and verify sveltekit build"`
