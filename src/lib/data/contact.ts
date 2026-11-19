export interface PhoneDirectoryItem {
  id: string;
  unitTh: string;
  unitEn: string;
  roomTh: string;
  roomEn: string;
  floor: number;
  phone: string;
  extension: string;
  email: string;
  headNameTh?: string;
  headNameEn?: string;
}

export interface TransportGuideItem {
  id: string;
  titleTh: string;
  titleEn: string;
  iconName: string;
  descriptionTh: string;
  descriptionEn: string;
  detailsTh: string[];
  detailsEn: string[];
}

export const contactInfo = {
  facultyNameTh: "คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล",
  facultyNameEn: "Faculty of Information Technology and Digital Innovation",
  universityNameTh: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
  universityNameEn: "King Mongkut's University of Technology North Bangkok",
  buildingTh: "อาคารนวมินทรราชินี (อาคาร 79) ชั้น 3, 4, 5, 7",
  buildingEn: "Navamindra Rajini Building (Building 79), Floors 3, 4, 5, 7",
  addressTh: "เลขที่ 1518 ถนนประชาราษฎร์ 1 แขวงวงศ์สว่าง เขตบางซื่อ กรุงเทพฯ 10800",
  addressEn: "1518 Pracharat 1 Road, Wongsawang, Bang Sue, Bangkok 10800, Thailand",
  phoneMain: "02-555-2000",
  phoneDirect: "02-555-2708, 02-555-2706",
  fax: "02-587-8257",
  emailGeneral: "contact@itd.kmutnb.ac.th",
  emailAcademic: "academic@itd.kmutnb.ac.th",
  officeHoursTh: "จันทร์ - ศุกร์ : 08:30 - 16:30 น. (ปิดทำการวันเสาร์-อาทิตย์ และวันหยุดนักขัตฤกษ์)",
  officeHoursEn: "Monday - Friday: 08:30 AM - 04:30 PM (Closed on weekends and public holidays)",
  googleMapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3874.453303649666!2d100.51187437592477!3d13.817882295898084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29b8289456209%3A0xe54d89e47f781a7!2z4LiE4LiT4Liw4LmA4LiX4LiE4LmC4LiZ4LmC4Lil4Lii4Liq4Liy4Lij4Liq4LiZ4LmA4LiX4Lio4LmB4Lil4Liw4LiZ4Lin4Lix4LiV4LiB4Lij4Lij4Lih4LiU4Li04LiI4Li04LiX4Lix4Lil!5e0!3m2!1sth!2sth!4v1700000000000!5m2!1sth!2sth",
  googleMapLink: "https://maps.google.com/?q=Faculty+of+Information+Technology+and+Digital+Innovation+KMUTNB",
  socialLinks: {
    facebook: "https://www.facebook.com/itd.kmutnb",
    line: "https://line.me/R/ti/p/@itd.kmutnb",
    youtube: "https://www.youtube.com/@ITDKMUTNB",
    website: "https://itd.kmutnb.ac.th"
  }
};

