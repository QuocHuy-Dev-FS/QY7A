"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  Copy,
  Archive,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";

const STATUS_LABELS = {
  active: { label: "Đang áp dụng", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  draft: { label: "Bản nháp", color: "bg-slate-100 text-slate-700 border-slate-300" },
  archived: { label: "Đã lưu trữ", color: "bg-amber-100 text-amber-800 border-amber-300" },
};

const STATUS_ICONS = {
  active: CheckCircle2,
  draft: Clock,
  archived: Archive,
};

export default function SurveysPage() {
  const { showToast } = useAdmin();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadForms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/survey-forms", { credentials: "include" });
      const data = await res.json();
      if (data.success) setForms(data.data || []);
      else showToast(data.message || "Không thể tải danh sách bộ khảo sát.", "error");
    } catch {
      showToast("Lỗi kết nối khi tải bộ khảo sát.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadForms(); }, [loadForms]);

  const handleClone = async (id) => {
    setActionLoading(id + "-clone");
    try {
      const res = await fetch(`/api/admin/survey-forms/${id}/clone`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Đã nhân bản bộ khảo sát.");
        await loadForms();
      } else {
        showToast(data.message || "Không thể nhân bản.", "error");
      }
    } catch {
      showToast("Lỗi khi nhân bản bộ khảo sát.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(id + "-" + newStatus);
    try {
      const res = await fetch(`/api/admin/survey-forms/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        const label = newStatus === "active" ? "Đã áp dụng bộ khảo sát." : "Đã lưu trữ bộ khảo sát.";
        showToast(label);
        await loadForms();
      } else {
        showToast(data.message || "Không thể thay đổi trạng thái.", "error");
      }
    } catch {
      showToast("Lỗi khi thay đổi trạng thái.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f2852] flex items-center gap-2.5">
            <ClipboardList size={26} className="text-[#0f2852]" />
            Quản lý Bộ khảo sát
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Tạo, chỉnh sửa và áp dụng bộ câu hỏi cho Kiosk khảo sát chất lượng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadForms}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>Làm mới</span>
          </button>
          <Link
            href="/admin/surveys/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f2852] hover:bg-[#163a75] text-white text-sm font-black transition shadow-md"
          >
            <Plus size={16} />
            <span>Tạo bộ mới</span>
          </Link>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-500">
          <RefreshCw size={22} className="animate-spin mr-2" />
          <span className="font-bold">Đang tải...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && forms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
          <FileText size={48} className="mb-3" />
          <p className="font-bold text-slate-600">Chưa có bộ khảo sát nào.</p>
          <p className="text-sm mt-1">Nhấn &ldquo;Tạo bộ mới&rdquo; để bắt đầu.</p>
        </div>
      )}

      {/* Survey forms list */}
      {!loading && forms.length > 0 && (
        <div className="space-y-3">
          {forms.map((form) => {
            const StatusIcon = STATUS_ICONS[form.status] || FileText;
            const statusStyle = STATUS_LABELS[form.status] || STATUS_LABELS.draft;
            const isActioning = actionLoading?.startsWith(form.id);

            return (
              <div
                key={form.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border-2 bg-white shadow-sm transition ${
                  form.status === "active"
                    ? "border-emerald-300 ring-1 ring-emerald-200"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl border shrink-0 ${statusStyle.color}`}>
                    <StatusIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-black text-slate-900 text-base truncate">{form.title}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusStyle.color}`}>
                        {statusStyle.label}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">v{form.version}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 font-medium">
                      <span>Phạm vi: <strong className="text-slate-700">{form.scope}</strong></span>
                      <span>Cập nhật: <strong className="text-slate-700">{new Date(form.updated_at).toLocaleDateString("vi-VN")}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Edit */}
                  <Link
                    href={`/admin/surveys/${form.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
                  >
                    Chỉnh sửa
                  </Link>

                  {/* Clone */}
                  <button
                    type="button"
                    disabled={isActioning}
                    onClick={() => handleClone(form.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition disabled:opacity-50"
                  >
                    <Copy size={13} />
                    <span>Nhân bản</span>
                  </button>

                  {/* Apply (draft → active) */}
                  {form.status === "draft" && (
                    <button
                      type="button"
                      disabled={isActioning}
                      onClick={() => handleStatusChange(form.id, "active")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} />
                      <span>Áp dụng</span>
                    </button>
                  )}

                  {/* Archive (active/draft → archived) */}
                  {form.status !== "archived" && (
                    <button
                      type="button"
                      disabled={isActioning}
                      onClick={() => handleStatusChange(form.id, "archived")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-800 transition disabled:opacity-50"
                    >
                      <Archive size={13} />
                      <span>Lưu trữ</span>
                    </button>
                  )}

                  {/* Restore from archived → draft */}
                  {form.status === "archived" && (
                    <button
                      type="button"
                      disabled={isActioning}
                      onClick={() => handleStatusChange(form.id, "draft")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition disabled:opacity-50"
                    >
                      <RefreshCw size={13} />
                      <span>Khôi phục nháp</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3 text-sm text-amber-800 font-medium">
        <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
        <p>
          Khi áp dụng bộ mới, bộ đang áp dụng sẽ tự động được lưu trữ.
          Kiosk sẽ dùng bộ mới ngay lập tức (không cần deploy lại).
          Phiếu cũ vẫn hiển thị đúng theo bộ tương ứng lúc gửi.
        </p>
      </div>
    </div>
  );
}
