<script lang="ts">
  import { languageState } from "$lib/state/language.svelte";
  import {
    History,
    Calendar,
    ChevronRight,
    Home,
    CheckCircle2,
    ArrowRight,
    Landmark,
    Milestone,
    Award,
    Sparkles
  } from "lucide-svelte";

  interface MilestoneItem {
    yearBe: string;
    yearCe: string;
    titleTh: string;
    titleEn: string;
    badgeTh: string;
    badgeEn: string;
    color: string;
    descriptionTh: string;
    descriptionEn: string;
    highlightsTh: string[];
    highlightsEn: string[];
  }

  const milestones: MilestoneItem[] = [
    {
      yearBe: "2539",
      yearCe: "1996",
      titleTh: "จุดเริ่มต้น: ภาควิชาเทคโนโลยีสารสนเทศ คณะวิทยาศาสตร์ประยุกต์",
      titleEn: "Foundation: Department of Information Technology",
      badgeTh: "การก่อตั้งภาควิชา",
      badgeEn: "Establishment",
      color: "bg-blue-500",
      descriptionTh:
        "สถาบันเทคโนโลยีพระจอมเกล้าพระนครเหนือ ได้ริเริ่มก่อตั้งภาควิชาเทคโนโลยีสารสนเทศ ขึ้นในสังกัดคณะวิทยาศาสตร์ประยุกต์ เพื่อรองรับการเติบโตอย่างก้าวกระโดดของยุคสารสนเทศและอินเทอร์เน็ตในประเทศไทย",
      descriptionEn:
        "KMUTNB founded the Department of Information Technology under the Faculty of Applied Science to meet the surging demand for IT specialists during the dawn of the internet era in Thailand.",
      highlightsTh: [
        "เปิดสอนหลักสูตรวิทยาศาสตรบัณฑิต (วท.บ.) สาขาเทคโนโลยีสารสนเทศ รุ่นแรก",
        "จัดตั้งห้องปฏิบัติการคอมพิวเตอร์และระบบเครือข่ายยุคแรกเริ่ม",
        "วางรากฐานการเรียนการสอนด้านการพัฒนาซอฟต์แวร์และฐานข้อมูล"
      ],
      highlightsEn: [
        "Inaugural Bachelor of Science (B.Sc.) in IT cohort enrolled",
        "Set up the first computer labs and campus network nodes",
        "Laid curriculum foundation in software engineering and database systems"
      ]
    },
    {
      yearBe: "2544 - 2548",
      yearCe: "2001 - 2005",
      titleTh: "การขยายตัวสู่ระดับบัณฑิตศึกษาและการวิจัยขั้นสูง",
      titleEn: "Expansion to Graduate Studies & Advanced Research",
      badgeTh: "บัณฑิตศึกษา & วิจัย",
      badgeEn: "Graduate Programs",
      color: "bg-amber-500",
      descriptionTh:
        "ขยายขอบเขตการศึกษาเพื่อสร้างนักวิจัยและผู้บริหารสารสนเทศระดับสูง เปิดสอนหลักสูตรปริญญาโท (วท.ม.) สาขาเทคโนโลยีสารสนเทศ และหลักสูตรระบบสารสนเทศเพื่อการจัดการ (MIS) รวมถึงหลักสูตรปริญญาเอก (ปร.ด.)",
      descriptionEn:
        "Expanded into graduate studies to cultivate high-level researchers and CIO leaders, introducing M.Sc. in IT, M.Sc. in MIS, and Ph.D. in Information Technology programs.",
      highlightsTh: [
        "เปิดหลักสูตร วท.ม. เทคโนโลยีสารสนเทศ (ภาคปกติและภาคนอกเวลาราชการ)",
        "เปิดหลักสูตร วท.ม. ระบบสารสนเทศเพื่อการจัดการ (MIS)",
        "เปิดหลักสูตร ปร.ด. เทคโนโลยีสารสนเทศ รองรับการสร้างองค์ความรู้ระดับสากล"
      ],
      highlightsEn: [
        "Launched M.Sc. in IT (regular and evening/weekend tracks)",
        "Introduced M.Sc. in Management Information Systems (MIS)",
        "Launched Ph.D. in IT to pioneer cutting-edge academic publications"
      ]
    },
    {
      yearBe: "2552",
      yearCe: "2009",
      titleTh: "ยกฐานะเป็น 'คณะเทคโนโลยีสารสนเทศ' (FIT KMUTNB)",
      titleEn: "Upgraded to Faculty of Information Technology (FIT)",
      badgeTh: "ยกฐานะเป็นคณะ",
      badgeEn: "Faculty Elevation",
      color: "bg-orange-500",
      descriptionTh:
        "สภามหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ มีมติจัดตั้ง 'คณะเทคโนโลยีสารสนเทศ' (Faculty of Information Technology) เป็นส่วนงานภายในมหาวิทยาลัย เมื่อวันที่ 16 ตุลาคม พ.ศ. 2552 เพื่อความเป็นเลิศทางวิชาการและวิจัยเฉพาะทาง",
      descriptionEn:
        "The KMUTNB University Council officially resolved to elevate the department into the full-fledged 'Faculty of Information Technology' (FIT) on October 16, 2009, enabling autonomous academic and research leadership.",
      highlightsTh: [
        "จัดตั้งโครงสร้าง 2 ภาควิชา: ภาควิชาเทคโนโลยีสารสนเทศ และภาควิชาการจัดการเทคโนโลยีสารสนเทศ",
        "จัดตั้งสำนักงานคณบดีและหน่วยบริการการศึกษาเฉพาะทาง",
        "ขับเคลื่อนมาตรฐานการศึกษาตามกรอบมาตรฐานคุณวุฒิระดับอุดมศึกษาแห่งชาติ (TQF)"
      ],
      highlightsEn: [
        "Formed two core departments: IT and IT Management",
        "Established dedicated Dean's Office and academic support units",
        "Implemented rigorous National Higher Education Qualifications Framework (TQF)"
      ]
    },
    {
      yearBe: "2557",
      yearCe: "2014",
      titleTh: "ย้ายสู่บ้านหลังใหม่ 'อาคารนวมินทรราชินี' (อาคาร 79)",
      titleEn: "Relocation to Navamindra Rajini Building (Bldg 79)",
      badgeTh: "บ้านใหม่ Smart Campus",
      badgeEn: "Campus Center",
      color: "bg-indigo-500",
      descriptionTh:
        "คณะเทคโนโลยีสารสนเทศได้ย้ายที่ทำการและศูนย์ปฏิบัติการการเรียนการสอนเข้าสู่อาคารนวมินทรราชินี (อาคาร 79) ชั้น 3, 4, 5 และ 7 ทำให้มีพื้นที่จัดการศึกษาและห้องปฏิบัติการที่ทันสมัยและกว้างขวางที่สุดแห่งหนึ่งใน มจพ.",
      descriptionEn:
        "The faculty relocated to the state-of-the-art Navamindra Rajini Building (Building 79), occupying Floors 3, 4, 5, and 7, dramatically expanding smart learning spaces and specialized computing labs.",
      highlightsTh: [
        "ติดตั้งห้องปฏิบัติการคอมพิวเตอร์และห้องบรรยายอัจฉริยะรวมกว่า 19 ห้อง",
        "จัดตั้งศูนย์ควบคุมเครือข่ายและระบบเซิร์ฟเวอร์แม่ข่าย (ITD NOC)",
        "รองรับนักศึกษาทั้งระดับปริญญาตรี โท และเอก กว่า 1,500 คน"
      ],
      highlightsEn: [
        "Equipped over 19 state-of-the-art smart lecture rooms and computing labs",
        "Established Enterprise Network Operations Center (NOC) and server cluster",
        "Expanded capacity to serve over 1,500 undergraduate and graduate students"
      ]
    },
    {
      yearBe: "2560",
      yearCe: "2017",
      titleTh: "ศูนย์ทดสอบสากล Pearson VUE & การรับรองคุณภาพระดับสากล",
      titleEn: "Pearson VUE Testing Hub & Global Accreditations",
      badgeTh: "ศูนย์ทดสอบสากล",
      badgeEn: "Global Certification",
      color: "bg-emerald-500",
      descriptionTh:
        "ได้รับการรับรองให้เป็นศูนย์ทดสอบมาตรฐานวิชาชีพระดับสากล Pearson VUE Authorized Test Center (ห้อง 5A02) พร้อมทั้งวารสาร IT Journal ของคณะได้รับการรับรองดัชนี TCI กลุ่มที่ 1",
      descriptionEn:
        "Officially authorized as a Pearson VUE International Test Center (Room 5A02), while the faculty's IT Journal achieved prestigious TCI Tier 1 national accreditation.",
      highlightsTh: [
        "เปิดบริการสอบใบประกาศนียบัตรวิชาชีพไอทีสากล (Cisco, CompTIA, AWS, Microsoft)",
        "วารสาร Information Technology Journal เข้าสู่ฐานข้อมูล TCI กลุ่มที่ 1",
        "นำระบบประกันคุณภาพการศึกษาตามเกณฑ์ AUN-QA และ EdPEx มาใช้อย่างเต็มรูปแบบ"
      ],
      highlightsEn: [
        "Delivered international IT cert exams (Cisco, CompTIA, AWS, Microsoft, Oracle)",
        "IT Journal indexed in TCI Tier 1 database",
        "Adopted ASEAN University Network Quality Assurance (AUN-QA) framework"
      ]
    },
    {
      yearBe: "2564",
      yearCe: "2021",
      titleTh: "ก้าวสู่ยุคใหม่: 'คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล' (ITD)",
      titleEn: "Reorganization: Faculty of IT & Digital Innovation (ITD)",
      badgeTh: "การเปลี่ยนผ่านสู่ดิจิทัล",
      badgeEn: "Digital Transformation",
      color: "bg-brand-orange",
      descriptionTh:
        "ปรับเปลี่ยนชื่อและโครงสร้างส่วนงานเป็น 'คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล' (Faculty of Information Technology and Digital Innovation : ITD) เพื่อตอบโจทย์เศรษฐกิจดิจิทัล ปัญญาประดิษฐ์ (AI) และความมั่นคงปลอดภัยไซเบอร์",
      descriptionEn:
        "Renamed and strategically reorganized to 'Faculty of Information Technology and Digital Innovation' (ITD) to spearhead Artificial Intelligence, Big Data, and Cyber Defense frontiers.",
      highlightsTh: [
        "เปิดหลักสูตรใหม่: วิศวกรรมเครือข่ายและความมั่นคงปลอดภัยไซเบอร์ (วศ.บ.)",
        "จัดตั้งภาควิชาการบริหารเครือข่ายดิจิทัลและความมั่นคงปลอดภัยสารสนเทศ (DNS)",
        "ปรับปรุงหลักสูตร วท.บ., วท.ม., และ ปร.ด. มุ่งเน้น AI, Data Science และ Cloud Computing"
      ],
      highlightsEn: [
        "Launched B.Eng. in Network and Cyber Security Engineering",
        "Established Department of Digital Network & Security (DNS)",
        "Revamped B.Sc., M.Sc., Ph.D. curricula focusing on AI, Data Science & Cloud"
      ]
    },
    {
      yearBe: "ปัจจุบัน & อนาคต",
      yearCe: "Present & Future",
      titleTh: "ศูนย์กลางนวัตกรรมดิจิทัลและงานวิจัยแห่งอนาคต",
      titleEn: "Frontier of Digital Innovation & Future Tech",
      badgeTh: "สู่อนาคตดิจิทัล",
      badgeEn: "Future Vision",
      color: "bg-purple-600",
      descriptionTh:
        "มุ่งสู่การเป็นสถาบันการศึกษาและวิจัยด้านเทคโนโลยีดิจิทัลชั้นนำระดับเอเชีย ผลิตบัณฑิตคุณภาพสูงที่พร้อมทำงานในระดับสากล และสร้างสรรค์งานวิจัยเทคโนโลยีขั้นสูงเพื่อขับเคลื่อนประเทศไทย 4.0",
      descriptionEn:
        "Positioning as a premier digital tech institution in Asia, nurturing globally competitive talent and developing deep-tech research to empower smart sustainable societies.",
      highlightsTh: [
        "พัฒนาบัณฑิตพร้อมทำงาน (Work-Ready Graduates) มีอัตราการมีงานทำสูงต่อเนื่อง",
        "ขยายความร่วมมือกับมหาวิทยาลัยชั้นนำในต่างประเทศและพันธมิตรอุตสาหกรรมเทคโนโลยี",
        "ผลักดันงานวิจัย AI for Health, Cyber Forensics และ Smart IoT"
      ],
      highlightsEn: [
        "Consistent >95% graduate employment in prestigious tech enterprises",
        "Strategic global academic exchanges and dual-degree partnerships",
        "Pioneering research in generative AI, cyber forensics, and industrial IoT"
      ]
    }
  ];
