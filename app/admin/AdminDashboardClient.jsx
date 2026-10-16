"use client";

import { useEffect, useMemo, useState } from "react";
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
  AlertCircle,
  CheckCircle2,
  Activity,
  Download,
  Clock,
  ShieldCheck,
  MessageSquareText,
  Info,
  SearchX,
  Building2,
  RefreshCw,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { HOSPITAL_INFO, DEPARTMENTS } from "@/lib/hospitalData";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  valueClass = "text-slate-900",
}) {
  return (
    <section className="flex min-w-0 items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className={`mt-2 text-2xl sm:text-3xl font-black tracking-tight ${valueClass}`}>
          {value}
        </p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>

      <div
        className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        aria-hidden="true"
      >
        <Icon size={26} />
      </div>
    </section>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

const DEFAULT_ADMIN_FEEDBACKS = [
  {
    id: "FB-7A-101",
    patientCode: "BN-7A-8821",
    department: "Khoa Khám Bệnh",
    departmentKey: "KhamBenh",
    scores: { c1_access: 5, c2_transparency: 5, c3_facilities: 4, c4_attitude: 5, c5_outcome: 5 },
    csatPercent: 96,
    npsScore: 10,
    npsCategory: "Promoter",
    urgentFeedback: "",
    comment: "Bác sĩ phòng khám tim mạch giải thích phác đồ rất tỉ mỉ, thái độ quân y mẫu mực, tôi rất an tâm khi khám tại 7A.",
    status: "resolved",
    timeAgo: "45 phút trước",
  },
  {
    id: "FB-7A-102",
    patientCode: "Ẩn danh",
    department: "Khoa Cấp Cứu",
    departmentKey: "CapCuu",
    scores: { c1_access: 4, c2_transparency: 4, c3_facilities: 3, c4_attitude: 4, c5_outcome: 4 },
    csatPercent: 76,
    npsScore: 8,
    npsCategory: "Passive",
    urgentFeedback: "Khu vực sảnh chờ xét nghiệm cận lâm sàng vào buổi sáng quá đông, cần thêm ghế ngồi chờ và quầy nước uống.",
    comment: "Đội ngũ y bác sĩ cấp cứu phản ứng nhanh, kịp thời.",
    status: "pending",
    timeAgo: "2 giờ trước",
  },
  {
    id: "FB-7A-103",
    patientCode: "CCCD-079093012345",
    department: "Khoa Phụ Sản An Đông",
    departmentKey: "SanAnDong",
    scores: { c1_access: 5, c2_transparency: 5, c3_facilities: 5, c4_attitude: 5, c5_outcome: 5 },
    csatPercent: 100,
    npsScore: 10,
    npsCategory: "Promoter",
    urgentFeedback: "",
    comment: "Khoa Sản An Đông dịch vụ xuất sắc, phòng sinh gia đình tiện nghi, nữ hộ sinh chăm sóc bé sơ sinh rất nhẹ nhàng.",
    status: "resolved",
    timeAgo: "5 giờ trước",
  },
  {
    id: "FB-7A-104",
    patientCode: "BN-7A-4190",
    department: "Khoa B1 - Chấn thương Chỉnh hình",
    departmentKey: "B1_CTCH",
    scores: { c1_access: 4, c2_transparency: 5, c3_facilities: 4, c4_attitude: 5, c5_outcome: 5 },
    csatPercent: 92,
    npsScore: 9,
    npsCategory: "Promoter",
    urgentFeedback: "",
    comment: "Phẫu thuật nối dây chằng khớp gối thành công tốt đẹp, bác sĩ giải thích phương pháp tập phục hồi chức năng chu đáo.",
    status: "resolved",
    timeAgo: "Hôm qua",
  },
];

export default function AdminDashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [feedbacks, setFeedbacks] = useState(DEFAULT_ADMIN_FEEDBACKS);
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [feedbackFilter, setFeedbackFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feedback");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setFeedbacks(json.data);
      }
    } catch {
      // Keep existing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchFeedbacks();
  }, []);

  // Recalculate dynamic statistics
  const stats = useMemo(() => {
    const totalCount = feedbacks.length;
    if (totalCount === 0) {
      return {
        totalSurveys: 0,
        avgCsat: 0,
        npsIndex: 0,
        pendingCount: 0,
        radarData: [
          { subject: "Tiếp cận", score: 0, fullMark: 5 },
          { subject: "Minh bạch", score: 0, fullMark: 5 },
          { subject: "Cơ sở vật chất", score: 0, fullMark: 5 },
          { subject: "Thái độ phục vụ", score: 0, fullMark: 5 },
          { subject: "Kết quả điều trị", score: 0, fullMark: 5 },
        ],
      };
    }

    const totalCsat = feedbacks.reduce((acc, f) => acc + (f.csatPercent || 0), 0);
    const avgCsat = Math.round(totalCsat / totalCount);

    const promoters = feedbacks.filter((f) => f.npsCategory === "Promoter").length;
    const detractors = feedbacks.filter((f) => f.npsCategory === "Detractor").length;
    const npsIndex = Math.round(((promoters - detractors) / totalCount) * 100);

    const pending = feedbacks.filter((f) => f.status === "pending").length;

    // Calculate Radar scores
    let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0;
    feedbacks.forEach((f) => {
      if (f.scores) {
        c1 += f.scores.c1_access || 0;
        c2 += f.scores.c2_transparency || 0;
        c3 += f.scores.c3_facilities || 0;
        c4 += f.scores.c4_attitude || 0;
        c5 += f.scores.c5_outcome || 0;
      }
    });

    const radarData = [
      { subject: "Tiếp cận", score: Number((c1 / totalCount).toFixed(1)), fullMark: 5 },
      { subject: "Minh bạch", score: Number((c2 / totalCount).toFixed(1)), fullMark: 5 },
      { subject: "Cơ sở vật chất", score: Number((c3 / totalCount).toFixed(1)), fullMark: 5 },
      { subject: "Thái độ phục vụ", score: Number((c4 / totalCount).toFixed(1)), fullMark: 5 },
      { subject: "Kết quả điều trị", score: Number((c5 / totalCount).toFixed(1)), fullMark: 5 },
    ];

    return {
      totalSurveys: totalCount,
      avgCsat,
      npsIndex,
      pendingCount: pending,
      radarData,
    };
  }, [feedbacks]);

  // Dynamic Department CSAT Bar Chart
  const departmentCsatData = useMemo(() => {
    return DEPARTMENTS.map((dept) => {
      const deptFeedbacks = feedbacks.filter(
        (f) => f.departmentKey === dept.value || f.department === dept.label
      );
      const count = deptFeedbacks.length;
      const csat =
        count > 0
          ? Math.round(deptFeedbacks.reduce((sum, f) => sum + (f.csatPercent || 0), 0) / count)
          : 90; // baseline if empty

      return {
        department: dept.code,
        fullName: dept.label,
        key: dept.value,
        csat,
        surveys: count,
      };
    }).slice(0, 8); // Top 8 for clean kiosk view
  }, [feedbacks]);

  // Filtered Feedbacks list
  const filteredFeedbacks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return feedbacks.filter((item) => {
      const matchDept =
        selectedDept === "ALL" ||
        item.departmentKey === selectedDept ||
        item.department?.includes(selectedDept);

      const matchStatus =
        feedbackFilter === "ALL" || item.status === feedbackFilter;

      const contentString = `${item.id} ${item.department} ${item.patientCode} ${item.comment || ""} ${item.urgentFeedback || ""}`.toLowerCase();
      const matchSearch = !term || contentString.includes(term);

      return matchDept && matchStatus && matchSearch;
    });
  }, [feedbacks, selectedDept, feedbackFilter, searchTerm]);

  const handleResolveFeedback = async (id) => {
    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "resolved" }),
      });
      if (res.ok) {
        setFeedbacks((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: "resolved" } : item))
        );
      }
    } catch {
      // Fallback
    }
  };

  const handleExportCSV = () => {
    const headers = ["Mã phiếu", "Thời gian", "Khoa phòng", "Mã BN", "CSAT (%)", "NPS", "Đóng góp", "Phản ánh", "Trạng thái"];
    const rows = feedbacks.map((f) => [
      f.id,
      f.createdAt || f.timeAgo,
      `"${f.department || ""}"`,
      `"${f.patientCode || ""}"`,
      f.csatPercent,
      f.npsScore,
      `"${(f.comment || "").replace(/"/g, '""')}"`,
      `"${(f.urgentFeedback || "").replace(/"/g, '""')}"`,
      f.status,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bao_cao_khao_sat_BV_Quan_y_7A_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-4 sm:py-6">
      <main className="mx-auto w-full max-w-7xl space-y-6 px-3 sm:px-6 lg:px-8 select-none">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95"
            >
              <ArrowLeft size={14} />
              Về màn hình Kiosk
            </Link>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
              <ShieldCheck size={14} />
              {HOSPITAL_INFO.name} • Quản lý chất lượng
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard Giám sát Chất lượng Kiosk
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Tổng hợp dữ liệu khảo sát trực tiếp từ các màn hình Kiosk tại các khoa phòng Bệnh viện Quân y 7A.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchFeedbacks}
            disabled={loading}
            className="flex min-h-[46px] items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-cyan-600" : ""} />
            Làm mới dữ liệu
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex min-h-[46px] items-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow transition active:scale-95"
          >
            <Download size={16} />
            Xuất file CSV / Excel
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <section aria-label="Các chỉ số tổng quan">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Tổng phiếu khảo sát"
            value={stats.totalSurveys}
            description="Lượt đánh giá từ Kiosk"
            icon={Users}
            iconClass="bg-blue-50 text-blue-700"
          />

          <StatCard
            title="CSAT Hài lòng chung"
            value={`${stats.avgCsat}%`}
            description="Tỷ lệ đạt chuẩn chất lượng"
            icon={TrendingUp}
            iconClass="bg-emerald-50 text-emerald-700"
            valueClass="text-emerald-700"
          />

          <StatCard
            title="Chỉ số NPS"
            value={`${stats.npsIndex > 0 ? "+" : ""}${stats.npsIndex}`}
            description="Mức độ sẵn sàng giới thiệu BV"
            icon={Activity}
            iconClass="bg-indigo-50 text-indigo-700"
            valueClass="text-indigo-700"
          />

          <StatCard
            title="Phản ánh cần xử lý"
            value={stats.pendingCount}
            description="Ý kiến đang chờ ban QL giải quyết"
            icon={AlertCircle}
            iconClass="bg-rose-50 text-rose-600"
            valueClass="text-rose-600"
          />
        </div>
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard
          title="Đánh giá 5 nhóm tiêu chí chất lượng"
          description="Điểm trung bình (1–5 sao) được bệnh nhân chấm tại Kiosk BV Quân y 7A"
        >
          <div className="h-72 sm:h-80 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={stats.radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#334155", fontSize: 11, fontWeight: "bold" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Radar
                    name="Điểm trung bình"
                    dataKey="score"
                    stroke="#0284c7"
                    fill="#38bdf8"
                    fillOpacity={0.4}
                  />
                  <Tooltip formatter={(val) => [`${val}/5 sao`, "Điểm thực tế"]} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Đang tải biểu đồ...
              </div>
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Tỷ lệ hài lòng (CSAT) theo Khoa phòng"
          description="So sánh chỉ số CSAT (%) giữa các chuyên khoa tại Bệnh viện Quân y 7A"
        >
          <div className="h-72 sm:h-80 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentCsatData} layout="vertical" margin={{ top: 8, right: 20, bottom: 8, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="department" width={45} tick={{ fontSize: 11, fill: "#0f172a", fontWeight: "bold" }} />
                  <Tooltip
                    formatter={(val, name, item) => [`${val}% (${item.payload.fullName})`, "CSAT"]}
                  />
                  <Bar dataKey="csat" fill="#059669" radius={[0, 8, 8, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Đang tải biểu đồ...
              </div>
            )}
          </div>
        </ChartCard>
      </section>

      {/* Feedbacks Inbox Table */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5 sm:p-6 bg-slate-50/50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                <MessageSquareText size={22} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Hộp thư tiếp nhận phản ánh & khảo sát Kiosk
                </h2>
                <p className="text-xs text-slate-500">
                  Theo dõi phản ánh tức thì và cập nhật trạng thái xử lý cho ban quản lý chất lượng.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                {stats.pendingCount} phản ánh cần xử lý
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2">
              <SearchX size={18} className="text-slate-400 shrink-0" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã phiếu, khoa, nội dung..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 outline-none"
              />
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2">
              <Building2 size={18} className="text-slate-400 shrink-0" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">Tất cả khoa phòng</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2">
              <Activity size={18} className="text-slate-400 shrink-0" />
              <select
                value={feedbackFilter}
                onChange={(e) => setFeedbackFilter(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="resolved">Đã xử lý</option>
              </select>
            </div>
          </div>
        </div>

        {/* List of Feedbacks */}
        {filteredFeedbacks.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredFeedbacks.map((item) => (
              <article key={item.id} className="p-5 transition hover:bg-slate-50/70">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-slate-900 text-white px-2.5 py-1 text-xs font-mono font-bold">
                        {item.id}
                      </span>
                      <span className="rounded-lg bg-blue-50 text-blue-900 px-2.5 py-1 text-xs font-bold border border-blue-200">
                        {item.department}
                      </span>
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-extrabold ${
                          item.status === "pending"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {item.status === "pending" ? "● Chờ giải quyết" : "✓ Đã xử lý"}
                      </span>
                      <span className="rounded-lg bg-amber-50 text-amber-900 px-2.5 py-1 text-xs font-bold">
                        CSAT: {item.csatPercent}% • NPS: {item.npsScore}/10
                      </span>
                    </div>

                    {/* Urgent Alert if present */}
                    {item.urgentFeedback && (
                      <div className="mt-2.5 flex items-start gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm font-semibold">
                        <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-black text-rose-700">Phản ánh cần ưu tiên:</span>{" "}
                          {item.urgentFeedback}
                        </div>
                      </div>
                    )}

                    {/* Compliment / Feedback */}
                    {item.comment && (
                      <p className="mt-2 text-sm text-slate-800 leading-relaxed">
                        <span className="font-bold text-slate-600">Góp ý:</span> {item.comment}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span>Người bệnh: {item.patientCode || "Ẩn danh"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {item.timeAgo || new Date(item.createdAt).toLocaleTimeString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  {item.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleResolveFeedback(item.id)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3.5 py-2 text-xs font-bold text-white shadow transition active:scale-95"
                    >
                      <CheckCircle2 size={16} />
                      Đánh dấu đã giải quyết
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <SearchX size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">Không tìm thấy phản ánh phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="pt-4 border-t border-slate-200 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Cổng Quản lý Chất lượng • Bệnh viện Quân y 7A (Cục Hậu cần Quân khu 7)</span>
        <span>Địa chỉ: {HOSPITAL_INFO.address}</span>
      </footer>
    </main>
    </div>
  );
}