# Task 8: End-to-End Build & Static Asset Verification & Documentation

**Files:**
- Create: `README.md`
- Test: `bun run lint` and `bun run build`

**Global Constraints:**
- Must use Bun as the package manager and runtime.
- Must use local assets from `public/assets/` without external hotlinks.
- Brand colors: Primary Orange (`#FF6B00` / `#E8501E`), Deep Dark (`#222222`), Clean Light Surface (`#F8F9FA`).
- Typography: Google Font `Mitr` + `sans-serif`.
- Zero TypeScript and lint errors on `bun run build`.

**Instructions:**
1. Create a comprehensive, well-structured `README.md` documenting:
   - Project overview, architecture, and alignment with `https://itd.kmutnb.ac.th`.
   - Prerequisites and quick start commands with Bun (`bun install`, `bun dev`, `bun run build`, `bun start`).
   - Scraper pipeline usage (`bun run scripts/scrape-and-archive.ts`).
   - Codebase structure and key modules (`src/app/`, `src/components/`, `src/data/`, `src/types/`, `src/lib/`, `public/assets/`).
   - Feature guide: Bilingual language context, Hero slider, News directory with SSG, Faculty directory, Facilities explorer, Services & Download center, Contact page with Google Map.
2. Run `bun run lint` and `bun run build` to verify 100% clean production build.
3. Commit your work with `git add . && git commit -m "chore: complete project verification and add documentation"`.
4. Write your report to `/home/rinme/project/itdre/.superpowers/sdd/2026-08-30-itd-kmutnb-nextjs/task-8-report.md`.
