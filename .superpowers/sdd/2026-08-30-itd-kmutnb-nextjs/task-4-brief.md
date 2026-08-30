# Task 4: Homepage Features & Sections

**Files:**
- Create: `src/components/home/HeroBannerSlider.tsx`
- Create: `src/components/home/QuickNavGrid.tsx`
- Create: `src/components/news/NewsCard.tsx`
- Create: `src/components/home/NewsSection.tsx`
- Create: `src/components/home/ProgramsOverview.tsx`
- Create: `src/components/home/VideoHighlight.tsx`
- Modify: `src/app/page.tsx`
- Test: `bun run build`

**Global Constraints:**
- Must use Bun as the package manager and runtime.
- Must use local assets from `public/assets/` without external hotlinks.
- Brand colors: Primary Orange (`#FF6B00` / `#E8501E`), Deep Dark (`#222222`), Clean Light Surface (`#F8F9FA`).
- Typography: Google Font `Mitr` + `sans-serif`.
- Zero TypeScript and lint errors on `bun run build`.

**Instructions:**
1. Implement `HeroBannerSlider.tsx` using Swiper React (`Autoplay`, `Pagination`, `Navigation` modules) consuming `src/data/banners.ts`. Ensure smooth responsive image display.
2. Implement `QuickNavGrid.tsx` rendering quick-action cards for Admissions (Bachelor & Graduate), Academic Calendar / Timetables, E-Services, and Downloads.
3. Implement `NewsCard.tsx` with responsive image thumbnail, category badge with brand colors, publication date formatted cleanly, title, and link to `/news/[id]`.
4. Implement `NewsSection.tsx` with interactive category filter tabs (All, General, Faculty, Scholarship, Events, Quality, Academic, Announcements, Recruit, Procurement), animated grid display, and "ดูข่าวทั้งหมด" CTA button to `/news`.
5. Implement `ProgramsOverview.tsx` presenting Bachelor, Master, and Doctoral degrees from `src/data/programs.ts` with program highlights, duration, and admission links.
6. Implement `VideoHighlight.tsx` with faculty introduction video embed and key faculty stats (Graduates, Employment rate, Specialized labs).
7. Assemble all components in `src/app/page.tsx`.
8. Test that `bun run build` succeeds with 0 TypeScript and lint errors.
9. Commit your work with `git add . && git commit -m "feat: implement homepage sections and banner slider"`.
10. Write your report to `/home/rinme/project/itdre/.superpowers/sdd/2026-08-30-itd-kmutnb-nextjs/task-4-report.md`.
