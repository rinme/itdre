<script lang="ts">
  import { languageState } from "$lib/state/language.svelte";
  import {
    Phone,
    GraduationCap,
    FileText,
    ExternalLink,
    Laptop
  } from "lucide-svelte";
</script>

<header class="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative z-40">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
    <!-- Faculty Brand Logo -->
    <a
      href="/"
      class="flex items-center gap-3 shrink-0 group focus-visible:ring-2 focus-visible:ring-brand-orange rounded-xl p-1 -m-1 transition-transform active:scale-[0.99]"
      title="คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ"
    >
      <div class="relative h-10 sm:h-11 w-[180px] sm:w-[250px] flex items-center">
        <img
          src="/assets/logos/Logo-Header.png"
          alt="Faculty of Information Technology and Digital Innovation, KMUTNB"
          class="h-10 sm:h-11 w-auto max-w-[180px] sm:max-w-[250px] object-contain object-left transition-transform duration-200 group-hover:scale-[1.01]"
        />
      </div>
    </a>

    <!-- Right Controls -->
    <div class="flex items-center gap-3 sm:gap-4">
      <!-- Quick Access Action Bar - Desktop & Large Tablets -->
      <div class="hidden xl:flex items-center gap-2 text-xs">
        <a
          href="https://www.admission.kmutnb.ac.th"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-light-orange hover:bg-orange-100 text-brand-dark-orange font-semibold border border-orange-200/80 transition-all hover:shadow-xs active:scale-95"
        >
          <GraduationCap class="w-3.5 h-3.5 text-brand-orange" />
          <span>{languageState.t("สมัครเรียนออนไลน์ 2569", "Admissions 2026")}</span>
          <ExternalLink class="w-2.5 h-2.5 opacity-70" />
        </a>

        <a
          href="/services#e-services"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-600 hover:text-brand-orange hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all active:scale-95"
        >
          <Laptop class="w-3.5 h-3.5 text-slate-400" />
          <span>{languageState.t("Student e-Services", "e-Services")}</span>
        </a>

        <a
          href="/services#downloads"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-600 hover:text-brand-orange hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all active:scale-95"
        >
          <FileText class="w-3.5 h-3.5 text-slate-400" />
          <span>{languageState.t("ดาวน์โหลดเอกสาร", "Downloads")}</span>
        </a>
      </div>

      <!-- Social Channels & Contact - Tablet/Desktop -->
      <div class="hidden sm:flex items-center gap-1.5 border-l border-slate-200 pl-3 sm:pl-4">
        <a
          href="https://www.facebook.com/IT.KMUTNB"
          target="_blank"
          rel="noopener noreferrer"
          class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#1877F2] hover:bg-blue-50 transition-all p-1 active:scale-90"
          title="Facebook Fanpage"
          aria-label="Facebook"
        >
          <img
            src="/assets/logos/facebook.png"
            alt="Facebook"
            width="18"
            height="18"
            class="w-4 h-4 object-contain"
          />
        </a>

        <a
          href="https://line.me/ti/p/~@it.kmutnb"
          target="_blank"
          rel="noopener noreferrer"
          class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#00B900] hover:bg-green-50 transition-all p-1 active:scale-90"
          title="LINE Official Account"
          aria-label="Line"
        >
          <img
            src="/assets/logos/line.png"
            alt="Line OA"
            width="18"
            height="18"
            class="w-4 h-4 object-contain"
          />
        </a>

        <a
          href="/contact"
          class="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-orange transition-colors px-2.5 py-1 rounded-lg hover:bg-slate-50 font-medium active:scale-95"
          title={languageState.t("ติดต่อคณะ", "Contact Us")}
        >
          <Phone class="w-3.5 h-3.5 text-brand-orange" />
          <span class="hidden md:inline">{languageState.t("ติดต่อเรา", "Contact")}</span>
        </a>
      </div>

      <!-- Bilingual Language Switcher Toggle -->
      <div class="flex items-center bg-slate-100/90 p-0.5 rounded-full border border-slate-200/80 shadow-inner">
        <button
          type="button"
          onclick={() => languageState.setLanguage("th")}
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 {languageState.language === 'th'
            ? 'bg-brand-orange text-white shadow-xs'
            : 'text-slate-500 hover:text-slate-900'}"
          aria-label="ภาษาไทย"
        >
          <img
            src="/assets/logos/th-flag.png"
            alt="TH"
            width="14"
            height="14"
            class="w-3.5 h-3.5 rounded-full object-cover shadow-2xs"
          />
          <span>TH</span>
        </button>
        <button
          type="button"
          onclick={() => languageState.setLanguage("en")}
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 {languageState.language === 'en'
            ? 'bg-brand-orange text-white shadow-xs'
            : 'text-slate-500 hover:text-slate-900'}"
          aria-label="English"
        >
          <img
            src="/assets/logos/uk-flag.png"
            alt="EN"
            width="14"
            height="14"
            class="w-3.5 h-3.5 rounded-full object-cover shadow-2xs"
          />
          <span>EN</span>
        </button>
      </div>
    </div>
  </div>
</header>
