<script lang="ts">
  import { programs } from "$lib/data/programs";
  import type { DegreeLevel, ScheduleStatus, DayOfWeek } from "@prisma/client";
  import {
    X,
    UploadCloud,
    FileSpreadsheet,
    FileText,
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Calendar,
    GraduationCap,
    Clock,
    MapPin,
    Users,
    BookOpen,
    Layers,
    ArrowRight,
    RotateCcw,
    Check,
    HelpCircle,
    Info,
    Sparkles,
    Lock,
  } from "lucide-svelte";
  import {
    formatCourseNameByPreference,
    type FormattedImportSlot as ImportSlotItem,
  } from "$lib/utils/timetable-utils";

  export interface TargetScheduleInfo {
    id: string;
    academicYear: number;
    semester: number;
    degreeLevel: DegreeLevel;
    programId: string;
    programName: string;
    yearLevel: number;
    sectionGroup: string | null;
  }

  export interface ImportSlotItem {
    id: string;
    courseCode: string;
    courseNameTh: string;
    courseNameEn: string;
    section: string;
    sectionType: "lecture" | "lab" | "other";
    courseType: "LECTURE" | "LAB" | "BOTH";
    dayOfWeek: DayOfWeek;
    dayAbbrTh: string;
    startTime: string;
    endTime: string;
    room: string;
    instructors: string[];
    creditsRaw: string;
    creditsTotal: number | null;
    color: string;
    selected: boolean;
  }

  interface Props {
    isOpen: boolean;
    targetSchedule?: TargetScheduleInfo | null;
    onClose: () => void;
    onSuccess?: (scheduleId: string, message: string) => void;
  }

  let { isOpen, targetSchedule = null, onClose, onSuccess }: Props = $props();

  // Step: 1 = upload, 2 = review & config
  let currentStep = $state<1 | 2>(1);

  // File upload state
  let isDragging = $state(false);
  let fileInput = $state<HTMLInputElement | null>(null);
  let selectedFile = $state<File | null>(null);
  let isParsing = $state(false);
  let parseError = $state<string | null>(null);

  // Parsed data
  let parsedMetadata = $state<{
    source_file: string | null;
    source_url: string | null;
    academic_year_be: number | null;
    academic_year_ad: number | null;
    semester: number | null;
    week_date_range?: { raw: string } | null;
    printed_at?: string | null;
    total_courses: number;
    total_sections: number;
    total_credits: number;
  } | null>(null);

  let detectedSlots = $state<ImportSlotItem[]>([]);
  let internalConflicts = $state<
    Array<{
      slotAId: string;
      slotBId: string;
      message: string;
    }>
  >([]);

  // Cohort form state (if not prefilled by targetSchedule)
  let academicYear = $state<number>(2568);
  let semester = $state<number>(1);
  let degreeLevel = $state<DegreeLevel>("BACHELOR");
  let programId = $state<string>("bachelor-itd");
  let yearLevel = $state<number>(1);
  let sectionGroup = $state<string>("Sec 1");

  // Naming & Import mode preferences
  let namingPreference = $state<"THAI_EN" | "EN" | "TH">("THAI_EN");
  let importMode = $state<"REPLACE" | "APPEND">("REPLACE");

  // Filter slots in checklist
  let slotFilterQuery = $state("");

  // Commit state
  let isCommitting = $state(false);
  let commitError = $state<string | null>(null);

  // Filter programs dynamically according to degree level
  let filteredPrograms = $derived(
    programs.filter((p) => p.degree.toLowerCase() === degreeLevel.toLowerCase())
  );

  $effect(() => {
    if (filteredPrograms.length > 0) {
      const match = filteredPrograms.find((p) => p.id === programId);
      if (!match) {
        programId = filteredPrograms[0].id;
      }
    }
  });

  // Reset modal state on open
  $effect(() => {
    if (isOpen) {
      currentStep = 1;
      selectedFile = null;
      isParsing = false;
      parseError = null;
      parsedMetadata = null;
      detectedSlots = [];
      internalConflicts = [];
      commitError = null;
      isCommitting = false;
      slotFilterQuery = "";
      namingPreference = "THAI_EN";
      importMode = "REPLACE";

      if (targetSchedule) {
        academicYear = targetSchedule.academicYear;
        semester = targetSchedule.semester;
        degreeLevel = targetSchedule.degreeLevel;
        programId = targetSchedule.programId;
        yearLevel = targetSchedule.yearLevel;
        sectionGroup = targetSchedule.sectionGroup || "Sec 1";
      } else {
        academicYear = 2568;
        semester = 1;
        degreeLevel = "BACHELOR";
        programId = "bachelor-itd";
        yearLevel = 1;
        sectionGroup = "Sec 1";
      }
    }
  });

  // Selected slots count & credits
  let selectedSlots = $derived(detectedSlots.filter((s) => s.selected));
  let uniqueSelectedCourses = $derived(
    new Set(selectedSlots.map((s) => s.courseCode)).size
  );
  let totalSelectedCredits = $derived.by(() => {
    // Unique course credits
    const courseCreditsMap = new Map<string, number>();
    for (const slot of selectedSlots) {
      if (!courseCreditsMap.has(slot.courseCode) && slot.creditsTotal) {
        courseCreditsMap.set(slot.courseCode, slot.creditsTotal);
      }
    }
    return Array.from(courseCreditsMap.values()).reduce((a, b) => a + b, 0);
  });

  // Visible slots after filter query
  let visibleSlots = $derived.by(() => {
    if (!slotFilterQuery.trim()) return detectedSlots;
    const q = slotFilterQuery.toLowerCase().trim();
    return detectedSlots.filter(
      (s) =>
        s.courseCode.toLowerCase().includes(q) ||
        s.courseNameTh.toLowerCase().includes(q) ||
        s.courseNameEn.toLowerCase().includes(q) ||
        s.room.toLowerCase().includes(q) ||
        s.instructors.some((inst) => inst.toLowerCase().includes(q))
    );
  });

  // Conflicts affecting currently selected slots
  let activeConflicts = $derived.by(() => {
    const selectedIds = new Set(selectedSlots.map((s) => s.id));
    return internalConflicts.filter(
      (c) => selectedIds.has(c.slotAId) && selectedIds.has(c.slotBId)
    );
  });

  // Handle file drop
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  }

  function handleFileInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      processSelectedFile(input.files[0]);
    }
  }

  async function processSelectedFile(file: File) {
    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".json")) {
      parseError = "กรุณาอัปโหลดไฟล์ที่มีนามสกุล .pdf หรือ .json เท่านั้น";
      return;
    }

    selectedFile = file;
    parseError = null;
    isParsing = true;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/schedules/import/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "เกิดข้อผิดพลาดในการอ่านไฟล์");
      }

      parsedMetadata = data.metadata;
      detectedSlots = data.detectedSlots;
      internalConflicts = data.internalConflicts || [];

      // Auto-fill year and semester if detected from file and not locked by targetSchedule
      if (!targetSchedule && data.metadata) {
        if (data.metadata.academic_year_be) {
          academicYear = data.metadata.academic_year_be;
        }
        if (data.metadata.semester) {
          semester = data.metadata.semester;
        }
      }

      currentStep = 2;
    } catch (err: any) {
      console.error("Parse error:", err);
      parseError = err.message || "ไม่สามารถวิเคราะห์ไฟล์ตารางเรียนได้ โปรดตรวจสอบความถูกต้องของไฟล์";
    } finally {
      isParsing = false;
    }
  }

  function toggleAllSlots(select: boolean) {
    detectedSlots = detectedSlots.map((s) => ({ ...s, selected: select }));
  }

  function toggleSlot(id: string) {
    detectedSlots = detectedSlots.map((s) =>
      s.id === id ? { ...s, selected: !s.selected } : s
    );
  }

  async function handleCommitImport() {
    commitError = null;

    if (selectedSlots.length === 0) {
      commitError = "กรุณาเลือกอย่างน้อย 1 รายวิชา/คาบเรียนสำหรับการนำเข้า";
      return;
    }

    const selectedProg = programs.find((p) => p.id === programId);
    if (!targetSchedule && !selectedProg) {
      commitError = "กรุณาเลือกหลักสูตรการศึกษา";
      return;
    }

    isCommitting = true;

    try {
      const payload = {
        scheduleId: targetSchedule?.id,
        academicYear: Number(academicYear),
        semester: Number(semester),
        degreeLevel,
        programId: targetSchedule?.programId || selectedProg?.id,
        programName: targetSchedule?.programName || selectedProg?.titleTh,
        yearLevel: Number(yearLevel),
        sectionGroup: sectionGroup.trim() || null,
        namingPreference,
        mode: importMode,
        slots: selectedSlots.map((s) => ({
          courseCode: s.courseCode,
          courseNameTh: s.courseNameTh,
          courseNameEn: s.courseNameEn,
          section: s.section,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room || null,
          instructors: s.instructors,
          courseType: s.courseType,
          creditsRaw: s.creditsRaw,
          color: s.color,
        })),
      };

      const res = await fetch("/api/admin/schedules/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || result.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      isCommitting = false;
      const finalScheduleId = result.schedule.id;
      const successMsg = `นำเข้าสำเร็จ! บันทึกทั้งหมด ${result.createdSlotsCount} คาบเรียน (และซิงค์แค็ตตาล็อก ${result.syncedPresetsCount} รายวิชา)`;

      if (onSuccess) {
        onSuccess(finalScheduleId, successMsg);
      }
      onClose();
    } catch (err: any) {
      console.error("Commit import error:", err);
      commitError = err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลตารางเรียน";
      isCommitting = false;
    }
  }

  function getDayBadgeClasses(day: DayOfWeek): string {
    switch (day) {
      case "MONDAY":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "TUESDAY":
        return "bg-pink-500/20 text-pink-300 border-pink-500/30";
      case "WEDNESDAY":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "THURSDAY":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "FRIDAY":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "SATURDAY":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "SUNDAY":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
    role="dialog"
    aria-modal="true"
  >
    <!-- Backdrop Click to Close -->
    <div
      class="fixed inset-0 -z-10"
      onclick={() => !isParsing && !isCommitting && onClose()}
      aria-hidden="true"
    ></div>

    <div
      class="relative w-full max-w-4xl bg-[#1A1B20] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
    >
      <!-- Modal Header -->
      <div
        class="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-white/[0.02]"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20"
          >
            <FileSpreadsheet class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>นำเข้าตารางเรียนจาก KMUTNB Reg</span>
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-orange/20 text-brand-orange border border-brand-orange/30 uppercase tracking-wider"
              >
                Reg Importer
              </span>
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              รองรับไฟล์ PDF ตารางเรียนจาก reg4.kmutnb.ac.th หรือ JSON จากเครื่องมือแปลงตาราง
            </p>
          </div>
        </div>

        <button
          type="button"
          onclick={onClose}
          disabled={isParsing || isCommitting}
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
        <!-- STEP 1: Upload File -->
        {#if currentStep === 1}
          <div class="space-y-5">
            {#if parseError}
              <div
                class="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm animate-shake"
              >
                <AlertCircle class="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div class="space-y-1">
                  <div class="font-semibold text-red-200">เกิดข้อผิดพลาดในการอ่านไฟล์</div>
                  <div class="opacity-90">{parseError}</div>
                </div>
              </div>
            {/if}

            <!-- Target Schedule Context Notice -->
            {#if targetSchedule}
              <div
                class="flex items-center gap-3 p-4 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 text-xs text-slate-300"
              >
                <Lock class="w-4 h-4 text-brand-orange shrink-0" />
                <div>
                  <span class="text-white font-medium">กำลังนำเข้าสู่ตารางเรียนปัจจุบัน:</span>
                  <span class="text-brand-orange font-semibold ml-1">{targetSchedule.programName}</span>
                  (ปีการศึกษา {targetSchedule.academicYear}/{targetSchedule.semester} ชั้นปีที่ {targetSchedule.yearLevel})
                </div>
              </div>
            {/if}

            <!-- Drop Zone -->
            <div
              role="button"
              tabindex="0"
              onkeydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  fileInput?.click();
                }
              }}
              class="relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 {isDragging
                ? 'border-brand-orange bg-brand-orange/10 scale-[0.99]'
                : 'border-white/15 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/30'}"
              ondragover={(e) => {
                e.preventDefault();
                isDragging = true;
              }}
              ondragleave={() => (isDragging = false)}
              ondrop={handleDrop}
              onclick={() => fileInput?.click()}
            >
              <input
                bind:this={fileInput}
                type="file"
                accept=".pdf,.json,application/pdf,application/json"
                class="hidden"
                onchange={handleFileInputChange}
              />

              {#if isParsing}
                <div class="flex flex-col items-center gap-3">
                  <Loader2 class="w-12 h-12 text-brand-orange animate-spin" />
                  <div class="text-white font-semibold text-sm">กำลังแยกวิเคราะห์ตารางเรียน...</div>
                  <p class="text-xs text-slate-400">
                    กำลังดึงข้อมูลรายวิชา อาจารย์ผู้สอน วัน-เวลา คาบเรียน และห้องเรียน
                  </p>
                </div>
              {:else}
                <div
                  class="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-orange shadow-inner group-hover:scale-105 transition-transform"
                >
                  <UploadCloud class="w-8 h-8" />
                </div>

                <div class="space-y-1">
                  <div class="text-sm sm:text-base font-semibold text-white">
                    ลากไฟล์มาวางที่นี่ หรือ <span class="text-brand-orange underline">คลิกเพื่อเลือกไฟล์</span>
                  </div>
                  <p class="text-xs text-slate-400">
                    รองรับไฟล์ตารางเรียน <code class="text-slate-300">.pdf</code> (ที่พิมพ์/บันทึกจาก reg4) หรือ <code class="text-slate-300">.json</code>
                  </p>
                </div>

                <div class="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                  <div class="flex items-center gap-1.5">
                    <FileText class="w-3.5 h-3.5 text-brand-orange" />
                    <span>PDF Timetable</span>
                  </div>
                  <span>•</span>
                  <div class="flex items-center gap-1.5">
                    <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-400" />
                    <span>JSON Timetable</span>
                  </div>
                  <span>•</span>
                  <span>ขนาดไม่เกิน 15 MB</span>
                </div>
              {/if}
            </div>

            <!-- Helpful tips -->
            <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs text-slate-400">
              <div class="flex items-center gap-2 text-slate-300 font-semibold">
                <Info class="w-4 h-4 text-brand-orange" />
                <span>คำแนะนำการส่งออกตารางเรียนจากระบบทะเบียน KMUTNB:</span>
              </div>
              <ol class="list-decimal list-inside space-y-1 ml-1 text-slate-400 leading-relaxed">
                <li>เข้าสู่ระบบที่ <a href="https://reg4.kmutnb.ac.th/registrar/timetable" target="_blank" rel="noopener noreferrer" class="text-brand-orange hover:underline">reg4.kmutnb.ac.th/registrar/timetable</a></li>
                <li>เลือกปีการศึกษาและภาคการศึกษาที่ต้องการ</li>
                <li>กดพิมพ์หน้าเว็บ (Print) และเลือกปลายทางเป็น <strong>"Save as PDF (บันทึกเป็น PDF)"</strong></li>
                <li>นำไฟล์ PDF ที่ได้มาอัปโหลดในช่องด้านบนนี้ได้โดยตรง</li>
              </ol>
            </div>
          </div>
        {:else if currentStep === 2}
          <!-- STEP 2: Review, Cohort Config & Slot Checklist -->
          <div class="space-y-6">
            <!-- Metadata Summary Ribbon -->
            {#if parsedMetadata}
              <div
                class="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/10"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Check class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-white">
                      อ่านข้อมูลสำเร็จจาก: {parsedMetadata.source_file || selectedFile?.name}
                    </div>
                    <div class="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      {#if parsedMetadata.academic_year_be}
                        <span>ปี {parsedMetadata.academic_year_be}</span>
                        <span>•</span>
                      {/if}
                      {#if parsedMetadata.semester}
                        <span>ภาค {parsedMetadata.semester}</span>
                        <span>•</span>
                      {/if}
                      <span>พบ {parsedMetadata.total_courses} รายวิชา ({parsedMetadata.total_sections} ตอนเรียน)</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onclick={() => {
                    currentStep = 1;
                    selectedFile = null;
                  }}
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw class="w-3.5 h-3.5" />
                  <span>เปลี่ยนไฟล์</span>
                </button>
              </div>
            {/if}

            {#if commitError}
              <div
                class="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm animate-shake"
              >
                <AlertCircle class="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div class="space-y-1">
                  <div class="font-semibold text-red-200">ไม่สามารถบันทึกตารางเรียนได้</div>
                  <div class="opacity-90">{commitError}</div>
                </div>
              </div>
            {/if}

            <!-- Conflict Warnings (if any) -->
            {#if activeConflicts.length > 0}
              <div
                class="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs"
              >
                <AlertTriangle class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div class="space-y-1">
                  <div class="font-bold text-amber-300">
                    ตรวจพบเวลาเรียนซ้อนทับกัน ({activeConflicts.length} จุด) ในวิชาที่เลือก:
                  </div>
                  <ul class="list-disc list-inside space-y-0.5 text-amber-200/90">
                    {#each activeConflicts.slice(0, 3) as conf}
                      <li>{conf.message}</li>
                    {/each}
                    {#if activeConflicts.length > 3}
                      <li>และอีก {activeConflicts.length - 3} รายการ...</li>
                    {/if}
                  </ul>
                  <p class="text-[11px] text-amber-400/80 pt-1">
                    * คุณสามารถยกเลิกการเลือกวิชาที่มีเวลาซ้อนกันได้ในรายการด้านล่าง
                  </p>
                </div>
              </div>
            {/if}

            <!-- Section 1: Target Cohort Settings -->
            <div class="p-5 rounded-2xl bg-[#22242B] border border-white/10 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <GraduationCap class="w-4 h-4 text-brand-orange" />
                  <span>ข้อมูลรุ่นและหลักสูตรปลายทาง (Target Cohort)</span>
                </div>
                {#if targetSchedule}
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] bg-white/5 border border-white/10 text-slate-300"
                  >
                    <Lock class="w-3 h-3 text-brand-orange" />
                    <span>ล็อกตามตารางที่เปิดอยู่</span>
                  </span>
                {/if}
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <!-- Academic Year -->
                <div>
                  <label for="reg-academic-year" class="block text-[11px] font-semibold text-slate-400 mb-1">
                    ปีการศึกษา (พ.ศ.)
                  </label>
                  <input
                    id="reg-academic-year"
                    type="number"
                    bind:value={academicYear}
                    disabled={!!targetSchedule}
                    class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-orange disabled:opacity-50"
                  />
                </div>

                <!-- Semester -->
                <div>
                  <label for="reg-semester" class="block text-[11px] font-semibold text-slate-400 mb-1">
                    ภาคการศึกษา
                  </label>
                  <select
                    id="reg-semester"
                    bind:value={semester}
                    disabled={!!targetSchedule}
                    class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-orange disabled:opacity-50"
                  >
                    <option value={1}>ภาคเรียนที่ 1</option>
                    <option value={2}>ภาคเรียนที่ 2</option>
                    <option value={3}>ภาคเรียนฤดูร้อน (3)</option>
                  </select>
                </div>

                <!-- Degree Level -->
                <div>
                  <label for="reg-degree-level" class="block text-[11px] font-semibold text-slate-400 mb-1">
                    ระดับการศึกษา
                  </label>
                  <select
                    id="reg-degree-level"
                    bind:value={degreeLevel}
                    disabled={!!targetSchedule}
                    class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-orange disabled:opacity-50"
                  >
                    <option value="BACHELOR">ปริญญาตรี (Bachelor)</option>
                    <option value="MASTER">ปริญญาโท (Master)</option>
                    <option value="DOCTOR">ปริญญาเอก (Doctoral)</option>
                  </select>
                </div>

                <!-- Year Level -->
                <div>
                  <label for="reg-year-level" class="block text-[11px] font-semibold text-slate-400 mb-1">
                    ชั้นปีที่ (Year)
                  </label>
                  <select
                    id="reg-year-level"
                    bind:value={yearLevel}
                    disabled={!!targetSchedule}
                    class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-orange disabled:opacity-50"
                  >
                    <option value={1}>ชั้นปีที่ 1</option>
                    <option value={2}>ชั้นปีที่ 2</option>
                    <option value={3}>ชั้นปีที่ 3</option>
                    <option value={4}>ชั้นปีที่ 4</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <!-- Program Dropdown -->
                <div class="sm:col-span-2">
                  <label for="reg-program" class="block text-[11px] font-semibold text-slate-400 mb-1">
                    หลักสูตร (Program)
                  </label>
                  <select
                    id="reg-program"
                    bind:value={programId}
                    disabled={!!targetSchedule}
                    class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-orange disabled:opacity-50 truncate"
                  >
                    {#each filteredPrograms as prog}
                      <option value={prog.id}>{prog.titleTh} ({prog.id})</option>
                    {/each}
                  </select>
                </div>

                <!-- Section Group -->
                <div>
                  <label for="reg-sec-group" class="block text-[11px] font-semibold text-slate-400 mb-1">
                    กลุ่มเรียน (Section Group)
                  </label>
                  <input
                    id="reg-sec-group"
                    type="text"
                    bind:value={sectionGroup}
                    disabled={!!targetSchedule}
                    placeholder="เช่น Sec 1 หรือ ภาคปกติ"
                    class="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-orange disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <!-- Section 2: Import Preferences -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Naming Preference -->
              <div class="p-4 rounded-2xl bg-[#22242B] border border-white/10 space-y-2">
                <div class="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <BookOpen class="w-4 h-4 text-brand-orange" />
                  <span>รูปแบบชื่อรายวิชา (Course Name Style)</span>
                </div>
                <div class="space-y-1.5 pt-1">
                  <label
                    class="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer text-xs {namingPreference ===
                    'THAI_EN'
                      ? 'border border-brand-orange/40 bg-brand-orange/10'
                      : 'border border-transparent'}"
                  >
                    <input
                      type="radio"
                      name="naming"
                      value="THAI_EN"
                      bind:group={namingPreference}
                      class="text-brand-orange"
                    />
                    <div>
                      <span class="text-white font-medium">ไทย (English)</span>
                      <span class="text-[10px] text-slate-400 block">เช่น ทักษะภาษาอังกฤษ (English Skills) [แนะนำ]</span>
                    </div>
                  </label>

                  <label
                    class="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer text-xs {namingPreference ===
                    'EN'
                      ? 'border border-brand-orange/40 bg-brand-orange/10'
                      : 'border border-transparent'}"
                  >
                    <input
                      type="radio"
                      name="naming"
                      value="EN"
                      bind:group={namingPreference}
                      class="text-brand-orange"
                    />
                    <div>
                      <span class="text-white font-medium">English Only</span>
                      <span class="text-[10px] text-slate-400 block">เช่น English Skills</span>
                    </div>
                  </label>

                  <label
                    class="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer text-xs {namingPreference ===
                    'TH'
                      ? 'border border-brand-orange/40 bg-brand-orange/10'
                      : 'border border-transparent'}"
                  >
                    <input
                      type="radio"
                      name="naming"
                      value="TH"
                      bind:group={namingPreference}
                      class="text-brand-orange"
                    />
                    <div>
                      <span class="text-white font-medium">ภาษาไทยล้วน (Thai Only)</span>
                      <span class="text-[10px] text-slate-400 block">เช่น ทักษะภาษาอังกฤษ</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Import Mode -->
              <div class="p-4 rounded-2xl bg-[#22242B] border border-white/10 space-y-2">
                <div class="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Layers class="w-4 h-4 text-brand-orange" />
                  <span>การจัดการวิชาที่มีอยู่เดิม (Conflict Resolution)</span>
                </div>
                <div class="space-y-1.5 pt-1">
                  <label
                    class="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer text-xs {importMode ===
                    'REPLACE'
                      ? 'border border-brand-orange/40 bg-brand-orange/10'
                      : 'border border-transparent'}"
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="REPLACE"
                      bind:group={importMode}
                      class="text-brand-orange"
                    />
                    <div>
                      <span class="text-white font-medium">แทนที่รายวิชาเดิมทั้งหมด (Replace All)</span>
                      <span class="text-[10px] text-slate-400 block">ลบคอร์สสล็อตเดิมในตารางนี้ออกและบันทึกใหม่ทั้งหมด</span>
                    </div>
                  </label>

                  <label
                    class="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer text-xs {importMode ===
                    'APPEND'
                      ? 'border border-brand-orange/40 bg-brand-orange/10'
                      : 'border border-transparent'}"
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="APPEND"
                      bind:group={importMode}
                      class="text-brand-orange"
                    />
                    <div>
                      <span class="text-white font-medium">เพิ่มต่อท้าย (Merge / Append)</span>
                      <span class="text-[10px] text-slate-400 block">คงรายวิชาเดิมไว้ และเพิ่มคาบเรียนที่เลือกเข้าไปในตาราง</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Section 3: Slot Selection Checklist -->
            <div class="space-y-3">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <h3 class="text-xs font-bold text-white uppercase tracking-wider">
                    รายการคาบเรียนที่ตรวจพบ ({selectedSlots.length}/{detectedSlots.length} คาบ)
                  </h3>
                  <span class="text-xs text-slate-400">
                    ({uniqueSelectedCourses} รายวิชา, รวม {totalSelectedCredits} หน่วยกิต)
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    onclick={() => toggleAllSlots(true)}
                    class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    เลือกทั้งหมด
                  </button>
                  <button
                    type="button"
                    onclick={() => toggleAllSlots(false)}
                    class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    ยกเลิกทั้งหมด
                  </button>
                </div>
              </div>

              <!-- Search/filter slots input -->
              <div class="relative">
                <input
                  type="text"
                  bind:value={slotFilterQuery}
                  placeholder="ค้นหารหัสวิชา, ชื่อวิชา, ห้องเรียน, หรือชื่ออาจารย์ผู้สอน..."
                  class="w-full px-3 py-2 pl-9 rounded-xl bg-black/30 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-orange"
                />
                <BookOpen class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>

              <!-- Slots Table -->
              <div
                class="border border-white/10 rounded-2xl overflow-hidden bg-black/20 divide-y divide-white/5 max-h-72 overflow-y-auto custom-scrollbar"
              >
                {#if visibleSlots.length === 0}
                  <div class="p-8 text-center text-xs text-slate-400">
                    ไม่พบคอร์สสล็อตที่ตรงกับคำค้นหา
                  </div>
                {:else}
                  {#each visibleSlots as slot (slot.id)}
                    <div
                      class="p-3 sm:p-3.5 flex items-start sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors cursor-pointer {slot.selected
                        ? 'bg-white/[0.01]'
                        : 'opacity-50'}"
                      onclick={() => toggleSlot(slot.id)}
                      role="checkbox"
                      aria-checked={slot.selected}
                      tabindex="0"
                      onkeydown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          toggleSlot(slot.id);
                        }
                      }}
                    >
                      <div class="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={slot.selected}
                          onchange={() => toggleSlot(slot.id)}
                          onclick={(e) => e.stopPropagation()}
                          class="rounded text-brand-orange mt-1 sm:mt-0 cursor-pointer"
                        />

                        <!-- Course Code & Name -->
                        <div class="min-w-0 flex-1 space-y-0.5">
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-mono text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded-md">
                              {slot.courseCode}
                            </span>
                            <span class="text-xs font-semibold text-slate-200 truncate">
                              {formatCourseNameByPreference(
                                slot.courseNameTh,
                                slot.courseNameEn,
                                namingPreference
                              )}
                            </span>
                            {#if slot.creditsRaw}
                              <span class="text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                                {slot.creditsRaw}
                              </span>
                            {/if}
                          </div>

                          <div class="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                            <span class="px-1.5 py-0.2 rounded text-[10px] font-medium {slot.sectionType === 'lab' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}">
                              {slot.section} ({slot.sectionType === "lab" ? "ปฏิบัติ" : "บรรยาย"})
                            </span>

                            <span class="flex items-center gap-1">
                              <Clock class="w-3 h-3 text-slate-500" />
                              <span>{slot.startTime} - {slot.endTime}</span>
                            </span>

                            {#if slot.room}
                              <span class="flex items-center gap-1 text-slate-300">
                                <MapPin class="w-3 h-3 text-brand-orange" />
                                <span>{slot.room}</span>
                              </span>
                            {/if}

                            {#if slot.instructors.length > 0}
                              <span class="flex items-center gap-1 truncate text-slate-400">
                                <Users class="w-3 h-3 text-slate-500" />
                                <span class="truncate">{slot.instructors.join(", ")}</span>
                              </span>
                            {/if}
                          </div>
                        </div>
                      </div>

                      <!-- Day Badge -->
                      <div class="shrink-0">
                        <span
                          class="px-2.5 py-1 rounded-xl text-xs font-bold border {getDayBadgeClasses(
                            slot.dayOfWeek
                          )}"
                        >
                          {slot.dayAbbrTh}
                        </span>
                      </div>
                    </div>
                  {/each}
                {/if}
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Modal Footer -->
      <div
        class="flex items-center justify-between p-4 sm:p-6 border-t border-white/10 bg-white/[0.02] flex-wrap gap-3"
      >
        <button
          type="button"
          onclick={onClose}
          disabled={isParsing || isCommitting}
          class="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
        >
          ยกเลิก (Cancel)
        </button>

        {#if currentStep === 2}
          <div class="flex items-center gap-3">
            <button
              type="button"
              onclick={() => (currentStep = 1)}
              disabled={isCommitting}
              class="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              ย้อนกลับ (Back)
            </button>

            <button
              type="button"
              onclick={handleCommitImport}
              disabled={isCommitting || selectedSlots.length === 0}
              class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-dark-orange hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-orange-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {#if isCommitting}
                <Loader2 class="w-4 h-4 animate-spin" />
                <span>กำลังนำเข้า...</span>
              {:else}
                <CheckCircle2 class="w-4 h-4" />
                <span>ยืนยันการนำเข้า ({selectedSlots.length} คาบ)</span>
              {/if}
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 9999px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }
</style>
