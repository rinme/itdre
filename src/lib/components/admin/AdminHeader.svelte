<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import {
    Calendar,
    BookMarked,
    LogOut,
    ExternalLink,
    ShieldCheck,
    User,
    Home,
    Loader2,
    Menu,
    X,
  } from "lucide-svelte";

  interface Props {
    currentTab?: string;
    adminUsername?: string;
  }

  let { currentTab = "schedules", adminUsername }: Props = $props();

  let fetchedUsername = $state<string | null>(null);
  let isLoggingOut = $state(false);
  let mobileMenuOpen = $state(false);

  let username = $derived(adminUsername || fetchedUsername || "admin");

  onMount(async () => {
    if (!adminUsername) {
      try {
        const res = await fetch("/api/admin/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data?.authenticated && data.user?.username) {
            fetchedUsername = data.user.username;
          }
        }
      } catch {
        // Fallback to default username
      }
    }
  });

  async function handleLogout() {
    if (isLoggingOut) return;
    isLoggingOut = true;
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
      });
      goto("/admin/login");
    } catch (err) {
      console.error("Logout error:", err);
      isLoggingOut = false;
    }
  }

  let navLinks = $derived([
    {
      nameTh: "จัดการตารางเรียน",
      nameEn: "Schedules",
      href: "/admin/schedules",
      icon: Calendar,
      active: page.url.pathname.startsWith("/admin/schedules"),
    },
    {
      nameTh: "Presets",
      nameEn: "Presets",
      href: "/admin/presets",
      icon: BookMarked,
      active: page.url.pathname.startsWith("/admin/presets"),
    },
  ]);
</script>

<header class="sticky top-0 z-30 w-full bg-[#121316]/95 backdrop-blur-xl border-b border-white/10 text-white shadow-lg">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Left: Branding & Navigation -->
      <div class="flex items-center gap-6">
        <a
          href="/admin/schedules"
          class="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange rounded-xl"
        >
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-brand-dark-orange flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            IT
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="font-bold text-white tracking-wide text-base leading-tight">
                ITD Admin Portal
              </span>
              <span class="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-orange/20 text-orange-400 border border-brand-orange/30 rounded-md">
                ADMIN
              </span>
            </div>
            <span class="text-xs text-slate-400 leading-tight">
              ระบบจัดการตารางเรียนคณะ ITD KMUTNB
            </span>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-1.5 ml-4">
          {#each navLinks as item (item.href)}
            {@const Icon = item.icon}
            <a
              href={item.href}
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all {item.active ? 'bg-white/10 text-brand-orange shadow-inner font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/5'}"
            >
              <Icon class="w-4 h-4" />
              <span>{item.nameTh}</span>
            </a>
          {/each}

          <a
            href="/schedules"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all ml-2"
            title="เปิดหน้าตารางเรียนสาธารณะในแท็บใหม่"
          >
            <span>หน้าตารางเรียนสาธารณะ</span>
            <ExternalLink class="w-3.5 h-3.5" />
          </a>
        </nav>
      </div>

      <!-- Right: User Info & Logout -->
      <div class="hidden sm:flex items-center gap-3">
        <!-- User Badge -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
          <div class="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <User class="w-3.5 h-3.5" />
          </div>
          <div class="flex flex-col text-left">
            <span class="font-semibold text-slate-200 leading-tight">
              {username}
            </span>
            <span class="text-[10px] text-emerald-400 leading-tight flex items-center gap-1">
              <ShieldCheck class="w-2.5 h-2.5" />
              ผู้ดูแลระบบ
            </span>
          </div>
        </div>

        <!-- Main Site Home Link -->
        <a
          href="/"
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="กลับสู่หน้าหลักเว็บไซต์"
        >
          <Home class="w-4 h-4" />
        </a>

        <!-- Logout Button -->
        <button
          type="button"
          onclick={handleLogout}
          disabled={isLoggingOut}
          class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          title="ออกจากระบบ"
        >
          {#if isLoggingOut}
            <Loader2 class="w-4 h-4 animate-spin" />
          {:else}
            <LogOut class="w-4 h-4" />
          {/if}
          <span>ออกจากระบบ</span>
        </button>
      </div>

      <!-- Mobile Menu Button -->
      <div class="flex sm:hidden items-center gap-2">
        <button
          type="button"
          onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
          class="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {#if mobileMenuOpen}
            <X class="w-5 h-5" />
          {:else}
            <Menu class="w-5 h-5" />
          {/if}
        </button>
      </div>
    </div>

    <!-- Mobile Dropdown Menu -->
    {#if mobileMenuOpen}
      <div class="sm:hidden py-3 border-t border-white/10 space-y-2">
        <div class="flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl text-xs text-slate-300 mb-2">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="font-semibold">{username}</span>
          </div>
          <span class="text-[10px] text-emerald-400">ผู้ดูแลระบบ</span>
        </div>

        {#each navLinks as item (item.href)}
          {@const Icon = item.icon}
          <a
            href={item.href}
            onclick={() => (mobileMenuOpen = false)}
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium {item.active ? 'bg-brand-orange text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}"
          >
            <Icon class="w-4 h-4" />
            <span>{item.nameTh}</span>
          </a>
        {/each}

        <a
          href="/schedules"
          target="_blank"
          rel="noreferrer"
          onclick={() => (mobileMenuOpen = false)}
          class="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5"
        >
          <span>เปิดหน้าเว็บตารางเรียนสาธารณะ</span>
          <ExternalLink class="w-3.5 h-3.5" />
        </a>

        <a
          href="/"
          onclick={() => (mobileMenuOpen = false)}
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5"
        >
          <Home class="w-3.5 h-3.5" />
          <span>กลับสู่หน้าหลักเว็บไซต์</span>
        </a>

        <button
          type="button"
          onclick={handleLogout}
          disabled={isLoggingOut}
          class="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold mt-2 cursor-pointer"
        >
          {#if isLoggingOut}
            <Loader2 class="w-4 h-4 animate-spin" />
          {:else}
            <LogOut class="w-4 h-4" />
          {/if}
          <span>ออกจากระบบ</span>
        </button>
      </div>
    {/if}
  </div>
</header>
