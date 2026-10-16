"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  MessageSquareText,
  AlertTriangle,
  Building2,
  Sliders,
  Monitor,
  LogOut,
  X,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { HOSPITAL_INFO } from "@/lib/hospitalData";

function AdminSidebarContent({ isOpen, onClose, onLogout, signingOut }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const priorityParam = searchParams.get("priority");
  const { stats } = useAdmin();

  // Desktop hover expansion state (Supabase-style collapsible rail)
  const [isHovered, setIsHovered] = useState(false);

  const navigationGroups = [
    {
      title: "Tổng quan & Báo cáo",
      items: [
        {
          name: "Tổng quan Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          exact: true,
          badge: null,
        },
        {
          name: "Báo cáo Phân tích 5 Tiêu chí",
          href: "/admin/reports",
          icon: BarChart3,
          exact: false,
          badge: null,
        },
      ],
    },
    {
      title: "Tiếp nhận & Xử lý khảo sát",
      items: [
        {
          name: "Hộp thư & Phiếu khảo sát",
          href: "/admin/feedbacks",
          icon: MessageSquareText,
          exact: true,
          badge: stats.pendingCount > 0 ? { label: stats.pendingCount, type: "amber" } : null,
        },
        {
          name: "Phản ánh khẩn cấp / Ưu tiên",
          href: "/admin/feedbacks?priority=urgent",
          icon: AlertTriangle,
          exact: false,
          badge: stats.urgentCount > 0 ? { label: stats.urgentCount, type: "rose" } : null,
        },
      ],
    },
    {
      title: "Hệ thống & Khoa phòng",
      items: [
        {
          name: "Danh mục Khoa / Phòng",
          href: "/admin/departments",
          icon: Building2,
          exact: false,
          badge: null,
        },
        {
          name: "Thông tin BV & Cấu hình",
          href: "/admin/settings",
          icon: Sliders,
          exact: false,
          badge: null,
        },
      ],
    },
  ];

  // Precise, reactive active detection with URL query support
  const isLinkActive = (itemHref, isExact) => {
    if (itemHref.includes("?priority=urgent")) {
      return pathname === "/admin/feedbacks" && priorityParam === "urgent";
    }
    if (itemHref === "/admin/feedbacks") {
      return pathname === "/admin/feedbacks" && priorityParam !== "urgent";
    }
    if (isExact) {
      return pathname === itemHref;
    }
    return pathname.startsWith(itemHref);
  };

  // Whether sidebar is expanded (either on mobile when open, or on desktop when hovered)
  const isExpandedDesktop = isHovered;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          role="presentation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container: Slim rail w-[70px] by default on desktop, smoothly expands to w-72 on hover */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white text-slate-800 border-r border-slate-200 shadow-xl transition-all duration-300 ease-in-out ${
          isOpen
            ? "translate-x-0 w-72"
            : "-translate-x-full lg:translate-x-0"
        } ${isExpandedDesktop ? "lg:w-72 shadow-slate-300/60" : "lg:w-[70px]"}`}
      >
        {/* Sidebar Brand Header */}
        <div className="relative flex flex-col border-b border-slate-100 p-3.5 bg-slate-50/80 overflow-hidden">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-3 focus:outline-none min-w-0"
              title="Cổng Quản trị Bệnh viện Quân y 7A"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 p-1 shadow-xs shrink-0">
                <img
                  src={HOSPITAL_INFO.logo}
                  alt="Logo BV 7A"
                  className="h-full w-auto object-contain"
                />
              </div>

              {/* Title & Unit: Fade in/out smoothly with width */}
              <div
                className={`min-w-0 transition-all duration-300 ${
                  isExpandedDesktop || isOpen
                    ? "opacity-100 max-w-[180px]"
                    : "opacity-0 max-w-0 pointer-events-none lg:hidden"
                }`}
              >
                <h1 className="text-xs font-black uppercase tracking-wider text-slate-900 leading-tight truncate">
                  BV QUÂN Y 7A
                </h1>
                <p className="text-[10px] font-semibold text-slate-500 tracking-wide mt-0.5 truncate">
                  CỤC HẬU CẦN • QUÂN KHU 7
                </p>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng bảng điều hướng"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Hospital Management Badge (Visible when expanded) */}
          {(isExpandedDesktop || isOpen) && (
            <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-900 animate-in fade-in duration-200">
              <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
              <span className="truncate">Quản trị Chất lượng Bệnh viện</span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav
          className="flex-1 overflow-y-auto px-2 py-3 space-y-4 select-none scrollbar-none"
          aria-label="Menu quản trị"
        >
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {/* Group Title: Shown when expanded, thin divider when collapsed */}
              {isExpandedDesktop || isOpen ? (
                <h2 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 truncate">
                  {group.title}
                </h2>
              ) : (
                <div className="mx-2 my-2 border-t border-slate-200" />
              )}

              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item.href, item.exact);

                  return (
                    <li key={item.name} className="relative group">
                      <Link
                        href={item.href}
                        onClick={onClose}
                        title={item.name}
                        className={`relative flex items-center rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all duration-150 ${
                          isExpandedDesktop || isOpen
                            ? "px-3 justify-between"
                            : "px-0 justify-center"
                        } ${
                          active
                            ? "bg-emerald-50 text-emerald-900 font-bold border-l-4 border-emerald-600 shadow-xs"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {/* Active vertical indicator bar in collapsed mode */}
                        {active && !isExpandedDesktop && !isOpen && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-1 bottom-1 w-1 bg-emerald-600 rounded-r"
                          />
                        )}

                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            size={18}
                            className={`shrink-0 transition-colors ${
                              active ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-700"
                            }`}
                          />
                          {/* Label visible only when expanded */}
                          <span
                            className={`truncate transition-all duration-200 ${
                              isExpandedDesktop || isOpen
                                ? "opacity-100 max-w-[170px]"
                                : "opacity-0 max-w-0 pointer-events-none hidden"
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>

                        {/* Badge */}
                        {item.badge ? (
                          isExpandedDesktop || isOpen ? (
                            <span
                              className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-black shrink-0 ${
                                item.badge.type === "rose"
                                  ? "bg-rose-500 text-white animate-pulse"
                                  : "bg-amber-400 text-slate-950"
                              }`}
                            >
                              {item.badge.label}
                            </span>
                          ) : (
                            <span
                              className={`absolute top-1 right-2 flex h-2.5 w-2.5 rounded-full ${
                                item.badge.type === "rose"
                                  ? "bg-rose-500 animate-ping"
                                  : "bg-amber-400"
                              }`}
                            />
                          )
                        ) : active && (isExpandedDesktop || isOpen) ? (
                          <ChevronRight size={14} className="text-emerald-700 shrink-0" />
                        ) : null}
                      </Link>

                      {/* Tooltip on Desktop Collapsed Hover (Supabase style) */}
                      {!isExpandedDesktop && (
                        <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden lg:group-hover:flex items-center z-50 animate-in fade-in zoom-in-95 duration-150">
                          <div className="rounded-md bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs font-semibold text-white shadow-xl whitespace-nowrap">
                            {item.name}
                            {item.badge && (
                              <span
                                className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                  item.badge.type === "rose" ? "bg-rose-500 text-white" : "bg-amber-400 text-slate-950"
                                }`}
                              >
                                {item.badge.label}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer Area with Kiosk Link & Logout */}
        <div className="border-t border-slate-200 p-2 sm:p-3 space-y-1.5 bg-slate-50/80">
          {/* Quick Switch to Patient Kiosk */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Xem màn hình Kiosk người bệnh"
            className={`flex items-center rounded-lg bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 hover:text-slate-900 transition border border-slate-200 py-2 shadow-xs ${
              isExpandedDesktop || isOpen ? "px-3 justify-between" : "px-0 justify-center"
            }`}
          >
            <div className="flex items-center gap-2">
              <Monitor size={16} className="text-slate-500 shrink-0" />
              {(isExpandedDesktop || isOpen) && <span className="truncate">Màn hình Kiosk</span>}
            </div>
            {(isExpandedDesktop || isOpen) && (
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Mở ↗
              </span>
            )}
          </Link>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            disabled={signingOut}
            title="Đăng xuất khỏi hệ thống quản trị"
            className={`flex w-full items-center rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 hover:text-rose-800 transition disabled:opacity-50 py-2 ${
              isExpandedDesktop || isOpen ? "px-3 gap-2" : "px-0 justify-center"
            }`}
          >
            <LogOut size={16} className="text-rose-600 shrink-0" />
            {(isExpandedDesktop || isOpen) && (
              <span>{signingOut ? "Đang đăng xuất..." : "Đăng xuất quản trị"}</span>
            )}
          </button>

          {/* System Version Footnote */}
          {(isExpandedDesktop || isOpen) && (
            <div className="px-2 pt-1 text-[10px] text-slate-400 font-mono text-center truncate">
              HIS Portal • BV Quân y 7A
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default function AdminSidebar(props) {
  return (
    <Suspense fallback={<aside className="fixed top-0 bottom-0 left-0 w-[70px] bg-white border-r border-slate-200 hidden lg:block" />}>
      <AdminSidebarContent {...props} />
    </Suspense>
  );
}
