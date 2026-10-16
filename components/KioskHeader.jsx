"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function KioskHeader() {
  const pathname = usePathname();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isAdmin = Boolean(pathname?.startsWith("/admin"));

  useEffect(() => {
    if (isAdmin) return;

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isAdmin]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // Browser permission restriction fallback
    }
  };

  // Do not render KioskHeader on Admin routes (safe return after all hooks are called)
  if (isAdmin) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/90 shadow-sm select-none">
      <div className="mx-auto grid grid-cols-[1fr_auto_1fr] h-16 sm:h-20 w-full max-w-7xl items-center px-3 sm:px-6 md:px-8 gap-2">
        {/* Left: Hospital Logo */}
        <div className="flex items-center justify-start shrink-0">
          <Link
            href="/"
            aria-label="Về trang chủ Kiosk Bệnh viện Quân y 7A"
            className="flex items-center focus:outline-none"
          >
            <img
              src="/assets/images/logo-bv-quan-y-7a-tight.png"
              alt="Logo Bệnh viện Quân y 7A"
              className="h-8 sm:h-10 md:h-12 w-auto object-contain object-left max-w-[160px] sm:max-w-[220px]"
            />
          </Link>
        </div>

        {/* Center: Title “BỆNH VIỆN QUÂN Y 7A” Centered Horizontally & Vertically */}
        <div className="flex items-center justify-center text-center px-2">
          <Link
            href="/"
            className="focus:outline-none text-center"
          >
            <span
              style={{ color: "#0f2852" }}
              className="block text-sm sm:text-lg md:text-xl lg:text-2xl font-black tracking-wide uppercase leading-tight text-[#0f2852]"
            >
              BỆNH VIỆN QUÂN Y 7A
            </span>
          </Link>
        </div>

        {/* Right: Discreet Fullscreen Toggle to balance layout */}
        <div className="flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Thoát toàn màn hình" : "Chế độ Kiosk toàn màn hình"}
            aria-label="Chế độ Kiosk toàn màn hình"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg text-slate-400 hover:text-[#0f2852] hover:bg-slate-100 transition active:scale-95 focus:outline-none"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
