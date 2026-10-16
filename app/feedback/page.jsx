"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Building2,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  LoaderCircle,
  Check,
} from "lucide-react";
import KioskStepProgress from "@/components/KioskStepProgress";
import {
  HOSPITAL_INFO,
  DEPARTMENTS,
  DEPARTMENT_GROUPS,
  CRITERIA_GROUPS,
  QUICK_TAGS_POSITIVE,
  QUICK_TAGS_IMPROVEMENT,
} from "@/lib/hospitalData";

const KIOSK_STEPS = [
  { title: "Chọn Khoa khám", subtitle: "Nơi khám & điều trị" },
  { title: "Đánh giá chất lượng", subtitle: "5 nhóm tiêu chí" },
  { title: "Ý kiến & Hoàn tất", subtitle: "NPS & Đóng góp ý kiến" },
];

const RATING_LABELS = {
  1: { label: "Rất không hài lòng", color: "text-rose-700" },
  2: { label: "Chưa hài lòng", color: "text-amber-700" },
  3: { label: "Bình thường", color: "text-blue-700" },
  4: { label: "Hài lòng", color: "text-emerald-700" },
  5: { label: "Rất hài lòng", color: "text-emerald-800 font-black" },
};

function FeedbackFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCode = searchParams.get("patientCode") || "";

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(!initialCode);
  const [formData, setFormData] = useState({
    patientCode: initialCode,
    department: DEPARTMENTS[0].value,
    scores: {
      c1_access: null,
      c2_transparency: null,
      c3_facilities: null,
      c4_attitude: null,
      c5_outcome: null,
    },
    npsScore: null,
    urgentFeedback: "",
    comment: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [autoRedirectTimer, setAutoRedirectTimer] = useState(12);

  const hasRedirectedRef = useRef(false);

  // 1. Countdown timer interval effect (chỉ đếm ngược, không gọi router.push bên trong setState)
  useEffect(() => {
    if (!submitted) return;

    setAutoRedirectTimer(12);
    hasRedirectedRef.current = false;

    const intervalId = setInterval(() => {
      setAutoRedirectTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [submitted]);

  // 2. Navigation effect riêng biệt: chỉ gọi router.push("/") khi đếm ngược kết thúc
  useEffect(() => {
    if (!submitted) return;

    if (autoRedirectTimer <= 0 && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push("/");
    }
  }, [submitted, autoRedirectTimer, router]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage("");
  };

  const handleScoreChange = (id, rating) => {
    setFormData((prev) => ({
      ...prev,
      scores: { ...prev.scores, [id]: rating },
    }));
    setErrorMessage("");
  };

  const toggleTag = (targetField, tagText) => {
    setFormData((prev) => {
      const current = prev[targetField];
      if (current.includes(tagText)) {
        const updated = current
          .replace(tagText, "")
          .replace(/,\s*,/g, ",")
          .trim();
        return { ...prev, [targetField]: updated };
      } else {
        const updated = current ? `${current}. ${tagText}` : tagText;
        return { ...prev, [targetField]: updated };
      }
    });
  };

  const validScoreCount = CRITERIA_GROUPS.filter((crit) => {
    const sc = formData.scores[crit.id];
    return Number.isInteger(sc) && sc >= 1 && sc <= 5;
  }).length;

  const handleNextFromStep1 = () => {
    if (!formData.department) {
      setErrorMessage("Vui lòng chạm chọn Khoa/Phòng điều trị trước khi tiếp tục.");
      return;
    }
    setErrorMessage("");
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleNextFromStep2 = () => {
    if (validScoreCount < 5) {
      setErrorMessage("Vui lòng chạm đánh giá từ 1 đến 5 sao cho đầy đủ cả 5 nhóm tiêu chí trước khi tiếp tục.");
      return;
    }
    setErrorMessage("");
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    if (loading) return;

    const validScores = CRITERIA_GROUPS.every((criterion) => {
      const score = formData.scores[criterion.id];
      return Number.isInteger(score) && score >= 1 && score <= 5;
    });

    if (!validScores) {
      setErrorMessage("Vui lòng chạm đánh giá từ 1 đến 5 sao cho đầy đủ cả 5 nhóm tiêu chí bên dưới.");
      setCurrentStep(2);
      return;
    }

    if (
      !Number.isInteger(formData.npsScore) ||
      formData.npsScore < 0 ||
      formData.npsScore > 10
    ) {
      setErrorMessage("Vui lòng chạm chọn mức độ sẵn sàng giới thiệu trên thang điểm từ 0 đến 10.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        ...formData,
        patientCode: isAnonymous ? null : formData.patientCode.trim() || null,
        isAnonymous,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Chưa thể gửi phiếu khảo sát. Vui lòng thử lại sau.");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi gửi khảo sát. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // 1. Success / Thank You Screen
  if (submitted) {
    const percentCountdown = (autoRedirectTimer / 12) * 100;

    return (
      <div className="relative flex-1 min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] flex flex-col bg-[#f8fafc] text-slate-800 select-none pb-36">
        <KioskStepProgress steps={KIOSK_STEPS} currentStep={3} />

        <div className="relative z-10 mx-auto w-full max-w-4xl flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-8">
          <section
            className="rounded-3xl border-2 border-slate-200 bg-white p-8 sm:p-12 text-center shadow-2xl shadow-slate-200/60"
            aria-live="polite"
          >
            <div className="mx-auto flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-100 mb-6">
              <CheckCircle2 size={68} strokeWidth={2.5} />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-sm font-black uppercase tracking-wider border border-emerald-300 mb-4">
              <ShieldCheck size={18} className="text-emerald-600" />
              Khảo sát ghi nhận thành công
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f2852] leading-tight">
              CẢM ƠN QUÝ NGƯỜI BỆNH!
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base sm:text-xl text-slate-600 leading-relaxed font-bold">
              Hệ thống Quản lý chất lượng Bệnh viện Quân y 7A đã tiếp nhận đánh giá của Quý vị.
              Những ý kiến đóng góp quý báu giúp bệnh viện liên tục nâng cao chất lượng điều trị và chăm sóc.
            </p>

            {/* Auto Redirect Countdown for Kiosk */}
            <div className="my-8 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 max-w-xl mx-auto">
              <div className="flex items-center justify-between text-sm sm:text-base font-extrabold text-[#0f2852] mb-3">
                <span>Màn hình tự động trở về trang chủ sau:</span>
                <span className="text-xl sm:text-2xl font-black text-[#0f2852] font-mono">{autoRedirectTimer} giây</span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0f2852] transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${percentCountdown}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setAutoRedirectTimer(12);
                  setCurrentStep(1);
                  setFormData({
                    patientCode: "",
                    department: DEPARTMENTS[0].value,
                    scores: {
                      c1_access: null,
                      c2_transparency: null,
                      c3_facilities: null,
                      c4_attitude: null,
                      c5_outcome: null,
                    },
                    npsScore: null,
                    urgentFeedback: "",
                    comment: "",
                  });
                  setSelectedGroup(null);
                  setIsAnonymous(true);
                  window.scrollTo({ top: 0, behavior: "instant" });
                }}
                className="flex min-h-[76px] sm:min-h-[82px] flex-1 items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-lg sm:text-xl shadow-sm active:scale-95 transition"
              >
                <RotateCcw size={22} className="text-slate-600" />
                <span>Khảo sát lượt mới</span>
              </button>

              <Link
                href="/"
                style={{ color: "#ffffff", backgroundColor: "#0f2852" }}
                className="flex min-h-[76px] sm:min-h-[82px] flex-1 items-center justify-center gap-2.5 rounded-2xl bg-[#0f2852] hover:bg-[#163a75] text-white font-black text-lg sm:text-xl shadow-xl active:scale-95 transition focus:ring-4 focus:ring-blue-300"
              >
                <Check size={24} className="text-white" />
                <span style={{ color: "#ffffff" }} className="text-white font-black">
                  Về Trang chủ ngay
                </span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // 2. Active Survey Screen (Steps 1, 2, 3)
  return (
    <div className="relative flex-1 min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] flex flex-col bg-[#f8fafc] text-slate-800 select-none pb-36">
      {/* 1. Step Progress Bar under Header */}
      <KioskStepProgress steps={KIOSK_STEPS} currentStep={currentStep} />

      {/* 2. Main Content Area with Safe Margins 40-60px */}
      <div className="relative z-10 mx-auto w-full max-w-4xl flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-6 sm:py-8">
        
        {/* STEP 1: Department Selection (Two-step flow: Group -> Department) */}
        {currentStep === 1 && (
          <div className="w-full animate-in fade-in-50 duration-200">
            {/* Step 1A: Choose Department Group */}
            {!selectedGroup ? (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wide text-[#0f2852]">
                    1. CHỌN NHÓM KHOA / CHUYÊN MÔN
                  </h1>
                  <p className="mt-2 text-base sm:text-lg text-slate-600 font-bold leading-relaxed max-w-2xl mx-auto">
                    Vui lòng chạm chọn nhóm chuyên môn Quý khách đã thăm khám hoặc điều trị:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DEPARTMENT_GROUPS.map((group) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => {
                        setSelectedGroup(group.id);
                        if (!group.deptValues.includes(formData.department)) {
                          updateField("department", group.deptValues[0]);
                        }
                        setErrorMessage("");
                      }}
                      className="flex flex-col text-left p-5 sm:p-6 rounded-2xl border-2 border-slate-300 bg-white hover:border-[#0f2852] hover:bg-slate-50 transition active:scale-[0.99] shadow-md focus:outline-none group"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-lg sm:text-xl font-black text-[#0f2852] group-hover:text-blue-900">
                          {group.name}
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 group-hover:bg-[#0f2852] group-hover:text-white transition shrink-0 ml-2">
                          <ChevronRight size={20} />
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                        {group.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Step 1B: Choose Specific Department in the Selected Group */
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Nhóm chuyên môn đang chọn:
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0f2852]">
                      {DEPARTMENT_GROUPS.find((g) => g.id === selectedGroup)?.name}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedGroup(null)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs sm:text-sm font-bold text-slate-700 shadow-xs transition self-start"
                  >
                    <ArrowLeft size={16} />
                    <span>Đổi nhóm chuyên môn</span>
                  </button>
                </div>

                <div className="text-center mb-2">
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[#0f2852]">
                    CHỌN KHOA / PHÒNG ĐIỀU TRỊ CỤ THỂ
                  </h1>
                  <p className="mt-1 text-sm sm:text-base text-slate-600 font-bold">
                    Chạm chọn khoa Quý khách đã điều trị hôm nay:
                  </p>
                </div>

                {/* Filtered Departments in Selected Group */}
                <div className="space-y-3">
                  {DEPARTMENTS.filter((dept) =>
                    DEPARTMENT_GROUPS.find((g) => g.id === selectedGroup)?.deptValues.includes(dept.value)
                  ).map((dept) => {
                    const isSelected = formData.department === dept.value;

                    return (
                      <button
                        key={dept.value}
                        type="button"
                        onClick={() => updateField("department", dept.value)}
                        className={`w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 text-left transition active:scale-[0.99] shadow-sm ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500 shadow-md"
                            : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <span
                            className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl font-mono text-sm sm:text-base font-black shrink-0 ${
                              isSelected
                                ? "bg-emerald-700 text-white"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {dept.code}
                          </span>

                          <div>
                            <span
                              className={`block text-base sm:text-lg font-black ${
                                isSelected ? "text-emerald-950" : "text-slate-900"
                              }`}
                            >
                              {dept.label}
                            </span>
                            <span className="block text-xs sm:text-sm text-slate-500 font-medium mt-0.5 line-clamp-1">
                              {dept.description}
                            </span>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs sm:text-sm font-black shrink-0">
                            <Check size={16} />
                            <span>Đã chọn</span>
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-slate-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Patient identifier note if present from auth */}
                {formData.patientCode && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-900 flex items-center justify-between">
                    <span>Mã người bệnh: <strong>{formData.patientCode}</strong></span>
                    <span className="text-[11px] text-blue-700 font-bold">Đã liên kết lượt khám</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: 5 Quality Criteria Rating with Large Touch Stars */}
        {currentStep === 2 && (
          <div className="w-full animate-in fade-in-50 duration-200">
            <div className="text-center mb-5">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wide text-[#0f2852]">
                2. ĐÁNH GIÁ 5 NHÓM TIÊU CHÍ CHẤT LƯỢNG
              </h1>
              <p className="mt-1.5 text-base sm:text-lg text-slate-600 font-bold leading-relaxed max-w-2xl mx-auto">
                Chạm chọn từ 1 đến 5 sao theo mức độ hài lòng của Quý khách cho từng tiêu chí.
              </p>
              <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs sm:text-sm font-black text-[#0f2852]">
                <span>Tiến độ đánh giá:</span>
                <span className="text-base text-blue-700">{validScoreCount}/5 tiêu chí</span>
              </div>
            </div>

            {/* Error Message if Incomplete */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-3 rounded-2xl border-2 border-rose-400 bg-rose-50 p-4 text-rose-800 font-bold text-sm sm:text-base"
              >
                <AlertCircle size={24} className="shrink-0 text-rose-600 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            {/* 5 Criteria Rows */}
            <div className="space-y-3.5">
              {CRITERIA_GROUPS.map((criterion, index) => {
                const currentScore = formData.scores[criterion.id];
                const ratingInfo = currentScore ? RATING_LABELS[currentScore] : null;

                return (
                  <fieldset
                    key={criterion.id}
                    className={`rounded-2xl border-2 p-4 sm:p-5 transition-all shadow-sm ${
                      currentScore
                        ? "border-emerald-300 bg-emerald-50/40"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <legend className="sr-only">{criterion.title}</legend>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Left: Criteria info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f2852] text-white text-xs font-black shrink-0">
                            {index + 1}
                          </span>
                          <h2 className="text-base sm:text-lg font-black text-slate-800 leading-snug">
                            {criterion.title}
                          </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 pl-9 font-medium">
                          {criterion.description}
                        </p>
                      </div>

                      {/* Right: Touch Stars (1 to 5) */}
                      <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0 pl-9 md:pl-0">
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isSelected = currentScore === star;
                            const isFilled = currentScore && star <= currentScore;

                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleScoreChange(criterion.id, star)}
                                aria-label={`${star} trên 5 sao`}
                                aria-pressed={isSelected}
                                className={`flex h-13 w-13 sm:h-15 sm:w-15 items-center justify-center rounded-2xl border-2 transition-all active:scale-90 ${
                                  isSelected
                                    ? "border-amber-400 bg-amber-400 text-slate-900 shadow-md scale-105"
                                    : isFilled
                                    ? "border-amber-400 bg-amber-100 text-amber-500"
                                    : "border-slate-200 bg-slate-50 text-slate-300 hover:border-amber-300 hover:bg-amber-50/50"
                                }`}
                              >
                                <Star
                                  size={star === 5 ? 28 : 24}
                                  className={
                                    isSelected
                                      ? "fill-slate-900 text-slate-900"
                                      : isFilled
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-300"
                                  }
                                />
                              </button>
                            );
                          })}
                        </div>

                        {/* Text badge under stars */}
                        <div className="text-xs sm:text-sm font-extrabold h-5">
                          {ratingInfo ? (
                            <span className={`inline-flex items-center gap-1 font-bold ${ratingInfo.color}`}>
                              <span>{currentScore}/5 sao:</span>
                              <span>{ratingInfo.label}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">Chạm chọn số sao (1 đến 5)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </fieldset>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: NPS & Quick Feedback Tags */}
        {currentStep === 3 && (
          <div className="w-full animate-in fade-in-50 duration-200">
            <div className="text-center mb-5">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wide text-[#0f2852]">
                3. MỨC ĐỘ SẴN SÀNG GIỚI THIỆU & GÓP Ý
              </h1>
              <p className="mt-1.5 text-base sm:text-lg text-slate-600 font-bold leading-relaxed max-w-2xl mx-auto">
                Quý khách sẵn sàng giới thiệu Bệnh viện Quân y 7A cho người thân ở mức độ nào (0 - 10)?
              </p>
            </div>

            {/* Error Message Notice */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-3 rounded-2xl border-2 border-rose-400 bg-rose-50 p-4 text-rose-800 font-bold text-sm sm:text-base"
              >
                <AlertCircle size={24} className="shrink-0 text-rose-600 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6">
              {/* NPS Scale 0 - 10 */}
              <div>
                <label className="block text-base sm:text-lg font-extrabold text-slate-700 mb-3">
                  Thang điểm giới thiệu (0: Hoàn toàn không giới thiệu → 10: Chắc chắn giới thiệu):
                </label>

                <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
                  {Array.from({ length: 11 }, (_, i) => i).map((score) => {
                    const isSelected = formData.npsScore === score;
                    let colorClass = "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100";
                    if (isSelected) {
                      if (score <= 6) {
                        colorClass = "border-rose-500 bg-rose-500 text-white shadow-md scale-105";
                      } else if (score <= 8) {
                        colorClass = "border-amber-400 bg-amber-400 text-slate-900 shadow-md scale-105";
                      } else {
                        colorClass = "border-emerald-500 bg-emerald-500 text-white shadow-md scale-105";
                      }
                    }

                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => updateField("npsScore", score)}
                        className={`flex min-h-[56px] sm:min-h-[66px] items-center justify-center rounded-2xl border-2 text-xl sm:text-2xl font-black transition-all active:scale-95 ${colorClass}`}
                      >
                        {score}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-500 px-1">
                  <span className="text-rose-600 font-extrabold">0 - 6: Chưa hài lòng</span>
                  <span className="text-amber-600 font-extrabold hidden sm:inline">7 - 8: Trung lập</span>
                  <span className="text-emerald-600 font-extrabold">9 - 10: Rất hài lòng</span>
                </div>
              </div>

              {/* Quick Feedback Tags */}
              <div className="pt-2 border-t border-slate-200 space-y-4">
                {/* Positive Tags */}
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-emerald-800 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles size={16} className="text-emerald-600" />
                    Điểm hài lòng (Chạm để chọn nhanh):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_TAGS_POSITIVE.map((tag) => {
                      const isActive = formData.comment.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag("comment", tag)}
                          className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold border-2 transition-all active:scale-95 ${
                            isActive
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                              : "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                          }`}
                        >
                          {isActive ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Improvement Tags */}
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-amber-800 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                    <AlertTriangle size={16} className="text-amber-600" />
                    Điểm cần cải thiện thêm (Chạm để chọn nhanh):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_TAGS_IMPROVEMENT.map((tag) => {
                      const isActive = formData.urgentFeedback.includes(tag) || formData.comment.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag("urgentFeedback", tag)}
                          className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold border-2 transition-all active:scale-95 ${
                            isActive
                              ? "bg-amber-500 border-amber-500 text-slate-900 shadow-sm"
                              : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                          }`}
                        >
                          {isActive ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Combined Text Box Preview / Edit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label
                      htmlFor="comment-input"
                      className="mb-1 block text-xs sm:text-sm font-bold text-slate-700"
                    >
                      Nội dung khen ngợi & đóng góp:
                    </label>
                    <textarea
                      id="comment-input"
                      rows={2}
                      value={formData.comment}
                      onChange={(e) => updateField("comment", e.target.value)}
                      placeholder="Nội dung đã chọn từ thẻ trên hoặc nhập thêm..."
                      className="w-full rounded-2xl border-2 border-slate-300 bg-slate-50 p-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#0f2852] focus:bg-white placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="urgent-feedback-input"
                      className="mb-1 block text-xs sm:text-sm font-bold text-rose-700"
                    >
                      Phản ánh cần xem xét giải quyết:
                    </label>
                    <textarea
                      id="urgent-feedback-input"
                      rows={2}
                      value={formData.urgentFeedback}
                      onChange={(e) => updateField("urgentFeedback", e.target.value)}
                      placeholder="Nội dung phản ánh cần ban quản lý giải quyết..."
                      className="w-full rounded-2xl border-2 border-rose-300 bg-rose-50/40 p-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-rose-500 focus:bg-white placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Fixed Bottom Navigation Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 px-6 sm:px-12 py-4 shadow-lg">
        <div className="mx-auto w-full max-w-5xl flex items-center justify-between gap-6 sm:gap-8">
          {/* Secondary Back Button */}
          {currentStep === 1 ? (
            selectedGroup ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedGroup(null);
                  setErrorMessage("");
                }}
                className="flex min-h-[76px] sm:min-h-[82px] min-w-[200px] sm:min-w-[240px] items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-lg sm:text-xl font-extrabold shadow-sm transition-all focus:outline-none"
              >
                <ArrowLeft size={24} className="text-slate-600" />
                <span>Đổi nhóm khoa</span>
              </button>
            ) : (
              <Link
                href="/"
                className="flex min-h-[76px] sm:min-h-[82px] min-w-[200px] sm:min-w-[240px] items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-lg sm:text-xl font-extrabold shadow-sm transition-all focus:outline-none"
              >
                <ArrowLeft size={24} className="text-slate-600" />
                <span>Trang chủ</span>
              </Link>
            )
          ) : (
            <button
              type="button"
              onClick={() => {
                setErrorMessage("");
                setCurrentStep((prev) => Math.max(1, prev - 1));
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
              className="flex min-h-[76px] sm:min-h-[82px] min-w-[200px] sm:min-w-[240px] items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-lg sm:text-xl font-extrabold shadow-sm transition-all focus:outline-none"
            >
              <ArrowLeft size={24} className="text-slate-600" />
              <span>Quay lại</span>
            </button>
          )}

          {/* Primary Action Button */}
          {currentStep === 1 && (
            <button
              type="button"
              onClick={handleNextFromStep1}
              disabled={!formData.department}
              className="flex min-h-[76px] sm:min-h-[82px] min-w-[240px] sm:min-w-[280px] items-center justify-center gap-2.5 rounded-2xl bg-[#0f2852] hover:bg-[#163a75] active:scale-95 text-white text-lg sm:text-xl font-black shadow-xl transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Tiếp tục</span>
              <ArrowRight size={24} className="text-white" />
            </button>
          )}

          {currentStep === 2 && (
            <button
              type="button"
              onClick={handleNextFromStep2}
              className="flex min-h-[76px] sm:min-h-[82px] min-w-[240px] sm:min-w-[280px] items-center justify-center gap-2.5 rounded-2xl bg-[#0f2852] hover:bg-[#163a75] active:scale-95 text-white text-lg sm:text-xl font-black shadow-xl transition-all focus:outline-none"
            >
              <span>Tiếp tục</span>
              <ArrowRight size={24} className="text-white" />
            </button>
          )}

          {currentStep === 3 && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || formData.npsScore === null}
              className="flex min-h-[76px] sm:min-h-[82px] min-w-[260px] sm:min-w-[300px] items-center justify-center gap-2.5 rounded-2xl bg-[#0f2852] hover:bg-[#163a75] active:scale-95 text-white text-lg sm:text-xl font-black shadow-xl transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <LoaderCircle size={24} className="animate-spin text-white" />
                  <span>Đang gửi phiếu...</span>
                </>
              ) : (
                <>
                  <Send size={24} className="text-white" />
                  <span>Gửi phiếu khảo sát</span>
                </>
              )}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

export default function PatientFeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-800">
          <LoaderCircle size={40} className="animate-spin text-[#0f2852]" />
          <span className="ml-3 font-bold text-xl text-[#0f2852]">Đang tải phiếu khảo sát Kiosk...</span>
        </div>
      }
    >
      <FeedbackFormContent />
    </Suspense>
  );
}
