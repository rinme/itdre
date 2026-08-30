# Task 3: Shared Layout Components (TopHeader, MainNavbar, Footer)

**Files:**
- Create: `src/components/layout/TopHeader.tsx`
- Create: `src/components/layout/MainNavbar.tsx`
- Create: `src/components/layout/Footer.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css` (if needed for animations / navbar styling)
- Test: `bun run build`

**Global Constraints:**
- Must use Bun as the package manager and runtime.
- Must use local assets from `public/assets/` without external hotlinks.
- Brand colors: Primary Orange (`#FF6B00` / `#E8501E`), Deep Dark (`#222222`), Clean Light Surface (`#F8F9FA`).
- Typography: Google Font `Mitr` + `sans-serif`.
- Zero TypeScript and lint errors on `bun run build`.

**Instructions:**
1. Implement `TopHeader.tsx` (Client component or Server component with Client interactivity):
   - ITD KMUTNB Logo Header (`/assets/logos/Logo-Header.png`) linking to `/`.
   - Bilingual language selector toggle (TH / EN) with active indicator.
   - Social channels: Facebook, Line OA, Contact button.
   - Quick access button bar (E-services, Downloads, MTD).
2. Implement `MainNavbar.tsx`:
   - Sticky navbar styled with brand colors (Primary Orange accents, deep dark dropdown backgrounds).
   - Desktop dropdown menus reading navigation structure from `src/data/navigation.ts` (Home, News categories, Personnel, Programs, About & Facilities, Services).
   - Responsive mobile navigation bar with hamburger menu toggle and animated slide-in drawer.
   - Mobile accordion navigation allowing expanding/collapsing category links.
   - Search trigger button with expandable search bar or modal.
3. Implement `Footer.tsx`:
   - Official faculty footer with KMUTNB & ITD branding, address, phone directory, and email.
   - Quick navigation links grouped by academic levels, e-services, and university portals.
   - Social media links and copyright notice.
4. Update `src/app/layout.tsx`:
   - Wrap the main page content inside `<TopHeader />`, `<MainNavbar />`, `<main className="flex-1">`, and `<Footer />`.
5. Run `bun run build` to verify 0 errors.
6. Commit your work with `git add . && git commit -m "feat: implement TopHeader, MainNavbar, and Footer layout components"`.
7. Write your report to `/home/rinme/project/itdre/.superpowers/sdd/2026-08-30-itd-kmutnb-nextjs/task-3-report.md`.
