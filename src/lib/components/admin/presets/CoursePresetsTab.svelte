<script lang="ts">
  import { Plus, Pencil, Trash2, BookOpen, Loader2 } from "lucide-svelte";
  import { adminPresetsState, type CoursePreset } from "$lib/state/admin-presets.svelte";
  import CoursePresetModal from "./CoursePresetModal.svelte";
  import { COLOR_THEMES, type ColorToken } from "$lib/utils/weekly-grid";

  const COURSE_TYPE_LABELS: Record<string, string> = {
    LECTURE: "บรรยาย",
    LAB: "ปฏิบัติ",
    BOTH: "บรรยาย+ปฏิบัติ",
  };

  let modalPreset = $state<CoursePreset | null | "new">(null);
  let deletingId = $state<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("ต้องการลบ preset นี้ใช่ไหม?")) return;
    deletingId = id;
    try {
      const res = await fetch(`/api/admin/presets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await adminPresetsState.refreshPresets();
    } catch {
      alert("ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      deletingId = null;
    }
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <p class="text-slate-400 text-sm">
      {adminPresetsState.coursePresets.length} รายวิชา — คลิกรายวิชาเพื่อแก้ไข หรือกด + เพิ่มใหม่
    </p>
    <button
      onclick={() => (modalPreset = "new")}
      class="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-dark-orange text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
    >
      <Plus class="w-4 h-4" />
      เพิ่มรายวิชา
    </button>
  </div>

  {#if adminPresetsState.loading}
    <div class="flex items-center justify-center h-48">
      <Loader2 class="w-6 h-6 text-brand-orange animate-spin" />
      <span class="ml-2 text-slate-400 text-sm">กำลังโหลด...</span>
    </div>
  {:else if adminPresetsState.error}
    <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
      {adminPresetsState.error}
    </div>
  {:else if adminPresetsState.coursePresets.length === 0}
    <div class="flex flex-col items-center justify-center h-48 text-slate-500">
      <BookOpen class="w-10 h-10 mb-3 opacity-40" />
      <p class="text-sm">ยังไม่มี preset — กด "เพิ่มรายวิชา" เพื่อเพิ่มรายแรก</p>
    </div>
  {:else}
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each adminPresetsState.coursePresets as p (p.id)}
        {@const theme = COLOR_THEMES[(p.color as ColorToken) ?? "orange"] ?? COLOR_THEMES["orange"]}
        <div
          class="relative rounded-xl border {theme.cardBorder} {theme.cardBg} p-4 group"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="inline-block w-2.5 h-2.5 rounded-full {theme.swatchBg}"></span>
                <span class="font-mono text-xs font-semibold {theme.cardText}">{p.courseCode}</span>
                {#if p.credits}
                  <span class="text-xs text-slate-500">{p.credits}</span>
                {/if}
              </div>
              <p class="text-sm font-medium {theme.cardText} truncate">{p.courseName}</p>
              <p class="text-xs text-slate-500 mt-1">{COURSE_TYPE_LABELS[p.courseType] ?? p.courseType}</p>
            </div>
            <div class="flex flex-col gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onclick={() => (modalPreset = p)}
                class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="แก้ไข"
                aria-label="Edit preset"
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button
                onclick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
                class="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                title="ลบ"
                aria-label="Delete preset"
              >
                {#if deletingId === p.id}
                  <Loader2 class="w-3.5 h-3.5 animate-spin" />
                {:else}
                  <Trash2 class="w-3.5 h-3.5" />
                {/if}
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if modalPreset !== null}
    <CoursePresetModal
      preset={modalPreset === "new" ? null : modalPreset}
      onClose={() => (modalPreset = null)}
      onSaved={async () => {
        modalPreset = null;
        await adminPresetsState.refreshPresets();
      }}
    />
  {/if}
</div>
