<script lang="ts">
  import {
    contactInfo,
    phoneDirectory,
    transportGuide,
    type PhoneDirectoryItem,
    type TransportGuideItem
  } from '$lib/data/contact';
  import { languageStore } from '$lib/stores/language';
  import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Send,
    Building2,
    Train,
    Bus,
    Ship,
    Car,
    CheckCircle2,
    ExternalLink,
    Search,
    MessageSquare,
    Home,
    ChevronRight,
    X,
    PhoneCall
  } from 'lucide-svelte';

  const transportIconsMap: Record<string, any> = {
    Train,
    Bus,
    Ship,
    Car,
    MapPin
  };

  function getTransportIcon(name: string) {
    return transportIconsMap[name] || MapPin;
  }

  let phoneSearch = $state('');
  let formData = $state({
    name: '',
    email: '',
    phone: '',
    category: 'general',
    subject: '',
    message: ''
  });
  let formErrors = $state<Record<string, string>>({});
  let isSubmitting = $state(false);
  let submitSuccess = $state(false);

  const filteredDirectory = $derived(
    phoneDirectory.filter((item) => {
      if (!phoneSearch.trim()) return true;
      const q = phoneSearch.toLowerCase();
      return (
        item.unitTh.toLowerCase().includes(q) ||
        item.unitEn.toLowerCase().includes(q) ||
        item.extension.includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.headNameTh && item.headNameTh.toLowerCase().includes(q))
      );
    })
  );

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = $languageStore === 'en' ? 'Please enter your full name' : 'กรุณากรอกชื่อ-นามสกุล';
    }
    if (!formData.email.trim()) {
      errors.email = $languageStore === 'en' ? 'Please enter your email' : 'กรุณากรอกอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = $languageStore === 'en' ? 'Please enter a valid email address' : 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    if (!formData.subject.trim()) {
      errors.subject = $languageStore === 'en' ? 'Please enter a subject' : 'กรุณากรอกหัวข้อเรื่อง';
    }
    if (!formData.message.trim()) {
      errors.message = $languageStore === 'en' ? 'Please enter your message' : 'กรุณากรอกข้อความที่ต้องการติดต่อ';
    }
    formErrors = errors;
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    isSubmitting = true;
    setTimeout(() => {
      isSubmitting = false;
      submitSuccess = true;
      formData = {
        name: '',
        email: '',
        phone: '',
        category: 'general',
        subject: '',
        message: ''
      };
    }, 1200);
  }
</script>

