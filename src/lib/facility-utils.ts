import type { FacilityItem } from "@/types";

export interface FacilityFilterState {
  category: string;
  floor: string;
  searchQuery: string;
}

export const FACILITY_CATEGORIES = [
  { id: "all", nameTh: "ทุกประเภทสถานที่", nameEn: "All Facilities" },
  { id: "classroom", nameTh: "ห้องบรรยาย / ห้องเรียน", nameEn: "Lecture Classrooms" },
  { id: "computer-room", nameTh: "ห้องปฏิบัติการคอมพิวเตอร์", nameEn: "Computer & Server Labs" }
];

export const FACILITY_FLOORS = [
  { id: "all", nameTh: "ทุกชั้น", nameEn: "All Floors" },
  { id: "3", nameTh: "ชั้น 3", nameEn: "3rd Floor" },
  { id: "4", nameTh: "ชั้น 4", nameEn: "4th Floor" },
  { id: "5", nameTh: "ชั้น 5", nameEn: "5th Floor" },
  { id: "7", nameTh: "ชั้น 7", nameEn: "7th Floor" }
];

/**
 * Extracts floor number from room title (e.g., '3A02' -> 3, '4A05' -> 4, '5A01' -> 5, '7A07' -> 7)
 */
export function getRoomFloor(roomTitle: string): number | null {
  const match = roomTitle.match(/(\d)[A-Za-z]/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Get category badge label in Thai or English
 */
export function getCategoryBadge(category: string, lang: "th" | "en" = "th"): { label: string; color: string } {
  switch (category) {
    case "classroom":
      return {
        label: lang === "en" ? "Lecture Classroom" : "ห้องบรรยาย / สัมมนา",
        color: "bg-blue-50 text-blue-700 border-blue-200"
      };
    case "computer-room":
      return {
        label: lang === "en" ? "Computer Laboratory" : "ห้องปฏิบัติการคอมพิวเตอร์",
        color: "bg-orange-50 text-brand-orange border-orange-200"
      };
    case "lab":
      return {
        label: lang === "en" ? "Specialized Research Lab" : "ห้องปฏิบัติการวิจัยเฉพาะทาง",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200"
      };
    default:
      return {
        label: lang === "en" ? "Facility Room" : "ห้องบริการการศึกษา",
        color: "bg-gray-50 text-gray-700 border-gray-200"
      };
  }
}

/**
 * Filter facilities by category, floor, and search keyword
 */
export function filterFacilities(
  facilities: FacilityItem[],
  filters: FacilityFilterState
): FacilityItem[] {
  return facilities.filter((item) => {
    // Category filter
    if (filters.category !== "all" && item.category !== filters.category) {
      return false;
    }

    // Floor filter
    if (filters.floor !== "all") {
      const roomFloor = getRoomFloor(item.titleTh) || getRoomFloor(item.titleEn);
      if (roomFloor?.toString() !== filters.floor) {
        return false;
      }
    }

    // Search query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      const matchTitleTh = item.titleTh.toLowerCase().includes(q);
      const matchTitleEn = item.titleEn.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCapacity = item.capacity ? item.capacity.toLowerCase().includes(q) : false;
      const matchFeatures = item.features
        ? item.features.some((f) => f.toLowerCase().includes(q))
        : false;

      return matchTitleTh || matchTitleEn || matchDesc || matchCapacity || matchFeatures;
    }

    return true;
  });
}
