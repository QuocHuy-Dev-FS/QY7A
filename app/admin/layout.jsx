"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { AdminProvider } from "./context/AdminContext";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import Toast from "./components/Toast";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  const [checking, setChecking] = useState(!isLoginPage);
  const [signingOut, setSigningOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const verifySession = useCallback(async () => {
    const response = await fetch("/api/admin/session", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (response.ok) {
      return true;
    }

    let session = null;

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getSession();

      if (!error) {
        session = data.session;
      }
    } catch {
      session = null;
    }

    if (!session?.access_token) {
      return false;
    }

    const syncResponse = await fetch("/api/admin/session", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: session.access_token,
      }),
    });

    if (!syncResponse.ok) {
      return false;
    }

    const result = await syncResponse.json().catch(() => null);

    return result?.authenticated === true;
  }, []);

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    let active = true;

    async function checkAccess() {
      setChecking(true);

      try {
        const allowed = await verifySession();

        if (!active) {
          return;
        }

        if (!allowed) {
          router.replace("/admin/login");
          return;
        }

        setChecking(false);
      } catch {
        if (active) {
          router.replace("/admin/login");
        }
      }
    }

    checkAccess();

    return () => {
      active = false;
    };
  }, [isLoginPage, pathname, router, verifySession]);

  async function handleLogout() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    try {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
      } catch {
        // Continue clearing server cookie
      }

      await fetch("/api/admin/session", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "logout" }),
      });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  if (isLoginPage) {
    return children;
  }

  if (checking) {
    return (
      <AdminProvider>
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-800">
          <div className="flex flex-col items-center gap-4 text-center rounded-xl bg-white border border-slate-200 p-8 shadow-sm max-w-sm w-full">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-4 ring-emerald-100 animate-pulse">
              <ShieldCheck size={32} />
            </div>

            <div>
              <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">
                Bệnh viện Quân y 7A
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Đang xác thực phiên quản trị chất lượng...
              </p>
            </div>
          </div>
          {/* Giữ segment children được render ẩn trong lúc xác thực để Next.js 16 instant navigation tracker không bị drop segment */}
          <div className="hidden" aria-hidden="true">
            {children}
          </div>
        </main>
      </AdminProvider>
    );
  }

  return (
    <AdminProvider>
      <div className="min-h-screen bg-slate-100/70 flex text-slate-800 antialiased selection:bg-emerald-600 selection:text-white">
        {/* Unified HIS Enterprise Sidebar (Supabase-style collapsible rail on desktop) */}
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
          signingOut={signingOut}
        />

        {/* Main Content Area (Offset by slim rail on Desktop lg:ml-[70px]) */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-[70px] transition-all duration-300">
          {/* Unified HIS Enterprise Header */}
          <AdminHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

          {/* Dynamic Page Content */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>

        {/* Global Toast Notifications */}
        <Toast />
      </div>
    </AdminProvider>
  );
}