"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";

interface AdminHeaderProps {
  currentTab?: "schedules" | string;
  adminUsername?: string;
}

export default function AdminHeader({
  currentTab = "schedules",
  adminUsername,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string>(adminUsername || "admin");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!adminUsername) {
      fetch("/api/admin/auth/me")
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (data?.authenticated && data.user?.username) {
            setUsername(data.user.username);
          }
        })
        .catch(() => {
          // Keep default username fallback
        });
    }
  }, [adminUsername]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
      });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  const navLinks = [
    {
      nameTh: "จัดการตารางเรียน",
      nameEn: "Schedules",
      href: "/admin/schedules",
      icon: Calendar,
      active: pathname.startsWith("/admin/schedules"),
    },
    {
      nameTh: "Presets",
      nameEn: "Presets",
      href: "/admin/presets",
      icon: BookMarked,
      active: pathname.startsWith("/admin/presets"),
    },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#121316]/95 backdrop-blur-xl border-b border-white/10 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Branding & Navigation */}
          <div className="flex items-center gap-6">
            <Link
              href="/admin/schedules"
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange rounded-xl"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-brand-darkOrange flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                IT
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white tracking-wide text-base leading-tight">
                    ITD Admin Portal
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-orange/20 text-orange-400 border border-brand-orange/30 rounded-md">
                    ADMIN
                  </span>
                </div>
                <span className="text-xs text-slate-400 leading-tight">
                  ระบบจัดการตารางเรียนคณะ ITD KMUTNB
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 ml-4">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      item.active
                        ? "bg-white/10 text-brand-orange shadow-inner font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.nameTh}</span>
                  </Link>
                );
              })}

              <Link
                href="/schedules"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all ml-2"
                title="เปิดหน้าตารางเรียนสาธารณะในแท็บใหม่"
              >
                <span>หน้าเว็บสาธารณะ</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </nav>
          </div>

          {/* Right: Active Admin User Status & Logout */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Active User Indicator */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="relative">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#121316]"
                  title="ออนไลน์"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-slate-200 leading-tight">
                  {username}
                </span>
                <span className="text-[10px] text-emerald-400 leading-tight flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  ผู้ดูแลระบบ
                </span>
              </div>
            </div>

            {/* Main Site Home Link */}
            <Link
              href="/"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="กลับสู่หน้าหลักเว็บไซต์"
            >
              <Home className="w-4 h-4" />
            </Link>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              title="ออกจากระบบ"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>ออกจากระบบ</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-3 border-t border-white/10 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl text-xs text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold">{username}</span>
              </div>
              <span className="text-[10px] text-emerald-400">ผู้ดูแลระบบ</span>
            </div>

            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium ${
                    item.active
                      ? "bg-brand-orange text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.nameTh}</span>
                </Link>
              );
            })}

            <Link
              href="/schedules"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5"
            >
              <span>เปิดหน้าเว็บตารางเรียนสาธารณะ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>กลับสู่หน้าหลักเว็บไซต์</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold mt-2"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>ออกจากระบบ</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
