# Specification: ITD KMUTNB Website Port to Modern Next.js (App Router)

**Date:** 2026-08-30  
**Project:** ITD KMUTNB Modern Portal & Offline Asset Mirror  
**Target Repository:** `/home/rinme/project/itdre`  
**Toolchain:** Bun, Next.js (App Router), TypeScript, Tailwind CSS, Lucide React, Swiper  

---

## 1. Project Overview & Goals
The goal is to scrape, archive, and reimplement the official website of the **Faculty of Information Technology and Digital Innovation, KMUTNB** (`https://itd.kmutnb.ac.th`) into a clean, modern, fully functional, and self-contained Next.js project.

### Key Objectives:
- **100% Standalone & Offline Ready:** Download and localize all logos, banners, faculty photos, icons, and document links into `public/assets/` to ensure no broken external dependencies.
- **Modern Next.js Architecture:** Modular App Router structure with TypeScript and Tailwind CSS matching the brand identity and typography (Font Mitr).
- **Structured Data Layer:** Extracted TypeScript/JSON data models for news, banners, faculty members, facilities, and navigation.
- **Enhanced Interactivity:** Fast client-side category filtering for news, live search, responsive mobile drawer menu, and multi-language shell (TH/EN).

---

## 2. Technical Stack & Dependencies

- **Runtime & Package Manager:** Bun (`bun 1.3+`)
- **Framework:** Next.js (App Router, React 18/19, TypeScript)
- **Styling:** Tailwind CSS + PostCSS + Autoprefixer
- **Typography:** Google Font `Mitr` + system sans fallback
- **Icons:** Lucide React (`lucide-react`)
- **Sliders/Carousels:** Swiper React (`swiper`)
- **Extraction Tools:** Node/Bun fetch + Cheerio scraper script for asset extraction and data normalization

---

## 3. Directory & File Structure

```
itdre/
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-08-30-itd-kmutnb-nextjs-design.md
├── scripts/
│   └── scrape-and-archive.ts       # Extraction pipeline for assets & mock data
├── public/
│   └── assets/
│       ├── logos/                  # Header, footer, and university logos
│       ├── banners/                # Homepage hero slider banners
│       ├── news/                   # News thumbnails & article photos
│       ├── faculty/                # Administrator, lecturer, and staff portraits
│       └── facilities/             # Classroom and computer lab photos
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Global layout (Header, Navbar, Footer, Mitr font)
│   │   ├── page.tsx                # Homepage (Hero Swiper, Quick Menu, News Tabs, Programs)
│   │   ├── news/
│   │   │   ├── page.tsx            # News directory with category filter & search
│   │   │   └── [id]/page.tsx       # News detail article page
│   │   ├── personnel/
│   │   │   ├── page.tsx            # All faculty & staff overview
│   │   │   ├── administrators/     # Executive board
│   │   │   ├── lecturers/          # Academic staff & instructors
│   │   │   └── staff/              # Support & departmental staff
│   │   ├── about/
│   │   │   ├── page.tsx            # Faculty history, vision, mission
│   │   │   └── history/page.tsx
│   │   ├── facilities/
│   │   │   ├── page.tsx            # Classrooms, labs, and student spaces
│   │   │   ├── classrooms/
│   │   │   └── computer-rooms/
│   │   ├── services/
│   │   │   └── page.tsx            # E-services, downloads, timetable links
│   │   ├── contact/
│   │   │   └── page.tsx            # Map, contact form, telephone directory
│   │   └── globals.css             # Tailwind base and theme variables
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopHeader.tsx       # Language switcher, social links, fast links
│   │   │   ├── MainNavbar.tsx      # Desktop mega-menu & mobile responsive drawer
│   │   │   └── Footer.tsx          # University footer, contacts, copyright
│   │   ├── home/
│   │   │   ├── HeroBannerSlider.tsx # Swiper hero banner with autoplay & pagination
│   │   │   ├── QuickNavGrid.tsx    # Admission, calendar, e-service button tiles
│   │   │   ├── NewsSection.tsx     # Filterable news tabs (General, Faculty, Research, etc.)
│   │   │   ├── ProgramsOverview.tsx# Bachelor, Master, Doctoral degree cards
│   │   │   └── VideoHighlight.tsx  # Faculty spotlight video embed
│   │   ├── news/
│   │   │   ├── NewsCard.tsx        # Standardized news card
│   │   │   └── NewsFilter.tsx      # Category pills & search input
│   │   ├── personnel/
│   │   │   └── PersonnelCard.tsx   # Staff portrait, academic rank, email, department
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       └── Card.tsx
│   ├── data/
│   │   ├── banners.ts              # Hero slide items
│   │   ├── navigation.ts           # Header, submenu, and footer links
│   │   ├── news.ts                 # Real scraped news articles categorized
│   │   ├── personnel.ts            # Administrators, lecturers, and staff data
│   │   ├── programs.ts             # Undergraduate and graduate curricula
│   │   └── facilities.ts           # Laboratories and classroom facilities
│   └── types/
│       └── index.ts                # TypeScript interfaces for all entities
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. Brand Color Palette & Styling Tokens

- **Primary Brand Orange:** `#FF6B00` / `#E8501E` (ITD Signature Orange)
- **Dark Accent / Text:** `#222222` / `#1F2937`
- **Secondary Dark:** `#333333`
- **Surface / Background:** `#F8F9FA` / `#FFFFFF`
- **Subtle Border:** `#E5E7EB`
- **Active Tab Highlight:** `#FF6B00` with white text

