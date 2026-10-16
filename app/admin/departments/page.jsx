"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";

export default function DepartmentsPage() {
  const { stats } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDepartments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return stats.departmentStats;

    return stats.departmentStats.filter(
      (dept) =>
        dept.code.toLowerCase().includes(term) ||
        dept.label.toLowerCase().includes(term) ||
        dept.description.toLowerCase().includes(term)
    );
  }, [stats.departmentStats, searchTerm]);

  return (
    <div className="space-y-5">
      {/* 1. Header & Search Card */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Danh mục Khoa / Phòng chức năng
            </h2>
            <span className="rounded-full bg-emerald-100 text-emerald-950 border border-emerald-200 px-2.5 py-0.5 text-xs font-black">
              13 Khoa / Phòng
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi phân bổ khảo sát và chỉ số hài lòng theo từng đơn vị trực thuộc Bệnh viện Quân y 7A
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã hoặc tên khoa..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50/60 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-emerald-700 focus:bg-white"
          />
        </div>
      </section>

      {/* 2. Structured Table Card */}
      <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-4 font-bold uppercase text-[11px] text-slate-700 w-20 text-center">
                  Mã khoa
                </th>
                <th className="py-3 px-4 font-bold uppercase text-[11px] text-slate-700 min-w-[200px]">
                  Tên Khoa / Phòng chức năng
                </th>
                <th className="py-3 px-4 font-bold uppercase text-[11px] text-slate-700 min-w-[280px]">
                  Nhiệm vụ &amp; Chuyên môn
                </th>
                <th className="py-3 px-4 font-bold uppercase text-[11px] text-slate-700 text-center w-28">
                  Lượt khảo sát
                </th>
                <th className="py-3 px-4 font-bold uppercase text-[11px] text-slate-700 text-center w-28">
                  CSAT Hài lòng
                </th>
                <th className="py-3 px-4 font-bold uppercase text-[11px] text-slate-700 text-center w-28">
                  Chờ giải quyết
                </th>
                <th className="py-3 px-4 font-bold uppercase text-[11px] text-slate-700 text-right w-28">
                  Hộp thư
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dept) => (
                  <tr key={dept.code} className="hover:bg-slate-50/80 transition-colors">
                    {/* Mã khoa */}
                    <td className="py-3.5 px-4 text-center font-mono font-black text-emerald-900">
                      <span className="inline-block rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold">
                        {dept.code}
                      </span>
                    </td>

                    {/* Tên Khoa */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {dept.label}
                    </td>

                    {/* Nhiệm vụ */}
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {dept.description}
                    </td>

                    {/* Lượt khảo sát */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {dept.count}
                    </td>

                    {/* CSAT */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block font-black px-2.5 py-0.5 rounded-full text-xs ${
                          dept.csat >= 90
                            ? "bg-emerald-100 text-emerald-800"
                            : dept.csat >= 80
                            ? "bg-blue-100 text-blue-800"
                            : dept.csat > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {dept.count > 0 ? `${dept.csat}%` : "Chưa có"}
                      </span>
                    </td>

                    {/* Chờ giải quyết */}
                    <td className="py-3.5 px-4 text-center">
                      {dept.pendingCount > 0 ? (
                        <span className="inline-flex items-center gap-1 font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-xs">
                          <AlertCircle size={12} />
                          {dept.pendingCount}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-semibold">0</span>
                      )}
                    </td>

                    {/* Action link */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/feedbacks?dept=${dept.value}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition"
                      >
                        <span>Xem phiếu</span>
                        <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Không tìm thấy khoa phòng phù hợp với từ khóa &ldquo;{searchTerm}&rdquo;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
