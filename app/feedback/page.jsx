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
} from "@/lib/hospitalData";
import { FALLBACK_SURVEY_FORM } from "@/lib/surveyFallback";

const KIOSK_STEPS = [
  { title: "Chọn Khoa khám", subtitle: "Nơi khám & điều trị" },
  { title: "Đánh giá chất lượng", subtitle: "Tiêu chí chất lượng" },
  { title: "Ý kiến & Hoàn tất", subtitle: "NPS & Đóng góp ý kiến" },
];

const RATING_LABELS = {
  1: { label: "Rất không hài lòng", color: "text-rose-700" },
  2: { label: "Chưa hài lòng", color: "text-amber-700" },
  3: { label: "Bình thường", color: "text-blue-700" },
  4: { label: "Hài lòng", color: "text-emerald-700" },
  5: { label: "Rất hài lòng", color: "text-emerald-800 font-black" },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildInitialAnswers(questions) {
  const ans = {};
  for (const q of questions) {
    ans[q.id] = q.type === "multi" ? [] : null;
  }
  return ans;
}

function toggleMultiTag(current, tag) {
  return current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
}

// ─── Star Question ───────────────────────────────────────────────────────────

function StarQuestion({ question, value, onChange }) {
  const labels = question.config?.labels || {
    1: "Rất không hài lòng",
    2: "Chưa hài lòng",
    3: "Bình thường",
    4: "Hài lòng",
    5: "Rất hài lòng",
  };
  const ratingInfo = value ? { label: labels[value], color: RATING_LABELS[value]?.color } : null;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base sm:text-lg font-black text-slate-800 leading-snug">
            {question.title}
          </h2>
        </div>
        {question.description && (
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">{question.description}</p>
        )}
      </div>
      <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const isSelected = value === star;
            const isFilled = value && star <= value;
            return (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star)}
                aria-label={`${star} trên 5 sao`}
                aria-pressed={isSelected}
                className={`flex h-13 w-13 sm:h-15 sm:w-15 items-center justify-center rounded-2xl border-2 transition-all active:scale-95 ${
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
        <div className="text-xs sm:text-sm font-extrabold h-5">
          {ratingInfo ? (
            <span className={`inline-flex items-center gap-1 font-bold ${ratingInfo.color}`}>
              <span>{value}/5 sao:</span>
              <span>{ratingInfo.label}</span>
            </span>
          ) : (
            <span className="text-slate-400 text-xs">Chạm chọn số sao (1 đến 5)</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── NPS Question ────────────────────────────────────────────────────────────

function NpsQuestion({ question, value, onChange }) {
  return (
    <div className="space-y-3">
      <p className="text-base sm:text-lg font-extrabold text-slate-700">
        {question.description || "Thang điểm giới thiệu (0 → 10):"}
      </p>
      <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
        {Array.from({ length: 11 }, (_, i) => i).map((score) => {
          const isSelected = value === score;
          let colorClass = "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100";
          if (isSelected) {
            if (score <= 6) colorClass = "border-rose-500 bg-rose-500 text-white shadow-md scale-105";
            else if (score <= 8) colorClass = "border-amber-400 bg-amber-400 text-slate-900 shadow-md scale-105";
            else colorClass = "border-emerald-500 bg-emerald-500 text-white shadow-md scale-105";
          }
          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={`flex min-h-[56px] sm:min-h-[66px] items-center justify-center rounded-2xl border-2 text-xl sm:text-2xl font-black transition-all active:scale-95 ${colorClass}`}
            >
              {score}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-500 px-1">
        <span className="text-rose-600 font-extrabold">0–6: Chưa hài lòng</span>
        <span className="text-amber-600 font-extrabold hidden sm:inline">7–8: Trung lập</span>
        <span className="text-emerald-600 font-extrabold">9–10: Rất hài lòng</span>
      </div>
    </div>
  );
}

// ─── Multi Question (Quick Tags) ──────────────────────────────────────────────

function MultiQuestion({ question, value, onChange }) {
  const tags = question.config?.tags || [];
  const isUrgent = question.config?.urgent === true;

  return (
    <div className="space-y-2">
      <p className={`text-xs sm:text-sm font-extrabold mb-2 flex items-center gap-1.5 uppercase tracking-wide ${
        isUrgent ? "text-amber-800" : "text-emerald-800"
      }`}>
        {isUrgent ? (
          <AlertTriangle size={16} className="text-amber-600" />
        ) : (
          <Sparkles size={16} className="text-emerald-600" />
        )}
        {question.title}
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = Array.isArray(value) && value.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onChange(toggleMultiTag(value || [], tag))}
              className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold border-2 transition-all active:scale-95 ${
                isActive
                  ? isUrgent
                    ? "bg-amber-500 border-amber-500 text-slate-900 shadow-sm"
                    : "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                  : isUrgent
                  ? "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              {isActive ? `✓ ${tag}` : `+ ${tag}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Text Question ────────────────────────────────────────────────────────────

function TextQuestion({ question, value, onChange, isUrgent = false }) {
  return (
    <div>
      <label className={`mb-1 block text-xs sm:text-sm font-bold ${isUrgent ? "text-rose-700" : "text-slate-700"}`}>
        {question.title}
      </label>
      <textarea
        rows={2}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.description || "Nhập ý kiến của Quý vị..."}
        className={`w-full rounded-2xl border-2 bg-slate-50 p-3 text-xs sm:text-sm text-slate-800 outline-none placeholder:text-slate-400 ${
          isUrgent
            ? "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:bg-white"
            : "border-slate-300 focus:border-[#0f2852] focus:bg-white"
        }`}
      />
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

function FeedbackFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("patientCode") || "";

  const [surveyForm, setSurveyForm] = useState(null);
  const [formLoading, setFormLoading] = useState(true);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(!initialCode);
  const [patientCode, setPatientCode] = useState(initialCode);
  const [department, setDepartment] = useState(DEPARTMENTS[0].value);
  const [answers, setAnswers] = useState({});

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [autoRedirectTimer, setAutoRedirectTimer] = useState(12);
  const hasRedirectedRef = useRef(false);

  // Fetch active survey form
  useEffect(() => {
    fetch("/api/survey-forms/active")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setSurveyForm(data.data);
          setAnswers(buildInitialAnswers(data.data.questions));
        } else {
          setSurveyForm(FALLBACK_SURVEY_FORM);
          setAnswers(buildInitialAnswers(FALLBACK_SURVEY_FORM.questions));
        }
      })
      .catch(() => {
        setSurveyForm(FALLBACK_SURVEY_FORM);
        setAnswers(buildInitialAnswers(FALLBACK_SURVEY_FORM.questions));
      })
      .finally(() => setFormLoading(false));
  }, []);

  // Countdown after submit
  useEffect(() => {
    if (!submitted) return;
    setAutoRedirectTimer(12);
    hasRedirectedRef.current = false;
    const id = setInterval(() => setAutoRedirectTimer((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [submitted]);

  useEffect(() => {
    if (!submitted) return;
    if (autoRedirectTimer <= 0 && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push("/");
    }
  }, [submitted, autoRedirectTimer, router]);

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrorMessage("");
  };

  // Derive question groups by step
  const starQuestions = (surveyForm?.questions || []).filter((q) => q.type === "star");
  const npsQuestion = (surveyForm?.questions || []).find((q) => q.type === "nps");
  const step3Questions = (surveyForm?.questions || []).filter(
    (q) => q.type === "multi" || q.type === "text"
  );

  const validStarCount = starQuestions.filter((q) => {
    const v = answers[q.id];
    return Number.isInteger(v) && v >= 1 && v <= 5;
  }).length;

  const handleNextFromStep1 = () => {
    if (!department) {
      setErrorMessage("Vui lòng chạm chọn Khoa/Phòng điều trị trước khi tiếp tục.");
      return;
    }
    setErrorMessage("");
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleNextFromStep2 = () => {
    if (validStarCount < starQuestions.length) {
      setErrorMessage("Vui lòng chạm đánh giá sao cho đầy đủ tất cả tiêu chí trước khi tiếp tục.");
      return;
    }
    setErrorMessage("");
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleSubmit = async () => {
    if (loading || !surveyForm) return;

    // Validate star
    if (validStarCount < starQuestions.length) {
      setErrorMessage("Vui lòng chạm đánh giá sao cho đầy đủ tất cả tiêu chí.");
      setCurrentStep(2);
      return;
    }

    // Validate NPS
    if (npsQuestion) {
      const nps = answers[npsQuestion.id];
      if (!Number.isInteger(nps) || nps < 0 || nps > 10) {
        setErrorMessage("Vui lòng chạm chọn mức độ sẵn sàng giới thiệu (0–10).");
        return;
      }
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const selectedDeptObj = DEPARTMENTS.find((d) => d.value === department);
      const isFallback = surveyForm.id === "fallback-default";

      let payload;
      if (isFallback) {
        // Legacy path: build scores map from star answers
        const scores = {};
        for (const q of starQuestions) {
          if (q.criteria_key) scores[q.criteria_key] = answers[q.id];
        }

        // Merge tag answers into comment/urgentFeedback
        let comment = answers["tags_positive"]?.join(". ") || "";
        let urgentFeedback = answers["tags_improvement"]?.join(". ") || "";

        payload = {
          department: selectedDeptObj?.code ?? department,
          departmentCode: selectedDeptObj?.code ?? department,
          patientCode: isAnonymous ? null : patientCode.trim() || null,
          isAnonymous,
          scores,
          npsScore: npsQuestion ? answers[npsQuestion.id] : null,
          comment,
          urgentFeedback,
          timestamp: new Date().toISOString(),
        };
      } else {
        // Custom form path
        payload = {
          department: selectedDeptObj?.code ?? department,
          departmentCode: selectedDeptObj?.code ?? department,
          patientCode: isAnonymous ? null : patientCode.trim() || null,
          isAnonymous,
          surveyFormId: surveyForm.id,
          survey_form_version: surveyForm.version,
          answers,
          comment: "",
          urgentFeedback: "",
          timestamp: new Date().toISOString(),
        };
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Chưa thể gửi phiếu khảo sát.");

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Đã xảy ra lỗi khi gửi khảo sát.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setAutoRedirectTimer(12);
    setCurrentStep(1);
    setDepartment(DEPARTMENTS[0].value);
    setAnswers(buildInitialAnswers(surveyForm?.questions || FALLBACK_SURVEY_FORM.questions));
    setSelectedGroup(null);
    setIsAnonymous(true);
    setPatientCode("");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Loading survey form
  if (formLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <LoaderCircle size={40} className="animate-spin text-[#0f2852]" />
        <span className="ml-3 font-bold text-xl text-[#0f2852]">Đang tải phiếu khảo sát...</span>
      </div>
    );
  }

  // Thank You Screen
  if (submitted) {
    const percentCountdown = (autoRedirectTimer / 12) * 100;
    return (
      <div className="relative flex-1 min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] flex flex-col bg-[#f8fafc] text-slate-800 select-none pb-36">
        <KioskStepProgress steps={KIOSK_STEPS} currentStep={3} />
        <div className="relative z-10 mx-auto w-full max-w-4xl flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-8">
          <section className="rounded-3xl border-2 border-slate-200 bg-white p-8 sm:p-12 text-center shadow-2xl shadow-slate-200/60" aria-live="polite">
            <div className="mx-auto flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-100 mb-6">
              <CheckCircle2 size={68} strokeWidth={2.5} />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-sm font-black uppercase tracking-wider border border-emerald-300 mb-4">
              <ShieldCheck size={18} className="text-emerald-600" />
              Khảo sát ghi nhận thành công
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f2852] leading-tight">
              {surveyForm?.thank_you ? surveyForm.thank_you : "CẢM ƠN QUÝ NGƯỜI BỆNH!"}
            </h1>
            {!surveyForm?.thank_you && (
              <p className="mx-auto mt-4 max-w-2xl text-base sm:text-xl text-slate-600 leading-relaxed font-bold">
                Hệ thống Quản lý chất lượng Bệnh viện Quân y 7A đã tiếp nhận đánh giá của Quý vị.
              </p>
            )}
            <div className="my-8 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 max-w-xl mx-auto">
              <div className="flex items-center justify-between text-sm sm:text-base font-extrabold text-[#0f2852] mb-3">
                <span>Màn hình tự động trở về trang chủ sau:</span>
                <span className="text-xl sm:text-2xl font-black text-[#0f2852] font-mono">{autoRedirectTimer} giây</span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#0f2852] transition-all duration-1000 ease-linear rounded-full" style={{ width: `${percentCountdown}%` }} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <button type="button" onClick={resetForm}
                className="flex min-h-[76px] sm:min-h-[82px] flex-1 items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-lg sm:text-xl shadow-sm active:scale-95 transition">
                <RotateCcw size={22} className="text-slate-600" />
                <span>Khảo sát lượt mới</span>
              </button>
              <Link href="/" style={{ color: "#ffffff", backgroundColor: "#0f2852" }}
                className="flex min-h-[76px] sm:min-h-[82px] flex-1 items-center justify-center gap-2.5 rounded-2xl bg-[#0f2852] hover:bg-[#163a75] text-white font-black text-lg sm:text-xl shadow-xl active:scale-95 transition focus:ring-4 focus:ring-blue-300">
                <Check size={24} className="text-white" />
                <span style={{ color: "#ffffff" }} className="text-white font-black">Về Trang chủ ngay</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Active Survey
  return (
    <div className="relative flex-1 min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] flex flex-col bg-[#f8fafc] text-slate-800 select-none pb-36">
      <KioskStepProgress steps={KIOSK_STEPS} currentStep={currentStep} />

      <div className="relative z-10 mx-auto w-full max-w-4xl flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-6 sm:py-8">

        {/* STEP 1: Department Selection */}
        {currentStep === 1 && (
          <div key="step-1" className="w-full animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
            {!selectedGroup ? (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wide text-[#0f2852]">
                    1. CHỌN NHÓM KHOA / CHUYÊN MÔN
                  </h1>
                  {surveyForm?.greeting && (
                    <p className="mt-3 text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto italic">
                      {surveyForm.greeting}
                    </p>
                  )}
                  <p className="mt-2 text-base sm:text-lg text-slate-600 font-bold leading-relaxed max-w-2xl mx-auto">
                    Vui lòng chạm chọn nhóm chuyên môn Quý khách đã thăm khám hoặc điều trị:
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DEPARTMENT_GROUPS.map((group) => (
                    <button key={group.id} type="button"
                      onClick={() => {
                        setSelectedGroup(group.id);
                        if (!group.deptValues.includes(department)) {
                          setDepartment(group.deptValues[0]);
                        }
                        setErrorMessage("");
                      }}
                      className="flex flex-col text-left p-5 sm:p-6 rounded-2xl border-2 border-slate-300 bg-white hover:border-[#0f2852] hover:bg-slate-50 transition active:scale-[0.99] shadow-md focus:outline-none group">
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-lg sm:text-xl font-black text-[#0f2852] group-hover:text-blue-900">{group.name}</span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 group-hover:bg-[#0f2852] group-hover:text-white transition shrink-0 ml-2">
                          <ChevronRight size={20} />
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">{group.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Nhóm chuyên môn đang chọn:</span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0f2852]">
                      {DEPARTMENT_GROUPS.find((g) => g.id === selectedGroup)?.name}
                    </h2>
                  </div>
                  <button type="button" onClick={() => setSelectedGroup(null)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs sm:text-sm font-bold text-slate-700 shadow-xs transition self-start">
                    <ArrowLeft size={16} />
                    <span>Đổi nhóm chuyên môn</span>
                  </button>
                </div>
                <div className="text-center mb-2">
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[#0f2852]">CHỌN KHOA / PHÒNG ĐIỀU TRỊ CỤ THỂ</h1>
                </div>
                <div className="space-y-3">
                  {DEPARTMENTS.filter((dept) =>
                    DEPARTMENT_GROUPS.find((g) => g.id === selectedGroup)?.deptValues.includes(dept.value)
                  ).map((dept) => {
                    const isSelected = department === dept.value;
                    return (
                      <button key={dept.value} type="button" onClick={() => setDepartment(dept.value)}
                        className={`w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 text-left transition active:scale-[0.99] shadow-sm ${
                          isSelected ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500 shadow-md" : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
                        }`}>
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <span className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl font-mono text-sm sm:text-base font-black shrink-0 ${
                            isSelected ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}>{dept.code}</span>
                          <div>
                            <span className={`block text-base sm:text-lg font-black ${isSelected ? "text-emerald-950" : "text-slate-900"}`}>{dept.label}</span>
                            <span className="block text-xs sm:text-sm text-slate-500 font-medium mt-0.5 line-clamp-1">{dept.description}</span>
                          </div>
                        </div>
                        {isSelected ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs sm:text-sm font-black shrink-0">
                            <Check size={16} /><span>Đã chọn</span>
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-slate-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {patientCode && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-900 flex items-center justify-between">
                    <span>Mã người bệnh: <strong>{patientCode}</strong></span>
                    <span className="text-[11px] text-blue-700 font-bold">Đã liên kết lượt khám</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Star Questions */}
        {currentStep === 2 && (
          <div key="step-2" className="w-full animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
            <div className="text-center mb-5">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wide text-[#0f2852]">
                2. ĐÁNH GIÁ TIÊU CHÍ CHẤT LƯỢNG
              </h1>
              <p className="mt-1.5 text-base sm:text-lg text-slate-600 font-bold leading-relaxed max-w-2xl mx-auto">
                Chạm chọn từ 1 đến 5 sao theo mức độ hài lòng của Quý khách.
              </p>
              <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs sm:text-sm font-black text-[#0f2852]">
                <span>Tiến độ đánh giá:</span>
                <span className="text-base text-blue-700">{validStarCount}/{starQuestions.length} tiêu chí</span>
              </div>
            </div>

            {errorMessage && (
              <div role="alert" className="mb-4 flex items-start gap-3 rounded-2xl border-2 border-rose-400 bg-rose-50 p-4 text-rose-800 font-bold text-sm sm:text-base">
                <AlertCircle size={24} className="shrink-0 text-rose-600 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            <div className="space-y-3.5">
              {starQuestions.map((q, index) => (
                <fieldset key={q.id}
                  className={`rounded-2xl border-2 p-4 sm:p-5 transition-all shadow-sm ${
                    answers[q.id] ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-white"
                  }`}>
                  <legend className="sr-only">{q.title}</legend>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f2852] text-white text-xs font-black shrink-0">{index + 1}</span>
                  </div>
                  <StarQuestion question={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
                </fieldset>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: NPS + Multi/Text questions */}
        {currentStep === 3 && (
          <div key="step-3" className="w-full animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
            <div className="text-center mb-5">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wide text-[#0f2852]">
                3. MỨC ĐỘ SẴN SÀNG GIỚI THIỆU & GÓP Ý
              </h1>
            </div>

            {errorMessage && (
              <div role="alert" className="mb-4 flex items-start gap-3 rounded-2xl border-2 border-rose-400 bg-rose-50 p-4 text-rose-800 font-bold text-sm sm:text-base">
                <AlertCircle size={24} className="shrink-0 text-rose-600 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6">
              {npsQuestion && (
                <NpsQuestion
                  question={npsQuestion}
                  value={answers[npsQuestion.id]}
                  onChange={(v) => setAnswer(npsQuestion.id, v)}
                />
              )}

              {step3Questions.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-4">
                  {step3Questions.map((q) => (
                    q.type === "multi" ? (
                      <MultiQuestion key={q.id} question={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
                    ) : (
                      <TextQuestion key={q.id} question={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)}
                        isUrgent={q.config?.urgent === true} />
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 px-6 sm:px-12 py-4 shadow-lg">
        <div className="mx-auto w-full max-w-5xl flex items-center justify-between gap-6 sm:gap-8">
          {currentStep === 1 ? (
            selectedGroup ? (
              <button type="button" onClick={() => { setSelectedGroup(null); setErrorMessage(""); }}
                className="flex min-h-[76px] sm:min-h-[82px] min-w-[200px] sm:min-w-[240px] items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-lg sm:text-xl font-extrabold shadow-sm transition-all focus:outline-none">
                <ArrowLeft size={24} className="text-slate-600" />
                <span>Đổi nhóm khoa</span>
              </button>
            ) : (
              <Link href="/"
                className="flex min-h-[76px] sm:min-h-[82px] min-w-[200px] sm:min-w-[240px] items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-lg sm:text-xl font-extrabold shadow-sm transition-all focus:outline-none">
                <ArrowLeft size={24} className="text-slate-600" />
                <span>Trang chủ</span>
              </Link>
            )
          ) : (
            <button type="button"
              onClick={() => { setErrorMessage(""); setCurrentStep((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "instant" }); }}
              className="flex min-h-[76px] sm:min-h-[82px] min-w-[200px] sm:min-w-[240px] items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-lg sm:text-xl font-extrabold shadow-sm transition-all focus:outline-none">
              <ArrowLeft size={24} className="text-slate-600" />
              <span>Quay lại</span>
            </button>
          )}

          {currentStep === 1 && (
            <button type="button" onClick={handleNextFromStep1} disabled={!department}
              className="flex min-h-[76px] sm:min-h-[82px] min-w-[240px] sm:min-w-[280px] items-center justify-center gap-2.5 rounded-2xl bg-[#0f2852] hover:bg-[#163a75] active:scale-95 text-white text-lg sm:text-xl font-black shadow-xl transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed">
              <span>Tiếp tục</span>
              <ArrowRight size={24} className="text-white" />
            </button>
          )}

          {currentStep === 2 && (
            <button type="button" onClick={handleNextFromStep2}
              className="flex min-h-[76px] sm:min-h-[82px] min-w-[240px] sm:min-w-[280px] items-center justify-center gap-2.5 rounded-2xl bg-[#0f2852] hover:bg-[#163a75] active:scale-95 text-white text-lg sm:text-xl font-black shadow-xl transition-all focus:outline-none">
              <span>Tiếp tục</span>
              <ArrowRight size={24} className="text-white" />
            </button>
          )}

          {currentStep === 3 && (
            <button type="button" onClick={handleSubmit}
              disabled={loading || (npsQuestion && answers[npsQuestion.id] === null)}
              className="flex min-h-[76px] sm:min-h-[82px] min-w-[260px] sm:min-w-[300px] items-center justify-center gap-2.5 rounded-2xl bg-[#0f2852] hover:bg-[#163a75] active:scale-95 text-white text-lg sm:text-xl font-black shadow-xl transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? (
                <><LoaderCircle size={24} className="animate-spin text-white" /><span>Đang gửi phiếu...</span></>
              ) : (
                <><Send size={24} className="text-white" /><span>Gửi phiếu khảo sát</span></>
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
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-800">
        <LoaderCircle size={40} className="animate-spin text-[#0f2852]" />
        <span className="ml-3 font-bold text-xl text-[#0f2852]">Đang tải phiếu khảo sát Kiosk...</span>
      </div>
    }>
      <FeedbackFormContent />
    </Suspense>
  );
}
