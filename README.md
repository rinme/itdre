# ITD KMUTNB Modern Web Portal

> Modern, high-performance web portal for the **Faculty of Information Technology and Digital Innovation (ITD)**, King Mongkut's University of Technology North Bangkok (KMUTNB).

[![Runtime](https://img.shields.io/badge/Runtime-Bun-f472b6?style=flat-square&logo=bun)](https://bun.sh)
[![Framework](https://img.shields.io/badge/Framework-SvelteKit%202%20%7C%20Svelte%205-ff3e00?style=flat-square&logo=svelte)](https://svelte.dev/)
[![Language](https://img.shields.io/badge/Language-TypeScript%205-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Database-Prisma%20%2B%20SQLite-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%204-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Testing](https://img.shields.io/badge/Testing-Vitest-729b1b?style=flat-square&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Architecture & Design System](#architecture--design-system)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Testing & Quality Verification](#testing--quality-verification)
- [Scraper & Asset Pipeline](#scraper--asset-pipeline)
- [Feature Walkthrough](#feature-walkthrough)
- [Contributing & Maintenance](#contributing--maintenance)

---

## Overview

This project is a modern rebuild of the official ITD KMUTNB web portal ([https://itd.kmutnb.ac.th](https://itd.kmutnb.ac.th)) powered by **SvelteKit 2** and **Svelte 5 Runes**. It provides a fast, accessible, bilingual (Thai / English), and responsive user experience for prospective students, undergraduates, postgraduates, faculty members, researchers, campus visitors, and administrators.

### Core Objectives
- **Zero External Dependencies at Runtime:** All images, faculty portraits, news media, and facilities photos are archived locally under `public/assets/`, eliminating broken external hotlinks and CORS issues.
- **Svelte 5 Runes Reactivity:** Modern declarative state (`$state`, `$derived`, `$props`) with zero runtime overhead and ultra-lightweight client bundles.
- **Interactive Academic Schedule Management:** Complete public timetable viewer with cascading academic year/semester/program filters, weekly grid and list views, and a secure admin management portal with live conflict detection.
- **Seamless Bilingual Localization:** Reactive Thai (`TH`) and English (`EN`) language switching across every layout, page, card, and modal with persistent client state.
- **Brand-Aligned UI/UX:** Styled with official KMUTNB / ITD orange (`#FF6B00` / `#E8501E`), deep slate dark (`#222222`), clean surfaces (`#F8F9FA`), and the Google Font `Mitr`.

---

## Architecture & Design System

```
                      ┌───────────────────────────────────────────────┐
                      │              SvelteKit 2 + Vite               │
                      │          (Svelte 5 Runes & SSR/SSG)           │
                      └───────────────────────┬───────────────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
       ┌────────────────────────┐                          ┌────────────────────────┐
       │     Reactive State     │                          │   Static Data Layer    │
       │  ($lib/state/*.svelte) │                          │     ($lib/data/*.ts)   │
       │  • languageState       │                          │   • 130+ News Items    │
       │  • adminPresetsState   │                          │   • 56 Faculty Members │
       │  • scheduleState       │                          │   • 19 Facility Labs   │
       └────────────┬───────────┘                          │   • 7 Hero Banners     │
                    │                                      │   • Programs & Courses │
                    │                                      └───────────┬────────────┘
                    ▼                                                  │
       ┌───────────────────────────────────────────────────────────────┤
       │                     UI Component Layer                        │
       │  • Layout: TopHeader, MainNavbar, Footer                      │
       │  • Home: HeroBannerSlider, QuickNavGrid, ProgramsOverview     │
       │  • News: NewsArchive, NewsFilter, NewsCard, NewsDetail        │
       │  • Personnel: Execs, Lecturers, Staff, PersonnelCard          │
       │  • Facilities: Explorer, FacilityCard, FacilityModal (Zoom)   │
       │  • Services & Downloads: E-Services, Forms, Timetables        │
       │  • Schedules: FilterBar, WeeklyGrid, DayView, ListView        │
       │  • Admin: Dashboard, ScheduleModal, GridEditor, ConflictBanner│
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

- 🌐 **Reactive Bilingual Switching:** Instant switching between Thai and English with fallback protection and localStorage persistence via Svelte 5 runes (`languageState`).
- 📅 **Public Class Schedule System:** Interactive timetable exploration (`/schedules`) with automatic filter cascading (Academic Year → Semester → Degree → Program → Year Level), weekly timetable grid view, mobile day view, list view, and conflict indicator.
- 🔐 **Admin Schedule Management:** Secure admin portal (`/admin/schedules`, `/admin/schedules/[id]`, `/admin/presets`) protected by JWT sessions and SvelteKit `hooks.server.ts` middleware. Features visual drag/drop timetable editing, course preset management, and real-time room/time conflict detection.
- 🖼️ **Hero Banner Carousel:** Interactive hero slider with autoplay, pause-on-hover, custom bullet indicators, and slide captions.
- 📰 **Complete News Archive:** Filter by category (*All, Academic, Admissions, Activity, Scholarship, Research*), live keyword search, pagination, and dedicated detail pages (`/news/[id]`).
- 👨‍🏫 **Faculty & Staff Directory:** Filterable directory of administrators, professors, lecturers, and academic support staff with research expertise, education credentials, emails, and room locations.
- 🏫 **Facilities & Lab Showcase:** Detailed cards and lightbox modal for 19 campus facilities across Building 79, including the **Pearson VUE Authorized Test Center (Room 5A02)** and **High-Performance Computing NOC (Room 5A01)**.
- 📑 **E-Services & Download Center:** Quick-access portal to 12 KMUTNB digital services and 15 downloadable documents.
- 📍 **Campus Contact & Interactive Map:** Building 79 address, 4 transit routes (MRT, Bus, Boat, Car), telephone extension directory, and inquiry form.

---

## Tech Stack

- **Runtime & Package Manager:** [Bun](https://bun.sh) (v1.0+)
- **Framework:** [SvelteKit 2](https://svelte.dev) + [Svelte 5](https://svelte.dev) (Runes)
- **Bundler & Tooling:** [Vite 6](https://vite.dev) + [Tailwind CSS 4](https://tailwindcss.com)
- **Database & ORM:** [Prisma](https://www.prisma.io) + SQLite
- **Authentication:** [jose](https://github.com/panva/jose) (HMAC SHA-256 JWT & Secure Cookies)
- **Icons:** [Lucide Svelte](https://lucide.dev)
- **Testing:** [Vitest 3](https://vitest.dev) + [JSDOM](https://github.com/jsdom/jsdom)
- **Data Scraping:** [Cheerio](https://cheerio.js.org)

---

## Project Structure

```
itd-kmutnb/
├── prisma/
│   ├── schema.prisma               # Prisma schema (Schedule, CourseSlot, CoursePreset)
│   └── seed.ts                     # Database seeder for schedules & presets
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
│   ├── app.css                     # Tailwind CSS 4 theme & custom utilities
│   ├── app.d.ts                    # SvelteKit global TypeScript typings
│   ├── app.html                    # HTML shell template
│   ├── hooks.server.ts             # SvelteKit auth & route protection hook
│   ├── lib/                        # Shared SvelteKit modules
│   │   ├── components/             # Reusable Svelte 5 components
│   │   │   ├── admin/              # Admin dashboard, modals, and grid editor
│   │   │   ├── demo/               # Demo banner and feedback modal
│   │   │   ├── facilities/         # Explorer, card, and modal
│   │   │   ├── home/               # HeroSlider, QuickNav, Programs, Video
│   │   │   ├── layout/             # TopHeader, MainNavbar, Footer
│   │   │   ├── news/               # Archive, filter, card, detail
│   │   │   ├── personnel/          # Directory, administrators, lecturers, staff
│   │   │   └── schedules/          # FilterBar, WeeklyGrid, DayView, ListView
│   │   ├── data/                   # Strongly-typed datasets (banners, news, etc.)
│   │   ├── server/                 # Server-only code (auth, prisma client singleton)
│   │   ├── state/                  # Svelte 5 runes global state (.svelte.ts)
│   │   ├── types/                  # Shared TypeScript interfaces
│   │   └── utils/                  # Helper utilities (weekly-grid, schedule-conflict)
│   └── routes/                     # SvelteKit file-based routing
│       ├── +layout.svelte          # Root layout with Header/Footer and demo banner
│       ├── +page.svelte            # Homepage
│       ├── about/                  # /about and /about/history
│       ├── admin/                  # Admin login, schedules, and presets
│       ├── api/                    # REST endpoints (public & admin schedules)
│       ├── contact/                # Contact page
│       ├── facilities/             # Campus labs & classrooms
│       ├── news/                   # News archive and [id] detail page
│       ├── personnel/              # Faculty and staff directory
│       ├── schedules/              # Public class schedule viewer
│       └── services/               # E-services and download center
├── tests/                          # Vitest comprehensive test suites
├── svelte.config.js
├── vite.config.ts
├── vercel.json
└── package.json
```

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) (version 1.0 or newer)
- Node.js 18+ (optional, supported by Bun)

### 1. Installation

Clone the repository and install dependencies using Bun:

```bash
bun install
```

### 2. Database Setup

Generate the Prisma Client and run the database migrations/seeding:

```bash
bunx prisma db push
bunx prisma db seed
```

### 3. Development Server

Start the Vite development server with hot module replacement:

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Production Build & Preview

Verify types and build the optimized production bundle:

```bash
# Type check
bunx svelte-check --tsconfig ./tsconfig.json

# Build production bundle
bun run build

# Preview locally
bun run preview
```

---

## Testing & Quality Verification

Run the full Vitest suite to execute all component, utility, server API, and state tests:

```bash
bun run test
```

### Test Coverage Highlights
- **Server Authentication (`tests/server-auth.test.ts`):** JWT signing/verification, password validation, timing attack resistance, and SvelteKit route protection hooks.
- **API Endpoints (`tests/api-endpoints.test.ts`):** Public schedules, filter cascading, admin schedule CRUD, and course slot operations.
- **Weekly Timetable Grid (`tests/weekly-grid.test.ts`):** Timetable layout calculations, slot positioning, and color theme assignment.
- **Schedule Conflict Detection (`tests/schedule-conflict.test.ts`):** Time-overlap and room-overlap detection logic.
- **Navigation & Layout (`tests/navigation.test.ts`):** Responsive navbar, mobile navigation, and bilingual link structure.
- **Public & Admin UI Logic (`tests/public-schedule-ui.test.ts`, `tests/admin-ui.test.ts`):** Filter cascading state, URL sanitization, and modal operations.

---

## Scraper & Asset Pipeline

The project includes an automated data and asset ingestion pipeline located at `scripts/scrape-and-archive.ts`.

```bash
bun run scripts/scrape-and-archive.ts
```

### What the Pipeline Does:
1. **Target:** Scrapes the live portal at `https://itd.kmutnb.ac.th`.
2. **Asset Archival:** Concurrently downloads media files with retry logic into `public/assets/`.
3. **Data Generation:** Generates strongly-typed datasets under `src/lib/data/`.
4. **Fallback Protection:** Automatically creates standardized fallback graphics if an asset fails to download or is missing remotely.

---

## Contributing & Maintenance

1. Ensure code adheres to TypeScript strict mode and Svelte 5 runes conventions.
2. Run `bun run test` to guarantee all test suites pass.
3. Run `bunx svelte-check --tsconfig ./tsconfig.json` to verify 0 type errors.
4. Run `bun run build` to confirm clean production builds.

---

## License

Created for the **Faculty of Information Technology and Digital Innovation (ITD)**, King Mongkut's University of Technology North Bangkok (KMUTNB). All rights reserved.
