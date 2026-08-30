import type { NewsItem } from "@/types";

export interface CategoryInfo {
  id: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  color: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    dot: string;
  };
}

export const CATEGORY_LIST: CategoryInfo[] = [
  {
    id: "all",
    nameTh: "ทั้งหมด",
    nameEn: "All News",
    descriptionTh: "ข่าวสารและประกาศทั้งหมดของคณะ",
    descriptionEn: "All news and announcements from ITD KMUTNB",
    color: {
      bg: "bg-orange-50",
      text: "text-brand-orange",
      border: "border-orange-200",
      badgeBg: "bg-brand-orange text-white",
      dot: "bg-brand-orange",
    },
  },
  {
    id: "general",
    nameTh: "ข่าวทั่วไป",
    nameEn: "General News",
    descriptionTh: "ข่าวประชาสัมพันธ์ทั่วไป ข้อมูล และสาระน่ารู้",
    descriptionEn: "General announcements, public information, and updates",
    color: {
      bg: "bg-orange-50",
      text: "text-brand-orange",
      border: "border-orange-200",
      badgeBg: "bg-orange-600 text-white",
      dot: "bg-brand-orange",
    },
  },
  {
    id: "faculty",
    nameTh: "ข่าวคณะและมหาวิทยาลัย",
    nameEn: "Faculty & KMUTNB",
    descriptionTh: "ข่าวสารความเคลื่อนไหวภายในคณะและมหาวิทยาลัย",
    descriptionEn: "Official news and happenings from the faculty and university",
    color: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      badgeBg: "bg-blue-600 text-white",
      dot: "bg-blue-600",
    },
  },
  {
    id: "scholarship",
    nameTh: "ข่าวทุน/วิจัย",
    nameEn: "Scholarships & Research",
    descriptionTh: "ทุนการศึกษา ทุนสนับสนุนงานวิจัย และโอกาสพัฒนาทางวิชาการ",
    descriptionEn: "Scholarships, research grants, and academic opportunities",
    color: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      badgeBg: "bg-emerald-600 text-white",
      dot: "bg-emerald-600",
    },
  },
  {
    id: "event",
    nameTh: "ข่าวกิจกรรม/ศิลปวัฒนธรรม",
    nameEn: "Events & Culture",
    descriptionTh: "กิจกรรมนักศึกษา งานศิลปวัฒนธรรม และสัมมนา",
    descriptionEn: "Student events, cultural activities, workshops, and seminars",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      badgeBg: "bg-purple-600 text-white",
      dot: "bg-purple-600",
    },
  },
  {
    id: "quality",
    nameTh: "ข่าวประกันคุณภาพการศึกษา",
    nameEn: "Quality Assurance",
    descriptionTh: "การประกันคุณภาพการศึกษาและมาตรฐานหลักสูตร",
    descriptionEn: "Educational quality assurance and academic standard updates",
    color: {
      bg: "bg-teal-50",
      text: "text-teal-700",
      border: "border-teal-200",
      badgeBg: "bg-teal-600 text-white",
      dot: "bg-teal-600",
    },
  },
  {
    id: "conference",
    nameTh: "ข่าวการประชุมทางวิชาการ",
    nameEn: "Conferences & Symposia",
    descriptionTh: "การประชุมวิชาการ งานประชุมระดับชาติและนานาชาติ",
    descriptionEn: "National and international academic conferences and call for papers",
    color: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      badgeBg: "bg-indigo-600 text-white",
      dot: "bg-indigo-600",
    },
  },
  {
    id: "university",
    nameTh: "ข่าวประกาศ/คำสั่งมหาวิทยาลัย",
    nameEn: "University Directives",
    descriptionTh: "ประกาศ ระเบียบ และคำสั่งจากทางมหาวิทยาลัย",
    descriptionEn: "Official KMUTNB university directives, orders, and policies",
    color: {
      bg: "bg-sky-50",
      text: "text-sky-700",
      border: "border-sky-200",
      badgeBg: "bg-sky-600 text-white",
      dot: "bg-sky-600",
    },
  },
  {
    id: "recruit",
    nameTh: "ข่าวรับสมัครงาน",
    nameEn: "Job Recruitment",
    descriptionTh: "การรับสมัครอาจารย์ บุคลากร และตำแหน่งงานว่าง",
    descriptionEn: "Faculty positions, staff openings, and recruitment notices",
    color: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      badgeBg: "bg-amber-600 text-white",
      dot: "bg-amber-600",
    },
  },
  {
    id: "pcma",
    nameTh: "ข่าวประกาศจัดซื้อจัดจ้าง",
    nameEn: "Procurement & Bidding",
    descriptionTh: "ประกาศจัดซื้อจัดจ้าง ร่าง TOR และราคากลาง",
    descriptionEn: "Procurement notices, TOR bidding, and price estimations",
    color: {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200",
      badgeBg: "bg-slate-700 text-white",
      dot: "bg-slate-600",
    },
  },
];

const THAI_MONTH_TO_INDEX: Record<string, number> = {
  "ม.ค.": 0,
  "ก.พ.": 1,
  "มี.ค.": 2,
  "เม.ย.": 3,
  "พ.ค.": 4,
  "มิ.ย.": 5,
  "ก.ค.": 6,
  "ส.ค.": 7,
  "ก.ย.": 8,
  "ต.ค.": 9,
  "พ.ย.": 10,
  "ธ.ค.": 11,
};

const ENGLISH_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function parseThaiDateToTimestamp(dateStr: string): number {
  if (!dateStr) return 0;
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10) || 1;
    const monthStr = parts[1];
    const yearBE = parseInt(parts[2], 10) || 2569;
    const month = THAI_MONTH_TO_INDEX[monthStr] !== undefined ? THAI_MONTH_TO_INDEX[monthStr] : 0;
    const yearAD = yearBE > 2400 ? yearBE - 543 : yearBE;
    return new Date(yearAD, month, day).getTime();
  }
  return 0;
}

export function formatNewsDate(dateStr: string, language: "th" | "en"): string {
  if (!dateStr) return "";
  if (language === "th") return dateStr;

  const parts = dateStr.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parts[0];
    const monthIndex = THAI_MONTH_TO_INDEX[parts[1]];
    const yearBE = parseInt(parts[2], 10);
    const yearAD = yearBE > 2400 ? yearBE - 543 : yearBE;
    const monthEn = monthIndex !== undefined ? ENGLISH_MONTHS[monthIndex] : parts[1];
    return `${day} ${monthEn} ${yearAD}`;
  }
  return dateStr;
}

export function getCategoryById(id: string): CategoryInfo | undefined {
  return CATEGORY_LIST.find((c) => c.id === id);
}

export function getCategoryByName(nameTh: string): CategoryInfo | undefined {
  return CATEGORY_LIST.find((c) => c.nameTh === nameTh);
}

export function getCategoryIdByName(nameTh: string): string {
  const found = CATEGORY_LIST.find((c) => c.nameTh === nameTh);
  return found ? found.id : "general";
}

export function getCategoryStyle(categoryName: string) {
  const found = CATEGORY_LIST.find((c) => c.nameTh === categoryName);
  if (found) return found.color;
  return {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    badgeBg: "bg-gray-600 text-white",
    dot: "bg-gray-500",
  };
}
