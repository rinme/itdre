# ITD KMUTNB Modern Web Portal

> Modern, high-performance web portal for the **Faculty of Information Technology and Digital Innovation (ITD)**, King Mongkut's University of Technology North Bangkok (KMUTNB).

[![Runtime](https://img.shields.io/badge/Runtime-Bun-f472b6?style=flat-square&logo=bun)](https://bun.sh)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2014-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Language](https://img.shields.io/badge/Language-TypeScript%205-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Architecture & Design System](#architecture--design-system)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Scraper & Asset Pipeline](#scraper--asset-pipeline)
- [Feature Walkthrough](#feature-walkthrough)
- [Static Site Generation (SSG) & Build](#static-site-generation-ssg--build)
- [Contributing & Maintenance](#contributing--maintenance)

---

## Overview

This project is a modern rebuild of the official ITD KMUTNB web portal ([https://itd.kmutnb.ac.th](https://itd.kmutnb.ac.th)). It provides a fast, accessible, bilingual (Thai / English), and responsive user experience for prospective students, current undergraduates and postgraduates, faculty members, researchers, and campus visitors.

### Core Objectives
- **Zero External Dependencies at Runtime:** All images, faculty portraits, news media, and facilities photos are archived locally under `public/assets/`, eliminating broken external hotlinks and CORS issues.
- **Full Static Site Generation (SSG):** Pre-renders all 140+ routes—including 130+ dynamic news article pages—for lightning-fast delivery and optimal SEO.
- **Seamless Bilingual Localization:** Reactive Thai (`TH`) and English (`EN`) language switching across every layout, page, card, and modal with persistent client state.
- **Brand-Aligned UI/UX:** Styled with official KMUTNB / ITD orange (`#FF6B00` / `#E8501E`), deep slate dark (`#222222`), clean surfaces (`#F8F9FA`), and the Google Font `Mitr`.

---

## Architecture & Design System

```
                      ┌───────────────────────────────────────────────┐
                      │             Next.js 14 App Router             │
                      │  (147 Static Pages / Server & Client Comps)   │
                      └───────────────────────┬───────────────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
       ┌────────────────────────┐                          ┌────────────────────────┐
       │   Bilingual Context    │                          │   Static Data Layer    │
       │   (LanguageContext)    │                          │     (src/data/*.ts)    │
       │   • State: TH | EN     │                          │   • 130+ News Items    │
       │   • LocalStorage Sync  │                          │   • 56 Faculty Members │
       └────────────┬───────────┘                          │   • 19 Facility Labs   │
                    │                                      │   • 7 Hero Banners     │
                    │                                      │   • Programs & Courses │
                    ▼                                      └───────────┬────────────┘
       ┌───────────────────────────────────────────────────────────────┤
       │                     UI Component Layer                        │
       │  • Layout: TopHeader, MainNavbar, Footer                      │
       │  • Home: HeroSlider, QuickNav, Programs, NewsSection, Video   │
       │  • News: NewsArchive, NewsFilter, NewsCard, NewsDetail        │
       │  • Personnel: Execs, Lecturers, Staff, PersonnelCard          │
       │  • Facilities: Explorer, FacilityCard, FacilityModal (Zoom)   │
       │  • Services & Downloads: E-Services, Forms, Timetables        │
       │  • Contact: Info Cards, Map, Extension Table, Inquiry Form    │
       └───────────────────────────────┬───────────────────────────────┘
                                       │
                                       ▼
                       ┌───────────────────────────────┐
                       │    Local Asset Storehouse     │
                       │       (public/assets/)        │
                       │  • logos/   • banners/        │
                       │  • news/    • faculty/        │
                       │  • facilities/                │
                       └───────────────────────────────┘
```

### Brand Colors & Typography

| Element | Value | Description |
|---|---|---|
| **Primary Brand** | `#FF6B00` / `#E8501E` | Signature KMUTNB / ITD vibrant orange |
| **Dark Neutral** | `#222222` / `#111827` | High-contrast headers, dark mode footers, text |
| **Light Surface** | `#F8F9FA` / `#FFFFFF` | Background cards, content sections, modals |
| **Border / Muted** | `#E5E7EB` / `#6B7280` | Subtle dividers, metadata text, badges |
| **Typography** | `Mitr`, `sans-serif` | Clean, modern Thai/Latin geometric font |

---

## Key Features

- 🌐 **Reactive Bilingual Switching:** Instant switching between Thai and English with fallback protection and localStorage persistence.
- 🖼️ **Hero Banner Carousel:** Swiper-powered interactive hero slider with autoplay, pause-on-hover, custom bullet indicators, and slide captions.
- 📰 **Complete News Archive (SSG):** Filter by category (*All, Academic, Admissions, Activity, Scholarship, Research*), live keyword search, pagination, and dedicated static detail pages (`/news/[id]`).
- 👨‍🏫 **Faculty & Staff Directory:** Filterable directory of administrators, professors, lecturers, and academic support staff with research expertise, education credentials, emails, and room locations.
- 🏫 **Facilities & Lab Showcase:** Detailed 3D-like cards and lightbox modal for 19 campus facilities across Building 79, including the **Pearson VUE Authorized Test Center (Room 5A02)** and **High-Performance Computing NOC (Room 5A01)**.
- 📑 **E-Services & Download Center:** Quick-access portal to 12 KMUTNB digital services (REG, ICIT, Office 365, VPN, Library) and 15 downloadable student/faculty documents with search and format badges.
- 📍 **Campus Contact & Interactive Map:** Building 79 address, 4 transit routes (MRT, Bus, Boat, Car), searchable internal telephone extension directory, and an interactive contact inquiry form.

---

## Tech Stack

- **Runtime & Package Manager:** [Bun](https://bun.sh) (v1.0+)
- **Framework:** [Next.js 14](https://nextjs.org) (App Router, SSG, TypeScript)
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com) + PostCSS + Autoprefixer
- **Icons:** [Lucide React](https://lucide.dev)
- **Sliders / Carousel:** [Swiper 11](https://swiperjs.com)
- **Scraping & Data Parsing:** [Cheerio](https://cheerio.js.org)

---

## Project Structure

```
itd-kmutnb/
├── public/
│   └── assets/                     # Self-hosted media assets (no external hotlinks)
│       ├── banners/                # 7 homepage banner slides & animated GIFs
│       ├── facilities/             # 19 facility photos & fallback SVGs
│       ├── faculty/                # 56 faculty and staff portraits
│       ├── logos/                  # KMUTNB and ITD high-res vector/raster logos
│       └── news/                   # 130+ news article cover images
├── scripts/
│   └── scrape-and-archive.ts       # Automated portal scraper & asset archiver
├── src/
│   ├── app/                        # Next.js 14 App Router routes
│   │   ├── layout.tsx              # Root HTML wrapper with Mitr font & Header/Footer
│   │   ├── page.tsx                # Homepage
│   │   ├── globals.css             # Tailwind base layers, typography, and custom utilities
│   │   ├── about/
│   │   │   ├── page.tsx            # /about (Dean's message, Vision, Mission, Values)
│   │   │   └── history/page.tsx    # /about/history (1996–Present timeline & Building 79 guide)
│   │   ├── news/
│   │   │   ├── page.tsx            # /news (Filterable archive with pagination)
│   │   │   └── [id]/page.tsx       # /news/[id] (Pre-rendered static article detail pages)
│   │   ├── personnel/
│   │   │   ├── page.tsx            # /personnel (Full directory overview)
│   │   │   ├── administrators/page.tsx # /personnel/administrators (Executive board)
│   │   │   ├── lecturers/page.tsx  # /personnel/lecturers (Department faculty members)
│   │   │   └── staff/page.tsx      # /personnel/staff (Academic support staff)
│   │   ├── facilities/
│   │   │   ├── page.tsx            # /facilities (Filterable campus labs & classrooms)
│   │   │   ├── classrooms/page.tsx # /facilities/classrooms (Lecture rooms)
│   │   │   └── computer-rooms/page.tsx # /facilities/computer-rooms (Computing labs)
│   │   ├── services/page.tsx       # /services (E-Services & Downloadable forms)
│   │   └── contact/page.tsx        # /contact (Contact info, map, extensions, form)
│   ├── components/                 # Modular, reusable UI components
│   │   ├── layout/                 # TopHeader, MainNavbar, Footer
│   │   ├── home/                   # HeroBannerSlider, QuickNavGrid, ProgramsOverview, NewsSection, VideoHighlight
│   │   ├── news/                   # NewsArchiveContent, NewsFilter, NewsCard, NewsDetailContent
│   │   ├── personnel/              # PersonnelDirectoryContent, AdministratorsContent, LecturersContent, StaffContent, PersonnelCard
│   │   ├── facilities/             # FacilitiesExplorer, FacilityCard, FacilityModal
│   │   ├── about/                  # AboutOverviewContent, AboutHistoryContent
│   │   ├── services/               # ServicesContent
│   │   └── contact/                # ContactContent
│   ├── context/
│   │   └── LanguageContext.tsx     # Bilingual state management (TH/EN toggle & hook)
│   ├── data/                       # Strongly-typed datasets
│   │   ├── banners.ts              # Hero banners data
│   │   ├── contact.ts              # Campus address, transit info, phone extensions
│   │   ├── facilities.ts           # 19 facility rooms, specs, and local asset paths
│   │   ├── navigation.ts           # Header nav links and mega-menu structure
│   │   ├── news.ts                 # 130+ scraped news articles with rich metadata
│   │   ├── personnel.ts            # 56 faculty & staff records with research areas
│   │   ├── programs.ts             # Bachelor, Master, and Doctoral degree curricula
│   │   └── services.ts             # 12 e-services & 15 downloadable documents
│   ├── lib/                        # Helper utilities & data query functions
│   │   ├── facility-utils.ts       # Facility filtering and floor sorting
│   │   ├── news-utils.ts           # News search, pagination, and category filters
│   │   └── personnel-utils.ts      # Personnel grouping and search
│   └── types/
│       └── index.ts                # TypeScript interfaces for all entities
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) (version 1.0 or newer)
- Node.js 18+ (optional, if using Node-based tooling)

### 1. Installation

Clone the repository and install dependencies using Bun:

```bash
bun install
```

### 2. Development Mode

Start the Next.js local development server with hot-reload:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Static Generation

Compile the production bundle and generate all static pages:

```bash
bun run build
```

### 4. Production Server Preview

Serve the optimized production build locally:

```bash
bun start
```

### 5. Code Quality & Linting

Run ESLint to check for code standards and TypeScript adherence:

```bash
bun run lint
```

---

## Scraper & Asset Pipeline

The project includes an automated data and asset ingestion pipeline located at `scripts/scrape-and-archive.ts`.

### Running the Scraper Pipeline

```bash
bun run scripts/scrape-and-archive.ts
```

### What the Pipeline Does:
1. **Target:** Scrapes the live portal at `https://itd.kmutnb.ac.th`.
2. **Asset Archival:** Concurrently downloads all media files with retry logic:
   - Header & University logos ➡️ `public/assets/logos/`
   - Hero slider banners & GIFs ➡️ `public/assets/banners/`
   - News thumbnails & cover art ➡️ `public/assets/news/`
   - Faculty & personnel portrait photos ➡️ `public/assets/faculty/`
   - Lab & classroom facility photography ➡️ `public/assets/facilities/`
3. **Data Generation:** Generates type-safe TypeScript files under `src/data/`:
   - `src/data/banners.ts`
   - `src/data/news.ts`
   - `src/data/personnel.ts`
   - `src/data/facilities.ts`
   - `src/data/navigation.ts`
4. **Fallback Protection:** If an asset fails to download or is missing remotely, placeholder SVG generators create standardized fallback graphics automatically.

---

## Feature Walkthrough

### 1. Bilingual System (`useLanguage`)
- Context provider mounted in the root layout (`src/context/LanguageContext.tsx`).
- Switch between Thai (`TH`) and English (`EN`) at any time via the top header bar.
- Automatically stores preference in `localStorage` and applies smooth transitions.

### 2. Homepage Experience (`/`)
- **Hero Slider:** Full-width Swiper carousel displaying latest announcements, events, and academic notices with pause-on-hover and swipe gesture support.
- **Quick Nav Grid:** Instant shortcuts to Admissions, E-Services, Curricula, and Research.
- **Academic Programs:** Tabbed overview for Bachelor (B.Sc.), Master (M.Sc.), and Doctoral (Ph.D.) programs.
- **News Highlights:** Categorized grid of latest announcements with date badges and direct links.
- **Faculty Highlight:** Video showcase and dean welcoming quote.

### 3. News & Announcements (`/news` & `/news/[id]`)
- **Category Filter:** Filter by *All, Academic, Admissions, Activity, Scholarship, Research*.
- **Search:** Real-time query search matching titles and excerpts in both languages.
- **Pagination:** Clean page navigation preserving active filters.
- **Static Article Pages (`/news/[id]`):** 130+ pre-rendered pages with rich metadata, formatted content, and related article recommendations.

### 4. Faculty & Staff Directory (`/personnel/*`)
- **`/personnel`:** Comprehensive directory with department filters and search.
- **`/personnel/administrators`:** Executive Board (Dean, Associate Deans, Assistant Deans, Department Heads).
- **`/personnel/lecturers`:** Full-time professors, associate professors, and lecturers categorized by department.
- **`/personnel/staff`:** Academic support, administrative, and laboratory staff.

### 5. Facilities Explorer (`/facilities/*`)
- **`/facilities`:** Interactive grid of all 19 campus facilities on Building 79.
- **Filter & Room Search:** Filter by floor (3, 4, 5, 7) or room type (Classroom vs. Lab).
- **Zoom Lightbox Modal:** Fullscreen high-resolution image zoom, room equipment list, capacity, and reservation CTA.
- **Specialized Centers:** Highlights the Pearson VUE Authorized Test Center (Room 5A02) and High-Performance NOC (Room 5A01).

### 6. Services & Download Center (`/services`)
- **12 E-Services:** Direct links to REG KMUTNB, K-Admission, ICIT, Microsoft 365, KMUTNB VPN, IEEE/ACM databases, and Pearson VUE.
- **15 Downloadable Forms:** Organized by category (Undergraduate, Graduate, General, Research) with file format badges and instant mock download simulation.

### 7. Contact & Campus Guide (`/contact`)
- **Location:** Navamindra Rajini Building (Building 79), Pracharat 1 Rd, Bang Sue, Bangkok.
- **Transit Guide:** MRT Purple/Blue lines, BMTA buses, Chao Phraya Express Boat (Rama 7 Pier), and vehicle parking instructions.
- **Internal Telephone Extensions:** Searchable directory of 10 department direct extensions.
- **Inquiry Form:** Validated client form with category selection and simulated submission.

---

## Static Site Generation (SSG) & Build

The project is optimized for speed and reliability. During `bun run build`, Next.js creates static HTML for every route:

```
Route (app)                              Size     First Load JS
┌ ○ /                                    42.1 kB         186 kB
├ ○ /_not-found                          875 B          88.3 kB
├ ○ /about                               8.63 kB         113 kB
├ ○ /about/history                       8.47 kB         104 kB
├ ○ /contact                             11.1 kB         111 kB
├ ○ /facilities                          141 B           112 kB
├ ○ /facilities/classrooms               141 B           112 kB
├ ○ /facilities/computer-rooms           140 B           112 kB
├ ○ /news                                7.95 kB         151 kB
├ ● /news/[id] (131 SSG pages)           7.96 kB         108 kB
├ ○ /personnel                           5.34 kB         115 kB
├ ○ /personnel/administrators            3.34 kB         113 kB
├ ○ /personnel/lecturers                 5.14 kB         115 kB
├ ○ /personnel/staff                     5.43 kB         115 kB
└ ○ /services                            12.7 kB         108 kB
```

---

## Contributing & Maintenance

1. Ensure code conforms to TypeScript strict mode.
2. Run `bun run lint` before committing any changes.
3. Test production builds with `bun run build` to guarantee 0 build errors.
4. When adding new media, place assets under `public/assets/<category>/` and update the corresponding dataset in `src/data/`.

---

## License

Created for the **Faculty of Information Technology and Digital Innovation (ITD)**, King Mongkut's University of Technology North Bangkok (KMUTNB). All rights reserved.
