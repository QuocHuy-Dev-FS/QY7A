"use client";

import { useState } from "react";
import Link from "next/link";
import HospitalInfoModal from "@/components/HospitalInfoModal";

export default function HomePage() {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  return (
    <div className="relative flex-1 flex flex-col justify-between min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] w-full overflow-hidden bg-[#060c23] text-white select-none">
      {/* Background: Deep dark navy blending into glowing digital city & circuit floor at bottom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-bottom bg-no-repeat opacity-95"
        style={{
          backgroundImage: "url('/assets/images/kiosk-city-bg.jpg')",
          backgroundPosition: "center bottom",
        }}
      >
        {/* Top-to-center soft dark gradient overlay to ensure perfect contrast for text & buttons */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060c23] via-[#060c23]/85 to-transparent h-[62%]" />
      </div>

      {/* Main Kiosk Content: Centered Vertically and Horizontally */}
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        {/* Main Kiosk Title & Concise Instructions */}
        <div className="w-full text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wider text-white drop-shadow-md">
            KHẢO SÁT Ý KIẾN
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-200/90 leading-relaxed font-medium">
            Chào mừng Quý khách đến với Kiosk Bệnh viện Quân y 7A.
            <span className="block mt-0.5">Vui lòng chọn dịch vụ bạn muốn sử dụng</span>
          </p>
        </div>

        {/* Large Rectangular Kiosk Function Buttons in a Single Column */}
        <div className="flex w-full flex-col gap-3.5 sm:gap-4 md:gap-5">
          {/* Button 1: Direct Survey with high contrast navy text #0f2852 */}
          <Link
            href="/feedback"
            style={{ color: "#0f2852", backgroundColor: "#ffffff" }}
            className="flex min-h-[64px] sm:min-h-[72px] md:min-h-[78px] w-full items-center justify-center rounded-lg sm:rounded-xl bg-white hover:bg-slate-50 active:scale-[0.99] shadow-lg border border-slate-100 transition-all text-center px-4"
          >
            <span
              style={{ color: "#0f2852" }}
              className="text-[#0f2852] font-black text-base sm:text-lg md:text-xl tracking-wide select-none"
            >
              Khảo sát ý kiến trực tiếp
            </span>
          </Link>

          {/* Button 2: Survey with Patient Code / CCCD with high contrast navy text #0f2852 */}
          <Link
            href="/auth"
            style={{ color: "#0f2852", backgroundColor: "#ffffff" }}
            className="flex min-h-[64px] sm:min-h-[72px] md:min-h-[78px] w-full items-center justify-center rounded-lg sm:rounded-xl bg-white hover:bg-slate-50 active:scale-[0.99] shadow-lg border border-slate-100 transition-all text-center px-4"
          >
            <span
              style={{ color: "#0f2852" }}
              className="text-[#0f2852] font-black text-base sm:text-lg md:text-xl tracking-wide select-none"
            >
              Khảo sát theo mã BN / CCCD
            </span>
          </Link>

          {/* Button 3: Hospital Information with high contrast navy text #0f2852 */}
          <button
            type="button"
            onClick={() => setIsInfoModalOpen(true)}
            style={{ color: "#0f2852", backgroundColor: "#ffffff" }}
            className="flex min-h-[64px] sm:min-h-[72px] md:min-h-[78px] w-full items-center justify-center rounded-lg sm:rounded-xl bg-white hover:bg-slate-50 active:scale-[0.99] shadow-lg border border-slate-100 transition-all text-center px-4 focus:outline-none"
          >
            <span
              style={{ color: "#0f2852" }}
              className="text-[#0f2852] font-black text-base sm:text-lg md:text-xl tracking-wide select-none"
            >
              Tra cứu thông tin Bệnh viện
            </span>
          </button>
        </div>

        {/* Discreet Staff Management Link */}
        <div className="mt-8 text-center">
          <Link
            href="/admin"
            className="inline-block text-xs font-semibold text-cyan-300/60 hover:text-cyan-200 transition-colors py-1 px-3 rounded-full hover:bg-white/5"
          >
            Quản trị chất lượng bệnh viện
          </Link>
        </div>
      </div>

      {/* Hospital Information Modal */}
      <HospitalInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}
