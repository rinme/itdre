<script lang="ts">
  import { programs } from "$lib/data/programs";
  import type { DegreeLevel, ScheduleStatus } from "@prisma/client";
  import {
    X,
    Calendar,
    AlertCircle,
    Loader2,
    BookOpen,
    GraduationCap,
    Layers,
    CheckCircle2,
  } from "lucide-svelte";

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (newSchedule: any) => void;
    defaultAcademicYear?: number;
    defaultSemester?: number;
  }

  let {
    isOpen,
    onClose,
    onSuccess,
    defaultAcademicYear = 2567,
    defaultSemester = 1,
  }: Props = $props();

  let academicYear = $state(2567);
  let semester = $state(1);
  let degreeLevel = $state<DegreeLevel>("BACHELOR");
  let programId = $state<string>("");
  let yearLevel = $state<number>(1);
  let sectionGroup = $state<string>("Sec 1");
  let status = $state<ScheduleStatus>("DRAFT");
  let note = $state<string>("");

  let isSubmitting = $state(false);
  let errorMessage = $state<string | null>(null);

  // Filter programs dynamically according to selected degree level
  let filteredPrograms = $derived(
    programs.filter((p) => p.degree.toLowerCase() === degreeLevel.toLowerCase())
  );

  // When filtered programs change, ensure selected programId is valid
  $effect(() => {
    if (filteredPrograms.length > 0) {
      const match = filteredPrograms.find((p) => p.id === programId);
      if (!match) {
        programId = filteredPrograms[0].id;
      }
    }
  });

  // Reset modal state when opening
  $effect(() => {
    if (isOpen) {
      errorMessage = null;
      isSubmitting = false;
      academicYear = defaultAcademicYear;
      semester = defaultSemester;
    }
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = null;

    const selectedProg = programs.find((p) => p.id === programId);
    if (!selectedProg) {
      errorMessage = "กรุณาเลือกหลักสูตรการศึกษา (Please select a program)";
      return;
    }

    if (!academicYear || isNaN(Number(academicYear))) {
      errorMessage = "กรุณาระบุปีการศึกษาให้ถูกต้อง (Invalid academic year)";
      return;
    }

    isSubmitting = true;

    try {
      const response = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: Number(academicYear),
          semester: Number(semester),
          degreeLevel,
          programId: selectedProg.id,
          programName: selectedProg.titleTh,
          yearLevel: Number(yearLevel),
          sectionGroup: sectionGroup.trim() || null,
          status,
          note: note.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 || data.error === "SCHEDULE_ALREADY_EXISTS") {
          errorMessage =
            "มีตารางเรียนสำหรับรุ่นนี้อยู่แล้ว (Schedule already exists for this cohort): โปรดตรวจสอบปีการศึกษา ภาคการศึกษา หลักสูตร ชั้นปี และกลุ่มเรียน";
        } else {
          errorMessage = data.error || "ไม่สามารถสร้างตารางเรียนได้ กรุณาลองใหม่อีกครั้ง";
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
      console.error("Create schedule error:", err);
      errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง";
      isSubmitting = false;
    }
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in"
    role="dialog"
    aria-modal="true"
    aria-labelledby="schedule-modal-title"
  >
    <div
      class="relative w-full max-w-2xl bg-[#1A1B20] text-white border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-[#141518]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
            <Calendar class="w-5 h-5" />
          </div>
          <div>
            <h2 id="schedule-modal-title" class="text-lg sm:text-xl font-bold text-white leading-tight">
              สร้างตารางเรียนใหม่ (New Schedule)
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              กำหนดข้อมูลปีการศึกษา หลักสูตร และกลุ่มเรียนสำหรับตารางใหม่
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

      <!-- Error Message -->
      {#if errorMessage}
        <div class="mx-6 mt-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs sm:text-sm">
          <AlertCircle class="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div class="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      {/if}

      <!-- Form -->
      <form onsubmit={handleSubmit} class="p-6 space-y-4">
        <!-- Row 1: Academic Year & Semester -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="modal-academic-year" class="block text-xs font-semibold text-slate-300 mb-1.5">
              ปีการศึกษา (Academic Year) <span class="text-brand-orange">*</span>
            </label>
            <input
              id="modal-academic-year"
              type="number"
              min={2560}
              max={2600}
              bind:value={academicYear}
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm"
            />
          </div>

          <div>
            <label for="modal-semester" class="block text-xs font-semibold text-slate-300 mb-1.5">
              ภาคการศึกษา (Semester) <span class="text-brand-orange">*</span>
            </label>
            <select
              id="modal-semester"
              bind:value={semester}
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#23242B] border border-white/10 text-white focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm cursor-pointer"
            >
              <option value={1}>ภาคการศึกษาที่ 1 (Semester 1)</option>
              <option value={2}>ภาคการศึกษาที่ 2 (Semester 2)</option>
              <option value={3}>ภาคฤดูร้อน (Summer)</option>
            </select>
          </div>
        </div>

        <!-- Row 2: Degree Level -->
        <div>
          <span class="block text-xs font-semibold text-slate-300 mb-1.5">
            ระดับการศึกษา (Degree Level) <span class="text-brand-orange">*</span>
          </span>
          <div class="grid grid-cols-3 gap-2">
            {#each [
              { key: "BACHELOR", labelTh: "ปริญญาตรี", labelEn: "Bachelor's" },
              { key: "MASTER", labelTh: "ปริญญาโท", labelEn: "Master's" },
              { key: "DOCTOR", labelTh: "ปริญญาเอก", labelEn: "Doctorate" },
            ] as deg}
              <button
                type="button"
                onclick={() => (degreeLevel = deg.key as DegreeLevel)}
                class="py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer {degreeLevel === deg.key ? 'bg-brand-orange text-white border-brand-orange shadow-md shadow-brand-orange/20 font-semibold' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}"
              >
                <div>{deg.labelTh}</div>
                <div class="text-[10px] opacity-75">{deg.labelEn}</div>
              </button>
            {/each}
          </div>
        </div>

        <!-- Row 3: Program Selection -->
        <div>
          <label for="modal-program-id" class="block text-xs font-semibold text-slate-300 mb-1.5">
            หลักสูตรสาขาวิชา (Program) <span class="text-brand-orange">*</span>
          </label>
          <select
            id="modal-program-id"
            bind:value={programId}
            required
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#23242B] border border-white/10 text-white focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm cursor-pointer"
          >
            {#each filteredPrograms as prog (prog.id)}
              <option value={prog.id}>
                {prog.code ? `[${prog.code}] ` : ""}{prog.titleTh} ({prog.titleEn})
              </option>
            {/each}
          </select>
        </div>

        <!-- Row 4: Year Level & Section Group -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span class="block text-xs font-semibold text-slate-300 mb-1.5">
              ชั้นปี (Year Level) <span class="text-brand-orange">*</span>
            </span>
            <div class="grid grid-cols-4 gap-2">
              {#each [1, 2, 3, 4] as yr}
                <button
                  type="button"
                  onclick={() => (yearLevel = yr)}
                  class="py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer {yearLevel === yr ? 'bg-white/20 border-white/40 text-white font-bold' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}"
                >
                  ปี {yr}
                </button>
              {/each}
            </div>
          </div>

          <div>
            <label for="modal-section-group" class="block text-xs font-semibold text-slate-300 mb-1.5">
              กลุ่มเรียน / ตอนเรียน (Section Group)
            </label>
            <input
              id="modal-section-group"
              type="text"
              bind:value={sectionGroup}
              placeholder="เช่น Sec 1, ภาคปกติ, เสาร์-อาทิตย์"
              class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm"
            />
          </div>
        </div>

        <!-- Row 5: Status -->
        <div>
          <span class="block text-xs font-semibold text-slate-300 mb-1.5">
            สถานะตารางเรียนเริ่มต้น (Initial Status)
          </span>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              onclick={() => (status = "DRAFT")}
              class="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer {status === 'DRAFT' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'}"
            >
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>แบบร่าง (Draft)</span>
            </button>

            <button
              type="button"
              onclick={() => (status = "PUBLISHED")}
              class="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer {status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'}"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>เผยแพร่ทันที (Published)</span>
            </button>
          </div>
        </div>

        <!-- Row 6: Note -->
        <div>
          <label for="modal-schedule-note" class="block text-xs font-semibold text-slate-300 mb-1.5">
            หมายเหตุ / ข้อมูลเพิ่มเติม (Note - Optional)
          </label>
          <textarea
            id="modal-schedule-note"
            rows={2}
            bind:value={note}
            placeholder="ระบุข้อความเพิ่มเติมหรือบันทึกภายในสำหรับตารางเรียนนี้..."
            class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm resize-none"
          ></textarea>
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
            class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-dark-orange hover:opacity-90 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {#if isSubmitting}
              <Loader2 class="w-4 h-4 animate-spin" />
              <span>กำลังบันทึก...</span>
            {:else}
              <CheckCircle2 class="w-4 h-4" />
              <span>สร้างตารางเรียน</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
