# ITD KMUTNB Next.js Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a modern, self-contained Next.js (App Router) project for the Faculty of Information Technology and Digital Innovation (ITD KMUTNB) with 100% localized assets, typed mock data extracted from the live site, and interactive UI features.

**Architecture:** A Next.js App Router application built with Bun, TypeScript, and Tailwind CSS. A standalone scraper script downloads live images into `public/assets/` and generates typed data files in `src/data/`. Modular React components render the homepage, news portal, faculty directory, facilities, and contact pages.

**Tech Stack:** Bun (`bun 1.3+`), Next.js 14/15, TypeScript, Tailwind CSS, Lucide React, Swiper React, Cheerio.

**Spec:** `docs/superpowers/specs/2026-08-30-itd-kmutnb-nextjs-design.md`

## Global Constraints

- Must use Bun as the package manager and runtime.
- Must store all assets in `public/assets/` without hardcoded remote hotlinks in components.
- Brand colors: Primary Orange (`#FF6B00` / `#E8501E`), Deep Dark (`#222222`), Clean Light Surface (`#F8F9FA`).
- Typography: Google Font `Mitr` + `sans-serif`.
- Zero TypeScript and lint errors on `bun run build`.

---

### Task 1: Next.js + Bun Project Initialization & Configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.mjs`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Test: `bun run build`

**Interfaces:**
- Produces: Base project structure, Tailwind configuration, Google Font Mitr setup.

- [ ] **Step 1: Initialize Next.js project with Bun**

Run:
```bash
bun create next-app . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-bun --no-git
```
Or configure `package.json` and install dependencies:
```bash
bun add lucide-react swiper cheerio
bun add -d @types/cheerio
```

- [ ] **Step 2: Configure Tailwind CSS and Theme**

