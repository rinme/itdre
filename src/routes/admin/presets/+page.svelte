<script lang="ts">
  import CoursePresetsTab from "$lib/components/admin/presets/CoursePresetsTab.svelte";
  import InstructorsTab from "$lib/components/admin/presets/InstructorsTab.svelte";
  import { BookOpen, Users } from "lucide-svelte";

  const TABS = [
    { id: "courses", labelTh: "รายวิชา", labelEn: "Courses", icon: BookOpen },
    { id: "instructors", labelTh: "ผู้สอน", labelEn: "Instructors", icon: Users },
  ] as const;

  type TabId = (typeof TABS)[number]["id"];

  let activeTab = $state<TabId>("courses");
</script>

<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <!-- Page Header -->
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-white font-mitr mb-1">
      จัดการ Presets
    </h1>
    <p class="text-slate-400 text-sm">
      เพิ่ม แก้ไข หรือลบ presets ที่ใช้เติมข้อมูลอัตโนมัติในตารางเรียน
    </p>
  </div>

  <!-- Tab Bar -->
  <div class="flex gap-1 bg-white/5 rounded-xl p-1 mb-6 w-fit border border-white/10">
    {#each TABS as tab (tab.id)}
      {@const Icon = tab.icon}
      <button
        onclick={() => (activeTab = tab.id)}
        class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer {activeTab === tab.id ? 'bg-brand-orange text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}"
      >
        <Icon class="w-4 h-4" />
        <span>{tab.labelTh}</span>
      </button>
    {/each}
  </div>

  <!-- Tab Content -->
  <div class="bg-[#1A1B20] border border-white/10 rounded-2xl p-6">
    {#if activeTab === "courses"}
      <CoursePresetsTab />
    {:else}
      <InstructorsTab />
    {/if}
  </div>
</main>
