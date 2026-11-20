<script lang="ts">
  import FacilitiesExplorer from "$lib/components/facilities/FacilitiesExplorer.svelte";
</script>

<svelte:head>
  <title>ห้องเรียนและห้องบรรยาย Smart Classrooms | ITD KMUTNB</title>
  <meta
    name="description"
    content="ห้องบรรยายและห้องเรียนอัจฉริยะ Smart Classrooms ชั้น 3, 4, 5 อาคารนวมินทรราชินี คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ."
  />
</svelte:head>

<div class="w-full flex flex-col bg-[#F8F9FA] min-h-screen">
  <FacilitiesExplorer
    initialCategoryFilter="classroom"
    pageTitleTh="ห้องเรียนและห้องบรรยาย Smart Classrooms"
    pageTitleEn="Smart Lecture Classrooms"
    pageSubtitleTh="ห้องบรรยายมาตรฐานสากล พร้อมระบบโสตทัศนูปกรณ์ 4K ระบบไมโครโฟนไร้สาย เครื่องปรับอากาศ และ Wi-Fi ครอบคลุมทุกพื้นที่ อาคารนวมินทรราชินี (ชั้น 3, 4, 5)"
    pageSubtitleEn="Modern smart lecture rooms equipped with 4K interactive displays, sound systems, high-speed Wi-Fi, and ergonomic seating on Floors 3, 4, and 5 of Navamindra Rajini Building."
  />
</div>
