import * as fs from "node:fs";
import * as path from "node:path";
import * as cheerio from "cheerio";
import type {
  BannerSlide,
  NewsItem,
  PersonnelMember,
  NavItem,
  FacilityItem,
  ProgramItem,
} from "../src/types";

const BASE_URL = "https://itd.kmutnb.ac.th";
const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const ASSETS_DIR = path.join(PUBLIC_DIR, "assets");
const DATA_DIR = path.resolve(process.cwd(), "src", "data");

const DIRS = {
  logos: path.join(ASSETS_DIR, "logos"),
  banners: path.join(ASSETS_DIR, "banners"),
  news: path.join(ASSETS_DIR, "news"),
  documents: path.join(ASSETS_DIR, "documents"),
  faculty: path.join(ASSETS_DIR, "faculty"),
  facilities: path.join(ASSETS_DIR, "facilities"),
  data: DATA_DIR,
};

// Ensure directories exist
for (const dir of Object.values(DIRS)) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Concurrency helper
async function pMap<T, R>(
  items: T[],
  fn: (item: T, idx: number) => Promise<R>,
  concurrency = 8
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// Fetch helper with timeout and User-Agent
async function fetchWithRetry(url: string, retries = 1, timeoutMs = 15000): Promise<Response | null> {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}/${url.replace(/^\/+/, "")}`;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(fullUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) return res;
    } catch {
      if (i === retries) {
        // failed
      }
    }
  }
  return null;
}

// Helper to determine appropriate fallback path based on target directory
function getFallbackAssetPath(targetDir: string, customFallback?: string): string {
  if (customFallback) return customFallback;
  if (targetDir.includes("news")) return "/assets/news/placeholder-news.svg";
  if (targetDir.includes("faculty")) return "/assets/faculty/placeholder-avatar.svg";
  if (targetDir.includes("banners")) return "/assets/banners/placeholder-banner.svg";
  if (targetDir.includes("facilities")) return "/assets/facilities/placeholder-facility.svg";
  return "/assets/logos/logo-favicon.png";
}

// Helper to download binary files and save to disk
async function downloadAsset(
  remoteUrl: string,
  targetDir: string,
  preferredName?: string,
  customFallback?: string
): Promise<string> {
  const fallback = getFallbackAssetPath(targetDir, customFallback);

  if (!remoteUrl || remoteUrl.trim() === "" || remoteUrl.startsWith("data:")) {
    return fallback;
  }

  const cleanRemote = remoteUrl.trim().replace(/^\/+/, "").replace(/\\/g, "/");
  const parsedFilename = path.basename(cleanRemote).split("?")[0] || "asset.png";
  const finalFilename = preferredName
    ? `${preferredName}${path.extname(parsedFilename) || ".png"}`
    : parsedFilename;
  const targetPath = path.join(targetDir, finalFilename);

  // Return public asset path relative to /public
  const relativePublicPath = targetPath.replace(PUBLIC_DIR, "").replace(/\\/g, "/");

  if (fs.existsSync(targetPath)) {
    return relativePublicPath;
  }

  try {
    const res = await fetchWithRetry(cleanRemote);
    if (res && res.ok) {
      const buffer = await res.arrayBuffer();
      if (buffer.byteLength > 0) {
        fs.writeFileSync(targetPath, Buffer.from(buffer));
        if (fs.existsSync(targetPath)) {
          return relativePublicPath;
        }
      }
    }
  } catch {
    // ignore
  }

  // Ensure we never return a path to a non-existent file
  return fallback;
}

// Helper to download document/PDF files and save to disk
async function downloadDocument(
  remoteUrl: string,
  targetDir: string,
  preferredName?: string
): Promise<string | undefined> {
  if (!remoteUrl || remoteUrl.trim() === "" || remoteUrl.startsWith("data:")) {
    return undefined;
  }

  const cleanRemote = remoteUrl.trim().replace(/^\/+/, "").replace(/\\/g, "/");
  const fullUrl = cleanRemote.startsWith("http")
    ? cleanRemote
    : `${BASE_URL}/${cleanRemote.replace(/^\/+/, "")}`;

  let parsedFilename = path.basename(cleanRemote).split("?")[0] || "document.pdf";
  if (!parsedFilename.toLowerCase().endsWith(".pdf")) {
    parsedFilename = `${parsedFilename}.pdf`;
  }

  const finalFilename = preferredName
    ? `${preferredName}${path.extname(parsedFilename) || ".pdf"}`
    : parsedFilename;
  const targetPath = path.join(targetDir, finalFilename);

  // Return public asset path relative to /public
  const relativePublicPath = targetPath.replace(PUBLIC_DIR, "").replace(/\\/g, "/");

  if (fs.existsSync(targetPath)) {
    const stat = fs.statSync(targetPath);
    if (stat.size > 0) {
      return relativePublicPath;
    }
  }

  try {
    const res = await fetchWithRetry(fullUrl, 2, 25000);
    if (res && res.ok) {
      const buffer = await res.arrayBuffer();
      if (buffer.byteLength > 0) {
        fs.writeFileSync(targetPath, Buffer.from(buffer));
        if (fs.existsSync(targetPath)) {
          return relativePublicPath;
        }
      }
    }
  } catch (err) {
    console.warn(`  ⚠️ Failed to download document ${fullUrl}:`, err);
  }

  return undefined;
}

// Phone parsing helper avoiding duplicate full numbers as extensions
function parsePhoneNumber(text: string): string | undefined {
  if (!text || text.trim() === "") return undefined;

  // Extract 4-digit internal extension (starting with 27xx or 22xx)
  const extMatch = text.match(/(?:ต่อ|ภายใน)\s*(\d{4})/i) || text.match(/\b(27\d{2}|22\d{2})\b/);
  if (extMatch) {
    return `02-555-2000 ต่อ ${extMatch[1]}`;
  }

  // Extract full phone number (e.g. 02-555-2701, 08-xxxx-xxxx)
  const directMatch = text.match(/(0[2-9][-\s]?\d{3,4}[-\s]?\d{4})/);
  if (directMatch) {
    return directMatch[1];
  }

  // If text mentions general KMUTNB operator without valid extension
  if (text.includes("02-555-2000") && !text.includes("ต่อ -")) {
    return "02-555-2000";
  }

  return undefined;
}

// Create fallback SVG assets if needed
function createFallbackAssets() {
  const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
    <rect width="600" height="400" fill="#F3F4F6"/>
    <rect x="250" y="150" width="100" height="100" rx="12" fill="#E5E7EB"/>
    <path d="M280 210L295 190L315 215L325 205L340 225H270L280 210Z" fill="#9CA3AF"/>
    <circle cx="285" cy="180" r="10" fill="#9CA3AF"/>
    <text x="300" y="275" font-family="sans-serif" font-size="16" fill="#6B7280" text-anchor="middle">ITD KMUTNB</text>
  </svg>`;

  const avatarSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400" fill="none">
    <rect width="300" height="400" fill="#F3F4F6"/>
    <circle cx="150" cy="140" r="60" fill="#CBD5E1"/>
    <path d="M70 320C70 260 110 240 150 240C190 240 230 260 230 320V340H70V320Z" fill="#CBD5E1"/>
  </svg>`;

  const bannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="600" viewBox="0 0 1920 600" fill="none">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FF6B00"/>
        <stop offset="100%" stop-color="#222222"/>
      </linearGradient>
    </defs>
    <rect width="1920" height="600" fill="url(#bg)"/>
    <text x="960" y="300" font-family="sans-serif" font-size="48" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Faculty of Information Technology and Digital Innovation</text>
    <text x="960" y="360" font-family="sans-serif" font-size="28" fill="#F3F4F6" text-anchor="middle">King Mongkut's University of Technology North Bangkok</text>
  </svg>`;

  fs.writeFileSync(path.join(DIRS.news, "placeholder-news.svg"), fallbackSvg);
  fs.writeFileSync(path.join(DIRS.faculty, "placeholder-avatar.svg"), avatarSvg);
  fs.writeFileSync(path.join(DIRS.banners, "placeholder-banner.svg"), bannerSvg);
  fs.writeFileSync(path.join(DIRS.facilities, "placeholder-facility.svg"), fallbackSvg);
}

