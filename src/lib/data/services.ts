export interface EServiceItem {
  id: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  category: "student" | "staff" | "general" | "academic";
  iconName: string;
  url: string;
  isExternal: boolean;
  tagTh?: string;
  tagEn?: string;
  badgeColor?: string;
}

export interface DownloadItem {
  id: string;
  titleTh: string;
  titleEn: string;
  category: "form-undergrad" | "form-grad" | "timetable" | "handbook" | "faculty-staff";
  fileType: "PDF" | "DOCX" | "XLSX" | "ZIP";
  fileSize: string;
  updatedDate: string;
  downloadUrl: string;
  downloadsCount?: number;
  descriptionTh?: string;
  descriptionEn?: string;
}

export const serviceCategories = [
  { id: "all", nameTh: "บริการทั้งหมด", nameEn: "All Services" },
  { id: "student", nameTh: "สำหรับนักศึกษา", nameEn: "For Students" },
  { id: "staff", nameTh: "สำหรับบุคลากร", nameEn: "For Faculty & Staff" },
  { id: "academic", nameTh: "วิชาการและการวิจัย", nameEn: "Academic & Research" },
  { id: "general", nameTh: "บุคคลทั่วไป / บริการสาธารณะ", nameEn: "Public & General" },
];

export const eServices: EServiceItem[] = [
  {
    id: "reg-kmutnb",
    titleTh: "ระบบบริการการศึกษาและทะเบียน (REG KMUTNB)",
    titleEn: "Student Registration System (REG KMUTNB)",
    descriptionTh: "ลงทะเบียนเรียน ตรวจสอบผลการเรียน (GPA) ตารางเรียน ตารางสอบ และประวัตินักศึกษา",
    descriptionEn: "Course enrollment, GPA/grade checking, class and examination schedules, student records.",
    category: "student",
    iconName: "GraduationCap",
    url: "https://klogic.kmutnb.ac.th",
    isExternal: true,
    tagTh: "ระบบหลัก",
    tagEn: "Core Portal",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    id: "admission-kmutnb",
    titleTh: "ระบบรับสมัครนักศึกษาใหม่ (K-Admission)",
    titleEn: "Admission Online System (K-Admission)",
    descriptionTh: "สมัครเข้าศึกษาต่อระดับปริญญาตรี ปริญญาโท และปริญญาเอก คณะ ITD มจพ.",
    descriptionEn: "Apply online for Undergraduate, Master's, and Doctoral degree admissions.",
    category: "general",
    iconName: "UserPlus",
    url: "https://www.admission.kmutnb.ac.th",
    isExternal: true,
    tagTh: "เปิดรับสมัคร",
    tagEn: "Admissions Open",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    id: "icit-account",
    titleTh: "ระบบจัดการบัญชีผู้ใช้งาน ICIT Account",
    titleEn: "ICIT Account Self-Service Portal",
    descriptionTh: "เปิดใช้งานบัญชีผู้ใช้ จัดการรหัสผ่าน กู้คืนรหัสผ่าน และตั้งค่าการยืนยันตัวตน 2 ขั้นตอน (2FA)",
    descriptionEn: "Activate user account, change password, account recovery, and multi-factor authentication (2FA).",
    category: "student",
    iconName: "KeyRound",
    url: "https://account.kmutnb.ac.th",
    isExternal: true,
    tagTh: "ความปลอดภัย",
    tagEn: "Identity",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200"
  },
  {
    id: "microsoft-365",
    titleTh: "Microsoft 365 for KMUTNB",
    titleEn: "Microsoft 365 for Education",
    descriptionTh: "ใช้งาน Microsoft Teams, Outlook, Word, Excel, PowerPoint และ OneDrive ความจุสูง",
    descriptionEn: "Access Microsoft Teams, Outlook Web Mail, Word, Excel, PowerPoint and 1TB cloud OneDrive.",
    category: "student",
    iconName: "Layers",
    url: "https://portal.office.com",
    isExternal: true,
    tagTh: "ซอฟต์แวร์ลิขสิทธิ์",
    tagEn: "Licensed Apps",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  {
    id: "google-workspace",
    titleTh: "Google Workspace for Education",
    titleEn: "Google Workspace for Education",
    descriptionTh: "ใช้งานอีเมลสถาบัน @kmutnb.ac.th, Google Classroom, Google Drive และ Google Meet",
    descriptionEn: "Access institutional email (@kmutnb.ac.th), Google Classroom, Google Drive, and Meet.",
    category: "student",
    iconName: "Mail",
    url: "https://mail.google.com",
    isExternal: true,
    tagTh: "อีเมลมหาวิทยาลัย",
    tagEn: "Webmail",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200"
  },
  {
    id: "vpn-kmutnb",
    titleTh: "ระบบเครือข่ายเสมือนส่วนตัว (KMUTNB VPN)",
    titleEn: "KMUTNB Secure VPN Service",
    descriptionTh: "เชื่อมต่อเครือข่ายอินทราเน็ตของมหาวิทยาลัยจากภายนอกเพื่อสืบค้นฐานข้อมูลงานวิจัยและระบบภายใน",
    descriptionEn: "Securely connect to university intranet from home to access academic databases and internal services.",
    category: "staff",
    iconName: "ShieldCheck",
    url: "https://vpn.kmutnb.ac.th",
    isExternal: true,
    tagTh: "เครือข่าย",
    tagEn: "Network",
    badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200"
  },
  {
    id: "library-database",
    titleTh: "สืบค้นฐานข้อมูลวิชาการ สำนักหอสมุดกลาง",
    titleEn: "Central Library Academic Databases",
    descriptionTh: "สืบค้นฐานข้อมูลงานวิจัยระดับโลก IEEE Xplore, ACM Digital Library, ScienceDirect, Scopus",
    descriptionEn: "Search world-class academic research libraries: IEEE Xplore, ACM Digital Library, ScienceDirect.",
    category: "academic",
    iconName: "BookOpen",
    url: "https://library.kmutnb.ac.th",
    isExternal: true,
    tagTh: "ฐานข้อมูลวิจัย",
    tagEn: "Research",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    id: "pearson-vue",
    titleTh: "ศูนย์ทดสอบมาตรฐานสากล Pearson VUE",
    titleEn: "Pearson VUE Authorized Test Center",
    descriptionTh: "ศูนย์สอบใบรับรองสากลด้าน IT (Cisco, CompTIA, Microsoft, AWS, Oracle, Linux) ห้อง 5A02 อาคาร 79",
    descriptionEn: "Authorized test center for international IT certifications (Cisco, AWS, Microsoft, CompTIA) Room 5A02.",
    category: "general",
    iconName: "Award",
    url: "/facilities",
    isExternal: false,
    tagTh: "ศูนย์สอบสากล",
    tagEn: "Cert Center",
    badgeColor: "bg-orange-50 text-brand-orange border-orange-200"
  },
  {
    id: "it-journal",
    titleTh: "วารสารวิทยาการและเทคโนโลยีสารสนเทศ (IT Journal)",
    titleEn: "Information Technology Journal KMUTNB (TCI Tier 1)",
    descriptionTh: "วารสารวิชาการระดับชาติในฐานข้อมูล TCI กลุ่มที่ 1 เผยแพร่ผลงานวิจัยด้านเทคโนโลยีสารสนเทศ",
    descriptionEn: "National academic peer-reviewed journal indexed in TCI Tier 1 for IT and digital research.",
    category: "academic",
    iconName: "FileText",
    url: "https://ph01.tci-thaijo.org/index.php/IT_Journal",
    isExternal: true,
    tagTh: "TCI กลุ่ม 1",
    tagEn: "TCI Tier 1",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200"
  },
  {
    id: "qa-sar",
    titleTh: "ระบบสารสนเทศเพื่องานประกันคุณภาพการศึกษา (QA/SAR)",
    titleEn: "Quality Assurance & SAR Information System",
    descriptionTh: "ระบบรายงานผลการดำเนินงานและการประกันคุณภาพการศึกษาตามเกณฑ์ AUN-QA และ EdPEx",
    descriptionEn: "Quality assurance evaluation and institutional self-assessment reporting system (AUN-QA & EdPEx).",
    category: "staff",
    iconName: "CheckCircle2",
    url: "https://itd.kmutnb.ac.th/sar",
    isExternal: true,
    tagTh: "ประกันคุณภาพ",
    tagEn: "QA System",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    id: "lab-booking",
    titleTh: "ระบบจองห้องปฏิบัติการและห้องบรรยาย",
    titleEn: "ITD Lab & Classroom Reservation",
    descriptionTh: "ยื่นคำขอจองห้องเรียน ห้องคอมพิวเตอร์ และอุปกรณ์โสตทัศนูปกรณ์ อาคารนวมินทรราชินี",
    descriptionEn: "Online reservation system for classrooms, computer labs, and audio-visual gear in Building 79.",
    category: "staff",
    iconName: "CalendarDays",
    url: "/facilities",
    isExternal: false,
    tagTh: "จองห้อง",
    tagEn: "Reservation",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200"
  },
  {
    id: "helpdesk",
    titleTh: "ศูนย์บริการช่วยเหลือด้านเทคโนโลยี (ITD Helpdesk)",
    titleEn: "ITD Technical Helpdesk & Support",
    descriptionTh: "แจ้งปัญหาการใช้งานห้องปฏิบัติการ ระบบเครือข่าย ซอฟต์แวร์ และคอมพิวเตอร์",
    descriptionEn: "Technical support ticket submission for classroom facilities, network issues, and software licensing.",
    category: "student",
    iconName: "Headphones",
    url: "/contact",
    isExternal: false,
    tagTh: "ช่วยเหลือ 24/7",
    tagEn: "Helpdesk",
    badgeColor: "bg-violet-50 text-violet-700 border-violet-200"
  }
];

export const downloadCategories = [
  { id: "all", nameTh: "เอกสารทั้งหมด", nameEn: "All Documents" },
  { id: "form-undergrad", nameTh: "แบบฟอร์มปริญญาตรี", nameEn: "Undergraduate Forms" },
  { id: "form-grad", nameTh: "แบบฟอร์มบัณฑิตศึกษา", nameEn: "Graduate School Forms" },
  { id: "timetable", nameTh: "ตารางสอนและตารางสอบ", nameEn: "Timetables & Schedules" },
  { id: "handbook", nameTh: "คู่มือนักศึกษาและหลักสูตร", nameEn: "Handbooks & Curriculum" },
  { id: "faculty-staff", nameTh: "แบบฟอร์มสำหรับบุคลากร", nameEn: "Faculty & Staff Forms" }
];

export const downloadDocuments: DownloadItem[] = [
  {
    id: "doc-ug-add-drop",
    titleTh: "คำร้องขอเพิ่ม-ถอนรายวิชา และลงทะเบียนเรียนล่าช้า (บภ.01)",
    titleEn: "Course Add/Drop & Late Registration Request Form (BP.01)",
    category: "form-undergrad",
    fileType: "PDF",
    fileSize: "245 KB",
    updatedDate: "15 ก.ค. 2567",
    downloadUrl: "#download",
    downloadsCount: 1420,
    descriptionTh: "สำหรับนักศึกษาปริญญาตรีที่ต้องการขอเพิ่มหรือถอนรายวิชาหลังจากพ้นกำหนดการลงทะเบียนปกติ",
    descriptionEn: "For undergraduate students requesting course add/drop after the regular enrollment period."
  },
  {
    id: "doc-ug-tuition-defer",
    titleTh: "คำร้องขอผ่อนผันการชำระเงินค่าธรรมเนียมการศึกษา",
    titleEn: "Tuition Fee Deferral & Installment Request Form",
    category: "form-undergrad",
    fileType: "PDF",
    fileSize: "185 KB",
    updatedDate: "10 มิ.ย. 2567",
    downloadUrl: "#download",
    downloadsCount: 860,
    descriptionTh: "แบบฟอร์มยื่นขอผ่อนผันการชำระเงินค่าเล่าเรียนและค่าธรรมเนียมการศึกษาประจำภาคเรียน",
    descriptionEn: "Request form for deferring or installment payment of semester tuition fees."
  },
  {
    id: "doc-ug-general-request",
    titleTh: "คำร้องทั่วไป คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล",
    titleEn: "General Petition Request Form - ITD KMUTNB",
    category: "form-undergrad",
    fileType: "PDF",
    fileSize: "160 KB",
    updatedDate: "01 ส.ค. 2567",
    downloadUrl: "#download",
    downloadsCount: 2310,
    descriptionTh: "สำหรับยื่นคำร้องต่อคณบดีในกรณีต่างๆ เช่น ขอลาพักการศึกษา ขอคืนสภาพนักศึกษา ขอเปิดรายวิชาพิเศษ",
    descriptionEn: "General petition to the Dean for leave of absence, reinstatement, special course requests."
  },
  {
    id: "doc-ug-credit-transfer",
    titleTh: "คำร้องขอเทียบโอนผลการเรียนและรายวิชาสะสม",
    titleEn: "Course Equivalency & Credit Transfer Application Form",
    category: "form-undergrad",
    fileType: "PDF",
    fileSize: "320 KB",
    updatedDate: "20 พ.ค. 2567",
    downloadUrl: "#download",
    downloadsCount: 540,
    descriptionTh: "สำหรับนักศึกษาเข้าใหม่หรือโอนย้ายที่ประสงค์ขอเทียบโอนหน่วยกิตจากสถาบันเดิม",
    descriptionEn: "For new or transfer students seeking credit recognition from prior accredited institutions."
  },
  {
    id: "doc-grad-thesis-proposal",
    titleTh: "แบบเสนอขออนุมัติหัวข้อและเค้าโครงวิทยานิพนธ์ (ระดับปริญญาโท-เอก)",
    titleEn: "Thesis / Dissertation Proposal Approval Form (Master & Ph.D.)",
    category: "form-grad",
    fileType: "DOCX",
    fileSize: "410 KB",
    updatedDate: "05 ส.ค. 2567",
    downloadUrl: "#download",
    downloadsCount: 620,
    descriptionTh: "แบบฟอร์มสำหรับนักศึกษาระดับบัณฑิตศึกษาเพื่อเสนอหัวข้อและโครงร่างวิทยานิพนธ์ต่อคณะกรรมการ",
    descriptionEn: "Official proposal template for graduate students submitting thesis topic for committee approval."
  },
  {
    id: "doc-grad-qualifying-exam",
    titleTh: "คำร้องขอสอบวัดคุณสมบัติ / สอบประมวลความรู้ (Qualifying / Comprehensive Exam)",
    titleEn: "Qualifying & Comprehensive Examination Request Form",
    category: "form-grad",
    fileType: "PDF",
    fileSize: "210 KB",
    updatedDate: "12 ก.ค. 2567",
    downloadUrl: "#download",
    downloadsCount: 390,
    descriptionTh: "แบบฟอร์มขอลงทะเบียนและกำหนดวันสอบประมวลความรู้สำหรับนักศึกษาปริญญาเอกและปริญญาโท",
    descriptionEn: "Registration application for comprehensive and qualifying examinations in graduate programs."
  },
  {
    id: "doc-grad-progress-report",
    titleTh: "แบบรายงานความก้าวหน้าการทำวิทยานิพนธ์รายภาคการศึกษา",
    titleEn: "Semester Thesis Progress Evaluation Report Form",
    category: "form-grad",
    fileType: "DOCX",
    fileSize: "285 KB",
    updatedDate: "18 ม.ค. 2567",
    downloadUrl: "#download",
    downloadsCount: 480,
    descriptionTh: "แบบฟอร์มบันทึกความก้าวหน้าร่วมกับอาจารย์ที่ปรึกษาวิทยานิพนธ์ประจำภาคการศึกษา",
    descriptionEn: "Semester progress assessment report required for all thesis-enrolled graduate candidates."
  },
  {
    id: "doc-timetable-term1-2567",
    titleTh: "ตารางสอนและตารางเรียน ภาคการศึกษาที่ 1/2567 (ทุกหลักสูตร)",
    titleEn: "Class Schedule & Room Assignment - Semester 1/2024",
    category: "timetable",
    fileType: "PDF",
    fileSize: "1.4 MB",
    updatedDate: "28 มิ.ย. 2567",
    downloadUrl: "#download",
    downloadsCount: 3450,
    descriptionTh: "ตารางสอนระดับปริญญาตรีและบัณฑิตศึกษา ภาคการศึกษาที่ 1 อาคาร 79 นวมินทรราชินี",
    descriptionEn: "Comprehensive lecture and lab timetable for Undergraduate and Graduate programs (Building 79)."
  },
  {
    id: "doc-timetable-term2-2567",
    titleTh: "ตารางสอนและตารางเรียน ภาคการศึกษาที่ 2/2567 (ทุกหลักสูตร)",
    titleEn: "Class Schedule & Room Assignment - Semester 2/2024",
    category: "timetable",
    fileType: "PDF",
    fileSize: "1.5 MB",
    updatedDate: "15 พ.ย. 2567",
    downloadUrl: "#download",
    downloadsCount: 2980,
    descriptionTh: "ตารางสอนระดับปริญญาตรีและบัณฑิตศึกษา ภาคการศึกษาที่ 2 คณะ ITD มจพ.",
    descriptionEn: "Semester 2 lecture, computer lab assignments, and lecturer consultation timetables."
  },
  {
    id: "doc-exam-schedule",
    titleTh: "ตารางสอบกลางภาคและปลายภาค ประจำปีการศึกษา 2567",
    titleEn: "Midterm & Final Examination Timetable Academic Year 2024",
    category: "timetable",
    fileType: "PDF",
    fileSize: "890 KB",
    updatedDate: "20 ส.ค. 2567",
    downloadUrl: "#download",
    downloadsCount: 4120,
    descriptionTh: "ระเบียบและตารางเวลาการสอบกลางภาค-ปลายภาค รายวิชาคณะและรายวิชาศึกษาทั่วไป",
    descriptionEn: "Midterm and final exam schedules, room seat allocations, and examination hall regulations."
  },
  {
    id: "doc-handbook-freshman-2567",
    titleTh: "คู่มือนักศึกษาใหม่และแนวทางการศึกษา คณะ ITD ประจำปีการศึกษา 2567",
    titleEn: "ITD KMUTNB Freshman Student Handbook 2024",
    category: "handbook",
    fileType: "PDF",
    fileSize: "4.8 MB",
    updatedDate: "01 มิ.ย. 2567",
    downloadUrl: "#download",
    downloadsCount: 1890,
    descriptionTh: "รวบรวมข้อมูลหลักสูตร กฎระเบียบวินัย แผนการเรียน สวัสดิการนักศึกษา และทุนการศึกษา",
    descriptionEn: "Complete guide to curriculum roadmaps, academic regulations, scholarships, and campus facilities."
  },
  {
    id: "doc-curriculum-bsc-itd",
    titleTh: "เล่มหลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล (ฉบับปรับปรุง 2566)",
    titleEn: "Curriculum Specification: B.Sc. in IT and Digital Innovation (Rev. 2023)",
    category: "handbook",
    fileType: "PDF",
    fileSize: "2.1 MB",
    updatedDate: "10 มี.ค. 2567",
    downloadUrl: "#download",
    downloadsCount: 1250,
    descriptionTh: "โครงสร้างหลักสูตร คำอธิบายรายวิชา แผนการศึกษา 4 ปี และเกณฑ์การสำเร็จการศึกษา",
    descriptionEn: "Curriculum structure, course descriptions, 4-year degree plan, and graduation requirements."
  },
  {
    id: "doc-curriculum-beng-netsec",
    titleTh: "เล่มหลักสูตรวิศวกรรมศาสตรบัณฑิต สาขาวิศวกรรมเครือข่ายและความมั่นคงปลอดภัยไซเบอร์ (ฉบับปรับปรุง 2566)",
    titleEn: "Curriculum Specification: B.Eng. in Network & Cyber Security Engineering",
    category: "handbook",
    fileType: "PDF",
    fileSize: "2.3 MB",
    updatedDate: "10 มี.ค. 2567",
    downloadUrl: "#download",
    downloadsCount: 1180,
    descriptionTh: "โครงสร้างวิศวกรรมศาสตรบัณฑิต แผนการศึกษาและวิชาเลือกเฉพาะทางด้านไซเบอร์ซีเคียวริตี้",
    descriptionEn: "B.Eng. engineering curriculum structure, laboratory prerequisites, and cybersecurity tracks."
  },
  {
    id: "doc-staff-lab-reservation",
    titleTh: "แบบฟอร์มขออนุมัติใช้ห้องปฏิบัติการคอมพิวเตอร์และโสตทัศนูปกรณ์นอกเวลาราชการ",
    titleEn: "After-Hours Laboratory & Audio-Visual Equipment Usage Form",
    category: "faculty-staff",
    fileType: "PDF",
    fileSize: "195 KB",
    updatedDate: "14 ก.พ. 2567",
    downloadUrl: "#download",
    downloadsCount: 430,
    descriptionTh: "สำหรับอาจารย์และเจ้าหน้าที่ยื่นขอใช้งานห้องคอมพิวเตอร์และห้องบรรยายในวันหยุดหรือนอกเวลา",
    descriptionEn: "Application form for weekend or after-hours computer lab access and AV equipment support."
  },
  {
    id: "doc-staff-research-grant",
    titleTh: "แบบเสนอโครงการวิจัยเพื่อขอรับทุนสนับสนุนงานวิจัย คณะ ITD",
    titleEn: "Faculty Research Grant Application & Project Proposal Form",
    category: "faculty-staff",
    fileType: "DOCX",
    fileSize: "350 KB",
    updatedDate: "02 ก.พ. 2567",
    downloadUrl: "#download",
    downloadsCount: 310,
    descriptionTh: "แบบเสนอขอรับทุนสนับสนุนงานวิจัยพื้นฐาน ทุนวิจัยนวัตกรรม และการตีพิมพ์บทความวิชาการระดับนานาชาติ",
    descriptionEn: "Research grant proposal for basic science, digital innovation projects, and international publication funding."
  }
];