---

## 5. Asset Extraction & Scraping Pipeline

A dedicated automated TypeScript script (`scripts/scrape-and-archive.ts`) will run with Bun to:
1. Crawl `https://itd.kmutnb.ac.th` and key subpages (`administrator.php`, `lecturer.php`, `staff.php`, `all-*-news.php`, `history.php`, `class-room.php`, `computer-room.php`).
2. Download all banner slides, logo images, news thumbnails, and staff portraits to `public/assets/`.
3. Parse HTML structures (using `cheerio`) to extract Thai titles, dates, author info, executive ranks, course links, and descriptions into typed JSON/TS files in `src/data/`.
4. Ensure fallbacks for any missing media with SVG placeholders.

---

## 6. Implementation & Verification Plan

1. **Phase 1: Project Initialization & Tooling**
   - Initialize Bun + Next.js + TypeScript + Tailwind CSS project in `/home/rinme/project/itdre`.
   - Install dependencies (`lucide-react`, `swiper`, `cheerio`, `@types/cheerio`).
   - Configure Tailwind theme, Google Font Mitr, and global styles.

2. **Phase 2: Automated Scraper & Asset Localization**
   - Implement `scripts/scrape-and-archive.ts`.
   - Execute scraper to fetch all assets into `public/assets/` and populate `src/data/*.ts`.

3. **Phase 3: Core Shared Layout & Components**
   - Build `TopHeader`, `MainNavbar` with mobile drawer, and `Footer`.
   - Build UI components (`Card`, `Badge`, `Button`).

4. **Phase 4: Homepage & Subpages Implementation**
   - Implement Homepage (`HeroBannerSlider`, `QuickNavGrid`, `NewsSection`, `ProgramsOverview`, `VideoHighlight`).
   - Implement News list & detail pages (`/news`, `/news/[id]`).
   - Implement Personnel directory (`/personnel`).
   - Implement About & History (`/about`).
   - Implement Facilities (`/facilities`).
   - Implement Services & Downloads (`/services`).
   - Implement Contact page (`/contact`).

5. **Phase 5: Quality Assurance & Build Verification**
   - Run `bun run build` to verify clean static export / production build with 0 TypeScript and lint errors.
   - Verify all images render properly from local `public/assets/` without broken links.
   - Test responsive layout across desktop, tablet, and mobile views.
