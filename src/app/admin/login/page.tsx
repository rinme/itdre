"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { getSafeRedirect } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = getSafeRedirect(searchParams.get("from"));

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน (Please enter username and password)");
      return;
    }

    setIsLoading(true);

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
          setErrorMessage("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (Invalid username or password)");
        } else {
          setErrorMessage("เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองใหม่อีกครั้ง");
        }
        setIsLoading(false);
        return;
      }

      // Success: redirect to intended destination or schedules dashboard
      router.push(redirectTarget);
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#18191E] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-dark-orange text-white font-bold text-2xl shadow-xl shadow-orange-500/25 mb-4 ring-4 ring-orange-500/10">
          IT
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          ITD Admin Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          ระบบจัดการตารางเรียนและสารสนเทศ คณะ ITD มจพ.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs sm:text-sm animate-scale-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            ชื่อผู้ใช้งาน (Username)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ระบุชื่อผู้ใช้งาน admin"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            รหัสผ่าน (Password)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ระบุรหัสผ่าน"
              className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-sm transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-orange to-brand-dark-orange hover:opacity-95 text-white font-semibold text-sm shadow-xl shadow-orange-500/25 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>กำลังตรวจสอบข้อมูล...</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>เข้าสู่ระบบ (Sign In)</span>
            </>
          )}
        </button>
      </form>

      {/* Back to main site */}
      <div className="mt-6 pt-5 border-t border-white/10 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>กลับสู่หน้าหลักเว็บไซต์ ITD KMUTNB</span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0D0E11] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 bg-[#18191E] border border-white/10 rounded-3xl text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
            <span className="text-xs">กำลังโหลดหน้าเข้าสู่ระบบ...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
