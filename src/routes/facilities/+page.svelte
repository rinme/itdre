<script lang="ts">
  import FacilitiesExplorer from "$lib/components/facilities/FacilitiesExplorer.svelte";
</script>

<svelte:head>
  <title>ห้องเรียนและห้องปฏิบัติการ | คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. ITD KMUTNB</title>
  <meta
    name="description"
    content="สำรวจห้องเรียน Smart Classrooms ห้องปฏิบัติการคอมพิวเตอร์ ศูนย์ควบคุมระบบเครือข่าย NOC และศูนย์ทดสอบมาตรฐานสากล Pearson VUE อาคารนวมินทรราชินี คณะ ITD มจพ."
  />
</svelte:head>

<div class="w-full flex flex-col bg-[#F8F9FA] min-h-screen">
  <FacilitiesExplorer initialCategoryFilter="all" />
</div>