export const phoneDirectory: PhoneDirectoryItem[] = [
  {
    id: "dean-office",
    unitTh: "สำนักงานคณบดี / งานบริหารทั่วไป",
    unitEn: "Dean's Office & General Administration",
    roomTh: "ห้อง 4A01 อาคาร 79",
    roomEn: "Room 4A01, Building 79",
    floor: 4,
    phone: "02-555-2000",
    extension: "2708, 2700",
    email: "dean@itd.kmutnb.ac.th",
    headNameTh: "ผศ.ดร.สุนันฑา สดสี (คณบดี)",
    headNameEn: "Asst. Prof. Dr. Sunantha Sodsee"
  },
  {
    id: "admin-office",
    unitTh: "ฝ่ายบริหารและแผนงาน",
    unitEn: "Administration & Planning Division",
    roomTh: "ห้อง 4A01 อาคาร 79",
    roomEn: "Room 4A01, Building 79",
    floor: 4,
    phone: "02-555-2000",
    extension: "2706, 2707",
    email: "sucha.smanchat@itd.kmutnb.ac.th",
    headNameTh: "ผศ.ดร.สุชา สมานชาติ (รองคณบดีฝ่ายบริหาร)",
    headNameEn: "Asst. Prof. Dr. Sucha Smanchat"
  },
  {
    id: "academic-service",
    unitTh: "ฝ่ายวิชาการ วิจัย และบริการการศึกษา",
    unitEn: "Academic Affairs, Research & Student Services",
    roomTh: "ห้อง 4A01 อาคาร 79",
    roomEn: "Room 4A01, Building 79",
    floor: 4,
    phone: "02-555-2000",
    extension: "2726, 2727",
    email: "academic@itd.kmutnb.ac.th",
    headNameTh: "ผศ.ดร.ศักดิ์ชาย ตั้งวรรณวิทย์ (รองคณบดี)",
    headNameEn: "Asst. Prof. Dr. Sakchai Tangwannawit"
  },
  {
    id: "student-affairs",
    unitTh: "ฝ่ายกิจการนักศึกษาและประกันคุณภาพ",
    unitEn: "Student Affairs & Quality Assurance",
    roomTh: "ห้อง 4A01 อาคาร 79",
    roomEn: "Room 4A01, Building 79",
    floor: 4,
    phone: "02-555-2000",
    extension: "2705",
    email: "kanchana.v@itd.kmutnb.ac.th",
    headNameTh: "อาจารย์ ดร.กาญจนา วิริยะพันธ์ (รองคณบดี)",
    headNameEn: "Dr. Kanchana Viriyapant"
  },
  {
    id: "dept-it",
    unitTh: "ภาควิชาเทคโนโลยีสารสนเทศ (IT)",
    unitEn: "Department of Information Technology",
    roomTh: "ห้อง 4A09 อาคาร 79",
    roomEn: "Room 4A09, Building 79",
    floor: 4,
    phone: "02-555-2000",
    extension: "2733, 2734",
    email: "dept-it@itd.kmutnb.ac.th",
    headNameTh: "ผศ.ดร.ผุสดี บุญรอด (หัวหน้าภาควิชา)",
    headNameEn: "Asst. Prof. Dr. Pudsadee Boonrod"
  },
  {
    id: "dept-itm",
    unitTh: "ภาควิชาการจัดการเทคโนโลยีสารสนเทศ (ITM)",
    unitEn: "Department of IT Management",
    roomTh: "ห้อง 4A10 อาคาร 79",
    roomEn: "Room 4A10, Building 79",
    floor: 4,
    phone: "02-555-2000",
    extension: "2730, 2731",
    email: "dept-itm@itd.kmutnb.ac.th",
    headNameTh: "รศ.ดร.มหศักดิ์ เกตุฉ่ำ (หัวหน้าภาควิชา)",
    headNameEn: "Assoc. Prof. Dr. Mahasak Ketcham"
  },
  {
    id: "dept-dns",
    unitTh: "ภาควิชาการบริหารเครือข่ายดิจิทัลและความมั่นคงปลอดภัย (DNS)",
    unitEn: "Department of Digital Network & Security",
    roomTh: "ห้อง 5A11 อาคาร 79",
    roomEn: "Room 5A11, Building 79",
    floor: 5,
    phone: "02-555-2000",
    extension: "2735, 2736",
    email: "dept-dns@itd.kmutnb.ac.th",
    headNameTh: "ผศ.ดร.บงการ หอมนาน (หัวหน้าภาควิชา)",
    headNameEn: "Asst. Prof. Dr. Bongkarn Homnan"
  },
  {
    id: "pearson-vue-center",
    unitTh: "ศูนย์ทดสอบมาตรฐานสากล Pearson VUE",
    unitEn: "Pearson VUE Authorized Test Center",
    roomTh: "ห้อง 5A02 อาคาร 79",
    roomEn: "Room 5A02, Building 79",
    floor: 5,
    phone: "02-555-2000",
    extension: "2702, 2740",
    email: "pearsonvue@itd.kmutnb.ac.th"
  },
  {
    id: "lab-support-noc",
    unitTh: "ศูนย์ปฏิบัติการคอมพิวเตอร์และเครือข่าย (NOC)",
    unitEn: "Computer Lab & Network Operations Center (NOC)",
    roomTh: "ห้อง 5A01 อาคาร 79",
    roomEn: "Room 5A01, Building 79",
    floor: 5,
    phone: "02-555-2000",
    extension: "2740, 2741",
    email: "noc-itd@itd.kmutnb.ac.th"
  },
  {
    id: "finance-procurement",
    unitTh: "งานการเงินและพัสดุ",
    unitEn: "Finance & Procurement Unit",
    roomTh: "ห้อง 4A01 อาคาร 79",
    roomEn: "Room 4A01, Building 79",
    floor: 4,
    phone: "02-555-2000",
    extension: "2710, 2712",
    email: "finance@itd.kmutnb.ac.th"
  }
];