Update `tailwind.config.ts` with brand colors and fonts:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF6B00",
          darkOrange: "#E8501E",
          dark: "#222222",
          gray: "#444444",
          light: "#F8F9FA",
        },
      },
      fontFamily: {
        sans: ["var(--font-mitr)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 3: Configure `src/app/layout.tsx` and Google Font Mitr**

```typescript
import type { Metadata } from "next";
import { Mitr } from "next/font/google";
import "./globals.css";

const mitr = Mitr({
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-mitr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ITD - Faculty of Information Technology and Digital Innovation, KMUTNB",
  description: "Faculty of Information Technology and Digital Innovation, King Mongkut's University of Technology North Bangkok",
  icons: {
    icon: "/assets/logos/logo-favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={mitr.variable}>
      <body className="font-sans antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify build works**

Run: `bun run build`  
Expected: Successful build output.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js project with Bun, TypeScript, and Tailwind CSS"
```

---

### Task 2: Automated Scraper & Asset Localization Pipeline

**Files:**
- Create: `scripts/scrape-and-archive.ts`
- Create: `src/types/index.ts`
- Create: `src/data/banners.ts`, `src/data/news.ts`, `src/data/personnel.ts`, `src/data/navigation.ts`, `src/data/facilities.ts`, `src/data/programs.ts`
- Test: `bun run scripts/scrape-and-archive.ts`

**Interfaces:**
- Produces: Local image assets in `public/assets/` and typed data records in `src/data/*.ts`.

- [ ] **Step 1: Create TypeScript entity interfaces**

Write `src/types/index.ts`:
```typescript
export interface BannerSlide {
  id: string;
  title: string;
  image: string;
  link?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  thumbnail: string;
  summary?: string;
  content?: string;
  views?: number;
  pdfUrl?: string;
}

export interface PersonnelMember {
  id: string;
  nameTh: string;
  nameEn?: string;
  role: string;
  category: "administrator" | "lecturer" | "staff";
  department?: string;
  email?: string;
  phone?: string;
  image: string;
  education?: string[];
}

export interface NavItem {
  titleTh: string;
  titleEn: string;
  href: string;
  external?: boolean;
  children?: {
    titleTh: string;
    titleEn: string;
    href: string;
    external?: boolean;
  }[];
}

export interface FacilityItem {
  id: string;
  titleTh: string;
  titleEn: string;
  category: "classroom" | "computer-room" | "lab";
  description: string;
  capacity?: string;
  image: string;
  features?: string[];
}

export interface ProgramItem {
  id: string;
  degree: "bachelor" | "master" | "doctor";
  titleTh: string;
  titleEn: string;
  shortDescription: string;
  duration: string;
  tuition?: string;
  link: string;
}
```

- [ ] **Step 2: Implement `scripts/scrape-and-archive.ts`**

Write the scraper script that:
1. Connects to `https://itd.kmutnb.ac.th`.
2. Downloads all images (logos, hero slides, news thumbnails, faculty photos) to `public/assets/{logos,banners,news,faculty,facilities}/`.
3. Parses HTML using `cheerio` and outputs typed data files to `src/data/`.
4. Provides robust fallback data if network access fails.

- [ ] **Step 3: Run the scraper script**

Run: `bun run scripts/scrape-and-archive.ts`  
Expected: Assets downloaded to `public/assets/` and `src/data/*.ts` generated.

- [ ] **Step 4: Commit**

```bash
git add scripts/ src/data/ src/types/ public/assets/
git commit -m "feat: implement scraper and extract local assets and data"
```

---

### Task 3: Shared Layout Components (Header, Navbar, Footer)

**Files:**
- Create: `src/components/layout/TopHeader.tsx`
- Create: `src/components/layout/MainNavbar.tsx`
- Create: `src/components/layout/Footer.tsx`
- Modify: `src/app/layout.tsx`
- Test: Visual & layout check

**Interfaces:**
- Consumes: `src/data/navigation.ts`, `src/types/index.ts`
- Produces: Reusable site shell wrapping all pages.

- [ ] **Step 1: Create `TopHeader.tsx`**

Includes:
- Logo header with link to `/`
- Language selector toggle (TH / EN)
- Social links (Facebook, Line OA, Contact)
- Quick action buttons (E-services, Downloads, MTD)

- [ ] **Step 2: Create `MainNavbar.tsx`**

Includes:
- Sticky responsive navigation bar with brand color accents.
- Desktop dropdown menus: หน้าหลัก (Home), ข่าวสาร (News), บุคลากร (Personnel), หลักสูตร (Curriculum), แนะนำคณะ (About), บริการ (Services).
- Mobile burger menu button opening animated side drawer.
- Search icon button with quick search modal / input.

- [ ] **Step 3: Create `Footer.tsx`**

Includes:
- ITD KMUTNB official logo and address.
- Telephone, Email, and Social Media links.
- Quick navigation columns (Undergraduate, Graduate, E-Services, University links).
- Copyright and credits notice.

- [ ] **Step 4: Update `src/app/layout.tsx` to include TopHeader, MainNavbar, and Footer**

- [ ] **Step 5: Verify build passes**

Run: `bun run build`  
Expected: Pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ src/app/layout.tsx
git commit -m "feat: implement TopHeader, MainNavbar, and Footer layout components"
```

---

### Task 4: Homepage Features & Sections

**Files:**
- Create: `src/components/home/HeroBannerSlider.tsx`
- Create: `src/components/home/QuickNavGrid.tsx`
- Create: `src/components/home/NewsSection.tsx`
- Create: `src/components/news/NewsCard.tsx`
- Create: `src/components/home/ProgramsOverview.tsx`
- Create: `src/components/home/VideoHighlight.tsx`
- Modify: `src/app/page.tsx`
- Test: `bun run build`

**Interfaces:**
- Consumes: `src/data/banners.ts`, `src/data/news.ts`, `src/data/programs.ts`
- Produces: High-fidelity homepage.

- [ ] **Step 1: Create `HeroBannerSlider.tsx`**

Using Swiper React with Autoplay, Navigation, and Pagination bullets matching the original styling.

- [ ] **Step 2: Create `QuickNavGrid.tsx`**

Four key action cards (Admission, Timetable & Academic Calendar, Downloads, E-Services).

- [ ] **Step 3: Create `NewsSection.tsx` and `NewsCard.tsx`**

- Filterable news tabs (ข่าวทั่วไป, ข่าวคณะและมหาวิทยาลัย, ข่าวทุน/วิจัย, ข่าวกิจกรรม, ข่าวประกันคุณภาพ, ข่าวประชุมวิชาการ, ประกาศมหาวิทยาลัย, รับสมัครงาน, จัดซื้อจัดจ้าง).
- Responsive grid of news cards with date badges, thumbnails, titles, and hover zoom effect.
- "ดูข่าวทั้งหมด" (View all news) button linking to `/news`.

- [ ] **Step 4: Create `ProgramsOverview.tsx` & `VideoHighlight.tsx`**

- Highlight undergraduate and graduate programs with curriculum links.
- KMUTNB faculty introduction video player.

- [ ] **Step 5: Assemble `src/app/page.tsx`**

- [ ] **Step 6: Verify build passes**

Run: `bun run build`  
Expected: Pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/home/ src/components/news/ src/app/page.tsx
git commit -m "feat: implement homepage sections and banner slider"
```

---

### Task 5: News Directory & Detail Pages

**Files:**
- Create: `src/app/news/page.tsx`
- Create: `src/app/news/[id]/page.tsx`
- Create: `src/components/news/NewsFilter.tsx`
- Test: `bun run build`

**Interfaces:**
- Consumes: `src/data/news.ts`
- Produces: Interactive news archive and individual article reader routes.

- [ ] **Step 1: Implement `src/app/news/page.tsx`**

- Search input and category filter chips.
- Grid list of news articles with pagination / client filtering.
- Category statistics counters.

- [ ] **Step 2: Implement `src/app/news/[id]/page.tsx`**

- Breadcrumbs (`หน้าหลัก > ข่าวสาร > [Title]`).
- Article header with publishing date, category badge, and view count.
- Full content renderer, image preview, download attachments / PDF links if applicable.
- Related news sidebar.

- [ ] **Step 3: Verify build passes**

Run: `bun run build`  
Expected: Pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/news/ src/components/news/
git commit -m "feat: implement news listing and article detail routes"
```

---

### Task 6: Personnel & Faculty Directory

**Files:**
- Create: `src/components/personnel/PersonnelCard.tsx`
- Create: `src/app/personnel/page.tsx`
- Create: `src/app/personnel/administrators/page.tsx`
- Create: `src/app/personnel/lecturers/page.tsx`
- Create: `src/app/personnel/staff/page.tsx`
- Test: `bun run build`

**Interfaces:**
- Consumes: `src/data/personnel.ts`
- Produces: Faculty and staff directories.

- [ ] **Step 1: Implement `PersonnelCard.tsx`**

Displays portrait photo, full Thai and English names, academic position/role, department, email with mailto link, and telephone.

- [ ] **Step 2: Implement `src/app/personnel/page.tsx` with tabs**

Tabs for:
1. ผู้บริหาร (Administrators)
2. คณาจารย์ (Lecturers)
3. เจ้าหน้าที่ (Staff)

- [ ] **Step 3: Implement sub-routes `/administrators`, `/lecturers`, `/staff`**

- [ ] **Step 4: Verify build passes**

Run: `bun run build`  
Expected: Pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/personnel/ src/app/personnel/
git commit -m "feat: implement personnel and faculty directory"
```

---

### Task 7: Subpages: About, Facilities, Services, and Contact

**Files:**
- Create: `src/app/about/page.tsx`
- Create: `src/app/about/history/page.tsx`
- Create: `src/app/facilities/page.tsx`
- Create: `src/app/services/page.tsx`
- Create: `src/app/contact/page.tsx`
- Test: `bun run build`

**Interfaces:**
- Consumes: `src/data/facilities.ts`, `src/data/navigation.ts`
- Produces: Remaining core portal subpages.

- [ ] **Step 1: Implement About & History (`/about`, `/about/history`)**

- Faculty history timeline, vision, mission, and leadership greeting.

- [ ] **Step 2: Implement Facilities (`/facilities`)**

- Classroom and computer lab photos, equipment specifications, room capacities.

- [ ] **Step 3: Implement Services & Downloads (`/services`)**

- List of student & staff e-services, downloadable PDF forms, timetables, and academic calendars.

- [ ] **Step 4: Implement Contact (`/contact`)**

- Contact information, building location at KMUTNB, interactive Google Maps embed, phone extension list, and contact feedback form.

- [ ] **Step 5: Verify build passes**

Run: `bun run build`  
Expected: Pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/about/ src/app/facilities/ src/app/services/ src/app/contact/
git commit -m "feat: implement about, facilities, services, and contact subpages"
```

---

### Task 8: End-to-End Verification & Documentation

**Files:**
- Create: `README.md`
- Test: `bun run build` and asset integrity test

- [ ] **Step 1: Create project `README.md`**

Documenting setup instructions, architecture overview, scraping commands, and project features.

- [ ] **Step 2: Perform production build verification**

Run: `bun run build`  
Expected: 0 errors, all static routes generate cleanly.

- [ ] **Step 3: Final Commit**

```bash
git add .
git commit -m "chore: complete project verification and add documentation"
```