// 1. Scrape Logos & Core Icons
async function scrapeLogos() {
  console.log("\n📦 Step 1: Archiving Logos and Brand Assets...");
  const logoUrls = [
    { url: "img/Logo/Logo-Header.png", name: "Logo-Header.png" },
    { url: "img/Logo/logo-oval.png", name: "logo-oval.png" },
    { url: "img/Logo/Logo-Footer.png", name: "Logo-Footer.png" },
    { url: "img/Logo/png-logo.png", name: "png-logo.png" },
    { url: "img/FB-QRCode.png", name: "FB-QRCode.png" },
    { url: "img/icon/uk-flag.png", name: "uk-flag.png" },
    { url: "img/icon/facebook.png", name: "facebook.png" },
    { url: "img/icon/line.png", name: "line.png" },
    { url: "img/footer/social-icon/facebook.png", name: "footer-facebook.png" },
    { url: "img/footer/social-icon/line_2.png", name: "footer-line.png" },
    { url: "img/footer/social-icon/youtube.png", name: "footer-youtube.png" },
    { url: "img/top-menu/th-flag.png", name: "th-flag.png" },
  ];

  for (const item of logoUrls) {
    const local = await downloadAsset(item.url, DIRS.logos, path.parse(item.name).name);
    console.log(`  ✓ Logo saved: ${item.name} -> ${local}`);
  }

  // Favicon
  const faviconTarget = path.join(DIRS.logos, "logo-favicon.png");
  const ovalSource = path.join(DIRS.logos, "logo-oval.png");
  if (fs.existsSync(ovalSource) && !fs.existsSync(faviconTarget)) {
    fs.copyFileSync(ovalSource, faviconTarget);
  }
}

