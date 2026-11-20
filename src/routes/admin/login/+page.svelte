<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import {
    Lock,
    User,
    Eye,
    EyeOff,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Shield,
  } from "lucide-svelte";
  import { getSafeRedirect } from "$lib/auth";

  let username = $state("");
  let password = $state("");
  let showPassword = $state(false);
  let isLoading = $state(false);
  let errorMessage = $state<string | null>(null);

  let redirectTarget = $derived(getSafeRedirect(page.url.searchParams.get("from")));

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = null;

    if (!username.trim() || !password) {
      errorMessage = "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน (Please enter username and password)";
      return;
    }

    isLoading = true;

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401 || data.error === "INVALID_CREDENTIALS") {
          errorMessage = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (Invalid username or password)";
        } else {
          errorMessage = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองใหม่อีกครั้ง";
        }
        isLoading = false;
        return;
      }

      // Success: redirect to intended destination
      window.location.href = redirectTarget;
    } catch (err: any) {
      console.error("Login error:", err);
      errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง";
      isLoading = false;
    }
  }
</script>

<div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0D0E11] relative overflow-hidden">
  <!-- Background ambient lighting -->
  <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

  <div class="w-full max-w-md bg-[#18191E] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
    <!-- Brand Header -->
    <div class="text-center mb-6">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-dark-orange text-white font-bold text-2xl shadow-xl shadow-orange-500/25 mb-4 ring-4 ring-orange-500/10">
        IT
      </div>
      <h1 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
        ITD Admin Portal
      </h1>
      <p class="text-xs sm:text-sm text-slate-400 mt-1">
        ระบบจัดการตารางเรียนและสารสนเทศ คณะ ITD มจพ.
      </p>
    </div>

    <!-- Error Banner -->
    {#if errorMessage}
      <div class="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs sm:text-sm animate-scale-in">
        <AlertCircle class="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div class="flex-1 leading-relaxed">{errorMessage}</div>
      </div>
    {/if}

    <!-- Form -->
    <form onsubmit={handleSubmit} class="space-y-4">
      <!-- Username -->
      <div>
        <label for="admin-login-username" class="block text-xs font-semibold text-slate-300 mb-1.5">
          ชื่อผู้ใช้งาน (Username)
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User class="w-4 h-4" />
          </div>
          <input
            id="admin-login-username"
            type="text"
            required
            bind:value={username}
            placeholder="ระบุชื่อผู้ใช้งาน admin"
            class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm transition-all"
          />
        </div>
      </div>

      <!-- Password -->
      <div>
        <label for="admin-login-password" class="block text-xs font-semibold text-slate-300 mb-1.5">
          รหัสผ่าน (Password)
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock class="w-4 h-4" />
          </div>
          <input
            id="admin-login-password"
            type={showPassword ? "text" : "password"}
            required
            bind:value={password}
            placeholder="ระบุรหัสผ่าน"
            class="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm transition-all"
          />
          <button
            type="button"
            onclick={() => (showPassword = !showPassword)}
            class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {#if showPassword}
              <EyeOff class="w-4 h-4" />
            {:else}
              <Eye class="w-4 h-4" />
            {/if}
          </button>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        disabled={isLoading}
        class="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-orange to-brand-dark-orange hover:opacity-95 text-white font-semibold text-sm shadow-xl shadow-orange-500/25 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      >
        {#if isLoading}
          <Loader2 class="w-4 h-4 animate-spin" />
          <span>กำลังตรวจสอบข้อมูล...</span>
        {:else}
          <Shield class="w-4 h-4" />
          <span>เข้าสู่ระบบ (Sign In)</span>
        {/if}
      </button>
    </form>

    <!-- Back to main site -->
    <div class="mt-6 pt-5 border-t border-white/10 text-center">
      <a
        href="/"
        class="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>กลับสู่หน้าหลักเว็บไซต์ ITD KMUTNB</span>
      </a>
    </div>
  </div>
</div>
