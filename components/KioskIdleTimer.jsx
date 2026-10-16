"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, RotateCcw, ThumbsUp } from "lucide-react";

const IDLE_TIMEOUT_MS = 60 * 1000; // 60s idle before showing modal
const COUNTDOWN_SECONDS = 15; // 15s to respond

export default function KioskIdleTimer() {
  const pathname = usePathname();
  const router = useRouter();

  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_SECONDS);

  const idleTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const isHomePage = pathname === "/";
  const isAdmin = pathname?.startsWith("/admin");

  const resetIdleTimer = useCallback(() => {
    if (isAdmin) return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setIsWarningOpen(false);
    setSecondsRemaining(COUNTDOWN_SECONDS);

    // Only start idle monitoring if on kiosk/survey screen, not on home screen or admin
    if (!isHomePage && !isAdmin) {
      idleTimerRef.current = setTimeout(() => {
        setIsWarningOpen(true);
        setSecondsRemaining(COUNTDOWN_SECONDS);
      }, IDLE_TIMEOUT_MS);
    }
  }, [isHomePage, isAdmin]);

  // Handle countdown when warning is active
  useEffect(() => {
    if (!isWarningOpen) return;

    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          setIsWarningOpen(false);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isWarningOpen, router]);

  // Listen to user interaction events across the entire window
  useEffect(() => {
    if (isHomePage || isAdmin) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setIsWarningOpen(false);
      return;
    }

    const events = ["touchstart", "touchmove", "pointerdown", "mousedown", "keydown", "scroll"];

    const handleUserActivity = () => {
      // If modal is not open, simply refresh the idle timer
      if (!isWarningOpen) {
        resetIdleTimer();
      }
    };

    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));
    resetIdleTimer();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isHomePage, isAdmin, isWarningOpen, resetIdleTimer]);

  if (!isWarningOpen || isHomePage || isAdmin) {
    return null;
  }

  const percentLeft = (secondsRemaining / COUNTDOWN_SECONDS) * 100;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="idle-warning-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl border-2 border-amber-300">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-8 ring-amber-100/60 animate-pulse">
          <AlertCircle size={44} />
        </div>

        <h2
          id="idle-warning-title"
          className="mt-5 text-2xl font-black text-slate-900 tracking-tight"
        >
          Quý khách có còn thao tác?
        </h2>

        <p className="mt-3 text-base text-slate-600 leading-relaxed">
          Màn hình Kiosk sẽ tự động trở về Trang chủ trong vòng
        </p>

        {/* Animated Countdown Ring */}
        <div className="my-5 flex flex-col items-center justify-center">
          <span className="text-5xl font-black tabular-nums text-amber-600">
            {secondsRemaining}
          </span>
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400 mt-1">
            Giây còn lại
          </span>

          <div className="mt-4 h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-amber-500 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${percentLeft}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          Chạm bất kỳ đâu vào nút dưới đây để tiếp tục lượt khảo sát của bạn.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={resetIdleTimer}
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-base shadow-lg shadow-emerald-700/20 active:scale-95 transition"
          >
            <ThumbsUp size={20} />
            Tiếp tục thao tác
          </button>

          <button
            type="button"
            onClick={() => {
              setIsWarningOpen(false);
              router.push("/");
            }}
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base active:scale-95 transition"
          >
            <RotateCcw size={18} />
            Về Trang chủ ngay
          </button>
        </div>
      </div>
    </div>
  );
}
