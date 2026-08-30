# Task 7: Subpages: About, Facilities, Services, and Contact

**Files:**
- Create: `src/app/about/page.tsx`
- Create: `src/app/about/history/page.tsx`
- Create: `src/app/facilities/page.tsx`
- Create: `src/app/facilities/classrooms/page.tsx`
- Create: `src/app/facilities/computer-rooms/page.tsx`
- Create: `src/app/services/page.tsx`
- Create: `src/app/contact/page.tsx`
- Test: `bun run build`

**Global Constraints:**
- Must use Bun as the package manager and runtime.
- Must use local assets from `public/assets/` without external hotlinks.
- Brand colors: Primary Orange (`#FF6B00` / `#E8501E`), Deep Dark (`#222222`), Clean Light Surface (`#F8F9FA`).
- Typography: Google Font `Mitr` + `sans-serif`.
- Zero TypeScript and lint errors on `bun run build`.

**Instructions:**
1. Implement About & History (`src/app/about/page.tsx`, `src/app/about/history/page.tsx`):
   - Faculty history timeline (from establishment to current digital innovation era).
   - Vision, Mission, and Core Values (I-T-D excellence).
   - Dean's message and administrative leadership banner.
   - Quick links to personnel, programs, and facilities.
2. Implement Facilities (`src/app/facilities/page.tsx`, `/facilities/classrooms/page.tsx`, `/facilities/computer-rooms/page.tsx`):
   - Category filtering using `src/data/facilities.ts` (Classrooms, Computer Labs, Server Rooms, Pearson VUE Test Center).
   - Facility photo cards with capacity, room numbers, specs, and feature badges.
   - Lightbox / modal or high-resolution zoom preview.
3. Implement Services & Downloads (`src/app/services/page.tsx`):
   - E-Services hub (Registration, ICIT Account, M365, VPN, Library, Research).
   - Download Center with downloadable academic forms, degree timetables, and documents.
4. Implement Contact Page (`src/app/contact/page.tsx`):
   - Full address, Building 79 KMUTNB map coordinates, telephone directory with extensions.
   - Embedded Google Map with clean iframe container.
   - Functional contact inquiry form with client validation and submission toast.
   - Social media connection cards (Facebook, LINE OA, YouTube).
5. Support full bilingual localization with `useLanguage()`.
6. Run `bun run build` and ensure all static subpages compile with 0 errors.
7. Commit your work with `git add . && git commit -m "feat: implement about, facilities, services, and contact subpages"`.
8. Write your report to `/home/rinme/project/itdre/.superpowers/sdd/2026-08-30-itd-kmutnb-nextjs/task-7-report.md`.
