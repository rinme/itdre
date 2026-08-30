import type { PersonnelMember } from "@/types";

export interface PersonnelCategoryInfo {
  id: "all" | "administrator" | "lecturer" | "staff";
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  href: string;
  iconName: string;
}

export const PERSONNEL_CATEGORIES: PersonnelCategoryInfo[] = [
  {
    id: "all",
    nameTh: "บุคลากรทั้งหมด",
    nameEn: "All Personnel",
    descriptionTh: "คณาจารย์ บุคลากร และผู้บริหารคณะ ITD มจพ. ทั้งหมด",
    descriptionEn: "All faculty members, researchers, staff, and leadership team",
    href: "/personnel",
    iconName: "Users",
  },
  {
    id: "administrator",
    nameTh: "ผู้บริหารคณะ",
    nameEn: "Administrators",
    descriptionTh: "คณะผู้บริหาร คณบดี รองคณบดี และหัวหน้าภาควิชา",
    descriptionEn: "Executive leadership, Dean, Associate Deans, and Department Heads",
    href: "/personnel/administrators",
    iconName: "Award",
  },
  {
    id: "lecturer",
    nameTh: "คณาจารย์ประจำ",
    nameEn: "Lecturers & Faculty",
    descriptionTh: "อาจารย์ประจำและนักวิจัยประจำแต่ละภาควิชา",
    descriptionEn: "Academic professors, associate professors, assistant professors, and lecturers",
    href: "/personnel/lecturers",
    iconName: "GraduationCap",
  },
  {
    id: "staff",
    nameTh: "เจ้าหน้าที่สายสนับสนุน",
    nameEn: "Support Staff",
    descriptionTh: "บุคลากรสายสนับสนุนวิชาการและงานบริหารสำนักงาน",
    descriptionEn: "Administrative support officers and technical staff across all divisions",
    href: "/personnel/staff",
    iconName: "Briefcase",
  },
];

export interface DepartmentInfo {
  id: string;
  nameTh: string;
  nameEn: string;
  shortNameEn: string;
  category: "academic" | "administrative" | "executive";
  descriptionTh?: string;
  descriptionEn?: string;
}

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: "exec",
    nameTh: "คณะผู้บริหาร",
    nameEn: "Executive Board",
    shortNameEn: "Executive",
    category: "executive",
    descriptionTh: "ผู้บริหารระดับคณะ คณบดี รองคณบดี และหัวหน้าหน่วยงาน",
    descriptionEn: "Faculty leadership and executive administration",
  },
  {
    id: "it",
    nameTh: "ภาควิชาเทคโนโลยีสารสนเทศ",
    nameEn: "Department of Information Technology",
    shortNameEn: "IT Dept",
    category: "academic",
    descriptionTh: "จัดการเรียนการสอนและการวิจัยด้านเทคโนโลยีสารสนเทศ การพัฒนาซอฟต์แวร์ และวิทยาการข้อมูล",
    descriptionEn: "Teaching and research in Information Technology, Software Development, and Data Science",
  },
  {
    id: "itm",
    nameTh: "ภาควิชาการจัดการเทคโนโลยีสารสนเทศ",
    nameEn: "Department of Information Technology Management",
    shortNameEn: "ITM Dept",
    category: "academic",
    descriptionTh: "จัดการเรียนการสอนและการวิจัยด้านการจัดการเทคโนโลยี นวัตกรรมดิจิทัล และธุรกิจเทคโนโลยี",
    descriptionEn: "Teaching and research in Technology Management, Digital Innovation, and Tech Business",
  },
  {
    id: "dnet",
    nameTh: "ภาควิชาการบริหารเครือข่ายดิจิทัลและความมั่นคงปลอดภัยสารสนเทศ",
    nameEn: "Department of Digital Network and Information Security Management",
    shortNameEn: "DNet Dept",
    category: "academic",
    descriptionTh: "จัดการเรียนการสอนและการวิจัยด้านระบบเครือข่าย คลาวด์ และความมั่นคงปลอดภัยไซเบอร์",
    descriptionEn: "Teaching and research in Network Systems, Cloud Computing, and Cybersecurity",
  },
  {
    id: "admin",
    nameTh: "งานบริหารและธุรการ",
    nameEn: "Administration & General Affairs Division",
    shortNameEn: "Admin & General",
    category: "administrative",
    descriptionTh: "งานธุรการ สารบรรณ และการบริหารงานทั่วไปประจำคณะ",
    descriptionEn: "General administration, documentation, and office coordination",
  },
  {
    id: "finance",
    nameTh: "งานคลังและพัสดุ",
    nameEn: "Finance & Procurement Division",
    shortNameEn: "Finance & Supplies",
    category: "administrative",
    descriptionTh: "งานการเงิน การบัญชี งบประมาณ และการจัดซื้อจัดจ้างพัสดุ",
    descriptionEn: "Finance, accounting, budget management, and procurement supplies",
  },
  {
    id: "policy",
    nameTh: "งานนโยบายและแผน",
    nameEn: "Policy & Planning Division",
    shortNameEn: "Policy & Plan",
    category: "administrative",
    descriptionTh: "งานยุทธศาสตร์ แผนงาน และการติดตามประเมินผล",
    descriptionEn: "Strategic planning, faculty initiatives, and performance monitoring",
  },
  {
    id: "academic-services",
    nameTh: "งานบริการการศึกษา",
    nameEn: "Academic Services Division",
    shortNameEn: "Academic Services",
    category: "administrative",
    descriptionTh: "งานทะเบียน กิจการนักศึกษา ตารางเรียนตารางสอบ และวิเทศสัมพันธ์",
    descriptionEn: "Registrar services, student affairs, class schedules, and international relations",
  },
  {
    id: "computer-network",
    nameTh: "งานสารสนเทศและระบบเครือข่ายคอมพิวเตอร์",
    nameEn: "Information Systems & Computer Network Division",
    shortNameEn: "IT & Network",
    category: "administrative",
    descriptionTh: "งานดูแลระบบแม่ข่าย เครือข่ายสารสนเทศ ห้องปฏิบัติการ และบริการดิจิทัล",
    descriptionEn: "Server maintenance, campus network infrastructure, computer labs, and digital services",
  },
  {
    id: "research",
    nameTh: "งานวิจัยและพัฒนา",
    nameEn: "Research & Development Division",
    shortNameEn: "Research & Dev",
    category: "administrative",
    descriptionTh: "งานส่งเสริมการวิจัย นวัตกรรม และความร่วมมือทางวิชาการ",
    descriptionEn: "Research facilitation, technological innovation, and academic partnerships",
  },
  {
    id: "student-affairs",
    nameTh: "งานกิจการนักศึกษา",
    nameEn: "Student Affairs Division",
    shortNameEn: "Student Affairs",
    category: "administrative",
    descriptionTh: "งานพัฒนานักศึกษา ทุนการศึกษา กิจกรรมเสริมหลักสูตร และศิษย์เก่า",
    descriptionEn: "Student development, scholarship coordination, extracurricular activities, and alumni relations",
  },
];

