# Task 1: Next.js + Bun Project Initialization & Configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.mjs`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Test: `bun run build`

**Global Constraints:**
- Must use Bun as the package manager and runtime.
- Brand colors: Primary Orange (`#FF6B00` / `#E8501E`), Deep Dark (`#222222`), Clean Light Surface (`#F8F9FA`).
- Typography: Google Font `Mitr` + `sans-serif`.
- Zero TypeScript and lint errors on `bun run build`.

**Instructions:**
1. Initialize a clean Next.js App Router project configured for Bun with TypeScript and Tailwind CSS.
2. Install dependencies: `lucide-react`, `swiper`, `cheerio`, `@types/cheerio`.
3. Configure `tailwind.config.ts` with brand color palette (`brand-orange: #FF6B00`, `brand-darkOrange: #E8501E`, `brand-dark: #222222`, `brand-gray: #444444`, `brand-light: #F8F9FA`) and font family using `--font-mitr`.
4. Configure `src/app/layout.tsx` with Google font Mitr (`latin`, `thai` subsets) and metadata for ITD KMUTNB.
5. Create a clean placeholder `src/app/page.tsx` with basic Tailwind styling.
6. Verify `bun run build` succeeds cleanly.
7. Commit changes.
