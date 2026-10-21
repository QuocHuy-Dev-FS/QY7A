"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { DEPARTMENTS } from "@/lib/hospitalData";

const AdminContext = createContext(null);

export const DEFAULT_ADMIN_FEEDBACKS = [
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
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    timeAgo: "Hôm qua",
  },
];

export function AdminProvider({ children }) {
  const [feedbacks, setFeedbacks] = useState(DEFAULT_ADMIN_FEEDBACKS);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const toastHideTimerRef = useRef(null);
  const toastClearTimerRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    if (toastHideTimerRef.current) clearTimeout(toastHideTimerRef.current);
    if (toastClearTimerRef.current) clearTimeout(toastClearTimerRef.current);

    setToast({ message, type, isHiding: false });

    toastHideTimerRef.current = setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, isHiding: true } : null));
    }, 3600);
    toastClearTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Fetch admin session details (current user email)
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.user) {
          setUser(json.user);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Fetch feedbacks list from Supabase via API
  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setFeedbacks(json.data);
        }
      }
    } catch {
      // Keep existing data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
    fetchFeedbacks();
  }, [fetchSession, fetchFeedbacks]);

  // Recalculate dynamic statistics
  const stats = useMemo(() => {
    const totalCount = feedbacks.length;
    if (totalCount === 0) {
      return {
        totalSurveys: 0,
        avgCsat: 0,
        npsIndex: 0,
        pendingCount: 0,
        urgentCount: 0,
        promoterCount: 0,
        passiveCount: 0,
        detractorCount: 0,
        radarData: [
          { subject: "Tiếp cận", score: 0, fullMark: 5 },
          { subject: "Minh bạch", score: 0, fullMark: 5 },
          { subject: "Cơ sở vật chất", score: 0, fullMark: 5 },
          { subject: "Thái độ phục vụ", score: 0, fullMark: 5 },
          { subject: "Kết quả điều trị", score: 0, fullMark: 5 },
        ],
        departmentStats: [],
      };
    }

    const totalCsat = feedbacks.reduce((acc, f) => acc + (f.csatPercent || 0), 0);
    const avgCsat = Math.round(totalCsat / totalCount);

    const promoters = feedbacks.filter((f) => f.npsCategory === "Promoter").length;
    const passives = feedbacks.filter((f) => f.npsCategory === "Passive").length;
    const detractors = feedbacks.filter((f) => f.npsCategory === "Detractor").length;
    const npsIndex = Math.round(((promoters - detractors) / totalCount) * 100);

    const pending = feedbacks.filter((f) => f.status === "pending").length;
    // Chỉ tính phản ánh khẩn cấp CẦN XỬ LÝ (pending) vào chỉ số cảnh báo & badge
    const urgent = feedbacks.filter(
      (f) => f.status === "pending" && Boolean(f.urgentFeedback && f.urgentFeedback.trim())
    ).length;

    // Radar chỉ tính phiếu có đủ c1..c5 (bộ mặc định hoặc bộ có ánh xạ tiêu chí)
    const criteriaFeedbacks = feedbacks.filter(
      (f) => f.scores && f.scores.c1_access != null && f.scores.c5_outcome != null
    );
    const criteriaCount = criteriaFeedbacks.length || 1;
    let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0;
    criteriaFeedbacks.forEach((f) => {
      c1 += f.scores.c1_access || 0;
      c2 += f.scores.c2_transparency || 0;
      c3 += f.scores.c3_facilities || 0;
      c4 += f.scores.c4_attitude || 0;
      c5 += f.scores.c5_outcome || 0;
    });

    const radarData = [
      { subject: "Tiếp cận & Chờ", score: Number((c1 / criteriaCount).toFixed(1)), fullMark: 5 },
      { subject: "Minh bạch & Viện phí", score: Number((c2 / criteriaCount).toFixed(1)), fullMark: 5 },
      { subject: "Cơ sở vật chất", score: Number((c3 / criteriaCount).toFixed(1)), fullMark: 5 },
      { subject: "Thái độ quân y", score: Number((c4 / criteriaCount).toFixed(1)), fullMark: 5 },
      { subject: "Hiệu quả điều trị", score: Number((c5 / criteriaCount).toFixed(1)), fullMark: 5 },
    ];

    // Department Stats
    const departmentStats = DEPARTMENTS.map((dept) => {
      const deptFeedbacks = feedbacks.filter(
        (f) =>
          f.departmentKey === dept.value ||
          f.departmentCode === dept.code ||
          f.department === dept.label ||
          (typeof f.department === "string" && f.department.includes(dept.code))
      );
      const count = deptFeedbacks.length;
      const csat =
        count > 0
          ? Math.round(deptFeedbacks.reduce((sum, f) => sum + (f.csatPercent || 0), 0) / count)
          : 0;
      const deptPending = deptFeedbacks.filter((f) => f.status === "pending").length;
      const deptUrgent = deptFeedbacks.filter(
        (f) => f.status === "pending" && Boolean(f.urgentFeedback && f.urgentFeedback.trim())
      ).length;

      return {
        code: dept.code,
        label: dept.label,
        value: dept.value,
        description: dept.description,
        count,
        csat,
        pendingCount: deptPending,
        urgentCount: deptUrgent,
      };
    });

    return {
      totalSurveys: totalCount,
      avgCsat,
      npsIndex,
      pendingCount: pending,
      urgentCount: urgent,
      promoterCount: promoters,
      passiveCount: passives,
      detractorCount: detractors,
      radarData,
      departmentStats,
    };
  }, [feedbacks]);

  // Update feedback status via PATCH /api/feedback
  const updateFeedbackStatus = useCallback(async (id, newStatus, note = "") => {
    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id, status: newStatus, note }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setFeedbacks((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: newStatus,
                  adminNote: note || item.adminNote || "",
                  resolvedAt: newStatus === "resolved" ? new Date().toISOString() : null,
                }
              : item
          )
        );
        showToast(data?.message || "Đã cập nhật trạng thái phản hồi thành công.", "success");
        return { success: true };
      } else {
        // If it's a mock ID (e.g. FB-7A-102) or offline demo, update locally for seamless demonstration
        if (id && id.startsWith("FB-7A-")) {
          setFeedbacks((prev) =>
            prev.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: newStatus,
                    adminNote: note || item.adminNote || "",
                    resolvedAt: newStatus === "resolved" ? new Date().toISOString() : null,
                  }
                : item
            )
          );
          showToast(`Đã cập nhật trạng thái: ${newStatus === "resolved" ? "Đã xử lý" : "Chờ giải quyết"} (Demo).`, "success");
          return { success: true };
        }
        showToast(data?.message || "Không thể cập nhật trạng thái. Vui lòng thử lại.", "error");
        return { success: false, message: data?.message };
      }
    } catch {
      // Local fallback for demo mock IDs only
      if (id && id.startsWith("FB-7A-")) {
        setFeedbacks((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: newStatus,
                  adminNote: note || item.adminNote || "",
                  resolvedAt: newStatus === "resolved" ? new Date().toISOString() : null,
                }
              : item
          )
        );
        showToast(`Đã cập nhật trạng thái: ${newStatus === "resolved" ? "Đã xử lý" : "Chờ giải quyết"} (Demo).`, "success");
        return { success: true };
      }
      showToast("Lỗi kết nối khi cập nhật phản hồi.", "error");
      return { success: false };
    }
  }, [showToast]);

  // Export CSV with UTF-8 BOM
  const exportCSV = useCallback(() => {
    const headers = [
      "Mã phiếu",
      "Thời gian",
      "Khoa phòng",
      "Mã BN",
      "CSAT (%)",
      "NPS",
      "Phân loại NPS",
      "Đóng góp",
      "Phản ánh ưu tiên",
      "Trạng thái",
      "Bộ khảo sát ID",
      "Phiên bản",
    ];

    const rows = feedbacks.map((f) => [
      f.id,
      f.createdAt || f.timeAgo || "",
      `"${(f.department || "").replace(/"/g, '""')}"`,
      `"${(f.patientCode || "Ẩn danh").replace(/"/g, '""')}"`,
      f.csatPercent ?? "",
      f.npsScore ?? "",
      f.npsCategory || "",
      `"${(f.comment || "").replace(/"/g, '""')}"`,
      `"${(f.urgentFeedback || "").replace(/"/g, '""')}"`,
      f.status === "resolved" ? "Đã xử lý" : "Chờ giải quyết",
      f.surveyFormId || "legacy",
      f.surveyFormVersion || "",
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
    showToast("Đã xuất tệp dữ liệu CSV báo cáo thành công.", "success");
  }, [feedbacks, showToast]);

  const value = {
    feedbacks,
    loading,
    user,
    stats,
    toast,
    showToast,
    refreshFeedbacks: fetchFeedbacks,
    updateFeedbackStatus,
    exportCSV,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin phải được sử dụng bên trong AdminProvider");
  }
  return context;
}
