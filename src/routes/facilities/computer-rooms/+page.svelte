<script lang="ts">
  import FacilitiesExplorer from "$lib/components/facilities/FacilitiesExplorer.svelte";
</script>

<svelte:head>
  <title>ห้องปฏิบัติการคอมพิวเตอร์ & ศูนย์สอบ Pearson VUE | ITD KMUTNB</title>
  <meta
    name="description"
    content="ห้องปฏิบัติการคอมพิวเตอร์ประสิทธิภาพสูง ศูนย์สอบมาตรฐานสากล Pearson VUE และศูนย์ควบคุมระบบเครือข่าย NOC คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ."
  />
</svelte:head>

<div class="w-full flex flex-col bg-[#F8F9FA] min-h-screen">
  <FacilitiesExplorer
    initialCategoryFilter="computer-room"
    pageTitleTh="ห้องปฏิบัติการคอมพิวเตอร์ และศูนย์ทดสอบ Pearson VUE"
    pageTitleEn="Computer Laboratories & Pearson VUE Test Center"
    pageSubtitleTh="ห้องปฏิบัติการคอมพิวเตอร์สมรรถนะสูง ศูนย์ทดสอบใบประกาศนียบัตรวิชาชีพไอทีระดับสากล Pearson VUE (ห้อง 5A02) และศูนย์ควบคุมเครือข่าย NOC (ห้อง 5A01)"
    pageSubtitleEn="High-performance computing laboratories, official Pearson VUE international certification test center (Room 5A02), and Enterprise Network Operations Center (Room 5A01)."
  />
</div>
