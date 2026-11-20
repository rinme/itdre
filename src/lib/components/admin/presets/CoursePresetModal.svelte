<script lang="ts">
  import { X, Save, Loader2 } from "lucide-svelte";
  import { COLOR_THEMES } from "$lib/weekly-grid";
  import type { CoursePreset } from "$lib/state/admin-presets.svelte";

  const COURSE_TYPES = [
    { value: "LECTURE", labelTh: "บรรยาย", labelEn: "Lecture" },
    { value: "LAB", labelTh: "ปฏิบัติ", labelEn: "Lab" },
    { value: "BOTH", labelTh: "บรรยาย+ปฏิบัติ", labelEn: "Both" },
  ] as const;

  interface Props {
    preset: CoursePreset | null;
    onClose: () => void;
    onSaved: () => void;
  }

  let { preset, onClose, onSaved }: Props = $props();

  const isEdit = $derived(preset !== null);
  let courseCode = $state("");
  let courseName = $state("");
  let credits = $state("");
  let courseType = $state<string>("LECTURE");
  let color = $state<string>("orange");
  let saving = $state(false);
  let error = $state<string | null>(null);

  $effect(() => {
    courseCode = preset?.courseCode ?? "";
    courseName = preset?.courseName ?? "";
    credits = preset?.credits ?? "";
    courseType = preset?.courseType ?? "LECTURE";
    color = preset?.color ?? "orange";
    error = null;
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) {
      error = "กรุณากรอกรหัสวิชาและชื่อวิชา";
      return;
    }
    saving = true;
    error = null;
    try {
      const url = isEdit ? `/api/admin/presets/${preset!.id}` : "/api/admin/presets";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: courseCode.trim(),
          courseName: courseName.trim(),
          credits: credits.trim() || null,
          courseType,
          color,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save preset");
      }
      onSaved();
    } catch (err) {
      error = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
    } finally {
      saving = false;
    }
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
  <div class="bg-[#1A1B20] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
      <h2 class="text-white font-semibold font-mitr">
        {isEdit ? "แก้ไข Course Preset" : "เพิ่ม Course Preset"}
      </h2>
      <button onclick={onClose} class="text-slate-400 hover:text-white transition-colors cursor-pointer" aria-label="Close modal">
        <X class="w-5 h-5" />
      </button>
    </div>
    <!-- Form -->
    <form onsubmit={handleSubmit} class="p-6 space-y-4">
      {#if error}
        <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
          {error}
        </div>
      {/if}
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="preset-course-code" class="block text-xs text-slate-400 mb-1.5">รหัสวิชา <span class="text-red-400">*</span></label>
          <input
            id="preset-course-code"
            type="text"
            bind:value={courseCode}
            placeholder="060133101"
            class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-orange/60 focus:ring-1 focus:ring-brand-orange/30"
          />
        </div>
        <div>
          <label for="preset-credits" class="block text-xs text-slate-400 mb-1.5">หน่วยกิต</label>
          <input
            id="preset-credits"
            type="text"
            bind:value={credits}
            placeholder="3(2-2-5)"
            class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-orange/60 focus:ring-1 focus:ring-brand-orange/30"
          />
        </div>
      </div>
      <div>
        <label for="preset-course-name" class="block text-xs text-slate-400 mb-1.5">ชื่อวิชา <span class="text-red-400">*</span></label>
        <input
          id="preset-course-name"
          type="text"
          bind:value={courseName}
          placeholder="Web Application Development"
          class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-orange/60 focus:ring-1 focus:ring-brand-orange/30"
        />
      </div>
      <div>
        <span class="block text-xs text-slate-400 mb-1.5">ประเภทวิชา</span>
        <div class="flex gap-2">
          {#each COURSE_TYPES as ct (ct.value)}
            <button
              type="button"
              onclick={() => (courseType = ct.value)}
              class="flex-1 py-2 rounded-xl text-sm font-medium transition-all border cursor-pointer {courseType === ct.value ? 'bg-brand-orange/20 text-brand-orange border-brand-orange/50' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}"
            >
              {ct.labelTh}
            </button>
          {/each}
        </div>
      </div>
      <div>
        <span class="block text-xs text-slate-400 mb-1.5">สีธีม</span>
        <div class="flex gap-2 flex-wrap">
          {#each Object.entries(COLOR_THEMES) as [key, theme] (key)}
            <button
              type="button"
              onclick={() => (color = key)}
              class="w-8 h-8 rounded-full border-2 transition-transform cursor-pointer {color === key ? 'scale-125 border-white' : 'border-transparent hover:scale-110'} {theme.swatchBg}"
              title={key}
              aria-label={key}
            ></button>
          {/each}
        </div>
      </div>
      <div class="flex gap-3 pt-2">
        <button
          type="button"
          onclick={onClose}
          class="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-all cursor-pointer"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={saving}
          class="flex-1 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {#if saving}
            <Loader2 class="w-4 h-4 animate-spin" />
          {:else}
            <Save class="w-4 h-4" />
          {/if}
          {isEdit ? "บันทึกการแก้ไข" : "เพิ่ม Preset"}
        </button>
      </div>
    </form>
  </div>
</div>
