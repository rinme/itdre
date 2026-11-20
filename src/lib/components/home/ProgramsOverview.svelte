<script lang="ts">
  import { programs } from "$lib/data/programs";
  import { languageState } from "$lib/state/language.svelte";
  import {
    GraduationCap,
    Clock,
    Coins,
    ExternalLink,
    BookOpen,
    Award,
    Sparkles
  } from "lucide-svelte";

  type DegreeFilter = "all" | "bachelor" | "master" | "doctor";

  let selectedDegree = $state<DegreeFilter>("all");

  const degreeTabs = [
    { id: "all" as const, titleTh: "ทุกระดับการศึกษา", titleEn: "All Programs", icon: GraduationCap },
    { id: "bachelor" as const, titleTh: "ระดับปริญญาตรี (วท.บ. / วศ.บ.)", titleEn: "Bachelor's Degrees", icon: BookOpen },
    { id: "master" as const, titleTh: "ระดับปริญญาโท (วท.ม.)", titleEn: "Master's Degrees", icon: Award },
    { id: "doctor" as const, titleTh: "ระดับปริญญาเอก (ปร.ด.)", titleEn: "Doctoral Degrees", icon: Sparkles }
  ];

  let filteredPrograms = $derived(
    selectedDegree === "all"
      ? programs
      : programs.filter((p) => p.degree === selectedDegree)
  );

  function getDegreeBadge(degree: string) {
    switch (degree) {
      case "bachelor":
        return {
          label: languageState.t("ระดับปริญญาตรี", "Bachelor's Degree"),
          tag: "Undergraduate",
          color: "bg-orange-100 text-brand-dark-orange border-orange-200",
          gradient: "from-orange-500 to-amber-500"
        };
      case "master":
        return {
          label: languageState.t("ระดับปริญญาโท", "Master's Degree"),
          tag: "Graduate",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          gradient: "from-blue-600 to-indigo-600"
        };
      case "doctor":
        return {
          label: languageState.t("ระดับปริญญาเอก", "Doctoral Degree"),
          tag: "Ph.D.",
          color: "bg-purple-100 text-purple-800 border-purple-200",
          gradient: "from-purple-600 to-pink-600"
        };
      default:
        return {
          label: languageState.t("หลักสูตร", "Program"),
          tag: "Academic",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          gradient: "from-gray-600 to-gray-800"
        };
    }
  }
</script>

