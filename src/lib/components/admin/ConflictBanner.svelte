<script lang="ts">
  import {
    AlertTriangle,
    Clock,
    DoorClosed,
    ChevronDown,
    ChevronUp,
    X,
    Info,
  } from "lucide-svelte";
  import type { ConflictResult } from "$lib/utils/schedule-conflict";

  interface Props {
    conflicts: ConflictResult[];
    class?: string;
    onDismiss?: () => void;
    title?: string;
    compact?: boolean;
  }

  let {
    conflicts,
    class: className = "",
    onDismiss,
    title,
    compact = false,
  }: Props = $props();

  let isExpanded = $state(true);

  let roomConflicts = $derived(conflicts.filter((c) => c.type === "ROOM_CONFLICT"));
  let timeOverlaps = $derived(conflicts.filter((c) => c.type === "TIME_OVERLAP"));
</script>

{#if conflicts && conflicts.length > 0}
  <div
    class="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-amber-950/60 p-4 text-amber-200 shadow-lg shadow-amber-950/20 backdrop-blur-sm transition-all duration-200 {className}"
    role="alert"
    aria-live="polite"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-start gap-3">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
          <AlertTriangle class="h-5 w-5" />
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="text-sm font-bold text-amber-100">
              {title || `พบข้อขัดแย้งในตารางเรียน (${conflicts.length} รายการ)`}
            </h4>
            <span class="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-300 border border-amber-500/30">
              <Info class="h-3 w-3" />
              คำเตือนแบบไม่บล็อก (Non-blocking warning)
            </span>
          </div>
          <p class="mt-0.5 text-xs text-amber-300/80">
            {#if roomConflicts.length > 0 && timeOverlaps.length > 0}
              พบห้องเรียนซ้ำซ้อน {roomConflicts.length} จุด และเวลาเรียนทับซ้อน {timeOverlaps.length} จุด
            {:else if roomConflicts.length > 0}
              พบห้องเรียนซ้ำซ้อน {roomConflicts.length} จุด
            {:else}
              พบช่วงเวลาเรียนทับซ้อนกัน {timeOverlaps.length} จุด
            {/if}
            {" — "}คุณยังสามารถบันทึกได้หากได้รับการอนุญาตใช้งานร่วมกัน
          </p>
        </div>
      </div>

      <div class="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onclick={() => (isExpanded = !isExpanded)}
          class="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-amber-300/90 hover:bg-amber-500/20 hover:text-white transition-colors cursor-pointer"
          aria-label={isExpanded ? "ย่อรายละเอียด" : "ดูรายละเอียด"}
        >
          {#if isExpanded}
            <span class="hidden sm:inline">ย่อ</span>
            <ChevronUp class="h-4 w-4" />
          {:else}
            <span class="hidden sm:inline">แสดง ({conflicts.length})</span>
            <ChevronDown class="h-4 w-4" />
          {/if}
        </button>
        {#if onDismiss}
          <button
            type="button"
            onclick={onDismiss}
            class="rounded-lg p-1 text-amber-400/80 hover:bg-amber-500/20 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X class="h-4 w-4" />
          </button>
        {/if}
      </div>
    </div>

    {#if isExpanded}
      <div
        class="mt-3 pt-3 border-t border-amber-500/20 space-y-2 {compact ? 'max-h-48 overflow-y-auto' : ''}"
      >
        {#each conflicts as conflict, idx (`${conflict.type}-${conflict.conflictingSlot.id}-${idx}`)}
          {@const isRoom = conflict.type === "ROOM_CONFLICT"}
          <div
            class="flex items-start gap-2.5 rounded-xl bg-amber-950/40 border border-amber-500/20 p-2.5 text-xs text-amber-200/90 hover:bg-amber-950/60 transition-colors"
          >
            <div
              class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border {isRoom ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-orange-500/20 border-orange-500/40 text-orange-300'}"
            >
              {#if isRoom}
                <DoorClosed class="h-3.5 w-3.5" />
              {:else}
                <Clock class="h-3.5 w-3.5" />
              {/if}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span
                  class="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider {isRoom ? 'bg-red-500/25 text-red-200 border border-red-500/30' : 'bg-orange-500/25 text-orange-200 border border-orange-500/30'}"
                >
                  {isRoom ? "ห้องเรียนซ้อน" : "เวลาซ้อน"}
                </span>
                <span class="font-semibold text-white">
                  {conflict.conflictingSlot.courseCode} - {conflict.conflictingSlot.courseName}
                </span>
              </div>
              <p class="mt-0.5 text-amber-300/80 leading-relaxed break-words">
                {conflict.message}
              </p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}
