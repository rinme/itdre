<script lang="ts">
  import { languageState } from "$lib/state/language.svelte";
  import { demoFeedbackState } from "$lib/state/feedback.svelte";
  import {
    X,
    Send,
    Star,
    CheckCircle2,
    MessageSquareHeart
  } from "lucide-svelte";

  let {
    isOpen = $bindable(demoFeedbackState.isOpen),
    onClose
  }: {
    isOpen?: boolean;
    onClose?: () => void;
  } = $props();

  let rating = $state<number>(5);
  let hoverRating = $state<number | null>(null);
  let aspect = $state<string>("design");
  let feedback = $state<string>("");
  let contact = $state<string>("");
  let isSubmitting = $state<boolean>(false);
  let isSuccess = $state<boolean>(false);

  function handleClose() {
    if (onClose) {
      onClose();
    } else {
      isOpen = false;
      demoFeedbackState.close();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && isOpen) {
      handleClose();
    }
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;

    isSubmitting = true;
    setTimeout(() => {
      isSubmitting = false;
      isSuccess = true;
      setTimeout(() => {
        isSuccess = false;
        feedback = "";
        handleClose();
      }, 2200);
    }, 800);
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div
      role="presentation"
      class="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fade-in"
      onclick={handleClose}
    ></div>

    <!-- Modal Dialog Card -->
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      class="relative w-full max-w-lg bg-[#18191E] border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-10 animate-scale-in text-white"
    >
      <!-- Header -->
      <div class="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#1f2027]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-dark-orange flex items-center justify-center text-white shadow-md shadow-orange-500/25">
            <MessageSquareHeart class="w-5 h-5" />
          </div>
          <div>
            <h3 id="feedback-modal-title" class="font-bold text-base sm:text-lg text-white">
              {languageState.t("ข้อเสนอแนะเว็บไซต์ต้นแบบ", "Renovation Demo Feedback")}
            </h3>
            <p class="text-xs text-slate-400">
              {languageState.t(
                "ความเห็นของท่านช่วยพัฒนาเว็บไซต์คณะ ITD มจพ. ให้ดียิ่งขึ้น",
                "Help us shape the future of the ITD KMUTNB website"
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onclick={handleClose}
          class="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Content Body -->
      {#if isSuccess}
        <div class="p-8 sm:p-10 text-center space-y-4 animate-fade-in">
          <div class="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 class="w-8 h-8" />
          </div>
          <h4 class="text-xl font-bold text-white">
            {languageState.t("ขอบคุณสำหรับข้อเสนอแนะ!", "Thank you for your feedback!")}
          </h4>
          <p class="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            {languageState.t(
              "ข้อมูลความคิดเห็นของท่านถูกบันทึกเรียบร้อยแล้ว ทีมงานจะนำไปปรับปรุงโครงสร้างและการออกแบบเว็บไซต์ต่อไป",
              "Your valuable feedback has been recorded and will be used to enhance the final release."
            )}
          </p>
        </div>
      {:else}
        <form onsubmit={handleSubmit} class="p-5 sm:p-6 space-y-5">
          <!-- Rating Stars -->
          <div class="space-y-2">
            <label for="rating-group" class="block text-xs font-semibold text-slate-300">
              {languageState.t("ความพึงพอใจต่อดีไซน์และฟังก์ชันต้นแบบ", "Overall Prototype Experience")}
            </label>
            <div id="rating-group" class="flex items-center gap-2">
              {#each [1, 2, 3, 4, 5] as star}
                {@const active = (hoverRating ?? rating) >= star}
                <button
                  type="button"
                  onmouseenter={() => (hoverRating = star)}
                  onmouseleave={() => (hoverRating = null)}
                  onclick={() => (rating = star)}
                  class="p-1 text-slate-600 transition-transform active:scale-90"
                  aria-label="{star} stars"
                >
                  <Star
                    class="w-6 h-6 transition-colors {active
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-600 hover:text-slate-500'}"
                  />
                </button>
              {/each}
              <span class="ml-2 text-xs font-semibold text-amber-400">
                {#if rating === 5}{languageState.t("ยอดเยี่ยมมาก (5/5)", "Excellent (5/5)")}
                {:else if rating === 4}{languageState.t("ดีมาก (4/5)", "Very Good (4/5)")}
                {:else if rating === 3}{languageState.t("ปานกลาง (3/5)", "Good (3/5)")}
                {:else if rating === 2}{languageState.t("ควรปรับปรุง (2/5)", "Needs Work (2/5)")}
                {:else if rating === 1}{languageState.t("ต้องแก้ไข (1/5)", "Poor (1/5)")}
                {/if}
              </span>
            </div>
          </div>

          <!-- Category / Aspect -->
          <div class="space-y-1.5">
            <label for="feedback-aspect" class="block text-xs font-semibold text-slate-300">
              {languageState.t("หัวข้อที่ต้องการเน้น", "Feedback Area")}
            </label>
            <select
              id="feedback-aspect"
              bind:value={aspect}
              class="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#121316] text-white text-xs sm:text-sm focus:border-brand-orange focus:outline-none"
            >
              <option value="design">{languageState.t("การออกแบบและสีสัน (Visual Design & UI)", "Visual Design & UI")}</option>
              <option value="navigation">{languageState.t("ความสะดวกในการค้นหาข้อมูล (Navigation & Search)", "Navigation & Search")}</option>
              <option value="mobile">{languageState.t("การใช้งานบนมือถือ (Mobile Responsiveness)", "Mobile Responsiveness")}</option>
              <option value="content">{languageState.t("เนื้อหาและข้อมูลหลักสูตร (Content Accuracy)", "Content & Curriculum")}</option>
              <option value="other">{languageState.t("ข้อเสนอแนะทั่วไป / อื่นๆ (Other Suggestions)", "Other Suggestions")}</option>
            </select>
          </div>

          <!-- Comments -->
          <div class="space-y-1.5">
            <label for="feedback-comments" class="block text-xs font-semibold text-slate-300">
              {languageState.t("ข้อเสนอแนะและสิ่งที่อยากให้เพิ่มเติม", "Your Comments & Ideas")} <span class="text-brand-orange">*</span>
            </label>
            <textarea
              id="feedback-comments"
              rows={3}
              required
              bind:value={feedback}
              placeholder={languageState.t(
                "ระบุความประทับใจ หรือจุดที่ควรปรับปรุงเพิ่มเติม...",
                "Tell us what you like or what could be improved in this redesign..."
              )}
              class="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#121316] placeholder-slate-500 text-white text-xs sm:text-sm focus:border-brand-orange focus:outline-none"
            ></textarea>
          </div>

          <!-- Optional Contact -->
          <div class="space-y-1.5">
            <label for="feedback-contact" class="block text-xs font-semibold text-slate-400">
              {languageState.t("ชื่อหรืออีเมลผู้ติดต่อ (ไม่บังคับ)", "Name or Email (Optional)")}
            </label>
            <input
              id="feedback-contact"
              type="text"
              bind:value={contact}
              placeholder={languageState.t("เช่น อาจารย์ / นักศึกษา / email@example.com", "e.g., Student / Faculty member / email@example.com")}
              class="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-[#121316] placeholder-slate-500 text-white text-xs focus:border-brand-orange focus:outline-none"
            />
          </div>

          <!-- Actions -->
          <div class="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onclick={handleClose}
              class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {languageState.t("ยกเลิก", "Cancel")}
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !feedback.trim()}
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-dark-orange hover:opacity-90 text-white text-xs sm:text-sm font-semibold shadow-md shadow-orange-500/25 transition-all disabled:opacity-50 active:scale-95"
            >
              {#if isSubmitting}
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{languageState.t("กำลังส่ง...", "Submitting...")}</span>
              {:else}
                <Send class="w-3.5 h-3.5" />
                <span>{languageState.t("ส่งข้อเสนอแนะ", "Send Feedback")}</span>
              {/if}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}
