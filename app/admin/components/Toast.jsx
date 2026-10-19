"use client";

import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { useAdmin } from "../context/AdminContext";

export default function Toast() {
  const { toast } = useAdmin();

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md bg-white/95 text-slate-800 border-slate-200 ${
        toast.isHiding
          ? "animate-out slide-out-to-bottom-3 fade-out duration-300"
          : "animate-in slide-in-from-bottom-3 duration-200"
      }`}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
          isSuccess ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
        }`}
      >
        {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      </div>

      <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
        {toast.message}
      </div>
    </div>
  );
}
