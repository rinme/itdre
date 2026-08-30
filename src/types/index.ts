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