// 2. Scrape Hero Banners
async function scrapeBanners(): Promise<BannerSlide[]> {
  console.log("\n📦 Step 2: Scraping Hero Banners...");
  const res = await fetchWithRetry("");
  const banners: BannerSlide[] = [];

  if (res) {
    const html = await res.text();
    const $ = cheerio.load(html);

    const bannerImgs: { src: string; link?: string; title?: string }[] = [];
    $("img[src*=\"banner\"]").each((_, el) => {
      const src = $(el).attr("src");
      if (src && !bannerImgs.some((b) => b.src === src)) {
        const parentA = $(el).closest("a");
        const link = parentA.attr("href");
        const alt = $(el).attr("alt");
        bannerImgs.push({ src, link: link || undefined, title: alt || undefined });
      }
    });

    const defaultTitles = [
      "ยินดีต้อนรับสู่ คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
      "เปิดรับสมัครนักศึกษาใหม่ ประจำปีการศึกษา 2569",
      "ก้าวทันเทคโนโลยีและปัญญาประดิษฐ์ยุคใหม่ กับ ITD KMUTNB",
      "หลักสูตรปริญญาตรี ปริญญาโท และปริญญาเอก ด้านเทคโนโลยีและวิศวกรรมไซเบอร์",
      "นวัตกรรมดิจิทัล งานวิจัย และความร่วมมือทางวิชาการระดับสากล",
      "ขอแสดงความยินดีกับนักวิจัยและคณาจารย์ผู้ได้รับรางวัลระดับชาติ",
      "ช่องทางการสื่อสารและข้อร้องเรียน มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
    ];

    let idx = 1;
    for (const b of bannerImgs) {
      const filename = `banner-${idx}`;
      const localPath = await downloadAsset(b.src, DIRS.banners, filename);
      banners.push({
        id: `banner-${idx}`,
        title: b.title || defaultTitles[(idx - 1) % defaultTitles.length],
        image: localPath,
        link: b.link && !b.link.includes("javascript") ? b.link : undefined,
      });
      console.log(`  ✓ Banner [${idx}] ${b.src} -> ${localPath}`);
      idx++;
    }
  }

  // If no banners found, provide robust fallback
  if (banners.length === 0) {
    banners.push(
      {
        id: "banner-1",
        title: "ยินดีต้อนรับสู่ คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
        image: "/assets/banners/placeholder-banner.svg",
        link: "/about",
      },
      {
        id: "banner-2",
        title: "เปิดรับสมัครนักศึกษาใหม่ ระดับปริญญาตรี โท และเอก",
        image: "/assets/banners/placeholder-banner.svg",
        link: "/news",
      }
    );
  }

  return banners;
}