</script>

<div class="w-full flex flex-col">
  <!-- Hero Header Banner -->
  <section class="relative w-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden py-14 sm:py-20 border-b border-gray-800">
    <div class="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <!-- Breadcrumbs -->
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
        <a
          href="/"
          class="inline-flex items-center gap-1.5 hover:text-brand-orange transition-colors"
        >
          <Home class="w-3.5 h-3.5" />
          <span>{languageState.t("หน้าหลัก", "Home")}</span>
        </a>
        <ChevronRight class="w-3.5 h-3.5 text-gray-600" />
        <a
          href="/about"
          class="hover:text-brand-orange transition-colors"
        >
          {languageState.t("แนะนำคณะ", "About ITD")}
        </a>
        <ChevronRight class="w-3.5 h-3.5 text-gray-600" />
        <span class="text-brand-orange font-medium">
          {languageState.t("ประวัติและความเป็นมา", "Faculty History")}
        </span>
      </nav>

      <!-- Title & Description -->
      <div class="max-w-3xl space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-semibold tracking-wide">
          <History class="w-3.5 h-3.5" />
          <span>OVER 28 YEARS OF ACADEMIC EXCELLENCE (EST. 1996)</span>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          {languageState.t("ประวัติและความเป็นมาของคณะ", "Faculty History & Heritage")}
        </h1>
        <p class="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
          {languageState.t(
            "เส้นทางการพัฒนาจากภาควิชาเทคโนโลยีสารสนเทศ สู่การเป็นคณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ ที่มุ่งมั่นสร้างสรรค์นวัตกรรมดิจิทัลเพื่อประเทศชาติ",
            "Tracing our visionary journey from 1996 to the present: 28+ years of relentless innovation, transformative education, and digital leadership."
          )}
        </p>
      </div>

      <!-- Quick Stat Badges -->
      <div class="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <Calendar class="w-4 h-4 text-brand-orange" />
          <span>
            {languageState.t("ก่อตั้งเมื่อปี พ.ศ. 2539 (กว่า 28 ปี)", "Founded in 1996 (28+ Years)")}
          </span>
        </div>
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <Landmark class="w-4 h-4 text-sky-400" />
          <span>
            {languageState.t("อาคารนวมินทรราชินี (อาคาร 79)", "Building 79 Navamindra Rajini")}
          </span>
        </div>
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <Award class="w-4 h-4 text-amber-400" />
          <span>
            {languageState.t("3 ภาควิชา / 7 หลักสูตรปริญญา", "3 Departments / 7 Degree Programs")}
          </span>
        </div>
      </div>
    </div>
  </section>

  <!-- Main Container -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 w-full">
    <!-- Interactive Timeline Section -->
    <section class="space-y-10">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-brand-orange text-xs font-semibold">
          <Milestone class="w-3.5 h-3.5" />
          <span>{languageState.t("หมุดหมายประวัติศาสตร์", "HISTORICAL MILESTONES")}</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
          {languageState.t("ไทม์ไลน์การเติบโตและการเปลี่ยนผ่าน", "Chronological Timeline & Evolution")}
        </h2>
        <p class="text-xs sm:text-sm text-gray-500">
          {languageState.t(
            "บันทึกเหตุการณ์สำคัญและวิวัฒนาการทางวิชาการและเทคโนโลยีตลอดเกือบ 3 ทศวรรษ",
            "Key developmental milestones that transformed ITD into a modern digital powerhouse."
          )}
        </p>
      </div>

      <!-- Timeline Visual Cards -->
      <div class="relative border-l-2 border-orange-200 ml-4 sm:ml-32 md:ml-40 pl-6 sm:pl-10 space-y-12">
        {#each milestones as item, idx}
          <div class="relative group">
            <!-- Year Badge on the Left (Desktop) -->
            <div class="hidden sm:flex absolute -left-40 top-0 w-28 text-right flex-col items-end">
              <span class="text-lg font-black text-brand-orange tracking-tight">
                {item.yearBe}
              </span>
              <span class="text-xs font-semibold text-gray-400">
                {item.yearCe}
              </span>
            </div>

            <!-- Timeline Bullet Marker -->
            <div class="absolute -left-[31px] sm:-left-[47px] top-1.5 w-6 h-6 rounded-full bg-white border-4 border-brand-orange shadow-md group-hover:scale-125 transition-transform"></div>

            <!-- Milestone Card -->
            <div class="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs hover:shadow-xl hover:border-brand-orange/40 transition-all space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="inline-block sm:hidden text-sm font-black text-brand-orange">
                  พ.ศ. {item.yearBe} ({item.yearCe})
                </span>
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-brand-orange border border-orange-200">
                  {languageState.language === "en" ? item.badgeEn : item.badgeTh}
                </span>
              </div>

              <h3 class="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                {languageState.language === "en" ? item.titleEn : item.titleTh}
              </h3>

              <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {languageState.language === "en" ? item.descriptionEn : item.descriptionTh}
              </p>

              <!-- Highlights Bullet List -->
              <div class="pt-2 border-t border-gray-100 space-y-2">
                <h4 class="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  {languageState.t("ผลงานและความก้าวหน้าสำคัญ:", "Key Highlights & Achievements:")}
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {#each (languageState.language === "en" ? item.highlightsEn : item.highlightsTh) as h, hIdx}
                    <div class="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Campus Heritage Section: Building 79 -->
    <section class="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 rounded-3xl p-8 sm:p-12 text-white border border-gray-800 shadow-xl space-y-8 overflow-hidden relative">
      <div class="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div class="lg:col-span-7 space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-semibold">
            <Landmark class="w-3.5 h-3.5" />
            <span>BUILDING 79 - NAVAMINDRA RAJINI</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-white">
            {languageState.t(
              "อาคารนวมินทรราชินี : ศูนย์กลางแห่งวิทยาการดิจิทัล",
              "Navamindra Rajini Building: The Heart of Digital Learning"
            )}
          </h2>
          <p class="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {languageState.t(
              "อาคาร 79 นวมินทรราชินี เป็นอาคารเรียนและปฏิบัติการสูง 14 ชั้น ที่ทันสมัยใจกลาง มจพ. โดยคณะ ITD ประจำการอยู่ที่ ชั้น 3, 4, 5 และ 7 ประกอบด้วยห้องบรรยาย Smart Classroom, ห้องปฏิบัติการคอมพิวเตอร์ประสิทธิภาพสูง, ห้องแม่ข่าย ITD NOC, ศูนย์สอบ Pearson VUE และพื้นที่ Co-Working Space สำหรับนักศึกษา",
              "Building 79 is a modern 14-story educational complex at KMUTNB. ITD occupies Floors 3, 4, 5, and 7, housing 19 smart facilities, specialized cloud data servers, international testing facilities, and dynamic collaboration lounges."
            )}
          </p>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div class="bg-white/10 p-3 rounded-2xl border border-white/10 text-center">
              <span class="block text-xl font-bold text-brand-orange">ชั้น 3</span>
              <span class="text-[11px] text-gray-300">ห้องบรรยาย 3A</span>
            </div>
            <div class="bg-white/10 p-3 rounded-2xl border border-white/10 text-center">
              <span class="block text-xl font-bold text-brand-orange">ชั้น 4</span>
              <span class="text-[11px] text-gray-300">สำนักงานคณบดี & 4A</span>
            </div>
            <div class="bg-white/10 p-3 rounded-2xl border border-white/10 text-center">
              <span class="block text-xl font-bold text-brand-orange">ชั้น 5</span>
              <span class="text-[11px] text-gray-300">Pearson VUE & NOC</span>
            </div>
            <div class="bg-white/10 p-3 rounded-2xl border border-white/10 text-center">
              <span class="block text-xl font-bold text-brand-orange">ชั้น 7</span>
              <span class="text-[11px] text-gray-300">Lab คอมพิวเตอร์ 7A</span>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5 flex flex-col justify-center space-y-4">
          <div class="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles class="w-4 h-4 text-brand-orange" />
              <span>{languageState.t("สำรวจสถานที่จริงของคณะ", "Explore Our Facilities")}</span>
            </h4>
            <p class="text-xs text-gray-300">
              {languageState.t(
                "ชมภาพถ่ายสถานที่จริงและสิ่งอำนวยความสะดวกครบทั้ง 19 ห้อง",
                "Browse high-res galleries and room specifications of all 19 facilities."
              )}
            </p>
            <a
              href="/facilities"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <span>{languageState.t("ดูห้องเรียนและห้องแล็บทั้งหมด", "View All 19 Facilities")}</span>
              <ArrowRight class="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Navigation Footer -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
      <a
        href="/about"
        class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-brand-orange transition-colors"
      >
        <span>← {languageState.t("กลับสู่หน้าแนะนำคณะและวิสัยทัศน์", "Back to About Overview")}</span>
      </a>
      <a
        href="/personnel/administrators"
        class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand-orange hover:text-brand-dark-orange transition-colors"
      >
        <span>{languageState.t("ดูทำเนียบผู้บริหารคณะ", "View Executive Leadership")} →</span>
      </a>
    </div>
  </div>
</div>