// Department lookup helper
export function getDepartmentName(deptNameTh: string | undefined, language: "th" | "en"): string {
  if (!deptNameTh) return "";
  if (language === "th") return deptNameTh;
  const dept = DEPARTMENTS.find((d) => d.nameTh === deptNameTh);
  return dept ? dept.nameEn : deptNameTh;
}

// Role translation mapping
const ROLE_TRANSLATIONS: Record<string, string> = {
  "คณบดีคณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล": "Dean of Faculty of Information Technology and Digital Innovation",
  "รองคณบดีฝ่ายบริหาร": "Associate Dean for Administrative Affairs",
  "รองคณบดีฝ่ายวิชาการและวิจัย": "Associate Dean for Academic and Research Affairs",
  "รองคณบดีฝ่ายกิจการนักศึกษาและประกันคุณภาพการศึกษา": "Associate Dean for Student Affairs and Quality Assurance",
  "หัวหน้าภาควิชาเทคโนโลยีสารสนเทศ": "Head of Department of Information Technology",
  "หัวหน้าภาควิชาการจัดการเทคโนโลยีสารสนเทศ": "Head of Department of Information Technology Management",
  "หัวหน้าภาควิชาการบริหารเครือข่ายดิจิทัลและความมั่นคงปลอดภัยสารสนเทศ": "Head of Department of Digital Network and Information Security Management",
  "หัวหน้าสำนักงานคณบดี": "Head of Dean's Office",
  "อาจารย์ประจำ": "Lecturer / Faculty Member",
  "เจ้าหน้าที่บริหารงานทั่วไป": "General Administration Officer",
  "นักวิชาการศึกษา": "Educational Services Officer",
  "พนักงานบริการ": "Service Staff",
  "นักวิชาการเงินและบัญชี": "Finance and Accounting Officer",
  "นักวิชาการพัสดุ": "Procurement and Supply Officer",
  "นักวิเคราะห์นโยบายและแผน": "Policy and Plan Analyst",
  "นักวิเทศสัมพันธ์": "International Relations Officer",
  "นักวิชาการคอมพิวเตอร์": "Computer Systems Officer",
};

export function getRoleName(roleTh: string, language: "th" | "en"): string {
  if (language === "th") return roleTh;
  return ROLE_TRANSLATIONS[roleTh] || roleTh;
}