<section id="programs" class="w-full py-16 sm:py-24 bg-[#FAFAFC] border-b border-slate-200/80 relative">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
    <!-- Section Header -->
    <div class="text-center max-w-3xl mx-auto space-y-3">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-light-orange border border-orange-200/80 text-brand-dark-orange text-xs font-bold tracking-wide">
        <GraduationCap class="w-4 h-4 text-brand-orange" />
        <span>{languageState.t("หลักสูตรการศึกษาที่เปิดสอน", "ACADEMIC PROGRAMS")}</span>
      </div>
      <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
        {languageState.t("หลักสูตรระดับปริญญาตรี ปริญญาโท และปริญญาเอก", "Undergraduate & Graduate Programs")}
      </h2>
      <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
        {languageState.t(
          "หลักสูตรทันสมัยที่ได้รับการรับรองมาตรฐานสากล มุ่งเน้นการปฏิบัติจริง ตอบสนองความต้องการของอุตสาหกรรมดิจิทัล ปัญญาประดิษฐ์ และความมั่นคงไซเบอร์",
          "World-class curricula designed for hands-on expertise in software engineering, AI, cybersecurity, and digital business innovation."
        )}
      </p>
    </div>

    <!-- Degree Filter Switcher -->
    <div class="flex justify-center">
      <div class="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs max-w-full">
        {#each degreeTabs as tab (tab.id)}
          {@const isActive = selectedDegree === tab.id}
          {@const Icon = tab.icon}
          <button
            type="button"
            onclick={() => selectedDegree = tab.id}
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 cursor-pointer {isActive
              ? 'bg-brand-orange text-white shadow-md shadow-orange-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}"
          >
            <Icon class="w-4 h-4 shrink-0" />
            <span>{languageState.t(tab.titleTh, tab.titleEn)}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Programs Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {#each filteredPrograms as program (program.id)}
        {@const badge = getDegreeBadge(program.degree)}
        <div
          class="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-2xl hover:shadow-orange-500/10 hover:border-brand-orange/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <!-- Card Header & Content -->
          <div class="p-6 sm:p-7 space-y-4">
            <!-- Degree Badge Row -->
            <div class="flex items-center justify-between gap-2">
              <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border {badge.color}">
                <span>{badge.label}</span>
              </span>
              <span class="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                {badge.tag}
              </span>
            </div>

            <!-- Title -->
            <div class="space-y-1">
              <h3 class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-orange transition-colors leading-snug">
                {languageState.language === "en" && program.titleEn ? program.titleEn : program.titleTh}
              </h3>
              {#if languageState.language === "th" && program.titleEn}
                <p class="text-xs text-slate-500 line-clamp-1 italic font-medium">
                  {program.titleEn}
                </p>
              {/if}
            </div>

            <!-- Description -->
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
              {program.shortDescription}
            </p>

            <!-- Program Metadata Specs -->
            <div class="pt-3 space-y-2 border-t border-slate-100 text-xs text-slate-600 font-mono">
              <div class="flex items-center gap-2">
                <Clock class="w-3.5 h-3.5 text-brand-orange shrink-0" />
                <span class="font-semibold text-slate-800 font-sans">{languageState.t("ระยะเวลา:", "Duration:")}</span>
                <span class="tabular-nums font-medium">{program.duration}</span>
              </div>

              {#if program.tuition}
                <div class="flex items-center gap-2">
                  <Coins class="w-3.5 h-3.5 text-brand-orange shrink-0" />
                  <span class="font-semibold text-slate-800 font-sans">{languageState.t("ค่าธรรมเนียม:", "Tuition:")}</span>
                  <span class="tabular-nums font-medium">{program.tuition}</span>
                </div>
              {/if}
            </div>
          </div>

          <!-- Card Action Footer -->
          <div class="p-6 sm:p-7 pt-0 mt-auto">
            <a
              href={program.link}
              target="_blank"
              rel="noopener noreferrer"
              class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-50 hover:bg-gradient-to-r hover:from-brand-orange hover:to-brand-dark-orange text-slate-700 hover:text-white border border-slate-200 hover:border-transparent text-xs sm:text-sm font-bold transition-all duration-300 shadow-2xs hover:shadow-md hover:shadow-orange-500/20 active:scale-95 group/btn"
            >
              <span>{languageState.t("ดูรายละเอียด & สมัครเรียน", "Program Details & Apply")}</span>
              <ExternalLink class="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
            </a>
          </div>
        </div>
      {/each}
    </div>

    <!-- Admissions Call to Action Banner -->
    <div class="relative rounded-3xl bg-gradient-to-r from-[#141519] via-[#1C1E24] to-[#121316] p-8 sm:p-12 text-white shadow-2xl overflow-hidden border border-white/10">
      <div class="absolute top-0 right-0 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3 animate-pulse-glow"></div>

      <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
        <div class="space-y-3 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/40 text-orange-300 text-xs font-bold">
            <Sparkles class="w-3.5 h-3.5 text-brand-orange" />
            <span>{languageState.t("เปิดรับสมัครนักศึกษาใหม่ 2569", "Admissions Open for Academic Year 2026")}</span>
          </div>
          <h3 class="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            {languageState.t(
              "พร้อมก้าวสู่อนาคตสายไอทีและนวัตกรรมดิจิทัลกับเรา",
              "Ready to Shape the Future of IT & Digital Innovation?"
            )}
          </h3>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {languageState.t(
              "สมัครเรียนออนไลน์ผ่านระบบกลาง มจพ. ทั้งระดับปริญญาตรี (TCAS / โควตา / รับตรง) และระดับบัณฑิตศึกษา",
              "Apply online via the central KMUTNB admissions portal for undergraduate and graduate programs."
            )}
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <a
            href="https://www.admission.kmutnb.ac.th"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-dark-orange hover:opacity-95 text-white text-sm font-bold shadow-xl shadow-orange-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <span>{languageState.t("สมัครระดับปริญญาตรี (TCAS)", "Undergraduate Admissions")}</span>
            <ExternalLink class="w-4 h-4" />
          </a>

          <a
            href="https://grad.admission.kmutnb.ac.th"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold border border-white/15 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          >
            <span>{languageState.t("สมัครระดับ ป.โท - ป.เอก", "Graduate Admissions")}</span>
            <ExternalLink class="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