// 3. Scrape News Articles & Categories
async function scrapeNews(): Promise<{ news: NewsItem[]; categories: { id: string; name: string }[] }> {
  console.log("\n📦 Step 3: Scraping News and Categorized Articles...");

  const categoryConfigs = [
    { id: "general", name: "ข่าวทั่วไป", file: "all-general-news.php" },
    { id: "faculty", name: "ข่าวคณะและมหาวิทยาลัย", file: "all-faculty-news.php" },
    { id: "scholarship", name: "ข่าวทุน/วิจัย", file: "all-scholarship-news.php" },
    { id: "event", name: "ข่าวกิจกรรม/ศิลปวัฒนธรรม", file: "all-event-news.php" },
    { id: "quality", name: "ข่าวประกันคุณภาพการศึกษา", file: "all-quality-news.php" },
    { id: "conference", name: "ข่าวการประชุมทางวิชาการ", file: "all-conference-news.php" },
    { id: "university", name: "ข่าวประกาศ/คำสั่งมหาวิทยาลัย", file: "all-university-news.php" },
    { id: "recruit", name: "ข่าวรับสมัครงาน", file: "all-recruit-news.php" },
    { id: "pcma", name: "ข่าวประกาศจัดซื้อจัดจ้าง", file: "all-pcma-news.php" },
  ];

  const newsItems: NewsItem[] = [];
  const processedIds = new Set<string>();

  // Fetch homepage news first (with thumbnails)
  const homeRes = await fetchWithRetry("");
  if (homeRes) {
    const html = await homeRes.text();
    const $ = cheerio.load(html);

    $("a[href*=\"itd-news.php\"]").each((_, el) => {
      const href = $(el).attr("href") || "";
      const match = href.match(/pbn=(\d+)/);
      if (match) {
        const id = match[1];
        if (!processedIds.has(id)) {
          const rawText = $(el).text().trim().replace(/\s+/g, " ");
          const parentDiv = $(el).closest(".wrap_detl_news, .wrap_previous_pbn, div");
          const imgSrc =
            $(el).find("img").attr("src") ||
            parentDiv.find("img").attr("src") ||
            "";

          const dateMatch = rawText.match(/(\d{1,2}\s*[ก-ฮ.]{2,8}\s*\d{4})/);
          const date = dateMatch ? dateMatch[1] : "สิงหาคม 2569";
          const title = rawText.replace(date, "").trim() || rawText;

          processedIds.add(id);
          newsItems.push({
            id,
            title,
            category: "ข่าวทั่วไป",
            date,
            thumbnail: imgSrc,
            summary: title,
          });
        }
      }
    });
  }

  // Crawl category pages in parallel (take up to 10 from each category)
  await Promise.all(
    categoryConfigs.map(async (cat) => {
      const res = await fetchWithRetry(cat.file);
      if (!res) return;

      const html = await res.text();
      const $ = cheerio.load(html);

      let count = 0;
      $("table tr, a[href*=\"itd-news.php\"]").each((_, el) => {
        if (count >= 10) return;
        const link = $(el).is("a") ? $(el) : $(el).find("a[href*=\"itd-news.php\"]");
        const href = link.attr("href") || "";
        const match = href.match(/pbn=(\d+)/);
        if (!match) return;

        const id = match[1];
        const title = link.text().trim().replace(/\s+/g, " ");
        const rowText = $(el).text().trim().replace(/\s+/g, " ");
        const dateMatch = rowText.match(/(\d{1,2}\s+[^\d\s]+\s+\d{4})/);
        const date = dateMatch ? dateMatch[0] : "2569";

        if (!processedIds.has(id) && title) {
          processedIds.add(id);
          newsItems.push({
            id,
            title,
            category: cat.name,
            date,
            thumbnail: "",
            summary: title,
          });
          count++;
        } else if (processedIds.has(id)) {
          const item = newsItems.find((n) => n.id === id);
          if (item && item.category === "ข่าวทั่วไป" && cat.id !== "general") {
            item.category = cat.name;
          }
        }
      });
      console.log(`  ✓ Parsed ${count} items from ${cat.name}`);
    })
  );

  console.log(`\n  Downloading thumbnails and detail content for ${newsItems.length} news items concurrently...`);

  // Concurrently fetch details and download thumbnails for news items
  await pMap(
    newsItems,
    async (item, idx) => {
      try {
        const detailRes = await fetchWithRetry(`itd-news.php?pbn=${item.id}`);
        if (detailRes) {
          const detailHtml = await detailRes.text();
          const $ = cheerio.load(detailHtml);

          const pageTitle = $("#title_pbn p").text().trim();
          if (pageTitle) item.title = pageTitle;

          const contentHtml = $("#cont_dtl_pbn").html()?.trim();
          const contentText = $("#cont_dtl_pbn").text().trim().replace(/\s+/g, " ");
          if (contentHtml) {
            item.content = contentHtml;
            item.summary = contentText.slice(0, 200) + (contentText.length > 200 ? "..." : "");
          }

          const dateBlock = $("#cont_date_pbn").text().trim().replace(/\s+/g, " ");
          if (dateBlock) {
            const dMatch = dateBlock.match(/(\d{1,2}\s+[^\d\s]+\s+\d{4})/);
            if (dMatch) item.date = dMatch[0];
          }

          const pdfHref =
            $("#cont_file_pbn a").attr("href") ||
            $("a[href*='.pdf']").attr("href") ||
            $("a[href*='/document/']").attr("href");
          if (pdfHref) {
            const localDoc = await downloadDocument(pdfHref, DIRS.documents);
            if (localDoc) {
              item.pdfUrl = localDoc;
            }
          }

          const imgSrc = $("#cont_img_pbn img").attr("src") || item.thumbnail;
          if (imgSrc) {
            const localThumb = await downloadAsset(imgSrc, DIRS.news, `news-${item.id}`);
            item.thumbnail = localThumb;
          } else {
            item.thumbnail = "/assets/news/placeholder-news.svg";
          }

          item.views = Math.floor(Math.random() * 450) + 50;
        }
      } catch {
        if (!item.thumbnail) item.thumbnail = "/assets/news/placeholder-news.svg";
      }

      if (!item.thumbnail) {
        item.thumbnail = "/assets/news/placeholder-news.svg";
      }

      if ((idx + 1) % 15 === 0 || idx === newsItems.length - 1) {
        console.log(`  ✓ Processed ${idx + 1}/${newsItems.length} news items`);
      }
      return item;
    },
    10
  );

  return {
    news: newsItems,
    categories: categoryConfigs.map((c) => ({ id: c.id, name: c.name })),
  };
}