export const transportGuide: TransportGuideItem[] = [
  {
    id: "mrt",
    titleTh: "รถไฟฟ้าสายสีม่วง / สายสีน้ำเงิน (MRT)",
    titleEn: "MRT Subway (Purple / Blue Line)",
    iconName: "Train",
    descriptionTh: "ลงสถานีวงศ์สว่าง (สายสีม่วง ทางออก 1) หรือสถานีเตาปูน (จุดเชื่อมต่อ)",
    descriptionEn: "Alight at Wongsawang Station (Purple Line, Exit 1) or Tao Poon Interchange Station.",
    detailsTh: [
      "MRT สถานีวงศ์สว่าง (สายสีม่วง ทางออก 1) ต่อรถประจำทางสาย 18, 49, 97 หรือวินมอเตอร์ไซค์รับจ้าง (ประมาณ 1.5 กม.)",
      "MRT สถานีบางซื่อ / เตาปูน (สายสีน้ำเงิน) ต่อรถประจำทางสาย 97 หรือ 65 เข้าสู่ถนนประชาราษฎร์ 1 มจพ."
    ],
    detailsEn: [
      "MRT Wongsawang (Purple Line, Exit 1): Connect via bus No. 18, 49, 97 or local motorbike taxi (~1.5 km)",
      "MRT Bang Sue / Tao Poon (Blue Line): Connect via bus No. 97 or 65 directly to KMUTNB Main Gate"
    ]
  },
  {
    id: "bus",
    titleTh: "รถโดยสารประจำทาง (ขสมก.)",
    titleEn: "Public City Buses (BMTA)",
    iconName: "Bus",
    descriptionTh: "รถเมล์สาย 18, 32, 33, 49, 64, 90, 97, 117, 175, 203 ผ่านหน้ามหาวิทยาลัย",
    descriptionEn: "Bus routes 18, 32, 33, 49, 64, 90, 97, 117, 175, 203 stop right at the KMUTNB entrance.",
    detailsTh: [
      "ป้ายหน้ามหาวิทยาลัย (ถนนประชาราษฎร์ 1): สาย 32, 33, 64, 90, 117, 175, 203",
      "ป้ายวงศ์สว่าง / สะพานพระราม 7: สาย 18, 49, 50, 97, 170, 543ก"
    ],
    detailsEn: [
      "Bus Stop - Front Gate (Pracharat 1 Rd): Routes 32, 33, 64, 90, 117, 175, 203",
      "Bus Stop - Rama 7 Bridge / Wongsawang: Routes 18, 49, 50, 97, 170, 543A"
    ]
  },
  {
    id: "boat",
    titleTh: "เรือด่วนเจ้าพระยา",
    titleEn: "Chao Phraya Express Boat",
    iconName: "Ship",
    descriptionTh: "ลงที่ท่าเรือสะพานพระราม 7 (Rama VII Bridge Pier N22)",
    descriptionEn: "Alight at Rama VII Bridge Pier (N22) and walk ~350 meters to KMUTNB Campus.",
    detailsTh: [
      "เรือด่วนเจ้าพระยาธงส้ม / ธงเหลือง / ธงเขียว ลงที่ท่าเรือพระราม 7 (N22)",
      "เดินเท้าเข้าประตูฝั่งแม่น้ำเจ้าพระยา หรือต่อมอเตอร์ไซค์มายังอาคาร 79 นวมินทรราชินี เพียง 300 เมตร"
    ],
    detailsEn: [
      "Orange, Yellow, or Green Flag Express Boat to Rama VII Bridge Pier (N22)",
      "Walk 350 meters through riverside gate directly to Building 79"
    ]
  },
  {
    id: "car",
    titleTh: "รถยนต์ส่วนบุคคลและที่จอดรถ",
    titleEn: "Private Vehicle & Parking",
    iconName: "Car",
    descriptionTh: "เข้าทางถนนประชาราษฎร์ 1 หรือถนนวงศ์สว่าง มีอาคารจอดรถส่วนกลาง",
    descriptionEn: "Access via Pracharat 1 Rd or Wongsawang Rd. Central parking buildings available.",
    detailsTh: [
      "อาคารจอดรถกลางมหาวิทยาลัย (อาคาร 40 ปี มจพ.) และลานจอดรถใต้อาคารนวมินทรราชินี",
      "ผู้มาติดต่อกรุณาแลกบัตรเข้า-ออก ณ ป้อมยามประตู 1 หรือประตู 2"
    ],
    detailsEn: [
      "Multi-storey central parking building and underground parking at Navamindra Rajini Building",
      "Visitors must register and obtain visitor pass at Gate 1 or Gate 2"
    ]
  }
];
