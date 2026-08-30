# Task 6: Personnel & Faculty Directory

**Files:**
- Create: `src/components/personnel/PersonnelCard.tsx`
- Create: `src/app/personnel/page.tsx`
- Create: `src/app/personnel/administrators/page.tsx`
- Create: `src/app/personnel/lecturers/page.tsx`
- Create: `src/app/personnel/staff/page.tsx`
- Modify: `src/components/news/NewsArchiveContent.tsx` (to accept `searchParams.get("q") || searchParams.get("search")`)
- Test: `bun run build`

**Global Constraints:**
- Must use Bun as the package manager and runtime.
- Must use local assets from `public/assets/` without external hotlinks.
- Brand colors: Primary Orange (`#FF6B00` / `#E8501E`), Deep Dark (`#222222`), Clean Light Surface (`#F8F9FA`).
- Typography: Google Font `Mitr` + `sans-serif`.
- Zero TypeScript and lint errors on `bun run build`.

**Instructions:**
1. Implement `PersonnelCard.tsx`:
   - Portrait photo with Next.js image optimization and fallback to `/assets/faculty/placeholder-avatar.svg` on error.
   - Thai name, English name, academic title / administrative role.
   - Department badge (`ภาควิชา...`, `สำนักงานคณบดี`).
   - Contact info: Email link (`mailto:...`) and direct phone / internal extension.
   - Elegant card design with subtle hover elevation and brand accent border.
2. Implement `src/app/personnel/page.tsx`:
   - Hero header banner with faculty overview and total staff counter.
   - Category switcher tabs (All, Administrators, Lecturers, Staff).
   - Real-time search filter for names, roles, and departments.
   - Department breakdown sections or filter pills.
   - Responsive grid (1 col on mobile, 2 cols on tablet, 3-4 cols on desktop).
3. Implement dedicated subpages:
   - `src/app/personnel/administrators/page.tsx` (Focused on Executive leadership hierarchy).
   - `src/app/personnel/lecturers/page.tsx` (Focused on Academic instructors and professors).
   - `src/app/personnel/staff/page.tsx` (Focused on Departmental support officers).
4. Update `NewsArchiveContent.tsx` to accept `searchParams.get("q") || searchParams.get("search")`.
5. Support bilingual localization with `useLanguage()`.
6. Test with `bun run build` to verify all static routes compile cleanly.
7. Commit your work with `git add . && git commit -m "feat: implement personnel and faculty directory"`.
8. Write your report to `/home/rinme/project/itdre/.superpowers/sdd/2026-08-30-itd-kmutnb-nextjs/task-6-report.md`.