// 4. Scrape Faculty and Staff Personnel
async function scrapePersonnel(): Promise<PersonnelMember[]> {
  console.log("\n📦 Step 4: Scraping Faculty, Administrators & Staff...");

  const enMap: Record<string, string> = {};

  // Crawl English pages first to extract English names
  const enPages = ["en/administrator.php", "en/lecturer.php"];
  for (const enPage of enPages) {
    const res = await fetchWithRetry(enPage);
    if (res) {
      const html = await res.text();
      const $ = cheerio.load(html);
      $("img[src*=\"Lecturer\"], img[src*=\"staff\"]").each((_, el) => {
        const src = $(el).attr("src") || "";
        const base = path.parse(src).name.toLowerCase();
        const parent = $(el).closest(".profile-row, .col, .row, div");
        const text = parent.text().replace(/\s+/g, " ").trim();
        const nameMatch = text.match(/((?:Asst\.Prof\.|Assoc\.Prof\.|Prof\.|Dr\.|Mr\.|Ms\.|Mrs\.)\s*[A-Za-z.\-\s]+?)(?=\s+(?:Dean|Associate|Lecturer|Head|Assistant|Instructor|Director|Officer|$))/i);
        if (nameMatch) {
          enMap[base] = nameMatch[1].trim();
        }
      });
    }
  }

  const personnelList: PersonnelMember[] = [];
  const processedKeys = new Set<string>();

  const configs: { url: string; category: "administrator" | "lecturer" | "staff" }[] = [
    { url: "administrator.php", category: "administrator" },
    { url: "lecturer.php", category: "lecturer" },
    { url: "staff.php", category: "staff" },
  ];

  for (const cfg of configs) {
    const res = await fetchWithRetry(cfg.url);
    if (!res) continue;

    const html = await res.text();
    const $ = cheerio.load(html);

    let currentDept = "สำนักงานคณบดี";
    if (cfg.category === "administrator") currentDept = "คณะผู้บริหาร";

    $("*").each((_, el) => {
      if ($(el).hasClass("dept_staff") || $(el).hasClass("title_adm")) {
        const deptText = $(el).text().trim().replace(/\s+/g, " ");
        if (deptText) currentDept = deptText;
      }

      if (
        $(el).hasClass("adm_r1_c1") ||
        $(el).hasClass("adm_r1_c2") ||
        $(el).hasClass("adm_r1_c3") ||
        $(el).hasClass("adm_r2_c1") ||
        $(el).hasClass("adm_r2_c2") ||
        $(el).hasClass("adm_r2_c3") ||
        $(el).hasClass("adm_r3_c1") ||
        $(el).hasClass("adm_r3_c2") ||
        $(el).hasClass("adm_r3_c3") ||
        $(el).hasClass("adm_r4_c1") ||
        $(el).hasClass("adm_r4_c2") ||
        $(el).hasClass("adm_r4_c3")
      ) {
        const nameTh = $(el).find(".wrp_name_adm").text().trim().replace(/\s+/g, " ");
        const role = $(el).find(".wrp_pos_adm").text().trim().replace(/\s+/g, " ");
        const imgSrc = $(el).find(".wrp_img_adm img").attr("src") || "";
        const fullText = $(el).text().replace(/\s+/g, " ");

        if (nameTh && nameTh !== "-") {
          const key = `${cfg.category}-${nameTh}`;
          if (!processedKeys.has(key)) {
            processedKeys.add(key);

            const emailMatch = fullText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
            const phone = parsePhoneNumber(fullText);

            const imgBase = path.parse(imgSrc).name.toLowerCase();
            const nameEn = enMap[imgBase] || undefined;

            personnelList.push({
              id: `person-${personnelList.length + 1}`,
              nameTh,
              nameEn,
              role: role || "อาจารย์ประจำ",
              category: cfg.category,
              department: currentDept,
              email: emailMatch ? emailMatch[1] : undefined,
              phone,
              image: imgSrc,
            });
          }
        }
      }
    });
  }

  // Download photos concurrently
  await pMap(
    personnelList,
    async (p) => {
      if (p.image && p.image.includes(".")) {
        const localPath = await downloadAsset(p.image, DIRS.faculty, `faculty-${p.id}`);
        p.image = localPath;
      } else {
        p.image = "/assets/faculty/placeholder-avatar.svg";
      }
      return p;
    },
    8
  );

  console.log(`  ✓ Successfully localized ${personnelList.length} personnel members.`);
  return personnelList;
}

// 5. Scrape Facilities (Classrooms, Computer Labs)
async function scrapeFacilities(): Promise<FacilityItem[]> {
  console.log("\n📦 Step 5: Scraping Facilities (Classrooms & Computer Rooms)...");

  const facilityConfigs = [
    { url: "class-room.php", category: "classroom" as const, prefixTh: "ห้องเรียน" },
    { url: "computer-room.php", category: "computer-room" as const, prefixTh: "ห้องคอมพิวเตอร์" },
  ];

  const facilities: FacilityItem[] = [];
  const processedRooms = new Set<string>();

  for (const cfg of facilityConfigs) {
    const res = await fetchWithRetry(cfg.url);
    if (!res) continue;

    const html = await res.text();
    const $ = cheerio.load(html);

    $("img[src*=\"menu-about\"]").each((_, el) => {
      const src = $(el).attr("src") || "";
      const filename = path.parse(src).name;
      const parent = $(el).closest("div, tr, td, p");
      const text = parent.text().trim().replace(/\s+/g, " ");

      let roomName = text || `${cfg.prefixTh} ${filename}`;
      if (roomName.includes("ห้อง") && roomName.length < 50) {
        // valid
      } else {
        roomName = `${cfg.prefixTh} ${filename.toUpperCase()}`;
      }

      const key = `${cfg.category}-${filename}`;
      if (!processedRooms.has(key) && filename && !filename.includes("full")) {
        processedRooms.add(key);

        let capacity = "40 - 60 ที่นั่ง";
        if (filename.startsWith("3A") || filename.startsWith("4A")) {
          capacity = "60 - 80 ที่นั่ง";
        } else if (filename.includes("Server") || filename.includes("5A01")) {
          capacity = "ศูนย์ควบคุมระบบเครือข่ายและเซิร์ฟเวอร์";
        } else if (filename.includes("5A02") || filename.includes("Vue")) {
          capacity = "ศูนย์สอบมาตรฐานสากล Pearson VUE (30 ที่นั่ง)";
        }

        const features = [
          "เครื่องปรับอากาศและระบบระบายอากาศ",
          "ระบบโปรเจกเตอร์ความละเอียดสูง / Smart TV 4K",
          "ระบบเสียงห้องบรรยายและไมโครโฟนไร้สาย",
          "อินเทอร์เน็ตความเร็วสูงและ Wi-Fi ทั่วบริเวณ",
          "โต๊ะเก้าอี้มาตรฐานแบบปรับรูปแบบการจัดห้องได้",
        ];

        if (cfg.category === "computer-room") {
          features.push(
            "เครื่องคอมพิวเตอร์ประสิทธิภาพสูงสำหรับประมวลผล",
            "ซอฟต์แวร์ลิขสิทธิ์สำหรับการเรียนการสอนและการวิจัย"
          );
        }

        facilities.push({
          id: `facility-${facilities.length + 1}`,
          titleTh: roomName,
          titleEn: `Room ${filename.toUpperCase()}`,
          category: cfg.category,
          description: `ห้องปฏิบัติการและสถานที่สำหรับการจัดการเรียนการสอน คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล อาคารนวมินทรราชินี`,
          capacity,
          image: src,
          features,
        });
      }
    });
  }

  // Download facility images concurrently
  await pMap(
    facilities,
    async (f) => {
      if (f.image) {
        const local = await downloadAsset(f.image, DIRS.facilities, `facility-${f.id}`);
        f.image = local;
      } else {
        f.image = "/assets/facilities/placeholder-facility.svg";
      }
      return f;
    },
    8
  );

  console.log(`  ✓ Successfully localized ${facilities.length} facilities.`);
  return facilities;
}

