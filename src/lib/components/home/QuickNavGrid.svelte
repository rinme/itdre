<script lang="ts">
  import { languageState } from "$lib/state/language.svelte";
  import {
    GraduationCap,
    CalendarDays,
    Laptop,
    DownloadCloud,
    ArrowUpRight,
    ChevronRight,
    ExternalLink
  } from "lucide-svelte";

  const quickNavItems = [
    {
      id: "admissions",
      titleTh: "รับสมัครนักศึกษาใหม่",
      titleEn: "Admissions (Online)",
      descTh: "เปิดรับสมัครระดับปริญญาตรี ปริญญาโท และปริญญาเอก",
      descEn: "Undergraduate & Graduate admissions for all programs",
      href: "https://www.admission.kmutnb.ac.th",
      external: true,
      icon: GraduationCap,
      accentColor: "from-orange-500 to-amber-500",
      badgeColor: "bg-orange-100 text-orange-800",
      tagTh: "TCAS 2569 / รับตรง",
      tagEn: "TCAS / Direct Admission",
      subLinks: [
        {
          nameTh: "ปริญญาตรี (TCAS)",
          nameEn: "Bachelor Degrees",
          href: "https://www.admission.kmutnb.ac.th",
          external: true
        },
        {
          nameTh: "ปริญญาโท - ปริญญาเอก",
          nameEn: "Master & PhD",
          href: "https://grad.admission.kmutnb.ac.th",
          external: true
        }
      ]
    },
    {
      id: "timetable",
      titleTh: "ตารางเรียน & ปฏิทินวิชาการ",
      titleEn: "Timetable & Calendar",
      descTh: "ตารางเรียน ตารางสอน ตารางสอบ และปฏิทินการศึกษา มจพ.",
      descEn: "Class schedules, teaching timetables, exam schedules, and academic calendars",
      href: "/schedules",
      external: false,
      icon: CalendarDays,
      accentColor: "from-blue-500 to-cyan-500",
      badgeColor: "bg-blue-100 text-blue-800",
      tagTh: "ภาคเรียนปัจจุบัน",
      tagEn: "Current Term",
      subLinks: [
        {
          nameTh: "ตารางเรียน / ตารางสอน",
          nameEn: "Class & Teaching Schedule",
          href: "/schedules",
          external: false
        },
        {
          nameTh: "ปฏิทินการศึกษา มจพ.",
          nameEn: "KMUTNB Calendar",
          href: "http://acdserv.kmutnb.ac.th/academic-calendar",
          external: true
        }
      ]
    },
    {
      id: "e-services",
      titleTh: "Student e-Services",
      titleEn: "Student e-Services",
      descTh: "ระบบสารสนเทศนักศึกษา บริการออนไลน์ และบัญชี ICIT",
      descEn: "Online portals, ICIT account, Wi-Fi, and SAR systems",
      href: "/services#e-services",
      external: false,
      icon: Laptop,
      accentColor: "from-emerald-500 to-teal-500",
      badgeColor: "bg-emerald-100 text-emerald-800",
      tagTh: "ระบบบริการออนไลน์",
      tagEn: "Portal & Services",
      subLinks: [
        {
          nameTh: "ระบบประกันคุณภาพ (SAR)",
          nameEn: "QA SAR System",
          href: "https://itd.kmutnb.ac.th/sar",
          external: true
        },
        {
          nameTh: "บริการทั้งหมด",
          nameEn: "All Services",
          href: "/services#e-services",
          external: false
        }
      ]
    },
    {
      id: "downloads",
      titleTh: "ดาวน์โหลดเอกสาร & แบบฟอร์ม",
      titleEn: "Downloads & Forms",
      descTh: "แบบฟอร์มคำร้องทั่วไป เอกสารฝึกงาน และหลักสูตร",
      descEn: "Student petition forms, internship documents, syllabus",
      href: "/services#downloads",
      external: false,
      icon: DownloadCloud,
      accentColor: "from-purple-500 to-indigo-500",
      badgeColor: "bg-purple-100 text-purple-800",
      tagTh: "แบบฟอร์มคำร้อง",
      tagEn: "Forms & Files",
      subLinks: [
        {
          nameTh: "คำร้องทั่วไป",
          nameEn: "General Petitions",
          href: "/services#downloads",
          external: false
        },
        {
          nameTh: "คำร้องฝึกงาน/สหกิจ",
          nameEn: "Internship Forms",
          href: "/services#downloads",
          external: false
        }
      ]
    }
  ];