// English name mapping for faculty & staff
const ENGLISH_NAMES: Record<string, string> = {
  "person-1": "Asst. Prof. Dr. Sunantha Sodsee",
  "person-2": "Asst. Prof. Dr. Sucha Smanchat",
  "person-3": "Asst. Prof. Dr. Sakchai Tangwannawit",
  "person-4": "Dr. Kanchana Viriyaphan",
  "person-5": "Asst. Prof. Dr. Pudsadee Boonrawd",
  "person-6": "Assoc. Prof. Dr. Mahasak Ketcham",
  "person-7": "Asst. Prof. Dr. Pongsarun Boonyopakorn",
  "person-8": "Ms. Thanichanan Boonsawang",
  "person-9": "Asst. Prof. Dr. Pudsadee Boonrawd",
  "person-10": "Asst. Prof. Dr. Maleerat Maliyam",
  "person-11": "Ajarn Tongpool Heebthaisong",
  "person-12": "Assoc. Prof. Dr. Nalinpat Bumpenpian",
  "person-13": "Asst. Prof. Dr. Sucha Smanchat",
  "person-14": "Asst. Prof. Dr. Siranee Nuchitprasitchai",
  "person-15": "Ajarn Akkarat Boonyaphalanun",
  "person-16": "Dr. Kanchana Viriyaphan",
  "person-17": "Asst. Prof. Dr. Nathaporn Utakrit",
  "person-18": "Assoc. Prof. Dr. Mahasak Ketcham",
  "person-19": "Asst. Prof. Dr. Sakchai Tangwannawit",
  "person-20": "Asst. Prof. Dr. Montean Rattanasiriwongwut",
  "person-21": "Assoc. Prof. Dr. Phayung Meesad",
  "person-22": "Asst. Prof. Dr. Nattavee Utakrit",
  "person-23": "Asst. Prof. Dr. Tanapon Jensuttivechkull",
  "person-24": "Asst. Prof. Dr. Watchareewan Jitsakul",
  "person-25": "Prof. Dr. Pallop Piriyasurawong",
  "person-26": "Prof. Dr. Prachyanun Nilsook",
  "person-27": "Prof. Dr. Panita Wannapiroon",
  "person-28": "Dr. Junjiraporn Thongprasert",
  "person-29": "Asst. Prof. Dr. Pongsarun Boonyopakorn",
  "person-30": "Asst. Prof. Dr. Nawaporn Wisitpongphan",
  "person-31": "Asst. Prof. Dr. Sunantha Sodsee",
  "person-32": "Asst. Prof. Dr. Jeerasak Nampradit",
  "person-33": "Dr. Thanawat Dechahirannawat",
  "person-34": "Dr. Chalerm Klinkhamhom",
  "person-35": "Ms. Thanichanan Boonsawang",
  "person-36": "Ms. Natnarin Chantrathit",
  "person-37": "Ms. Valailuk Puntai",
  "person-38": "Ms. Gochapan Sookma",
  "person-39": "Mrs. Naree Kanuruk",
  "person-40": "Ms. Cholticha Thomyotha",
  "person-41": "Ms. Suchanat Saengsuwan",
  "person-42": "Ms. Ontima Mekphat",
  "person-43": "Ms. Chanadda Harnchana",
  "person-44": "Ms. Masaras Rerksantiwong",
  "person-45": "Ms. Tayaporn Toomsook",
  "person-46": "Ms. Natcha Sangwalnthong",
  "person-47": "Mr. Thanakorn Phonphakdee",
  "person-48": "Ms. Piyakamol Leelakhajornjit",
  "person-49": "Ms. Doungkamon Somdej",
  "person-50": "Ms. Phatcharee Yaiyindee",
  "person-51": "Mrs. Attiyaporn Kaewngam",
  "person-52": "Mr. Patipat Pookdam",
  "person-53": "Mr. Phuwadit Nopchinwong",
  "person-54": "Mr. Phudit Kruewan",
  "person-55": "Ms. Pornpimon Faithete",
  "person-56": "Ms. Natnicha Thammachot",
};

export function getPersonName(person: PersonnelMember, language: "th" | "en"): string {
  if (language === "th") return person.nameTh;
  if (person.nameEn) return person.nameEn;
  return ENGLISH_NAMES[person.id] || person.nameTh;
}

export function getPersonEnglishName(person: PersonnelMember): string | undefined {
  return person.nameEn || ENGLISH_NAMES[person.id];
}

// Category badge styling
export function getCategoryBadgeStyle(category: PersonnelMember["category"]) {
  switch (category) {
    case "administrator":
      return {
        bg: "bg-orange-50",
        text: "text-brand-orange",
        border: "border-orange-200",
        solidBg: "bg-brand-orange",
        labelTh: "ผู้บริหารคณะ",
        labelEn: "Administrator",
      };
    case "lecturer":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        solidBg: "bg-blue-600",
        labelTh: "คณาจารย์ประจำ",
        labelEn: "Lecturer",
      };
    case "staff":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        solidBg: "bg-emerald-600",
        labelTh: "สายสนับสนุน",
        labelEn: "Support Staff",
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        solidBg: "bg-gray-600",
        labelTh: "บุคลากร",
        labelEn: "Personnel",
      };
  }
}
