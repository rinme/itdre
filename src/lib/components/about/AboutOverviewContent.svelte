<script lang="ts">
  import { languageState } from "$lib/state/language.svelte";
  import { personnel } from "$lib/data/personnel";
  import {
    Building2,
    Compass,
    Target,
    Sparkles,
    Award,
    BookOpen,
    Users,
    ChevronRight,
    Home,
    CheckCircle2,
    GraduationCap,
    Lightbulb,
    Cpu,
    Globe2,
    ArrowRight,
    Quote,
    Layers,
    History,
    Monitor,
    PhoneCall
  } from "lucide-svelte";

  // Find Dean
  const dean = personnel.find((p) => p.role.includes("คณบดี") && p.category === "administrator") || {
    nameTh: "ผศ.ดร.สุนันฑา สดสี",
    role: "คณบดีคณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล",
    email: "sunantha.s@itd.kmutnb.ac.th",
    phone: "02-555-2000 ต่อ 2708",
    image: "/assets/faculty/faculty-person-1.png"
  };

  // Find other administrators (first 4)
  const keyLeaders = personnel
    .filter((p) => p.category === "administrator" && p.id !== "person-1")
    .slice(0, 4);

  const coreValues = [
    {
      letter: "I",
      titleTh: "Innovation & Integrity",
      titleEn: "Innovation & Integrity",
      subtitleTh: "นวัตกรรมและความซื่อสัตย์",
      descTh: "สร้างสรรค์นวัตกรรมดิจิทัลที่มีคุณค่า ยึดมั่นในจรรยาบรรณวิชาชีพและคุณธรรมทางวิชาการ",
      descEn: "Fostering valuable digital innovation while upholding professional integrity and academic ethics.",
      icon: Lightbulb,
      color: "from-orange-500 to-amber-500"
    },
    {
      letter: "T",
      titleTh: "Technology & Teamwork",
      titleEn: "Technology & Teamwork",
      subtitleTh: "เทคโนโลยีและการทำงานร่วมกัน",
      descTh: "เชี่ยวชาญเทคโนโลยีขั้นสูงระดับสากล และบูรณาการการทำงานร่วมกันเป็นทีมอย่างมีประสิทธิภาพ",
      descEn: "Mastering advanced technologies and collaborating seamlessly as an agile, multidisciplinary team.",
      icon: Cpu,
      color: "from-blue-500 to-indigo-600"
    },
    {
      letter: "D",
      titleTh: "Digital Leadership & Dedication",
      titleEn: "Digital Leadership & Dedication",
      subtitleTh: "ผู้นำดิจิทัลและความทุ่มเท",
      descTh: "มุ่งมั่นพัฒนาสู่การเป็นผู้นำด้านดิจิทัลระดับแนวหน้า พร้อมทุ่มเทเพื่อประโยชน์ของสังคมและประเทศชาติ",
      descEn: "Empowering visionary digital leaders dedicated to driving societal and national advancement.",
      icon: Sparkles,
      color: "from-emerald-500 to-teal-600"
    }
  ];

  const strategicPillars = [
    {
      icon: GraduationCap,
      titleTh: "หลักสูตรมาตรฐานสากล",
      titleEn: "World-Class Curriculum",
      descTh: "จัดการศึกษาที่ทันสมัยสอดคล้องกับความต้องการของอุตสาหกรรมเทคโนโลยีดิจิทัล และเกณฑ์ AUN-QA",
      descEn: "Modernized outcome-based curricula aligned with global digital industry demands and AUN-QA."
    },
    {
      icon: Sparkles,
      titleTh: "การวิจัยและนวัตกรรมขั้นสูง",
      titleEn: "High-Impact Research",
      descTh: "ผลิตผลงานวิจัยด้าน AI, Cybersecurity, Data Science และตีพิมพ์ในวารสารระดับนานาชาติ (Scopus/TCI)",
      descEn: "Pioneering research in AI, Cyber Defense, Big Data published in top international indexed journals."
    },
    {
      icon: Globe2,
      titleTh: "ความร่วมมือกับภาคอุตสาหกรรม",
      titleEn: "Industrial Partnerships",
      descTh: "ร่วมมือกับองค์กรไอทีชั้นนำ และเป็นศูนย์ทดสอบมาตรฐานวิชาชีพระดับสากล Pearson VUE",
      descEn: "Strong alliances with tech giants and an official Pearson VUE Authorized Test Center."
    },
    {
      icon: Users,
      titleTh: "พัฒนาบัณฑิตพร้อมทำงานจริง",
      titleEn: "Work-Ready Graduates",
      descTh: "บัณฑิตมีทักษะปฏิบัติการขั้นสูง คิดวิเคราะห์เป็นเลิศ และมีอัตราการได้งานทำสูงกว่า 95%",
      descEn: "Equipping graduates with practical engineering competence, resulting in over 95% employment."
    }
  ];