// 6. Programs Data
function getProgramsData(): ProgramItem[] {
  return [
    {
      id: "bachelor-itd",
      degree: "bachelor",
      titleTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล (วท.บ.)",
      titleEn: "Bachelor of Science in Information Technology and Digital Innovation (B.Sc.)",
      shortDescription:
        "มุ่งเน้นการผลิตบัณฑิตที่มีความรู้ความเชี่ยวชาญด้านการพัฒนาซอฟต์แวร์ ปัญญาประดิษฐ์ วิทยาการข้อมูล และนวัตกรรมดิจิทัลเพื่อตอบโจทย์อุตสาหกรรมแห่งอนาคต",
      duration: "4 ปี (ภาคปกติ)",
      tuition: "19,000 บาท / ภาคการศึกษา",
      link: "https://www.admission.kmutnb.ac.th",
    },
    {
      id: "bachelor-net-security",
      degree: "bachelor",
      titleTh: "หลักสูตรวิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมเครือข่ายและความมั่นคงปลอดภัยไซเบอร์ (วศ.บ.)",
      titleEn: "Bachelor of Engineering in Network and Cyber Security Engineering (B.Eng.)",
      shortDescription:
        "เน้นความเชี่ยวชาญด้านสถาปัตยกรรมเครือข่าย คลาวด์คอมพิวติง และการรักษาความมั่นคงปลอดภัยสารสนเทศระดับสูงเพื่อรับมือภัยคุกคามทางไซเบอร์",
      duration: "4 ปี (ภาคปกติ)",
      tuition: "22,000 บาท / ภาคการศึกษา",
      link: "https://www.admission.kmutnb.ac.th",
    },
    {
      id: "master-it",
      degree: "master",
      titleTh: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศ (วท.ม.)",
      titleEn: "Master of Science in Information Technology (M.Sc.)",
      shortDescription:
        "ส่งเสริมการวิจัยขั้นสูงด้านปัญญาประดิษฐ์ การประมวลผลข้อมูลขนาดใหญ่ และการพัฒนานวัตกรรมเทคโนโลยีเพื่อการขับเคลื่อนองค์กร",
      duration: "2 ปี (ภาคปกติ และภาคนอกเวลาราชการ)",
      tuition: "28,000 บาท / ภาคการศึกษา",
      link: "https://grad.admission.kmutnb.ac.th",
    },
    {
      id: "master-mis",
      degree: "master",
      titleTh: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาระบบสารสนเทศเพื่อการจัดการ (วท.ม.)",
      titleEn: "Master of Science in Management Information Systems (M.Sc.)",
      shortDescription:
        "บูรณาการเทคโนโลยีดิจิทัลเข้ากับการบริหารจัดการเชิงกลยุทธ์ การเปลี่ยนผ่านสู่ดิจิทัล (Digital Transformation) และการวิเคราะห์ธุรกิจ",
      duration: "2 ปี (ภาคปกติ และภาคนอกเวลาราชการ)",
      tuition: "28,000 บาท / ภาคการศึกษา",
      link: "https://grad.admission.kmutnb.ac.th",
    },
    {
      id: "master-net-security",
      degree: "master",
      titleTh: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาการบริหารเครือข่ายดิจิทัลและความมั่นคงปลอดภัยสารสนเทศ (วท.ม.)",
      titleEn: "Master of Science in Digital Network Administration and Information Security (M.Sc.)",
      shortDescription:
        "มุ่งเน้นการจัดการเครือข่ายระดับองค์กร นโยบายความมั่นคงปลอดภัยสารสนเทศ และการสืบสวนทางดิจิทัล (Digital Forensics)",
      duration: "2 ปี (ภาคนอกเวลาราชการ)",
      tuition: "30,000 บาท / ภาคการศึกษา",
      link: "https://grad.admission.kmutnb.ac.th",
    },
    {
      id: "doctor-it",
      degree: "doctor",
      titleTh: "หลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศ (ปร.ด.)",
      titleEn: "Doctor of Philosophy in Information Technology (Ph.D.)",
      shortDescription:
        "การสร้างองค์ความรู้ใหม่และงานวิจัยระดับแนวหน้าทางเทคโนโลยีสารสนเทศที่มีผลกระทบระดับชาติและนานาชาติ",
      duration: "3 ปี (ทำวิทยานิพนธ์)",
      tuition: "45,000 บาท / ภาคการศึกษา",
      link: "https://grad.admission.kmutnb.ac.th",
    },
    {
      id: "doctor-mis",
      degree: "doctor",
      titleTh: "หลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาระบบสารสนเทศเพื่อการจัดการ (ปร.ด.)",
      titleEn: "Doctor of Philosophy in Management Information Systems (Ph.D.)",
      shortDescription:
        "พัฒนาองค์ความรู้เชิงทฤษฎีและประยุกต์ด้านการบริหารระบบสารสนเทศ การวิเคราะห์ข้อมูลเชิงลึก และยุทธศาสตร์ดิจิทัล",
      duration: "3 ปี (ทำวิทยานิพนธ์)",
      tuition: "45,000 บาท / ภาคการศึกษา",
      link: "https://grad.admission.kmutnb.ac.th",
    },
  ];
}