</script>

<section class="w-full py-8 sm:py-12 -mt-2 sm:-mt-4 relative z-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {#each quickNavItems as item (item.id)}
        {@const Icon = item.icon}
        <div
          class="group relative bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-2xl hover:shadow-orange-500/10 hover:border-brand-orange/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
        >
          <!-- Subtle Accent Glow Top Bar -->
          <div class="absolute top-0 inset-x-6 h-0.5 rounded-full bg-gradient-to-r from-transparent via-slate-200 to-transparent group-hover:from-brand-orange group-hover:via-amber-400 group-hover:to-brand-dark-orange transition-all duration-500"></div>

          <div>
            <!-- Top Row: Icon & Tag -->
            <div class="flex items-center justify-between gap-2 mb-4">
              <div
                class="w-12 h-12 rounded-2xl bg-gradient-to-br {item.accentColor} text-white flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 group-hover:rotate-1 transition-transform duration-300"
              >
                <Icon class="w-6 h-6" />
              </div>

              <span
                class="text-[11px] font-semibold px-3 py-1 rounded-full border border-slate-200/60 {item.badgeColor}"
              >
                {languageState.t(item.tagTh, item.tagEn)}
              </span>
            </div>

            <!-- Main Title & Link -->
            {#if item.external}
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                class="group/title block focus-visible:ring-2 focus-visible:ring-brand-orange rounded-xl -m-1 p-1 active:scale-98 transition-transform"
              >
                <h3 class="text-base sm:text-lg font-bold text-slate-900 group-hover/title:text-brand-orange transition-colors flex items-center gap-1.5 leading-snug">
                  <span>{languageState.t(item.titleTh, item.titleEn)}</span>
                  <ArrowUpRight class="w-4 h-4 opacity-40 group-hover/title:opacity-100 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 transition-all text-brand-orange shrink-0" />
                </h3>
              </a>
            {:else}
              <a
                href={item.href}
                class="group/title block focus-visible:ring-2 focus-visible:ring-brand-orange rounded-xl -m-1 p-1 active:scale-98 transition-transform"
              >
                <h3 class="text-base sm:text-lg font-bold text-slate-900 group-hover/title:text-brand-orange transition-colors flex items-center gap-1.5 leading-snug">
                  <span>{languageState.t(item.titleTh, item.titleEn)}</span>
                  <ChevronRight class="w-4 h-4 opacity-40 group-hover/title:opacity-100 group-hover/title:translate-x-0.5 transition-all text-brand-orange shrink-0" />
                </h3>
              </a>
            {/if}

            <!-- Description -->
            <p class="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {languageState.t(item.descTh, item.descEn)}
            </p>
          </div>

          <!-- Sub Quick Links -->
          <div class="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
            {#each item.subLinks as sub (sub.nameTh)}
              {#if sub.external}
                <a
                  href={sub.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-600 hover:text-brand-orange bg-slate-50 hover:bg-orange-50/80 px-2.5 py-1.5 rounded-xl transition-all border border-slate-200/70 hover:border-orange-200 active:scale-95 font-medium"
                >
                  <span>{languageState.t(sub.nameTh, sub.nameEn)}</span>
                  <ExternalLink class="w-2.5 h-2.5 opacity-60" />
                </a>
              {:else}
                <a
                  href={sub.href}
                  class="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-600 hover:text-brand-orange bg-slate-50 hover:bg-orange-50/80 px-2.5 py-1.5 rounded-xl transition-all border border-slate-200/70 hover:border-orange-200 active:scale-95 font-medium"
                >
                  <span>{languageState.t(sub.nameTh, sub.nameEn)}</span>
                </a>
              {/if}
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