</script>

<div class="w-full flex flex-col">
  <!-- Hero Header Banner -->
  <section class="relative w-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden py-14 sm:py-20 border-b border-gray-800">
    <div class="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
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
        <span class="text-brand-orange font-medium">
          {languageState.t("แนะนำคณะ", "About ITD")}
        </span>
      </nav>

      <!-- Title & Description -->
      <div class="max-w-3xl space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-semibold tracking-wide">
          <Building2 class="w-3.5 h-3.5" />
          <span>FACULTY OF INFORMATION TECHNOLOGY & DIGITAL INNOVATION</span>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          {languageState.t("วิสัยทัศน์ พันธกิจ และโครงสร้างคณะ", "Vision, Mission & Faculty Overview")}
        </h1>
        <p class="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
          {languageState.t(
            "มุ่งมั่นสู่การเป็นคณะชั้นนำด้านเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัลระดับสากล ผลิตบัณฑิตที่มีสมรรถนะสูง สร้างสรรค์งานวิจัยและนวัตกรรมเพื่อการพัฒนาประเทศ",
            "Striving to be an internationally recognized institution in information technology and digital innovation, producing high-competence graduates and impactful research."
          )}
        </p>
      </div>

      <!-- Quick Subpage Navigation Pills -->
      <div class="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
        <a
          href="/about/history"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-orange/20 hover:bg-brand-orange text-white border border-brand-orange/40 transition-all"
        >
          <History class="w-4 h-4 text-brand-orange" />
          <span>{languageState.t("ประวัติและความเป็นมา", "Faculty History & Timeline")}</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </a>
        <a
          href="/personnel/administrators"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10 transition-all"
        >
          <Award class="w-4 h-4 text-amber-400" />
          <span>{languageState.t("ผู้บริหารคณะ", "Executive Board")}</span>
        </a>
        <a
          href="/facilities"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10 transition-all"
        >
          <Monitor class="w-4 h-4 text-sky-400" />
          <span>{languageState.t("ห้องเรียนและห้องปฏิบัติการ", "Facilities & Labs")}</span>
        </a>
        <a
          href="/contact"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10 transition-all"
        >
          <PhoneCall class="w-4 h-4 text-emerald-400" />
          <span>{languageState.t("ติดต่อเรา", "Contact Info")}</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Main Container -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 w-full">
    <!-- Dean's Welcome Message Banner -->
    <section class="relative bg-white rounded-3xl border border-gray-200/80 shadow-md overflow-hidden p-6 sm:p-10 lg:p-12">
      <div class="absolute top-0 right-0 w-96 h-96 bg-orange-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

      <div class="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <!-- Dean Portrait -->
        <div class="lg:col-span-4 flex flex-col items-center text-center">
          <div class="relative w-56 h-64 sm:w-64 sm:h-72 rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-gradient-to-b from-orange-100 to-orange-200">
            <img
              src={dean.image}
              alt={dean.nameTh}
              class="w-full h-full object-cover object-top"
            />
          </div>
          <div class="mt-4 space-y-1">
            <h3 class="text-lg font-bold text-gray-900">
              {dean.nameTh}
            </h3>
            <p class="text-xs font-semibold text-brand-orange">
              {dean.role}
            </p>
            <p class="text-[11px] text-gray-500">
              {dean.email}
            </p>
          </div>
        </div>

        <!-- Dean's Speech -->
        <div class="lg:col-span-8 space-y-5">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-brand-orange text-xs font-semibold">
            <Quote class="w-3.5 h-3.5" />
            <span>{languageState.t("สารจากคณบดี", "DEAN'S MESSAGE")}</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {languageState.t(
              "“สร้างสรรค์นวัตกรรมดิจิทัล ขับเคลื่อนสังคมแห่งอนาคตด้วยความเชี่ยวชาญทางเทคโนโลยี”",
              "“Pioneering Digital Innovation, Shaping the Future through Technological Excellence.”"
            )}
          </h2>

          <div class="space-y-3.5 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>
              {languageState.t(
                "ยินดีต้อนรับสู่คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ (ITD KMUTNB) คณะของเรามุ่งมั่นในการจัดการศึกษาชั้นนำที่บูรณาการทั้งภาคทฤษฎีเข้มข้นและการปฏิบัติการจริง เพื่อสร้างบัณฑิตที่เป็น 'นวัตกรดิจิทัล' และ 'วิศวกรผู้เชี่ยวชาญ' ที่พร้อมตอบสนองต่อการเปลี่ยนแปลงทางเทคโนโลยีระดับโลก",
                "Welcome to the Faculty of Information Technology and Digital Innovation at KMUTNB. Our faculty is dedicated to delivering cutting-edge education that seamlessly integrates rigorous theoretical foundations with hands-on engineering practice, empowering our students to become visionary digital innovators."
              )}
            </p>
            <p>
              {languageState.t(
                "ด้วยคณาจารย์ผู้ทรงคุณวุฒิ ห้องปฏิบัติการคอมพิวเตอร์และเซิร์ฟเวอร์ที่ทันสมัย ศูนย์สอบมาตรฐานสากล Pearson VUE และความร่วมมืออย่างใกล้ชิดกับภาคอุตสาหกรรมเทคโนโลยี เราพร้อมมอบประสบการณ์การเรียนรู้ที่ดีที่สุดเพื่อเปิดประตูสู่ความสำเร็จในระดับสากลให้แก่ทุกคน",
                "Backed by highly qualified faculty, state-of-the-art computer laboratories, our authorized Pearson VUE test center, and strategic industry collaborations, we provide an unparalleled learning ecosystem for lifelong achievement."
              )}
            </p>
          </div>

          <div class="pt-2 flex items-center gap-4">
            <a
              href="/personnel/administrators"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <Award class="w-4 h-4" />
              <span>{languageState.t("ทำเนียบคณะผู้บริหาร", "Meet Executive Leadership")}</span>
            </a>
            <a
              href="/about/history"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium transition-colors"
            >
              <History class="w-4 h-4 text-gray-500" />
              <span>{languageState.t("อ่านประวัติคณะ", "Read Faculty History")}</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Vision & Mission Cards -->
    <section class="space-y-6">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-brand-orange text-xs font-semibold">
          <Compass class="w-3.5 h-3.5" />
          <span>{languageState.t("ทิศทางและเป้าหมายเชิงกลยุทธ์", "STRATEGIC DIRECTION")}</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
          {languageState.t("วิสัยทัศน์และพันธกิจ", "Vision & Mission")}
        </h2>
        <p class="text-xs sm:text-sm text-gray-500">
          {languageState.t(
            "กรอบยุทธศาสตร์การพัฒนามุ่งสู่ความเป็นเลิศด้านเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล",
            "Strategic framework guiding our commitment to academic excellence and digital transformation."
          )}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Vision Card -->
        <div class="relative bg-gradient-to-br from-gray-900 to-gray-950 text-white rounded-3xl p-8 shadow-xl border border-gray-800 flex flex-col justify-between overflow-hidden group">
          <div class="absolute top-0 right-0 w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-orange/30 transition-all"></div>

          <div class="space-y-4 relative z-10">
            <div class="w-12 h-12 rounded-2xl bg-brand-orange flex items-center justify-center text-white shadow-md shadow-orange-500/30">
              <Compass class="w-6 h-6" />
            </div>
            <div class="space-y-1">
              <span class="text-xs font-semibold text-brand-orange tracking-wider uppercase">
                {languageState.t("วิสัยทัศน์", "FACULTY VISION")}
              </span>
              <h3 class="text-xl sm:text-2xl font-bold text-white">
                {languageState.t(
                  "“คณะชั้นนำด้านเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัลในระดับสากล”",
                  "“A Leading International Faculty in Information Technology and Digital Innovation”"
                )}
              </h3>
            </div>
            <p class="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {languageState.t(
                "มุ่งสร้างสรรค์บัณฑิตและผลงานวิจัยที่มีคุณภาพสูง มีมาตรฐานทางวิชาการและวิชาชีพในระดับสากล พร้อมตอบสนองต่อการเปลี่ยนแปลงของเทคโนโลยีและเศรษฐกิจดิจิทัลระดับโลก",
                "Committed to cultivating top-tier graduates, breakthrough research, and world-class academic leadership to spearhead global digital economic growth."
              )}
            </p>
          </div>

          <div class="pt-6 mt-6 border-t border-gray-800/80 flex items-center gap-2 text-xs text-gray-400">
            <CheckCircle2 class="w-4 h-4 text-brand-orange" />
            <span>{languageState.t("มุ่งเน้นมาตรฐาน AUN-QA และ EdPEx", "Aligned with AUN-QA & EdPEx Standards")}</span>
          </div>
        </div>

        <!-- Mission Card -->
        <div class="bg-white rounded-3xl p-8 shadow-md border border-gray-200/80 flex flex-col justify-between space-y-6">
          <div class="space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Target class="w-6 h-6" />
            </div>
            <div class="space-y-1">
              <span class="text-xs font-semibold text-blue-600 tracking-wider uppercase">
                {languageState.t("พันธกิจ 4 ด้าน", "FOUR CORE MISSIONS")}
              </span>
              <h3 class="text-xl sm:text-2xl font-bold text-gray-900">
                {languageState.t("พันธกิจของคณะ (Mission)", "Faculty Core Missions")}
              </h3>
            </div>

            <ul class="space-y-3 text-xs sm:text-sm text-gray-700">
              <li class="flex items-start gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong class="text-gray-900">{languageState.t("1. การจัดการศึกษา:", "1. Education:")}</strong>{" "}
                  {languageState.t("ผลิตบัณฑิตที่มีความรู้คู่คุณธรรม และทักษะวิชาชีพระดับสูงด้านเทคโนโลยีดิจิทัล", "Produce highly skilled, ethical graduates proficient in digital technologies.")}
                </span>
              </li>
              <li class="flex items-start gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong class="text-gray-900">{languageState.t("2. การวิจัยและนวัตกรรม:", "2. Research:")}</strong>{" "}
                  {languageState.t("สร้างงานวิจัยและนวัตกรรมที่มีคุณค่า เพื่อตอบโจทย์ภาคอุตสาหกรรมและสังคม", "Advance high-impact research driving industrial and societal innovation.")}
                </span>
              </li>
              <li class="flex items-start gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong class="text-gray-900">{languageState.t("3. บริการวิชาการ:", "3. Academic Services:")}</strong>{" "}
                  {languageState.t("ถ่ายทอดองค์ความรู้และเทคโนโลยีดิจิทัลสู่ชุมชน ภาครัฐ และเอกชน", "Disseminate technical knowledge and digital literacy to communities and industry.")}
                </span>
              </li>
              <li class="flex items-start gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong class="text-gray-900">{languageState.t("4. ทำนุบำรุงศิลปวัฒนธรรม:", "4. Cultural Preservation:")}</strong>{" "}
                  {languageState.t("ส่งเสริมและทำนุบำรุงศิลปวัฒนธรรมและสิ่งแวดล้อมอย่างยั่งยืน", "Preserve cultural heritage and promote sustainable digital campus practices.")}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Values: I-T-D -->
    <section class="space-y-8">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-brand-orange text-xs font-semibold">
          <Sparkles class="w-3.5 h-3.5" />
          <span>{languageState.t("ค่านิยมหลักขององค์กร", "ORGANIZATIONAL VALUES")}</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
          {languageState.t("ค่านิยมหลัก I-T-D Excellence", "Core Values: I-T-D Excellence")}
        </h2>
        <p class="text-xs sm:text-sm text-gray-500">
          {languageState.t(
            "อัตลักษณ์และวัฒนธรรมองค์กรที่หล่อหลอมชาว ITD สู่ความเป็นเลิศ",
            "The guiding principles that define our institutional identity, integrity, and passion for excellence."
          )}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each coreValues as val (val.letter)}
          {@const Icon = val.icon}
          <div
            class="relative bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs hover:shadow-xl hover:border-brand-orange/40 transition-all space-y-4 flex flex-col justify-between"
          >
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-orange to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-orange-500/20">
                  {val.letter}
                </div>
                <div class="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600">
                  <Icon class="w-5 h-5 text-brand-orange" />
                </div>
              </div>

              <div class="space-y-1">
                <h3 class="text-lg font-bold text-gray-900">
                  {languageState.language === "en" ? val.titleEn : val.titleTh}
                </h3>
                <p class="text-xs font-semibold text-brand-orange">
                  {val.subtitleTh}
                </p>
              </div>

              <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {languageState.language === "en" ? val.descEn : val.descTh}
              </p>
            </div>

            <div class="pt-4 border-t border-gray-100 flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
              <Sparkles class="w-3.5 h-3.5 text-brand-orange" />
              <span>ITD KMUTNB CORE VALUE</span>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Strategic Pillars Grid -->
    <section class="space-y-8">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Layers class="w-3.5 h-3.5" />
          <span>{languageState.t("เสาหลักแห่งความสำเร็จ", "STRATEGIC PILLARS")}</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
          {languageState.t("จุดเด่นและศักยภาพของคณะ", "Faculty Key Strengths")}
        </h2>
        <p class="text-xs sm:text-sm text-gray-500">
          {languageState.t(
            "มิติสำคัญที่ขับเคลื่อนความเป็นผู้นำทางวิชาการและงานวิจัยระดับสากล",
            "Key dimensions driving our academic, research, and industrial prominence."
          )}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each strategicPillars as pillar, idx}
          {@const Icon = pillar.icon}
          <div
            class="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs hover:shadow-lg transition-all space-y-3"
          >
            <div class="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-brand-orange">
              <Icon class="w-6 h-6" />
            </div>
            <h3 class="font-bold text-gray-900 text-base">
              {languageState.language === "en" ? pillar.titleEn : pillar.titleTh}
            </h3>
            <p class="text-xs text-gray-600 leading-relaxed">
              {languageState.language === "en" ? pillar.descEn : pillar.descTh}
            </p>
          </div>
        {/each}
      </div>
    </section>

    <!-- Executive Leadership Preview -->
    <section class="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-xs space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-brand-orange text-xs font-semibold">
            <Award class="w-3.5 h-3.5" />
            <span>{languageState.t("โครงสร้างการบริหาร", "LEADERSHIP STRUCTURE")}</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">
            {languageState.t("คณะผู้บริหารประจำคณะ", "Faculty Executive Board")}
          </h2>
          <p class="text-xs sm:text-sm text-gray-500">
            {languageState.t(
              "ทีมผู้บริหารที่มุ่งมั่นขับเคลื่อนยุทธศาสตร์การพัฒนาและคุณภาพการศึกษา",
              "The dedicated leadership team guiding ITD KMUTNB towards continuous innovation."
            )}
          </p>
        </div>

        <a
          href="/personnel/administrators"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 hover:bg-brand-orange text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-xs"
        >
          <span>{languageState.t("ดูผู้บริหารทั้งหมด (8 ท่าน)", "View All Leaders (8)")}</span>
          <ArrowRight class="w-4 h-4" />
        </a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each keyLeaders as leader (leader.id)}
          <div
            class="group flex flex-col bg-gray-50/70 rounded-2xl border border-gray-200/70 p-4 hover:bg-white hover:shadow-md hover:border-brand-orange/30 transition-all text-center items-center space-y-3"
          >
            <div class="relative w-28 h-32 rounded-2xl overflow-hidden bg-gray-200 shadow-xs">
              <img
                src={leader.image}
                alt={leader.nameTh}
                class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
              />
            </div>
            <div class="space-y-1">
              <h4 class="font-bold text-sm text-gray-900 group-hover:text-brand-orange transition-colors">
                {leader.nameTh}
              </h4>
              <p class="text-xs text-brand-orange font-medium line-clamp-2">
                {leader.role}
              </p>
              {#if leader.email}
                <p class="text-[11px] text-gray-400 truncate max-w-[200px]">
                  {leader.email}
                </p>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Quick Navigation Footer Banner -->
    <section class="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="space-y-2 max-w-xl">
        <h3 class="text-2xl sm:text-3xl font-bold tracking-tight">
          {languageState.t(
            "ศึกษาต่อหรือร่วมงานวิจัยกับคณะ ITD มจพ.",
            "Join ITD KMUTNB - Study, Research & Innovate"
          )}
        </h3>
        <p class="text-xs sm:text-sm text-white/90 leading-relaxed">
          {languageState.t(
            "สำรวจหลักสูตรระดับปริญญาตรี ปริญญาโท และปริญญาเอก หรือเยี่ยมชมห้องปฏิบัติการและสถานที่จริง",
            "Explore our Undergraduate, Master's, and Doctoral programs, or visit our smart campus facilities."
          )}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3 shrink-0">
        <a
          href="/#programs"
          class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-brand-orange font-bold text-xs sm:text-sm shadow-md hover:bg-gray-100 transition-colors"
        >
          <BookOpen class="w-4 h-4 text-brand-orange" />
          <span>{languageState.t("ดูหลักสูตรการศึกษา", "View Academic Programs")}</span>
        </a>
        <a
          href="/about/history"
          class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-black/20 hover:bg-black/30 border border-white/20 text-white font-medium text-xs sm:text-sm transition-colors"
        >
          <History class="w-4 h-4" />
          <span>{languageState.t("ประวัติความเป็นมา", "Faculty History")}</span>
        </a>
      </div>
    </section>
  </div>
</div>
