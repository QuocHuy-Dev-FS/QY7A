"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Clock,
  HeartPulse,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  X,
  CheckCircle,
} from "lucide-react";
import { HOSPITAL_INFO, DEPARTMENTS } from "@/lib/hospitalData";

export default function HospitalInfoModal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
      const t = setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, 180);
      return () => clearTimeout(t);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setMounted(false);
      setClosing(false);
      onClose();
    }, 180);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hospital-modal-title"
      className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md ${
        closing
          ? "animate-out fade-out duration-150"
          : "animate-in fade-in duration-200"
      }`}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-blue-200/50 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-[#061a35] via-[#09264b] to-[#123d68] px-6 py-5 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 items-center justify-center rounded-xl bg-white p-1.5 shrink-0 shadow-sm">
              <img
                src={HOSPITAL_INFO.logo}
                alt="Logo BV 7A"
                className="h-9 w-auto object-contain"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <ShieldCheck size={13} />
                {HOSPITAL_INFO.rank}
              </div>
              <h2
                id="hospital-modal-title"
                className="text-lg sm:text-xl font-extrabold text-white tracking-wide mt-0.5"
              >
                {HOSPITAL_INFO.name}
              </h2>
              <p className="text-xs text-blue-200/90 font-medium">
                {HOSPITAL_INFO.subName} • &quot;{HOSPITAL_INFO.slogan}&quot;
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng cửa sổ thông tin"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <X size={26} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-slate-800">
          {/* Quick Contact Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/70">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <PhoneCall size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-800 uppercase">
                  Tổng đài CSKH
                </p>
                <p className="text-base font-extrabold text-emerald-950">
                  {HOSPITAL_INFO.hotline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/70">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
                <HeartPulse size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-rose-800 uppercase">
                  Cấp cứu 24/7
                </p>
                <p className="text-base font-extrabold text-rose-950">
                  {HOSPITAL_INFO.emergencyHotline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-blue-50 border border-blue-200/70">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#174a7e] text-white">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-800 uppercase">
                  Giờ khám bệnh
                </p>
                <p className="text-xs font-bold text-slate-800">
                  07:00 - 16:30 (Thứ 2 - Thứ 6)
                </p>
              </div>
            </div>
          </div>

          {/* Address & Intro */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <MapPin size={22} className="text-blue-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-slate-900 text-base">
                  Địa chỉ bệnh viện:
                </p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">
                  {HOSPITAL_INFO.address}
                </p>
                <p className="text-xs text-slate-500 mt-1.5 leading-5">
                  {HOSPITAL_INFO.description}
                </p>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              Điểm nổi bật & Dịch vụ y tế
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {HOSPITAL_INFO.highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 shadow-sm"
                >
                  <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm font-medium text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Department Directory */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
              <Building2 size={18} className="text-blue-700" />
              Danh mục các Khoa / Phòng chức năng
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {DEPARTMENTS.map((dept) => (
                <div
                  key={dept.value}
                  className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/60"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-900 text-xs font-bold">
                      {dept.code}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {dept.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {dept.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Hệ thống Kiosk Tra cứu & Khảo sát ý kiến người bệnh
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 rounded-xl bg-[#09264b] hover:bg-[#123d68] text-white text-sm font-bold shadow transition active:scale-95"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
}