<div class="w-full flex flex-col">
  <!-- Hero Header Banner -->
  <section class="relative w-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden py-14 sm:py-20 border-b border-gray-800">
    <div class="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <!-- Breadcrumbs -->
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
        <a
          href="/"
          class="inline-flex items-center gap-1.5 hover:text-brand-orange transition-colors"
        >
          <Home class="w-3.5 h-3.5" />
          <span>{$languageStore === 'en' ? 'Home' : 'หน้าหลัก'}</span>
        </a>
        <ChevronRight class="w-3.5 h-3.5 text-gray-600" />
        <span class="text-brand-orange font-medium">
          {$languageStore === 'en' ? 'Contact Us' : 'ติดต่อเรา'}
        </span>
      </nav>

      <!-- Title & Description -->
      <div class="max-w-3xl space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-semibold tracking-wide">
          <Building2 class="w-3.5 h-3.5" />
          <span>FACULTY CONTACT & LOCATION</span>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          {$languageStore === 'en' ? 'Contact & Campus Location' : 'ติดต่อคณะและช่องทางการสื่อสาร'}
        </h1>
        <p class="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
          {$languageStore === 'en'
            ? 'Find our campus address at Navamindra Rajini Building (Bldg 79), interactive map directions, departmental extension directory, and inquiry form.'
            : 'ที่ตั้งอาคารนวมินทรราชินี (อาคาร 79) มจพ., แผนที่การเดินทาง, หมายเลขโทรศัพท์ภายในทุกหน่วยงาน และแบบฟอร์มส่งข้อความสอบถาม'}
        </p>
      </div>

      <!-- Quick Contact Badges -->
      <div class="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <Phone class="w-4 h-4 text-brand-orange" />
          <span>{contactInfo.phoneMain} ({$languageStore === 'en' ? 'ext 2708' : 'ต่อ 2708'})</span>
        </div>
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <Mail class="w-4 h-4 text-sky-400" />
          <span>{contactInfo.emailGeneral}</span>
        </div>
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <Building2 class="w-4 h-4 text-emerald-400" />
          <span>{$languageStore === 'en' ? 'Bldg 79 Fl 3, 4, 5, 7' : 'อาคาร 79 ชั้น 3, 4, 5, 7'}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Main Content Body -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 w-full">
    <!-- Section 1: Contact Form & Main Contact Info Grid -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Direct Contact Info & Socials (5 Cols) -->
      <div class="lg:col-span-5 space-y-6">
        <div class="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-brand-orange text-xs font-semibold">
              <Building2 class="w-3.5 h-3.5" />
              <span>{$languageStore === 'en' ? 'LOCATION & OFFICE' : 'ข้อมูลที่ตั้งและสำนักงาน'}</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
              {$languageStore === 'en' ? contactInfo.facultyNameEn : contactInfo.facultyNameTh}
            </h2>
            <p class="text-xs sm:text-sm text-brand-orange font-semibold">
              {$languageStore === 'en' ? contactInfo.universityNameEn : contactInfo.universityNameTh}
            </p>
          </div>

          <!-- Info Items List -->
          <div class="space-y-4 text-xs sm:text-sm text-gray-700">
            <div class="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
              <div class="w-9 h-9 rounded-xl bg-orange-100 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                <MapPin class="w-4 h-4" />
              </div>
              <div class="space-y-0.5">
                <strong class="text-gray-900 block font-semibold">
                  {$languageStore === 'en' ? contactInfo.buildingEn : contactInfo.buildingTh}
                </strong>
                <p class="text-gray-600 text-xs">
                  {$languageStore === 'en' ? contactInfo.addressEn : contactInfo.addressTh}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
              <div class="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Phone class="w-4 h-4" />
              </div>
              <div class="space-y-0.5">
                <strong class="text-gray-900 block font-semibold">
                  {$languageStore === 'en' ? 'Main Telephone' : 'หมายเลขโทรศัพท์หลัก'}
                </strong>
                <p class="text-gray-600 text-xs">
                  {contactInfo.phoneMain} ({$languageStore === 'en' ? 'KMUTNB Switchboard' : 'เบอร์กลาง มจพ.'})
                </p>
                <p class="text-brand-orange text-xs font-semibold">
                  {$languageStore === 'en' ? 'Direct Line:' : 'โทรตรงสำนักงานคณบดี:'} {contactInfo.phoneDirect}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
              <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Mail class="w-4 h-4" />
              </div>
              <div class="space-y-0.5">
                <strong class="text-gray-900 block font-semibold">
                  {$languageStore === 'en' ? 'Official Emails' : 'ไปรษณีย์อิเล็กทรอนิกส์ (Email)'}
                </strong>
                <p class="text-gray-600 text-xs">
                  {$languageStore === 'en' ? 'General:' : 'ติดต่อทั่วไป:'} <span class="text-brand-orange font-medium">{contactInfo.emailGeneral}</span>
                </p>
                <p class="text-gray-600 text-xs">
                  {$languageStore === 'en' ? 'Academic:' : 'บริการการศึกษา:'} <span class="text-brand-orange font-medium">{contactInfo.emailAcademic}</span>
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
              <div class="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Clock class="w-4 h-4" />
              </div>
              <div class="space-y-0.5">
                <strong class="text-gray-900 block font-semibold">
                  {$languageStore === 'en' ? 'Operating Hours' : 'เวลาทำการ (Office Hours)'}
                </strong>
                <p class="text-gray-600 text-xs leading-relaxed">
                  {$languageStore === 'en' ? contactInfo.officeHoursEn : contactInfo.officeHoursTh}
                </p>
              </div>
            </div>
          </div>

          <!-- Social Channels Connection Cards -->
          <div class="pt-2 border-t border-gray-100 space-y-3">
            <h3 class="text-xs font-bold text-gray-900 uppercase tracking-wider">
              {$languageStore === 'en' ? 'Official Social Media' : 'ช่องทางการติดตามโซเชียลมีเดีย'}
            </h3>

            <div class="grid grid-cols-3 gap-2">
              <a
                href={contactInfo.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                class="p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/20 transition-all flex flex-col items-center justify-center text-center gap-1.5 group"
              >
                <img
                  src="/assets/logos/facebook.png"
                  alt="Facebook"
                  class="w-6 h-6 object-contain"
                />
                <span class="text-[11px] font-bold">Facebook</span>
              </a>

              <a
                href={contactInfo.socialLinks.line}
                target="_blank"
                rel="noopener noreferrer"
                class="p-3 rounded-2xl bg-[#06C755]/10 hover:bg-[#06C755] text-[#06C755] hover:text-white border border-[#06C755]/20 transition-all flex flex-col items-center justify-center text-center gap-1.5 group"
              >
                <img
                  src="/assets/logos/line.png"
                  alt="LINE OA"
                  class="w-6 h-6 object-contain"
                />
                <span class="text-[11px] font-bold">LINE OA</span>
              </a>

              <a
                href={contactInfo.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                class="p-3 rounded-2xl bg-[#FF0000]/10 hover:bg-[#FF0000] text-[#FF0000] hover:text-white border border-[#FF0000]/20 transition-all flex flex-col items-center justify-center text-center gap-1.5 group"
              >
                <img
                  src="/assets/logos/footer-youtube.png"
                  alt="YouTube"
                  class="w-6 h-6 object-contain"
                />
                <span class="text-[11px] font-bold">YouTube</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Interactive Inquiry Contact Form (7 Cols) -->
      <div class="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
        <div class="space-y-2">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-brand-orange text-xs font-semibold">
            <MessageSquare class="w-3.5 h-3.5" />
            <span>{$languageStore === 'en' ? 'ONLINE INQUIRY FORM' : 'แบบฟอร์มติดต่อสอบถาม'}</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
            {$languageStore === 'en' ? 'Send Us a Message' : 'ส่งข้อความถึงคณะ ITD'}
          </h2>
          <p class="text-xs sm:text-sm text-gray-500">
            {$languageStore === 'en'
              ? 'Fill out the form below and our administrative team will get back to you promptly.'
              : 'กรอกข้อมูลและข้อความที่ต้องการสอบถาม เจ้าหน้าที่ฝ่ายที่เกี่ยวข้องจะติดต่อกลับโดยเร็วที่สุด'}
          </p>
        </div>

        <!-- Success Feedback Alert -->
        {#if submitSuccess}
          <div class="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                <CheckCircle2 class="w-5 h-5 text-emerald-600" />
                <span>{$languageStore === 'en' ? 'Message Sent Successfully!' : 'ส่งข้อความสำเร็จเรียบร้อยแล้ว!'}</span>
              </div>
              <button
                type="button"
                onclick={() => (submitSuccess = false)}
                aria-label="Close"
                class="text-emerald-700 hover:text-emerald-900 p-1"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
            <p class="text-xs text-emerald-700 leading-relaxed">
              {$languageStore === 'en'
                ? 'We have received your inquiry. Our team will review and respond via your provided email or phone shortly.'
                : 'ทางคณะได้รับข้อความสอบถามของท่านแล้ว เจ้าหน้าที่จะดำเนินการตรวจสอบและติดต่อกลับผ่านทางอีเมลหรือเบอร์โทรศัพท์ที่ท่านระบุไว้'}
            </p>
          </div>
        {/if}

        <!-- Contact Form Element -->
        <form onsubmit={handleSubmit} class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Full Name -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-gray-700">
                {$languageStore === 'en' ? 'Full Name' : 'ชื่อ-นามสกุล'} <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                bind:value={formData.name}
                placeholder={$languageStore === 'en' ? 'e.g. John Doe' : 'เช่น สมชาย ใจดี'}
                class={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                  formErrors.name
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
                    : 'border-gray-200 bg-gray-50/50 focus:border-brand-orange focus:bg-white focus:ring-brand-orange/20'
                }`}
              />
              {#if formErrors.name}
                <p class="text-[11px] text-red-500 font-medium">{formErrors.name}</p>
              {/if}
            </div>

            <!-- Email -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-gray-700">
                {$languageStore === 'en' ? 'Email Address' : 'อีเมลติดต่อ'} <span class="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                bind:value={formData.email}
                placeholder={$languageStore === 'en' ? 'e.g. user@example.com' : 'เช่น email@example.com'}
                class={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                  formErrors.email
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
                    : 'border-gray-200 bg-gray-50/50 focus:border-brand-orange focus:bg-white focus:ring-brand-orange/20'
                }`}
              />
              {#if formErrors.email}
                <p class="text-[11px] text-red-500 font-medium">{formErrors.email}</p>
              {/if}
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Phone -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-gray-700">
                {$languageStore === 'en' ? 'Phone Number' : 'หมายเลขโทรศัพท์'}
              </label>
              <input
                type="tel"
                name="phone"
                bind:value={formData.phone}
                placeholder={$languageStore === 'en' ? 'e.g. 081-234-5678' : 'เช่น 081-234-5678'}
                class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:border-brand-orange focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20 transition-all"
              />
            </div>

            <!-- Inquiry Category -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-gray-700">
                {$languageStore === 'en' ? 'Inquiry Department' : 'เรื่องที่ต้องการติดต่อ'}
              </label>
              <select
                name="category"
                bind:value={formData.category}
                class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:border-brand-orange focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20 transition-all cursor-pointer"
              >
                <option value="general">{$languageStore === 'en' ? 'General Inquiries' : 'สอบถามข้อมูลทั่วไป / ประชาสัมพันธ์'}</option>
                <option value="admission">{$languageStore === 'en' ? 'Student Admissions' : 'การรับสมัครเข้าศึกษาต่อ (Admissions)'}</option>
                <option value="academic">{$languageStore === 'en' ? 'Academic & Registrar Support' : 'งานบริการการศึกษาและวิชาการ'}</option>
                <option value="pearson-vue">{$languageStore === 'en' ? 'Pearson VUE Certification' : 'ศูนย์ทดสอบสากล Pearson VUE'}</option>
                <option value="lab-booking">{$languageStore === 'en' ? 'Facility & Lab Reservation' : 'ขอใช้ห้องปฏิบัติการ / สัมมนา'}</option>
                <option value="research">{$languageStore === 'en' ? 'Research & Collaboration' : 'ความร่วมมือทางวิจัยและอุตสาหกรรม'}</option>
              </select>
            </div>
          </div>

          <!-- Subject -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-gray-700">
              {$languageStore === 'en' ? 'Subject' : 'หัวข้อเรื่อง'} <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              bind:value={formData.subject}
              placeholder={$languageStore === 'en' ? 'Enter message subject' : 'ระบุหัวข้อที่ต้องการสอบถาม'}
              class={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                formErrors.subject
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
                  : 'border-gray-200 bg-gray-50/50 focus:border-brand-orange focus:bg-white focus:ring-brand-orange/20'
              }`}
            />
            {#if formErrors.subject}
              <p class="text-[11px] text-red-500 font-medium">{formErrors.subject}</p>
            {/if}
          </div>

          <!-- Message Body -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-gray-700">
              {$languageStore === 'en' ? 'Message Details' : 'รายละเอียดข้อความ'} <span class="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              rows={4}
              bind:value={formData.message}
              placeholder={$languageStore === 'en' ? 'Type your message or inquiry here...' : 'พิมพ์ข้อความคำถามหรือรายละเอียดที่ต้องการติดต่อที่นี่...'}
              class={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                formErrors.message
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
                  : 'border-gray-200 bg-gray-50/50 focus:border-brand-orange focus:bg-white focus:ring-brand-orange/20'
              }`}
            ></textarea>
            {#if formErrors.message}
              <p class="text-[11px] text-red-500 font-medium">{formErrors.message}</p>
            {/if}
          </div>

          <!-- Submit Button -->
          <div class="pt-2 flex items-center justify-between">
            <p class="text-[11px] text-gray-400">
              * {$languageStore === 'en' ? 'Your data is kept confidential' : 'ข้อมูลของท่านจะถูกเก็บเป็นความลับเพื่อการให้บริการเท่านั้น'}
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-xs sm:text-sm font-semibold shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {#if isSubmitting}
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{$languageStore === 'en' ? 'Sending message...' : 'กำลังส่งข้อความ...'}</span>
              {:else}
                <Send class="w-4 h-4" />
                <span>{$languageStore === 'en' ? 'Submit Inquiry' : 'ส่งข้อความ'}</span>
              {/if}
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- Section 2: Department Internal Telephone Extension Directory -->
    <section class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b-2 border-brand-orange/20">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-brand-orange flex items-center justify-center">
            <PhoneCall class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
              {$languageStore === 'en' ? 'Departmental Extension Directory' : 'สมุดโทรศัพท์และเบอร์ต่อภายในคณะ'}
            </h2>
            <p class="text-xs text-gray-500">
              {$languageStore === 'en' ? 'Call 02-555-2000 followed by the 4-digit extension' : 'โทร. 02-555-2000 ตามด้วยหมายเลขต่อภายใน 4 หลัก'}
            </p>
          </div>
        </div>

        <!-- Quick Extension Search -->
        <div class="relative min-w-[260px]">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            bind:value={phoneSearch}
            placeholder={$languageStore === 'en' ? 'Search unit, room, ext...' : 'ค้นหาหน่วยงาน, ห้อง, หรือเบอร์ต่อ...'}
            class="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm focus:bg-white focus:border-brand-orange focus:outline-hidden"
          />
          {#if phoneSearch}
            <button
              type="button"
              onclick={() => (phoneSearch = '')}
              aria-label="Clear search"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          {/if}
        </div>
      </div>

      <!-- Phone Directory Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each filteredDirectory as item}
          <div
            class="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md hover:border-brand-orange/30 transition-all flex flex-col justify-between space-y-3"
          >
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                  {$languageStore === 'en' ? item.roomEn : item.roomTh}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-brand-orange border border-orange-200">
                  {$languageStore === 'en' ? `Fl ${item.floor}` : `ชั้น ${item.floor}`}
                </span>
              </div>

              <h3 class="font-bold text-sm sm:text-base text-gray-900">
                {$languageStore === 'en' ? item.unitEn : item.unitTh}
              </h3>

              {#if item.headNameTh}
                <p class="text-xs text-gray-500">
                  {$languageStore === 'en' ? item.headNameEn : item.headNameTh}
                </p>
              {/if}
            </div>

            <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-brand-orange font-bold text-sm">
                <Phone class="w-3.5 h-3.5 text-brand-orange" />
                <span>{$languageStore === 'en' ? 'Ext.' : 'ต่อ'} {item.extension}</span>
              </div>

              <a
                href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                class="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-brand-orange"
              >
                <span>{item.phone}</span>
              </a>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Section 3: Embedded Google Map & Directions -->
    <section class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b-2 border-brand-orange/20">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <MapPin class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
              {$languageStore === 'en' ? 'Campus Map & Getting Here' : 'แผนที่และการเดินทางมายังคณะ ITD'}
            </h2>
            <p class="text-xs text-gray-500">
              {$languageStore === 'en'
                ? 'Navamindra Rajini Building, Pracharat 1 Rd, Bang Sue, Bangkok'
                : 'อาคารนวมินทรราชินี (อาคาร 79) ถนนประชาราษฎร์ 1 เขตบางซื่อ กรุงเทพฯ'}
            </p>
          </div>
        </div>

        <a
          href={contactInfo.googleMapLink}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 hover:bg-brand-orange text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs shrink-0"
        >
          <span>{$languageStore === 'en' ? 'Open in Google Maps' : 'เปิดใน Google Maps'}</span>
          <ExternalLink class="w-3.5 h-3.5" />
        </a>
      </div>

      <!-- Map Frame -->
      <div class="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100">
        <iframe
          src={contactInfo.googleMapEmbedUrl}
          width="100%"
          height="100%"
          style="border: 0"
          allowfullscreen={true}
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="ITD KMUTNB Location Map"
          class="w-full h-full"
        ></iframe>
      </div>

      <!-- Transportation Guide Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {#each transportGuide as guide}
          {@const TransIcon = getTransportIcon(guide.iconName)}
          <div
            class="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-brand-orange flex items-center justify-center">
                <TransIcon class="w-5 h-5" />
              </div>
              <h3 class="font-bold text-sm sm:text-base text-gray-900">
                {$languageStore === 'en' ? guide.titleEn : guide.titleTh}
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                {$languageStore === 'en' ? guide.descriptionEn : guide.descriptionTh}
              </p>
            </div>

            <div class="pt-2 border-t border-gray-100 space-y-1 text-[11px] text-gray-500">
              {#each ($languageStore === 'en' ? guide.detailsEn : guide.detailsTh) as detail, dIdx}
                <div class="flex items-start gap-1.5">
                  <span class="text-brand-orange font-bold">•</span>
                  <span>{detail}</span>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>
