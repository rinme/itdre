<script lang="ts">
  import { footerNav } from "$lib/data/navigation";
  import { contactInfo } from "$lib/data/contact";
  import { languageState } from "$lib/state/language.svelte";
  import {
    MapPin,
    Phone,
    Mail,
    ExternalLink,
    ChevronRight,
    ArrowUp
  } from "lucide-svelte";

  function scrollToTop() {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }

  const currentYear = new Date().getFullYear();
</script>

<footer class="w-full bg-[#0C0D11] text-slate-300 relative z-30 mt-auto overflow-hidden">
  <!-- Top Accent Gradient Border -->
  <div class="h-1 w-full bg-gradient-to-r from-brand-orange via-amber-400 to-brand-dark-orange"></div>

  <!-- Top Bar / Quick Accent Bar -->
  <div class="border-b border-white/10 bg-[#111217]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3 text-center sm:text-left">
        <span class="w-2.5 h-2.5 rounded-full bg-brand-orange animate-pulse shadow-[0_0_10px_#FF6B00]"></span>
        <span class="text-xs sm:text-sm text-slate-200 font-medium">
          {languageState.t(
            "คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
            "Faculty of Information Technology and Digital Innovation, KMUTNB"
          )}
        </span>
      </div>

      <button
        type="button"
        onclick={scrollToTop}
        class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-white/10 shadow-xs active:scale-95 group"
        aria-label="Scroll back to top"
      >
        <ArrowUp class="w-3.5 h-3.5 text-brand-orange transition-transform group-hover:-translate-y-0.5" />
        <span>{languageState.t("กลับขึ้นด้านบน", "Back to top")}</span>
      </button>
    </div>
  </div>

  <!-- Main Footer Directory -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
      <!-- Column 1: Faculty Info & Contact (Span 4 cols on desktop) -->
      <div class="lg:col-span-4 space-y-6">
        <a href="/" class="inline-block group active:scale-98 transition-transform">
          <div class="relative h-12 w-48 sm:w-56 flex items-center">
            <img
              src="/assets/logos/Logo-Footer.png"
              alt="Faculty of Information Technology and Digital Innovation, KMUTNB"
              class="h-12 w-auto max-w-[192px] sm:max-w-[224px] object-contain object-left invert brightness-200 contrast-200"
            />
          </div>
        </a>

        <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {languageState.t(
            "มุ่งมั่นผลิตบัณฑิต วิจัย และพัฒนานวัตกรรมด้านเทคโนโลยีสารสนเทศและดิจิทัลที่มีคุณภาพสูง สอดคล้องกับความต้องการของสังคมและภาคอุตสาหกรรมในระดับสากล",
            "Dedicated to cultivating high-caliber graduates, research, and innovation in information technology and digital innovation meeting international standards and industry demands."
          )}
        </p>

        <div class="space-y-3 text-xs sm:text-sm text-slate-300">
          <div class="flex items-start gap-3">
            <div class="p-1.5 rounded-lg bg-white/5 border border-white/10 shrink-0 mt-0.5">
              <MapPin class="w-3.5 h-3.5 text-brand-orange" />
            </div>
            <span class="leading-relaxed text-slate-300">
              {languageState.t(contactInfo.addressTh, contactInfo.addressEn)}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-1.5 rounded-lg bg-white/5 border border-white/10 shrink-0">
              <Phone class="w-3.5 h-3.5 text-brand-orange" />
            </div>
            <a
              href="tel:025552000"
              class="hover:text-white hover:underline transition-colors text-slate-300"
            >
              {languageState.t("02-555-2000 ต่อ 2701 - 2708", "+66 2 555 2000 Ext. 2701 - 2708")}
            </a>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-1.5 rounded-lg bg-white/5 border border-white/10 shrink-0">
              <Mail class="w-3.5 h-3.5 text-brand-orange" />
            </div>
            <a
              href="mailto:{contactInfo.emailGeneral}"
              class="hover:text-white hover:underline transition-colors text-slate-300"
            >
              {contactInfo.emailGeneral}
            </a>
          </div>
        </div>

        <!-- Social Channels -->
        <div class="pt-2">
          <span class="block text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
            {languageState.t("ช่องทางการติดตาม", "Follow Us")}
          </span>
          <div class="flex items-center gap-2.5">
            <a
              href={contactInfo.socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              class="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#1877F2] border border-white/10 hover:border-transparent flex items-center justify-center p-2 transition-all active:scale-90 group"
              aria-label="Facebook Fanpage"
            >
              <img
                src="/assets/logos/footer-facebook.png"
                alt="Facebook"
                width="20"
                height="20"
                class="w-4 h-4 object-contain"
              />
            </a>

            <a
              href={contactInfo.socialLinks.line}
              target="_blank"
              rel="noopener noreferrer"
              class="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#00B900] border border-white/10 hover:border-transparent flex items-center justify-center p-2 transition-all active:scale-90 group"
              aria-label="Line Official Account"
            >
              <img
                src="/assets/logos/footer-line.png"
                alt="Line OA"
                width="20"
                height="20"
                class="w-4 h-4 object-contain"
              />
            </a>

            <a
              href={contactInfo.socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              class="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#FF0000] border border-white/10 hover:border-transparent flex items-center justify-center p-2 transition-all active:scale-90 group"
              aria-label="YouTube Channel"
            >
              <img
                src="/assets/logos/footer-youtube.png"
                alt="YouTube"
                width="20"
                height="20"
                class="w-4 h-4 object-contain"
              />
            </a>
          </div>
        </div>
      </div>

      <!-- Column 2, 3, 4: Structured Footer Navigation Groups -->
      <div class="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {#each footerNav as group (group.titleTh)}
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-white tracking-wide border-l-2 border-brand-orange pl-3">
              {languageState.t(group.titleTh, group.titleEn)}
            </h3>
            <ul class="space-y-2.5 text-xs sm:text-sm text-slate-400">
              {#each group.items as item (item.href + item.titleTh)}
                {#if item.external}
                  <li>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1.5 hover:text-brand-orange hover:translate-x-1 transition-all group"
                    >
                      <span>{languageState.t(item.titleTh, item.titleEn)}</span>
                      <ExternalLink class="w-3 h-3 opacity-50 group-hover:opacity-100 shrink-0 ml-0.5" />
                    </a>
                  </li>
                {:else}
                  <li>
                    <a
                      href={item.href}
                      class="inline-flex items-center gap-1.5 hover:text-brand-orange hover:translate-x-1 transition-all group"
                    >
                      <ChevronRight class="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:text-brand-orange shrink-0" />
                      <span>{languageState.t(item.titleTh, item.titleEn)}</span>
                    </a>
                  </li>
                {/if}
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Copyright & Secondary Legal Bar -->
  <div class="border-t border-white/10 bg-[#08090C]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
      <p class="text-center sm:text-left font-mono text-[11px] sm:text-xs">
        © {currentYear} ITD KMUTNB. All rights reserved.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-4 text-slate-400">
        <a href="/about" class="hover:text-brand-orange transition-colors">
          {languageState.t("เกี่ยวกับคณะ", "About Us")}
        </a>
        <span>•</span>
        <a href="/services#downloads" class="hover:text-brand-orange transition-colors">
          {languageState.t("แบบฟอร์มคำร้อง", "Downloads")}
        </a>
        <span>•</span>
        <a href="/contact" class="hover:text-brand-orange transition-colors">
          {languageState.t("ติดต่อเรา", "Contact")}
        </a>
      </div>
    </div>
  </div>
</footer>
