"use client";

import { useState } from "react";
import {
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Building2,
  Star,
  ShieldCheck,
  Send,
  LoaderCircle,
  FileText,
} from "lucide-react";
import { CRITERIA_GROUPS } from "@/lib/hospitalData";
import { useAdmin } from "../context/AdminContext";

export default function AdminFeedbackModal({ feedback, onClose }) {
  const { updateFeedbackStatus } = useAdmin();

  const [status, setStatus] = useState(feedback?.status || "pending");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);

  if (!feedback) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 150);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateFeedbackStatus(feedback.id, status, note);
    setSaving(false);
    if (res?.success) {
      handleClose();
    }
  };

  const scores = feedback.scores || {
    c1_access: feedback.c1_access,
    c2_transparency: feedback.c2_transparency,
    c3_facilities: feedback.c3_facilities,
    c4_attitude: feedback.c4_attitude,
    c5_outcome: feedback.c5_outcome,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs ${
        closing ? "animate-out fade-out duration-150" : "animate-in fade-in duration-150"
      }`}
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 text-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-emerald-900">
                  {feedback.id}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${
                    feedback.status === "resolved"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-rose-100 text-rose-800 border border-rose-300"
                  }`}
                >
                  {feedback.status === "resolved" ? "Đã xử lý" : "Chờ giải quyết"}
                </span>
              </div>
              <h2 id="feedback-modal-title" className="text-base font-bold text-slate-900 mt-0.5">
                Chi tiết Phiếu Khảo sát Người bệnh
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng cửa sổ"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-300 transition active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-800">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                <Building2 size={15} className="text-blue-700" />
                Khoa / Phòng
              </div>
              <p className="mt-1 text-sm font-black text-slate-900 truncate">
                {feedback.department || "Khoa Khám Bệnh"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                <User size={15} className="text-emerald-700" />
                Người bệnh
              </div>
              <p className="mt-1 text-sm font-black text-slate-900 truncate">
                {feedback.patientCode || (feedback.isAnonymous ? "Khảo sát ẩn danh" : "Ẩn danh")}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                <Clock size={15} className="text-amber-700" />
                Thời gian ghi nhận
              </div>
              <p className="mt-1 text-xs font-extrabold text-slate-800">
                {feedback.timeAgo ||
                  (feedback.createdAt
                    ? new Date(feedback.createdAt).toLocaleString("vi-VN")
                    : "Hôm nay")}
              </p>
            </div>
          </div>

          {/* Urgent Feedback Warning if present */}
          {feedback.urgentFeedback && (
            <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/80 p-4 text-rose-900">
              <div className="flex items-center gap-2 font-black text-rose-800 text-sm mb-1">
                <AlertCircle size={18} className="text-rose-600" />
                PHẢN ÁNH CẦN ƯU TIÊN XỬ LÝ (KHẨN CẤP):
              </div>
              <p className="text-sm font-bold text-rose-950 leading-relaxed pl-6">
                &ldquo;{feedback.urgentFeedback}&rdquo;
              </p>
            </div>
          )}

          {/* General Comment if present */}
          {feedback.comment && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-extrabold uppercase text-slate-500">
                Nội dung khen ngợi & đóng góp:
              </span>
              <p className="mt-1 text-sm text-slate-800 font-medium leading-relaxed">
                &ldquo;{feedback.comment}&rdquo;
              </p>
            </div>
          )}

          {/* Score Overview: CSAT & NPS */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Chỉ số hài lòng (CSAT)
              </span>
              <p className="text-2xl font-black text-blue-950 mt-0.5">
                {feedback.csatPercent || 90}%
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Điểm sẵn sàng giới thiệu (NPS)
              </span>
              <p className="text-2xl font-black text-[#0f2852] mt-0.5">
                {feedback.npsScore ?? 10}/10
                <span className="text-xs font-bold text-slate-500 ml-1.5">
                  ({feedback.npsCategory || "Promoter"})
                </span>
              </p>
            </div>
          </div>

          {/* 5 Quality Criteria Breakdown */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5">
              Điểm đánh giá chi tiết 5 nhóm tiêu chí chất lượng
            </h3>
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
              {CRITERIA_GROUPS.map((criterion) => {
                const score = scores?.[criterion.id] ?? 5;
                return (
                  <div
                    key={criterion.id}
                    className="flex items-center justify-between p-3 sm:px-4 text-xs sm:text-sm"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-extrabold text-slate-900 block truncate">
                        {criterion.title}
                      </span>
                      <span className="text-[11px] text-slate-500 hidden sm:block truncate">
                        {criterion.subtitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={
                            star <= score
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }
                        />
                      ))}
                      <span className="ml-1.5 font-black text-slate-900 w-7 text-right">
                        {score}/5
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Update Form */}
          <form onSubmit={handleSave} className="pt-2 border-t border-slate-200 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-700" />
              Cập nhật tiến độ xử lý phản ánh
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trạng thái xử lý:
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-emerald-700"
                >
                  <option value="pending">Chờ giải quyết (Pending)</option>
                  <option value="resolved">Đã xử lý thỏa đáng (Resolved)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú hành động khắc phục:
                </label>
                <input
                  type="text"
                  maxLength={2000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Đã kiểm tra và bổ sung ghế ngồi..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Đóng
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow transition active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <LoaderCircle size={15} className="animate-spin text-white" />
                ) : (
                  <Send size={15} />
                )}
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
