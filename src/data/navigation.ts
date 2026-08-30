import type { NavItem } from "@/types";

export const mainNav: NavItem[] = [
  {
    "titleTh": "หน้าหลัก",
    "titleEn": "Home",
    "href": "/"
  },
  {
    "titleTh": "ข่าวสาร",
    "titleEn": "News",
    "href": "/news",
    "children": [
      {
        "titleTh": "ข่าวทั่วไป",
        "titleEn": "General News",
        "href": "/news?category=general"
      },
      {
        "titleTh": "ข่าวคณะและมหาวิทยาลัย",
        "titleEn": "Faculty News",
        "href": "/news?category=faculty"
      },
      {
        "titleTh": "ข่าวทุน/วิจัย",
        "titleEn": "Scholarship & Research",
        "href": "/news?category=scholarship"
      },
      {
        "titleTh": "ข่าวกิจกรรม/ศิลปวัฒนธรรม",
        "titleEn": "Events & Culture",
        "href": "/news?category=event"
      },
      {
        "titleTh": "ข่าวประกันคุณภาพการศึกษา",
        "titleEn": "Quality Assurance",
        "href": "/news?category=quality"
      },
      {
        "titleTh": "ข่าวการประชุมทางวิชาการ",
        "titleEn": "Academic Conferences",
        "href": "/news?category=conference"
      },
      {
        "titleTh": "ข่าวประกาศจัดซื้อจัดจ้าง",
        "titleEn": "Procurement Announcements",
        "href": "/news?category=pcma"
      }
    ]
  },
  {
    "titleTh": "บุคลากร",
    "titleEn": "Personnel",
    "href": "/personnel",
    "children": [
      {
        "titleTh": "ผู้บริหารคณะ",
        "titleEn": "Administrators",
        "href": "/personnel/administrators"
      },
      {
        "titleTh": "คณาจารย์ประจำ",
        "titleEn": "Lecturers & Faculty",
        "href": "/personnel/lecturers"
      },
      {
        "titleTh": "เจ้าหน้าที่สายสนับสนุน",
        "titleEn": "Support Staff",
        "href": "/personnel/staff"
      }
    ]
  },
  {
    "titleTh": "หลักสูตร",
    "titleEn": "Curriculum",
    "href": "/#programs",
    "children": [
      {
        "titleTh": "ปริญญาตรี (วท.บ. / วศ.บ.)",
        "titleEn": "Bachelor's Degrees",
        "href": "https://www.admission.kmutnb.ac.th",
        "external": true
      },
      {
        "titleTh": "ปริญญาโท (วท.ม.)",
        "titleEn": "Master's Degrees",
        "href": "https://grad.admission.kmutnb.ac.th",
        "external": true
      },
      {
        "titleTh": "ปริญญาเอก (ปร.ด.)",
        "titleEn": "Doctoral Degrees",
        "href": "https://grad.admission.kmutnb.ac.th",
        "external": true
      },
      {
        "titleTh": "หลักสูตรนานาชาติ",
        "titleEn": "International Programs",
        "href": "https://grad.admission.kmutnb.ac.th",
        "external": true
      }
    ]
  },
  {
    "titleTh": "แนะนำคณะ",
    "titleEn": "About ITD",
    "href": "/about",
    "children": [
      {
        "titleTh": "ประวัติและความเป็นมา",
        "titleEn": "History & Overview",
        "href": "/about/history"
      },
      {
        "titleTh": "วิสัยทัศน์และพันธกิจ",
        "titleEn": "Vision & Mission",
        "href": "/about"
      },
      {
        "titleTh": "ห้องเรียนและห้องปฏิบัติการ",
        "titleEn": "Facilities & Labs",
        "href": "/facilities"
      },
      {
        "titleTh": "ศูนย์ทดสอบ Pearson VUE",
        "titleEn": "Pearson VUE Test Center",
        "href": "/facilities"
      }
    ]
  },
  {
    "titleTh": "บริการและดาวน์โหลด",
    "titleEn": "Services",
    "href": "/services",
    "children": [
      {
        "titleTh": "Student e-Services",
        "titleEn": "Student e-Services",
        "href": "/services#e-services"
      },
      {
        "titleTh": "ดาวน์โหลดเอกสารและแบบฟอร์ม",
        "titleEn": "Document Downloads",
        "href": "/services#downloads"
      },
      {
        "titleTh": "ตารางเรียนและตารางสอบ",
        "titleEn": "Class & Exam Timetable",
        "href": "/services#timetable"
      },
      {
        "titleTh": "ปฏิทินการศึกษา มจพ.",
        "titleEn": "Academic Calendar",
        "href": "http://acdserv.kmutnb.ac.th/academic-calendar",
        "external": true
      }
    ]
  },
  {
    "titleTh": "ติดต่อเรา",
    "titleEn": "Contact",
    "href": "/contact"
  }
];

