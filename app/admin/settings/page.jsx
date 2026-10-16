"use client";

import {
  Building2,
  ShieldCheck,
  Server,
  Monitor,
  PhoneCall,
  Clock,
  Key,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { HOSPITAL_INFO } from "@/lib/hospitalData";

export default function SettingsPage() {
  const { user } = useAdmin();

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Cấu hình Hệ thống &amp; Thông tin Hành chính
          </h2>
          <span className="rounded-full bg-emerald-100 text-emerald-950 border border-emerald-200 px-2.5 py-0.5 text-xs font-black">
            Bệnh viện Quân y 7A
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Thông tin đơn vị, quy chuẩn vận hành Kiosk và trạng thái kết nối máy chủ
        </p>
      </section>

      {/* 2. Grid of Info Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hospital Administrative Info */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Thông tin Hành chính Đơn vị
              </h3>
              <p className="text-xs text-slate-400">
                Đơn vị thụ hưởng và vận hành hệ thống
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Tên bệnh viện:</span>
              <span className="font-bold text-slate-900 text-right">{HOSPITAL_INFO.name}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Cơ quan chủ quản:</span>
              <span className="font-bold text-slate-900 text-right">{HOSPITAL_INFO.subName}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Phân hạng bệnh viện:</span>
              <span className="font-bold text-emerald-800 text-right">{HOSPITAL_INFO.rank}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Khẩu hiệu hành động:</span>
              <span className="font-bold text-emerald-900 text-right">&ldquo;{HOSPITAL_INFO.slogan}&rdquo;</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Địa chỉ trụ sở:</span>
              <span className="font-bold text-slate-900 text-right max-w-xs">{HOSPITAL_INFO.address}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Tổng đài CSKH:</span>
              <span className="font-bold font-mono text-slate-900">{HOSPITAL_INFO.hotline}</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-medium">Đường dây cấp cứu 24/7:</span>
              <span className="font-bold font-mono text-rose-700">{HOSPITAL_INFO.emergencyHotline}</span>
            </div>
          </div>
        </section>

        {/* Kiosk Operational Parameters */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800">
              <Monitor size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Thông số Vận hành Màn hình Kiosk
              </h3>
              <p className="text-xs text-slate-400">
                Cấu hình thời gian chờ và trải nghiệm người bệnh
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Thời gian chờ bất hoạt (Idle):</span>
              <span className="font-bold text-slate-900">60 giây (Cảnh báo 15s)</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Tự động chuyển về Home sau khảo sát:</span>
              <span className="font-bold text-slate-900">12 giây đếm ngược</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Chế độ hiển thị Kiosk:</span>
              <span className="font-bold text-slate-900">Hỗ trợ Fullscreen API</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Phương thức định danh:</span>
              <span className="font-bold text-slate-900">Mã bệnh nhân / Số CCCD 12 số</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-medium">Bàn phím nhập liệu:</span>
              <span className="font-bold text-slate-900">Bàn phím số ảo Touch Numpad</span>
            </div>
          </div>
        </section>

        {/* Security & System Info */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
              <Server size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Hạ tầng Dữ liệu &amp; Tài khoản Quản trị
              </h3>
              <p className="text-xs text-slate-400">
                Phiên làm việc và phân quyền bảo mật
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block">Tài khoản quản trị hiện tại</span>
              <span className="text-sm font-black text-slate-900 mt-1 block truncate">
                {user?.email || "Cán bộ Quản trị Chất lượng"}
              </span>
              <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 size={12} /> Đã xác thực phân quyền
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block">Hệ thống Cơ sở Dữ liệu</span>
              <span className="text-sm font-black text-slate-900 mt-1 block">
                Supabase PostgreSQL (BaaS)
              </span>
              <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-emerald-700">
                <ShieldCheck size={12} /> RLS &amp; Service Role bảo mật
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block">Nền tảng Công nghệ</span>
              <span className="text-sm font-black text-slate-900 mt-1 block">
                Next.js 16.4 • Turbopack
              </span>
              <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-slate-500">
                HIS Enterprise Portal v2.6.4
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