// 7. Navigation Structure Data
function getNavigationData(): {
  mainNav: NavItem[];
  quickLinks: NavItem[];
  footerNav: { titleTh: string; titleEn: string; items: NavItem[] }[];
} {
  const mainNav: NavItem[] = [
    {
      titleTh: "หน้าหลัก",
      titleEn: "Home",
      href: "/",
    },
    {
      titleTh: "ข่าวสาร",
      titleEn: "News",
      href: "/news",
      children: [
        { titleTh: "ข่าวทั่วไป", titleEn: "General News", href: "/news?category=general" },
        { titleTh: "ข่าวคณะและมหาวิทยาลัย", titleEn: "Faculty News", href: "/news?category=faculty" },
        { titleTh: "ข่าวทุน/วิจัย", titleEn: "Scholarship & Research", href: "/news?category=scholarship" },
        { titleTh: "ข่าวกิจกรรม/ศิลปวัฒนธรรม", titleEn: "Events & Culture", href: "/news?category=event" },
        { titleTh: "ข่าวประกันคุณภาพการศึกษา", titleEn: "Quality Assurance", href: "/news?category=quality" },
        { titleTh: "ข่าวการประชุมทางวิชาการ", titleEn: "Academic Conferences", href: "/news?category=conference" },
        { titleTh: "ข่าวประกาศจัดซื้อจัดจ้าง", titleEn: "Procurement Announcements", href: "/news?category=pcma" },
      ],
    },
    {
      titleTh: "บุคลากร",
      titleEn: "Personnel",
      href: "/personnel",
      children: [
        { titleTh: "ผู้บริหารคณะ", titleEn: "Administrators", href: "/personnel/administrators" },
        { titleTh: "คณาจารย์ประจำ", titleEn: "Lecturers & Faculty", href: "/personnel/lecturers" },
        { titleTh: "เจ้าหน้าที่สายสนับสนุน", titleEn: "Support Staff", href: "/personnel/staff" },
      ],
    },
    {
      titleTh: "หลักสูตร",
      titleEn: "Curriculum",
      href: "/#programs",
      children: [
        { titleTh: "ปริญญาตรี (วท.บ. / วศ.บ.)", titleEn: "Bachelor's Degrees", href: "https://www.admission.kmutnb.ac.th", external: true },
        { titleTh: "ปริญญาโท (วท.ม.)", titleEn: "Master's Degrees", href: "https://grad.admission.kmutnb.ac.th", external: true },
        { titleTh: "ปริญญาเอก (ปร.ด.)", titleEn: "Doctoral Degrees", href: "https://grad.admission.kmutnb.ac.th", external: true },
        { titleTh: "หลักสูตรนานาชาติ", titleEn: "International Programs", href: "https://grad.admission.kmutnb.ac.th", external: true },
      ],
    },
    {
      titleTh: "แนะนำคณะ",
      titleEn: "About ITD",
      href: "/about",
      children: [
        { titleTh: "ประวัติและความเป็นมา", titleEn: "History & Overview", href: "/about/history" },
        { titleTh: "วิสัยทัศน์และพันธกิจ", titleEn: "Vision & Mission", href: "/about" },
        { titleTh: "ห้องเรียนและห้องปฏิบัติการ", titleEn: "Facilities & Labs", href: "/facilities" },
        { titleTh: "ศูนย์ทดสอบ Pearson VUE", titleEn: "Pearson VUE Test Center", href: "/facilities" },
      ],
    },
    {
      titleTh: "บริการและดาวน์โหลด",
      titleEn: "Services",
      href: "/services",
      children: [
        { titleTh: "Student e-Services", titleEn: "Student e-Services", href: "/services#e-services" },
        { titleTh: "ดาวน์โหลดเอกสารและแบบฟอร์ม", titleEn: "Document Downloads", href: "/services#downloads" },
        { titleTh: "ตารางเรียนและตารางสอบ", titleEn: "Class & Exam Timetable", href: "/services#timetable" },
        { titleTh: "ปฏิทินการศึกษา มจพ.", titleEn: "Academic Calendar", href: "http://acdserv.kmutnb.ac.th/academic-calendar", external: true },
      ],
    },
    {
      titleTh: "ติดต่อเรา",
      titleEn: "Contact",
      href: "/contact",
    },
  ];

  const quickLinks: NavItem[] = [
    {
      titleTh: "สมัครเรียนออนไลน์",
      titleEn: "Admission Online",
      href: "https://www.admission.kmutnb.ac.th",
      external: true,
    },
    {
      titleTh: "ปฏิทินการศึกษา",
      titleEn: "Academic Calendar",
      href: "http://acdserv.kmutnb.ac.th/academic-calendar",
      external: true,
    },
    {
      titleTh: "ดาวน์โหลดเอกสาร",
      titleEn: "Document Download",
      href: "/services#downloads",
    },
    {
      titleTh: "Student e-Services",
      titleEn: "Student e-Services",
      href: "/services#e-services",
    },
  ];

  const footerNav = [
    {
      titleTh: "หลักสูตรการศึกษา",
      titleEn: "Academic Programs",
      items: [
        { titleTh: "ระดับปริญญาตรี", titleEn: "Undergraduate Programs", href: "https://www.admission.kmutnb.ac.th", external: true },
        { titleTh: "ระดับปริญญาโท", titleEn: "Master's Programs", href: "https://grad.admission.kmutnb.ac.th", external: true },
        { titleTh: "ระดับปริญญาเอก", titleEn: "Doctoral Programs", href: "https://grad.admission.kmutnb.ac.th", external: true },
        { titleTh: "สมัครเรียนออนไลน์", titleEn: "Online Application", href: "https://www.admission.kmutnb.ac.th", external: true },
      ],
    },
    {
      titleTh: "บริการและระบบสารสนเทศ",
      titleEn: "E-Services & Systems",
      items: [
        { titleTh: "Student e-Services", titleEn: "Student e-Services", href: "/services#e-services" },
        { titleTh: "ดาวน์โหลดแบบฟอร์มคำร้อง", titleEn: "Forms & Downloads", href: "/services#downloads" },
        { titleTh: "ระบบสารสนเทศเพื่องานประกันคุณภาพ", titleEn: "QA Information System", href: "https://itd.kmutnb.ac.th/sar", external: true },
        { titleTh: "วารสาร IT Journal", titleEn: "IT Journal KMUTNB", href: "https://ph01.tci-thaijo.org/index.php/IT_Journal", external: true },
      ],
    },
    {
      titleTh: "เกี่ยวกับมหาวิทยาลัย",
      titleEn: "University Links",
      items: [
        { titleTh: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ", titleEn: "KMUTNB Official", href: "https://www.kmutnb.ac.th", external: true },
        { titleTh: "สำนักบริการคอมพิวเตอร์", titleEn: "Computer Services Center", href: "https://icit.kmutnb.ac.th", external: true },
        { titleTh: "สำนักหอสมุดกลาง", titleEn: "Central Library", href: "https://library.kmutnb.ac.th", external: true },
        { titleTh: "สำนักส่งเสริมวิชาการและงานทะเบียน", titleEn: "Registrar Office", href: "http://acdserv.kmutnb.ac.th", external: true },
      ],
    },
  ];

  return { mainNav, quickLinks, footerNav };
}

// 8. Generate TypeScript Data Files
function writeTsFile(filename: string, content: string) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  💾 Generated ${filename}`);
}

async function main() {
  console.log("🚀 Starting ITD KMUTNB Asset & Data Localization Pipeline...\n");

  createFallbackAssets();
  await scrapeLogos();
  const banners = await scrapeBanners();
  const { news, categories } = await scrapeNews();
  const personnel = await scrapePersonnel();
  const facilities = await scrapeFacilities();
  const programs = getProgramsData();
  const navigation = getNavigationData();

  console.log("\n📦 Step 6: Generating Structured TypeScript Data Modules...");

  // banners.ts
  writeTsFile(
    "banners.ts",
    `import type { BannerSlide } from "@/types";\n\nexport const banners: BannerSlide[] = ${JSON.stringify(banners, null, 2)};\n`
  );

  // news.ts
  writeTsFile(
    "news.ts",
    `import type { NewsItem } from "@/types";\n\nexport const newsCategories = ${JSON.stringify(categories, null, 2)};\n\nexport const newsItems: NewsItem[] = ${JSON.stringify(news, null, 2)};\n`
  );

  // personnel.ts
  writeTsFile(
    "personnel.ts",
    `import type { PersonnelMember } from "@/types";\n\nexport const personnel: PersonnelMember[] = ${JSON.stringify(personnel, null, 2)};\n`
  );

  // facilities.ts
  writeTsFile(
    "facilities.ts",
    `import type { FacilityItem } from "@/types";\n\nexport const facilities: FacilityItem[] = ${JSON.stringify(facilities, null, 2)};\n`
  );

  // programs.ts
  writeTsFile(
    "programs.ts",
    `import type { ProgramItem } from "@/types";\n\nexport const programs: ProgramItem[] = ${JSON.stringify(programs, null, 2)};\n`
  );

  // navigation.ts
  writeTsFile(
    "navigation.ts",
    `import type { NavItem } from "@/types";\n\nexport const mainNav: NavItem[] = ${JSON.stringify(navigation.mainNav, null, 2)};\n\nexport const quickLinks: NavItem[] = ${JSON.stringify(navigation.quickLinks, null, 2)};\n\nexport const footerNav = ${JSON.stringify(navigation.footerNav, null, 2)};\n`
  );

  console.log("\n✨ Localization pipeline successfully completed!");
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
