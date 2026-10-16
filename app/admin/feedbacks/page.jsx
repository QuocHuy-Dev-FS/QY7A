"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquareText,
  Filter,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { DEPARTMENTS } from "@/lib/hospitalData";
import AdminFeedbackModal from "../components/AdminFeedbackModal";

function FeedbacksTableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const priorityParam = searchParams.get("priority");
  const initialDept = searchParams.get("dept");

  const { feedbacks, stats, loading, refreshFeedbacks, exportCSV } = useAdmin();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState(initialDept || "ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [onlyUrgent, setOnlyUrgent] = useState(priorityParam === "urgent");
  const [selectedNps, setSelectedNps] = useState("ALL");

  // Sync state reactively when query params change (e.g. from Sidebar or Browser Back/Forward)
  useEffect(() => {
    const isUrgent = priorityParam === "urgent";
    setOnlyUrgent(isUrgent);
    if (initialDept) {
      setSelectedDept(initialDept);
    }
    setCurrentPage(1);
  }, [priorityParam, initialDept]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected feedback for modal
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Filter logic
  const filteredFeedbacks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return feedbacks.filter((item) => {
      const content =
        `${item.id} ${item.department} ${item.patientCode || ""} ${item.comment || ""} ${item.urgentFeedback || ""}`.toLowerCase();

      const matchSearch = !term || content.includes(term);

      const matchDept =
        selectedDept === "ALL" ||
        item.departmentKey === selectedDept ||
        item.departmentCode === selectedDept ||
        item.department === selectedDept ||
        (typeof item.department === "string" &&
          item.department.includes(selectedDept));

      const matchStatus =
        selectedStatus === "ALL" || item.status === selectedStatus;

      const matchUrgent =
        !onlyUrgent ||
        Boolean(
          item.urgentFeedback &&
            item.urgentFeedback.trim()
        );

      const matchNps =
        selectedNps === "ALL" ||
        item.npsCategory === selectedNps;

      return (
        matchSearch &&
        matchDept &&
        matchStatus &&
        matchUrgent &&
        matchNps
      );
    });
  }, [
    feedbacks,
    searchTerm,
    selectedDept,
    selectedStatus,
    onlyUrgent,
    selectedNps,
  ]);

  // Pagination calculation
  const totalItems = filteredFeedbacks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedFeedbacks = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredFeedbacks.slice(start, start + pageSize);
  }, [filteredFeedbacks, safeCurrentPage, pageSize]);

  const toggleUrgent = () => {
    const nextUrgent = !onlyUrgent;
    setOnlyUrgent(nextUrgent);
    setCurrentPage(1);
    if (nextUrgent) {
      router.replace("/admin/feedbacks?priority=urgent");
    } else {
      router.replace("/admin/feedbacks");
    }
  };

  const handleTabAll = () => {
    setOnlyUrgent(false);
    setCurrentPage(1);
    router.replace("/admin/feedbacks");
  };

  const handleTabUrgent = () => {
    setOnlyUrgent(true);
    setCurrentPage(1);
    router.replace("/admin/feedbacks?priority=urgent");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDept("ALL");
    setSelectedStatus("ALL");
    setOnlyUrgent(false);
    setSelectedNps("ALL");
    setCurrentPage(1);
    router.replace("/admin/feedbacks");
  };

  const isFiltered =
    Boolean(searchTerm) ||
    selectedDept !== "ALL" ||
    selectedStatus !== "ALL" ||
    onlyUrgent ||
    selectedNps !== "ALL";

  return (
    <div className="space-y-5">
      {/* 1. View Mode Segmented Tabs (Tất cả vs Phản ánh khẩn cấp) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleTabAll}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              !onlyUrgent
                ? "bg-emerald-800 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <MessageSquareText size={16} />
            <span>Tất cả phiếu khảo sát</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                !onlyUrgent
                  ? "bg-emerald-900/60 text-emerald-100"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {feedbacks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={handleTabUrgent}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              onlyUrgent
                ? "bg-rose-600 text-white shadow-sm shadow-rose-900/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <AlertTriangle size={16} className={onlyUrgent ? "text-white" : "text-rose-500"} />
            <span>Phản ánh khẩn cấp / Ưu tiên</span>
            {stats.urgentCount > 0 ? (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  onlyUrgent
                    ? "bg-rose-900/60 text-white animate-pulse"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {stats.urgentCount}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">
                0
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={refreshFeedbacks}
            disabled={loading}
            title="Làm mới dữ liệu"
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-emerald-600" : "text-slate-500"}
            />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button
            type="button"
            onClick={exportCSV}
            title="Xuất bảng tính CSV"
            className="flex h-9 items-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-3.5 text-xs font-bold text-white shadow-xs transition active:scale-95"
          >
            <Download size={14} className="text-emerald-200" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Toolbar */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-black tracking-tight text-slate-900">
              <span>{onlyUrgent ? "Danh sách Phản ánh Khẩn cấp Cần Xử lý" : "Hộp thư Quản lý Phiếu Khảo sát"}</span>
              <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-xs font-black text-emerald-950">
                {totalItems} kết quả
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {onlyUrgent
                ? "Các góp ý, bức xúc quan trọng từ người bệnh tại Kiosk cần ưu tiên xác minh và khắc phục"
                : "Theo dõi và cập nhật tiến độ giải quyết ý kiến đóng góp của người bệnh"}
            </p>
          </div>
        </div>

        {/* Filters Controls */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative sm:col-span-2 lg:col-span-1.5">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm mã phiếu, mã BN, nội dung..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50/60 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-emerald-700 focus:bg-white sm:text-sm"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:bg-white sm:text-sm"
            >
              <option value="ALL">Tất cả Khoa / Phòng</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.code} - {dept.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:bg-white sm:text-sm"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="pending">Chờ giải quyết (Pending)</option>
              <option value="resolved">Đã xử lý (Resolved)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedNps}
              onChange={(e) => {
                setSelectedNps(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:bg-white sm:text-sm"
            >
              <option value="ALL">Tất cả nhóm NPS</option>
              <option value="Promoter">Ủng hộ (Promoter 9-10)</option>
              <option value="Passive">Trung lập (Passive 7-8)</option>
              <option value="Detractor">Chưa hài lòng (Detractor 0-6)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleUrgent}
              className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition ${
                onlyUrgent
                  ? "border-rose-300 bg-rose-50 text-rose-800 ring-2 ring-rose-200"
                  : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <AlertTriangle
                size={14}
                className={onlyUrgent ? "text-rose-600" : "text-slate-400"}
              />
              <span>Chỉ phản ánh ưu tiên</span>
            </button>

            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                title="Xóa bộ lọc"
                aria-label="Xóa bộ lọc"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Feedback Data Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead className="select-none bg-slate-100 text-slate-700 border-b border-slate-200">
              <tr>
                <th scope="col" className="w-28 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Mã phiếu
                </th>
                <th scope="col" className="w-36 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Thời gian
                </th>
                <th scope="col" className="min-w-[160px] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Khoa / Phòng
                </th>
                <th scope="col" className="w-36 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Người bệnh
                </th>
                <th scope="col" className="w-28 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  CSAT / NPS
                </th>
                <th scope="col" className="min-w-[240px] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Ý kiến &amp; Phản ánh
                </th>
                <th scope="col" className="w-32 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Trạng thái
                </th>
                <th scope="col" className="w-24 px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {paginatedFeedbacks.length > 0 ? (
                paginatedFeedbacks.map((item) => {
                  const isUrgent = Boolean(
                    item.urgentFeedback && item.urgentFeedback.trim()
                  );

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-slate-50/80 ${
                        isUrgent ? "bg-rose-50/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-black text-slate-900">
                        {item.id}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                        <span className="block font-bold text-slate-700">
                          {item.timeAgo ||
                            (item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                              : "Hôm nay")}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleTimeString("vi-VN")
                            : ""}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="line-clamp-1 font-bold text-slate-900">
                          {item.department || "Khoa Khám Bệnh"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs">
                        <span
                          className={`font-semibold ${
                            item.patientCode && item.patientCode !== "Ẩn danh"
                              ? "font-mono font-bold text-[#0f2852]"
                              : "italic text-slate-400"
                          }`}
                        >
                          {item.patientCode ||
                            (item.isAnonymous ? "Ẩn danh" : "Không có")}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-block rounded bg-emerald-50 px-2 py-0.5 text-xs font-black text-emerald-700">
                          {item.csatPercent ?? 90}%
                        </span>
                        <span className="mt-0.5 block text-[11px] font-bold text-slate-500">
                          NPS: {item.npsScore ?? 10}/10
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {isUrgent ? (
                          <div className="flex items-start gap-1.5 rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-xs font-bold text-rose-900">
                            <AlertTriangle
                              size={14}
                              className="mt-0.5 shrink-0 text-rose-600"
                            />
                            <span className="line-clamp-2">
                              {item.urgentFeedback}
                            </span>
                          </div>
                        ) : item.comment ? (
                          <p className="line-clamp-2 text-xs text-slate-700">
                            {item.comment}
                          </p>
                        ) : (
                          <span className="text-xs italic text-slate-400">
                            Đánh giá sao, không để lại lời nhắn
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black ${
                            item.status === "resolved"
                              ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                              : "border-rose-200 bg-rose-100 text-rose-800"
                          }`}
                        >
                          {item.status === "resolved" ? (
                            <>
                              <CheckCircle2
                                size={12}
                                className="text-emerald-700"
                              />
                              Đã xử lý
                            </>
                          ) : (
                            <>
                              <Clock size={12} className="text-rose-700" />
                              Chờ giải quyết
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedFeedback(item)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200/70 px-2.5 py-1.5 text-xs font-bold text-emerald-950 transition hover:bg-emerald-100 active:scale-95"
                        >
                          <Eye size={13} className="text-emerald-700" />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-bold text-slate-600">
                      Không tìm thấy phiếu khảo sát nào
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Thử điều chỉnh từ khóa tìm kiếm hoặc các tiêu chí bộ lọc bên trên
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 text-xs sm:flex-row">
          <div className="flex items-center gap-2 text-slate-600">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 font-bold text-slate-700 outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>dòng / trang</span>
            <span className="hidden text-slate-400 sm:inline">•</span>
            <span className="hidden sm:inline">
              Hiển thị{" "}
              <strong className="font-bold text-slate-900">
                {totalItems === 0
                  ? 0
                  : (safeCurrentPage - 1) * pageSize + 1}{" "}
                - {Math.min(safeCurrentPage * pageSize, totalItems)}
              </strong>{" "}
              trên tổng số{" "}
              <strong className="font-bold text-slate-900">
                {totalItems}
              </strong>{" "}
              phiếu
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              disabled={safeCurrentPage <= 1}
              className="flex h-8 items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              <span>Trước</span>
            </button>

            <span className="px-3 py-1 font-bold text-slate-800">
              Trang {safeCurrentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={safeCurrentPage >= totalPages}
              className="flex h-8 items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <span>Sau</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {selectedFeedback && (
        <AdminFeedbackModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
        />
      )}
    </div>
  );
}

export default function FeedbacksPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500">
          Đang tải hộp thư khảo sát...
        </div>
      }
    >
      <FeedbacksTableContent />
    </Suspense>
  );
}
