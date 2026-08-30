# Task 2: Automated Scraper & Asset Localization Pipeline

**Files:**
- Create: `src/types/index.ts`
- Create: `scripts/scrape-and-archive.ts`
- Create: `src/data/banners.ts`, `src/data/news.ts`, `src/data/personnel.ts`, `src/data/navigation.ts`, `src/data/facilities.ts`, `src/data/programs.ts`
- Populate: `public/assets/logos/`, `public/assets/banners/`, `public/assets/news/`, `public/assets/faculty/`, `public/assets/facilities/`
- Test: `bun run scripts/scrape-and-archive.ts` and `bun run build`

**Global Constraints:**
- Must use Bun as the package manager and runtime.
- Must store all assets in `public/assets/` without hardcoded remote hotlinks.
- Brand typography and content matching ITD KMUTNB (`https://itd.kmutnb.ac.th`).
- Zero TypeScript and lint errors on `bun run build`.

**Instructions:**
1. Define all entity interfaces in `src/types/index.ts` (`BannerSlide`, `NewsItem`, `PersonnelMember`, `NavItem`, `FacilityItem`, `ProgramItem`).
2. Write `scripts/scrape-and-archive.ts` using Cheerio and Bun/fetch to:
   - Scrape live content and download real images from `https://itd.kmutnb.ac.th` (and its subpages like `administrator.php`, `lecturer.php`, `staff.php`, `all-general-news.php`, `class-room.php`, etc.).
   - Download logos (`Logo-Header.png`, `logo-favicon.png`, etc.) to `public/assets/logos/`.
   - Download hero slider banners to `public/assets/banners/`.
   - Download news thumbnails to `public/assets/news/`.
   - Download faculty / staff photos to `public/assets/faculty/`.
   - Download facility photos to `public/assets/facilities/`.
   - Handle any download failures with fallback images/placeholders so the pipeline never crashes.
   - Generate clean, typed TypeScript modules in `src/data/`: `banners.ts`, `news.ts`, `personnel.ts`, `facilities.ts`, `navigation.ts`, `programs.ts`.
3. Run `bun run scripts/scrape-and-archive.ts` to execute the pipeline and populate `public/assets/` and `src/data/`.
4. Verify that `bun run build` succeeds without type errors.
5. Commit your work with `git add . && git commit -m "feat: implement scraper and extract local assets and structured data"`.
6. Write your report to `/home/rinme/project/itdre/.superpowers/sdd/2026-08-30-itd-kmutnb-nextjs/task-2-report.md`.
