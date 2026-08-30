# Task 5: News Directory & Detail Pages

**Files:**
- Create: `src/components/news/NewsFilter.tsx`
- Create: `src/app/news/page.tsx`
- Create: `src/app/news/[id]/page.tsx`
- Test: `bun run build`

**Global Constraints:**
- Must use Bun as the package manager and runtime.
- Must use local assets from `public/assets/` without external hotlinks.
- Brand colors: Primary Orange (`#FF6B00` / `#E8501E`), Deep Dark (`#222222`), Clean Light Surface (`#F8F9FA`).
- Typography: Google Font `Mitr` + `sans-serif`.
- Zero TypeScript and lint errors on `bun run build`.

**Instructions:**
1. Implement `NewsFilter.tsx` component with:
   - Search input with clear button and real-time query support.
   - Horizontal category scrollable pills with badge counts for all 9 categories.
   - Sort dropdown (Newest / Most Popular).
2. Implement `src/app/news/page.tsx`:
   - Hero banner with page title ("ข่าวสารและกิจกรรม" / "News & Announcements").
   - Filter bar and pagination / "Load More" mechanism for smooth browsing of 130+ news items.
   - Dynamic URL query param synchronization (`?category=...&search=...`).
   - Clean responsive grid layout with `NewsCard`.
3. Implement `src/app/news/[id]/page.tsx`:
   - Implement `generateStaticParams()` to statically export all 131 articles at build time.
   - Implement `generateMetadata()` for dynamic page title and OpenGraph tags.
   - Breadcrumb navigation (`หน้าหลัก > ข่าวสาร > [Category] > [Title]`).
   - Article header with metadata (Publish date, Category badge, Author/Department, Views).
   - High-resolution hero image with error fallback.
   - Formatted article body / summary text and PDF attachment download link if available.
   - Social share buttons (Facebook, Line, Copy Link with toast notification).
   - Related news recommendation section displaying other articles in the same category.
4. Test that `bun run build` compiles all static news pages cleanly.
5. Commit your work with `git add . && git commit -m "feat: implement news listing and article detail routes"`.
6. Write your report to `/home/rinme/project/itdre/.superpowers/sdd/2026-08-30-itd-kmutnb-nextjs/task-5-report.md`.
