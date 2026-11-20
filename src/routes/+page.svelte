<script lang="ts">
  import HeroBannerSlider from "$lib/components/home/HeroBannerSlider.svelte";
  import QuickNavGrid from "$lib/components/home/QuickNavGrid.svelte";
  import NewsSection from "$lib/components/home/NewsSection.svelte";
  import ProgramsOverview from "$lib/components/home/ProgramsOverview.svelte";
  import VideoHighlight from "$lib/components/home/VideoHighlight.svelte";
</script>

<svelte:head>
  <title>คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. | ITD KMUTNB</title>
  <meta
    name="description"
    content="คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ (ITD KMUTNB) มุ่งเน้นการเรียนการสอนและวิจัยด้านวิทยาการคอมพิวเตอร์ เทคโนโลยีสารสนเทศ ปัญญาประดิษฐ์ และความมั่นคงปลอดภัยไซเบอร์"
  />
</svelte:head>

<div class="w-full flex flex-col flex-1">
  <!-- Hero Banner Swiper Slider -->
  <HeroBannerSlider />

  <!-- Quick Navigation Action Grid -->
  <QuickNavGrid />

  <!-- Latest News & Interactive Category Filtering -->
  <NewsSection />

  <!-- Degree Programs Overview (Bachelor, Master, Doctor) -->
  <ProgramsOverview />

  <!-- Faculty Video Presentation & Highlights Stats -->
  <VideoHighlight />
</div>
