<script module lang="ts">
  export interface SourceScheduleInfo {
    id: string;
    academicYear: number;
    semester: number;
    degreeLevel: string;
    programName: string;
    yearLevel: number;
    sectionGroup: string | null;
    _count?: { slots: number };
  }
</script>

<script lang="ts">
  import {
    X,
    Copy,
    AlertCircle,
    Loader2,
    Calendar,
    Layers,
    ArrowRight,
  } from "lucide-svelte";

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    sourceSchedule: SourceScheduleInfo | null;
    onSuccess?: (clonedSchedule: any) => void;
  }

  let {
    isOpen,
    onClose,
    sourceSchedule,
    onSuccess,
  }: Props = $props();

  let targetAcademicYear = $state<number>(2568);
  let targetSemester = $state<number>(1);
  let targetSectionGroup = $state<string>("");
  let isSubmitting = $state<boolean>(false);
  let errorMessage = $state<string | null>(null);

  $effect(() => {
    if (sourceSchedule && isOpen) {
      const nextSem = sourceSchedule.semester === 1 ? 2 : 1;
      const nextYear =
        sourceSchedule.semester === 2
          ? sourceSchedule.academicYear + 1
          : sourceSchedule.academicYear;

      targetAcademicYear = nextYear;
      targetSemester = nextSem;
      targetSectionGroup = sourceSchedule.sectionGroup || "Sec 1";
      errorMessage = null;
      isSubmitting = false;
    }
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!sourceSchedule) return;
    errorMessage = null;

    if (!targetAcademicYear || isNaN(Number(targetAcademicYear))) {
      errorMessage = "กรุณาระบุปีการศึกษาเป้าหมายให้ถูกต้อง (Invalid academic year)";
      return;
    }

    isSubmitting = true;

    try {
      const response = await fetch(`/api/admin/schedules/${sourceSchedule.id}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetAcademicYear: Number(targetAcademicYear),
          targetSemester: Number(targetSemester),
          targetSectionGroup: targetSectionGroup.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 || data.error === "TARGET_SCHEDULE_ALREADY_EXISTS") {
          errorMessage =
            "ตารางเรียนเป้าหมายมีอยู่แล้วสำหรับรุ่นนี้ (Target schedule already exists) โปรดเปลี่ยนปีการศึกษา ภาคการศึกษา หรือกลุ่มเรียน";
        } else {
          errorMessage = data.error || "ไม่สามารถคัดลอกตารางเรียนได้ กรุณาลองใหม่อีกครั้ง";
        }
        isSubmitting = false;
        return;
      }

      isSubmitting = false;
      if (onSuccess) {
        onSuccess(data.schedule);
      }
      onClose();
    } catch (err: any) {
      console.error("Clone schedule error:", err);
      errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง";
      isSubmitting = false;
    }
  }
</script>

{#if isOpen && sourceSchedule}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in"
    role="dialog"
    aria-modal="true"
    aria-labelledby="clone-modal-title"
  >
    <div
      class="relative w-full max-w-xl bg-[#1A1B20] text-white border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-[#141518]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Copy class="w-5 h-5" />
          </div>
          <div>
            <h2 id="clone-modal-title" class="text-lg sm:text-xl font-bold text-white leading-tight">
              คัดลอกตารางเรียน (Duplicate Schedule)
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              โคลนตารางเรียนพร้อมรายวิชาทั้งหมดไปยังปีการศึกษาหรือภาคเรียนใหม่
            </p>
          </div>
        </div>
        <button
          type="button"
          onclick={onClose}
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Source Schedule Overview Card -->
      <div class="m-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
        <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          ตารางต้นทาง (Source Schedule)
        </div>
        <div class="text-sm font-bold text-white">
          {sourceSchedule.programName} (ชั้นปี {sourceSchedule.yearLevel})
        </div>
        <div class="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
          <span class="inline-flex items-center gap-1">
            <Calendar class="w-3.5 h-3.5 text-brand-orange" />
            ภาค {sourceSchedule.semester}/{sourceSchedule.academicYear}
          </span>
          <span class="inline-flex items-center gap-1">
            <Layers class="w-3.5 h-3.5 text-blue-400" />
            {sourceSchedule.sectionGroup || "Sec 1"}
          </span>
          {#if sourceSchedule._count?.slots !== undefined}
            <span class="text-brand-orange font-semibold">
              {sourceSchedule._count.slots} วิชาที่จะถูกคัดลอก
            </span>
          {/if}
        </div>
      </div>

      <!-- Error Banner -->
      {#if errorMessage}
        <div class="mx-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs sm:text-sm">
          <AlertCircle class="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div class="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      {/if}

      <!-- Target Form -->
      <form onsubmit={handleSubmit} class="p-6 space-y-4">
        <div class="text-xs font-semibold text-brand-orange uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ArrowRight class="w-3.5 h-3.5" />
          <span>กำหนดข้อมูลเป้าหมายใหม่ (Target Settings)</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="clone-target-year" class="block text-xs font-semibold text-slate-300 mb-1.5">
              ปีการศึกษาเป้าหมาย (Target Academic Year) <span class="text-brand-orange">*</span>
            </label>
            <input
              id="clone-target-year"
              type="number"
              min={2560}
              max={2600}
              bind:value={targetAcademicYear}
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm"
            />
          </div>

          <div>
            <label for="clone-target-semester" class="block text-xs font-semibold text-slate-300 mb-1.5">
              ภาคการศึกษาเป้าหมาย (Target Semester) <span class="text-brand-orange">*</span>
            </label>
            <select
              id="clone-target-semester"
              bind:value={targetSemester}
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#23242B] border border-white/10 text-white focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm cursor-pointer"
            >
              <option value={1}>ภาคการศึกษาที่ 1 (Semester 1)</option>
              <option value={2}>ภาคการศึกษาที่ 2 (Semester 2)</option>
              <option value={3}>ภาคฤดูร้อน (Summer)</option>
            </select>
          </div>
        </div>

        <div>
          <label for="clone-target-section" class="block text-xs font-semibold text-slate-300 mb-1.5">
            กลุ่มเรียน / ตอนเรียนเป้าหมาย (Target Section Group)
          </label>
          <input
            id="clone-target-section"
            type="text"
            bind:value={targetSectionGroup}
            placeholder="เช่น Sec 1, Sec 2, ภาคปกติ"
            class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm"
          />
          <p class="text-[11px] text-slate-400 mt-1">
            ตารางเรียนที่คัดลอกจะถูกตั้งค่าเป็น <strong>แบบร่าง (DRAFT)</strong> โดยอัตโนมัติ เพื่อให้ท่านตรวจสอบก่อนเผยแพร่
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onclick={onClose}
            disabled={isSubmitting}
            class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs sm:text-sm font-medium transition-all cursor-pointer"
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {#if isSubmitting}
              <Loader2 class="w-4 h-4 animate-spin" />
              <span>กำลังคัดลอก...</span>
            {:else}
              <Copy class="w-4 h-4" />
              <span>คัดลอกตารางเรียน</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
