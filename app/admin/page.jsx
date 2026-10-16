"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Users,
  TrendingUp,
  Activity,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Award,
  AlertTriangle,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useAdmin } from "./context/AdminContext";
import AdminFeedbackModal from "./components/AdminFeedbackModal";

export default function AdminDashboardPage() {
  const { feedbacks, stats, loading } = useAdmin();
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Top urgent feedbacks for quick action (chỉ hiển thị phản ánh khẩn cấp CẦN XỬ LÝ)
  const urgentFeedbacks = useMemo(() => {
    return feedbacks
      .filter((f) => f.status === "pending" && f.urgentFeedback && f.urgentFeedback.trim())
      .slice(0, 4);
  }, [feedbacks]);

  // Top departments sorted by CSAT
  const sortedDepartments = useMemo(() => {
    return [...stats.departmentStats]
      .filter((d) => d.count > 0)
      .sort((a, b) => b.csat - a.csat);
  }, [stats.departmentStats]);

  return (
    <div className="space-y-6">
      {/* 1. KPI Cards Row */}
      <section aria-label="Các chỉ số KPI chất lượng">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {/* Card 1: Total Surveys */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Tổng phiếu khảo sát
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                {loading ? "..." : stats.totalSurveys}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Ghi nhận trực tiếp từ Kiosk
              </p>
            </div>
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
              <Users size={26} />
            </div>
          </div>

          {/* Card 2: CSAT */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                CSAT Hài lòng chung
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-emerald-700">
                {loading ? "..." : `${stats.avgCsat}%`}
              </p>
              <p className="mt-1 text-xs text-emerald-800 font-semibold">
                Đạt chuẩn bệnh viện Hạng I
              </p>
            </div>
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <TrendingUp size={26} />
            </div>
          </div>

          {/* Card 3: NPS */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Chỉ số NPS giới thiệu
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-indigo-700">
                {loading ? "..." : `${stats.npsIndex > 0 ? "+" : ""}${stats.npsIndex}`}
              </p>
              <p className="mt-1 text-xs text-indigo-700 font-semibold">
                Độ tín nhiệm cao từ người bệnh
              </p>
            </div>
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
              <Activity size={26} />
            </div>
          </div>

          {/* Card 4: Pending Feedback */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Ý kiến cần xử lý
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-rose-600">
                {loading ? "..." : stats.pendingCount}
              </p>
              <p className="mt-1 text-xs text-rose-700 font-semibold">
                {stats.urgentCount > 0 ? `${stats.urgentCount} phản ánh cần ưu tiên` : "Cần giải quyết theo quy trình"}
              </p>
            </div>
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertCircle size={26} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Charts Section (2 Columns) */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Radar Chart: 5 Criteria */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Đánh giá 5 nhóm tiêu chí chất lượng y tế
              </h2>
              <span className="text-xs font-bold text-slate-400">Thang điểm 1 - 5 sao</span>
            </div>
            <p className="text-xs text-slate-500">
              Điểm trung bình được người bệnh chấm tại các điểm Kiosk BV Quân y 7A
            </p>
          </div>

          <div className="h-72 sm:h-80 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={stats.radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#334155", fontSize: 11, fontWeight: "bold" }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: "#64748b", fontSize: 10 }} />
                <Radar
                  name="Điểm thực tế"
                  dataKey="score"
                  stroke="#059669"
                  fill="#10b981"
                  fillOpacity={0.35}
                />
                <Tooltip formatter={(val) => [`${val} / 5.0 sao`, "Điểm chất lượng"]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-slate-100 text-center">
            {stats.radarData.map((item, idx) => (
              <div key={idx} className="p-1">
                <span className="text-[10px] text-slate-400 font-semibold block truncate">
                  {item.subject}
                </span>
                <span className="text-sm font-black text-emerald-900">
                  {item.score}★
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: CSAT by Department */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Tỷ lệ hài lòng (CSAT) theo Khoa / Phòng
              </h2>
              <Link
                href="/admin/departments"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                Xem tất cả <ChevronRight size={13} />
              </Link>
            </div>
            <p className="text-xs text-slate-500">
              So sánh chỉ số CSAT (%) giữa các chuyên khoa có lượt đánh giá
            </p>
          </div>

          <div className="h-72 sm:h-80 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.departmentStats.filter((d) => d.count > 0).slice(0, 7)}
                layout="vertical"
                margin={{ top: 8, right: 24, bottom: 8, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="code"
                  width={42}
                  tick={{ fontSize: 11, fill: "#0f172a", fontWeight: "bold" }}
                />
                <Tooltip
                  formatter={(val, name, item) => [`${val}% (${item.payload.label})`, "CSAT"]}
                />
                <Bar dataKey="csat" fill="#047857" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Dữ liệu tính trên lượt đánh giá Kiosk</span>
            <span className="font-bold text-emerald-700">Mục tiêu toàn viện: ≥ 85%</span>
          </div>
        </div>
      </section>

      {/* 3. Urgent Feedbacks & Summary Widgets Row */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Urgent Action Feedbacks Widget (Takes 2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Phản ánh cần ưu tiên xử lý
                </h3>
                <p className="text-xs text-slate-500">
                  Ý kiến bức xúc hoặc góp ý quan trọng từ người bệnh
                </p>
              </div>
            </div>

            <Link
              href="/admin/feedbacks"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              Hộp thư chi tiết ({feedbacks.length}) <ArrowRight size={13} />
            </Link>
          </div>

          {urgentFeedbacks.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {urgentFeedbacks.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 transition hover:bg-slate-50/70 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {item.id}
                      </span>
                      <span className="text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {item.department}
                      </span>
                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                          item.status === "resolved"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {item.status === "resolved" ? "Đã xử lý" : "Chờ giải quyết"}
                      </span>
                    </div>

                    <p className="mt-2 text-xs sm:text-sm font-bold text-rose-900 bg-rose-50/60 p-2.5 rounded-xl border border-rose-200/60">
                      &ldquo;{item.urgentFeedback}&rdquo;
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Người bệnh: {item.patientCode || "Ẩn danh"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {item.timeAgo || (item.createdAt ? new Date(item.createdAt).toLocaleTimeString("vi-VN") : "")}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedFeedback(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition active:scale-95 shrink-0 self-start sm:self-center"
                  >
                    <Eye size={13} />
                    <span>Xem &amp; Xử lý</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-slate-700">Không có phản ánh khẩn cấp tồn đọng</p>
              <p className="text-xs text-slate-400 mt-0.5">Tất cả ý kiến bức xúc đã được giải quyết</p>
            </div>
          )}
        </div>

        {/* Quality Rankings & NPS Breakdown Widget */}
        <div className="space-y-6">
          {/* Top Departments */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-3">
              <Award size={16} className="text-amber-500" />
              Khoa / Phòng đánh giá cao nhất
            </h3>

            <div className="space-y-2.5">
              {sortedDepartments.slice(0, 3).map((dept, idx) => (
                <div
                  key={dept.code}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-800 text-white font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 truncate">
                      {dept.label}
                    </span>
                  </div>
                  <span className="font-black text-emerald-700 shrink-0 text-sm">
                    {dept.csat}% CSAT
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* NPS Breakdown */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
              Cơ cấu độ sẵn sàng giới thiệu (NPS)
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-700">Người ủng hộ (Promoters 9-10)</span>
                  <span className="text-slate-900">{stats.promoterCount} phiếu</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{
                      width: `${stats.totalSurveys > 0 ? (stats.promoterCount / stats.totalSurveys) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-amber-600">Trung lập (Passives 7-8)</span>
                  <span className="text-slate-900">{stats.passiveCount} phiếu</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{
                      width: `${stats.totalSurveys > 0 ? (stats.passiveCount / stats.totalSurveys) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-rose-600">Chưa hài lòng (Detractors 0-6)</span>
                  <span className="text-slate-900">{stats.detractorCount} phiếu</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${stats.totalSurveys > 0 ? (stats.detractorCount / stats.totalSurveys) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Feedback Modal */}
      {selectedFeedback && (
        <AdminFeedbackModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
        />
      )}
    </div>
  );
}