export const quickLinks: NavItem[] = [
  {
    "titleTh": "สมัครเรียนออนไลน์",
    "titleEn": "Admission Online",
    "href": "https://www.admission.kmutnb.ac.th",
    "external": true
  },
  {
    "titleTh": "ปฏิทินการศึกษา",
    "titleEn": "Academic Calendar",
    "href": "http://acdserv.kmutnb.ac.th/academic-calendar",
    "external": true
  },
  {
    "titleTh": "ดาวน์โหลดเอกสาร",
    "titleEn": "Document Download",
    "href": "/services#downloads"
  },
  {
    "titleTh": "Student e-Services",
    "titleEn": "Student e-Services",
    "href": "/services#e-services"
  }
];

export const footerNav = [
  {
    "titleTh": "หลักสูตรการศึกษา",
    "titleEn": "Academic Programs",
    "items": [
      {
        "titleTh": "ระดับปริญญาตรี",
        "titleEn": "Undergraduate Programs",
        "href": "https://www.admission.kmutnb.ac.th",
        "external": true
      },
      {
        "titleTh": "ระดับปริญญาโท",
        "titleEn": "Master's Programs",
        "href": "https://grad.admission.kmutnb.ac.th",
        "external": true
      },
      {
        "titleTh": "ระดับปริญญาเอก",
        "titleEn": "Doctoral Programs",
        "href": "https://grad.admission.kmutnb.ac.th",
        "external": true
      },
      {
        "titleTh": "สมัครเรียนออนไลน์",
        "titleEn": "Online Application",
        "href": "https://www.admission.kmutnb.ac.th",
        "external": true
      }
    ]
  },
  {
    "titleTh": "บริการและระบบสารสนเทศ",
    "titleEn": "E-Services & Systems",
    "items": [
      {
        "titleTh": "Student e-Services",
        "titleEn": "Student e-Services",
        "href": "/services#e-services"
      },
      {
        "titleTh": "ดาวน์โหลดแบบฟอร์มคำร้อง",
        "titleEn": "Forms & Downloads",
        "href": "/services#downloads"
      },
      {
        "titleTh": "ระบบสารสนเทศเพื่องานประกันคุณภาพ",
        "titleEn": "QA Information System",
        "href": "https://itd.kmutnb.ac.th/sar",
        "external": true
      },
      {
        "titleTh": "วารสาร IT Journal",
        "titleEn": "IT Journal KMUTNB",
        "href": "https://ph01.tci-thaijo.org/index.php/IT_Journal",
        "external": true
      }
    ]
  },
  {
    "titleTh": "เกี่ยวกับมหาวิทยาลัย",
    "titleEn": "University Links",
    "items": [
      {
        "titleTh": "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
        "titleEn": "KMUTNB Official",
        "href": "https://www.kmutnb.ac.th",
        "external": true
      },
      {
        "titleTh": "สำนักบริการคอมพิวเตอร์",
        "titleEn": "Computer Services Center",
        "href": "https://icit.kmutnb.ac.th",
        "external": true
      },
      {
        "titleTh": "สำนักหอสมุดกลาง",
        "titleEn": "Central Library",
        "href": "https://library.kmutnb.ac.th",
        "external": true
      },
      {
        "titleTh": "สำนักส่งเสริมวิชาการและงานทะเบียน",
        "titleEn": "Registrar Office",
        "href": "http://acdserv.kmutnb.ac.th",
        "external": true
      }
    ]
  }
];
