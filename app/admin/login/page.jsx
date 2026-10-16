"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockKeyhole, ShieldCheck, Eye, EyeOff, ArrowLeft } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { HOSPITAL_INFO } from "@/lib/hospitalData";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (signInError || !data.session?.access_token) {
        setError(
          "Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu."
        );
        return;
      }

      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          accessToken: data.session.access_token,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.authenticated !== true) {
        await supabase.auth.signOut();

        setError(
          result?.message ||
            "Tài khoản chưa được cấp quyền quản trị chất lượng."
        );

        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError(
        "Không thể kết nối hệ thống đăng nhập. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 text-slate-800 selection:bg-emerald-600 selection:text-white">
      <section className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        {/* Header with Hospital Military Branding */}
        <div className="bg-slate-50 border-b border-slate-200 px-7 py-7 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-white border border-slate-200 p-2 shadow-xs">
            <img
              src={HOSPITAL_INFO.logo}
              alt="Logo BV Quân y 7A"
              className="h-full w-auto object-contain"
            />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-emerald-800">
            <ShieldCheck size={13} className="text-emerald-700" />
            Quản trị Chất lượng Bệnh viện
          </span>

          <h1 className="mt-2.5 text-lg sm:text-xl font-bold uppercase tracking-wide text-slate-900">
            Đăng nhập Quản trị
          </h1>

          <p className="mt-1 text-xs text-slate-500 font-normal">
            {HOSPITAL_INFO.name} • {HOSPITAL_INFO.subName}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 sm:p-7">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-700"
            >
              Email cán bộ quản lý:
            </label>

            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              inputMode="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nhanvien@bvquany7a.vn"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-700"
            >
              Mật khẩu:
            </label>

            <div className="relative">
              <LockKeyhole
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nhập mật khẩu quản trị"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-11 text-sm text-slate-900 outline-none transition focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold leading-relaxed text-rose-800"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex min-h-11 w-full items-center justify-center rounded-lg bg-emerald-700 hover:bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang xác thực thông tin..." : "Đăng nhập hệ thống"}
          </button>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Khu vực an ninh Quân y 7A</span>
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900"
            >
              <ArrowLeft size={13} />
              Về Kiosk
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}