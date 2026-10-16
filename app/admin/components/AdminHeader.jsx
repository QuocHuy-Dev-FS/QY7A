"use client";

import { usePathname } from "next/navigation";
import {
  Menu,
  RefreshCw,
  Download,
  ShieldCheck,
  User,
  ChevronRight,
  Maximize2,
  Minimize2,
  BellRing,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAdmin } from "../context/AdminContext";

const PAGE_METADATA = {
  "/admin": {
    title: "Tổng quan Dashboard",
    category: "Giám sát & Báo cáo",
    description: "Theo dõi các chỉ số KPI chất lượng bệnh viện thời gian thực từ hệ thống Kiosk",
  },
  "/admin/feedbacks": {
    title: "Quản lý Phiếu Khảo sát & Hộp thư",
    category: "Tiếp nhận & Xử lý",
    description: "Chi tiết toàn bộ phản ánh, đánh giá của người bệnh và cập nhật tiến độ xử lý",
  },
  "/admin/reports": {
    title: "Báo cáo & Phân tích 5 Nhóm Tiêu chí",
    category: "Giám sát & Báo cáo",
    description: "Phân tích điểm số chi tiết theo tiêu chuẩn Bộ Y tế và cơ cấu độ sẵn sàng giới thiệu NPS",
  },
  "/admin/departments": {
    title: "Danh mục Khoa / Phòng chức năng",
    category: "Hệ thống & Khoa phòng",
    description: "Thống kê chỉ số hài lòng và lượt khảo sát theo từng chuyên khoa Bệnh viện Quân y 7A",
  },
  "/admin/settings": {
    title: "Cấu hình Hệ thống & Thông tin Bệnh viện",
    category: "Hệ thống & Cấu hình",
    description: "Thông số vận hành Kiosk, trạng thái cơ sở dữ liệu và thông tin hành chính đơn vị",
  },
};

export default function AdminHeader({ onOpenSidebar }) {
  const pathname = usePathname();
  const { user, loading, refreshFeedbacks, exportCSV, stats } = useAdmin();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // Fallback
    }
  };

  const meta = PAGE_METADATA[pathname] || {
    title: "Cổng Quản trị Chất lượng",
    category: "Bệnh viện Quân y 7A",
    description: "Hệ thống theo dõi và quản lý sự hài lòng người bệnh",
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs select-none">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 gap-4">
        {/* Left: Mobile Toggle & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Mở menu quản trị"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 lg:hidden shrink-0 transition"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb Path */}
          <nav aria-label="Đường dẫn trang" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-semibold truncate">
            <span className="text-slate-400">Admin HIS</span>
            <ChevronRight size={13} className="text-slate-300" />
            <span className="text-slate-600">{meta.category}</span>
            <ChevronRight size={13} className="text-slate-300" />
            <span className="text-emerald-950 font-extrabold truncate">{meta.title}</span>
          </nav>
        </div>

        {/* Right: Actions, Fullscreen, User Info */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Refresh Action Button */}
          <button
            type="button"
            onClick={refreshFeedbacks}
            disabled={loading}
            title="Làm mới dữ liệu từ máy chủ"
            className="flex h-9 sm:h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95 disabled:opacity-60 shadow-xs"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-emerald-600" : "text-slate-500"} />
            <span className="hidden md:inline">Làm mới</span>
          </button>

          {/* Export CSV Action Button */}
          <button
            type="button"
            onClick={exportCSV}
            title="Xuất bảng tính CSV / Excel"
            className="flex h-9 sm:h-10 items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 px-3.5 text-xs sm:text-sm font-semibold text-white transition active:scale-95 shadow-xs"
          >
            <Download size={15} className="text-emerald-100" />
            <span className="hidden md:inline">Xuất báo cáo</span>
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Thoát toàn màn hình" : "Chế độ xem toàn màn hình"}
            aria-label="Chế độ xem toàn màn hình"
            className="hidden sm:flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition active:scale-95 shadow-xs"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* User Account Info Pill */}
          <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 sm:px-3 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-700 text-white font-bold text-xs shadow-xs">
              {user?.email ? user.email.charAt(0).toUpperCase() : <User size={15} />}
            </div>

            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-slate-900 truncate max-w-[160px]">
                {user?.email || "Cán bộ Quản lý"}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-slate-500">
                  Phòng QLCL • Trực tuyến
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Title Sub-banner */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {meta.title}
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
              <ShieldCheck size={12} className="text-emerald-700" />
              Quân y 7A
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            {meta.description}
          </p>
        </div>

        {/* Urgent Alert Banner Badge if present */}
        {stats.urgentCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-in fade-in duration-200">
            <BellRing size={14} className="text-rose-600 animate-bounce" />
            <span>Có <strong>{stats.urgentCount}</strong> phản ánh cần ưu tiên xử lý</span>
          </div>
        )}
      </div>
    </header>
  );
}
