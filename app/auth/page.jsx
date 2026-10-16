"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Fingerprint,
  IdCard,
  LoaderCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import TouchNumpad from "@/components/TouchNumpad";
import KioskStepProgress from "@/components/KioskStepProgress";

const KIOSK_STEPS = [
  { title: "Thông tin người bệnh", subtitle: "Mã BN / CCCD" },
  { title: "Đánh giá chất lượng", subtitle: "5 nhóm tiêu chí" },
  { title: "Ý kiến & Hoàn tất", subtitle: "Góp ý & gửi phiếu" },
];

const IDENTIFIER_TYPES = {
  patient: {
    label: "Mã bệnh nhân BV Quân y 7A",
    placeholder: "Ví dụ: BN-7A-8821 hoặc 8821",
    description: "Nhập mã số trên phiếu khám bệnh hoặc hóa đơn viện phí.",
    sample: "BN-7A-8821",
  },
  cccd: {
    label: "Số Căn cước công dân (CCCD)",
    placeholder: "Nhập 12 chữ số CCCD",
    description: "Sử dụng số CCCD gồm 12 chữ số của người bệnh.",
    sample: "079093012345",
  },
};

export default function AuthPage() {
  const router = useRouter();
  const [identifierType, setIdentifierType] = useState("patient");
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = IDENTIFIER_TYPES[identifierType];

  function handleTypeChange(type) {
    setIdentifierType(type);
    setIdentifier("");
    setMessage("");
  }

  function handleIdentifierChange(value) {
    const normalized =
      identifierType === "cccd"
        ? value.replace(/\D/g, "").slice(0, 12)
        : value.slice(0, 30);

    setIdentifier(normalized);
    setMessage("");
  }

  function handleClear() {
    setIdentifier("");
    setMessage("");
  }

  function handleSubmit(event) {
    if (event) event.preventDefault();
    setMessage("");

    const normalized = identifier.trim();

    if (!normalized) {
      setMessageType("error");
      setMessage("Vui lòng nhập mã bệnh nhân hoặc số CCCD vào ô bên dưới.");
      return;
    }

    if (identifierType === "cccd" && !/^\d{12}$/.test(normalized)) {
      setMessageType("error");
      setMessage("Số CCCD phải gồm chính xác 12 chữ số.");
      return;
    }

    if (identifierType === "patient" && normalized.length < 3) {
      setMessageType("error");
      setMessage("Mã bệnh nhân cần tối thiểu 3 ký tự (ví dụ: BN-7A-8821 hoặc 8821).");
      return;
    }

    setIsSubmitting(true);
    setMessageType("success");
    setMessage("Xác thực thông tin thành công! Đang chuyển đến phiếu khảo sát...");

    setTimeout(() => {
      router.push(
        `/feedback?patientCode=${encodeURIComponent(normalized)}&type=${identifierType}`
      );
    }, 700);
  }

  return (
    <div className="relative flex-1 min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] flex flex-col bg-[#f8fafc] text-slate-800 select-none pb-36">
      {/* 1. Step Progress Bar under Header */}
      <KioskStepProgress steps={KIOSK_STEPS} currentStep={1} />

      {/* 2. Main Content Area with Safe Margin 40-60px */}
      <div className="relative z-10 mx-auto w-full max-w-4xl flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-6 sm:py-8">
        {/* Title and Instruction */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wide text-[#0f2852]">
            XÁC THỰC THÔNG TIN NGƯỜI BỆNH
          </h1>
          <p className="mt-2 text-base sm:text-lg text-slate-600 font-bold leading-relaxed max-w-2xl mx-auto">
            Vui lòng chọn loại định danh và nhập thông tin qua bàn phím cảm ứng bên dưới.
          </p>
        </div>

        {/* Center Task Card */}
        <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/60">
          {/* Type Selector (Patient ID vs CCCD) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
            <button
              type="button"
              onClick={() => handleTypeChange("patient")}
              aria-pressed={identifierType === "patient"}
              className={`flex min-h-[72px] sm:min-h-[80px] items-center justify-center gap-3 rounded-2xl border-2 p-3 text-center transition active:scale-[0.99] focus:outline-none ${
                identifierType === "patient"
                  ? "border-[#0f2852] bg-[#0f2852] text-white shadow-lg"
                  : "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100"
              }`}
            >
              <IdCard size={26} className={identifierType === "patient" ? "text-white" : "text-[#0f2852]"} />
              <div className="text-left">
                <span className="block font-black text-base sm:text-lg">
                  Mã bệnh nhân
                </span>
                <span className={`block text-xs ${identifierType === "patient" ? "text-blue-100" : "text-slate-500"}`}>
                  Phiếu khám / Viện phí
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange("cccd")}
              aria-pressed={identifierType === "cccd"}
              className={`flex min-h-[72px] sm:min-h-[80px] items-center justify-center gap-3 rounded-2xl border-2 p-3 text-center transition active:scale-[0.99] focus:outline-none ${
                identifierType === "cccd"
                  ? "border-[#0f2852] bg-[#0f2852] text-white shadow-lg"
                  : "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100"
              }`}
            >
              <Fingerprint size={26} className={identifierType === "cccd" ? "text-white" : "text-[#0f2852]"} />
              <div className="text-left">
                <span className="block font-black text-base sm:text-lg">
                  Số CCCD
                </span>
                <span className={`block text-xs ${identifierType === "cccd" ? "text-blue-100" : "text-slate-500"}`}>
                  12 chữ số căn cước
                </span>
              </div>
            </button>
          </div>

          {/* Input Display Area */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="kiosk-identifier-input"
                className="block text-sm sm:text-base font-extrabold text-slate-700 mb-2"
              >
                {config.label}:
              </label>
              <div className="relative">
                <input
                  id="kiosk-identifier-input"
                  name="kioskIdentifier"
                  type="text"
                  readOnly
                  value={identifier}
                  placeholder={config.placeholder}
                  className="min-h-[72px] sm:min-h-[80px] w-full rounded-2xl border-2 border-slate-300 bg-slate-50 px-5 pr-14 text-2xl sm:text-3xl font-black tracking-wider text-[#0f2852] outline-none transition placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#0f2852] focus:bg-white"
                />

                {identifier && (
                  <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Xóa nội dung"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-300 transition"
                  >
                    <X size={22} />
                  </button>
                )}
              </div>
            </div>

            {/* Error or Success Notice */}
            {message && (
              <div
                role="alert"
                aria-live="assertive"
                className={`flex items-start gap-3 rounded-2xl p-4 text-sm sm:text-base font-bold ${
                  messageType === "success"
                    ? "bg-emerald-50 border-2 border-emerald-500 text-emerald-800"
                    : "bg-rose-50 border-2 border-rose-500 text-rose-800"
                }`}
              >
                {messageType === "success" ? (
                  <CheckCircle2 size={24} className="shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <ShieldCheck size={24} className="shrink-0 text-rose-600 mt-0.5" />
                )}
                <div className="leading-relaxed">{message}</div>
              </div>
            )}

            {/* Touch Numpad for Kiosk */}
            <div className="pt-1">
              <TouchNumpad
                value={identifier}
                onChange={handleIdentifierChange}
                maxLength={identifierType === "cccd" ? 12 : 25}
                allowLetters={identifierType === "patient"}
                sampleCode={config.sample}
                sampleLabel={identifierType === "patient" ? "Mã mẫu" : "CCCD mẫu"}
              />
            </div>
          </form>

          {/* Quick Anonymous Option */}
          <div className="mt-5 pt-4 border-t border-slate-200 text-center">
            <Link
              href="/feedback"
              className="inline-flex items-center gap-2 text-sm sm:text-base font-extrabold text-[#0f2852] hover:text-blue-800 transition py-2 px-4 rounded-xl hover:bg-slate-100"
            >
              <span>Quý khách muốn khảo sát nhanh không cần nhập mã?</span>
              <span className="underline decoration-2 font-black">Khảo sát trực tiếp (Ẩn danh) →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Fixed Bottom Navigation Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 px-6 sm:px-12 py-4 shadow-lg">
        <div className="mx-auto w-full max-w-5xl flex items-center justify-between gap-6 sm:gap-8">
          {/* Secondary Back Button */}
          <Link
            href="/"
            className="flex min-h-[76px] sm:min-h-[82px] min-w-[200px] sm:min-w-[240px] items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-lg sm:text-xl font-extrabold shadow-sm transition-all focus:outline-none"
          >
            <ArrowLeft size={24} className="text-slate-600" />
            <span>Quay lại</span>
          </Link>

          {/* Primary Confirm / Continue Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !identifier.trim()}
            className="flex min-h-[76px] sm:min-h-[82px] min-w-[240px] sm:min-w-[280px] items-center justify-center gap-2.5 rounded-2xl bg-[#0f2852] hover:bg-[#163a75] active:scale-95 text-white text-lg sm:text-xl font-black shadow-xl transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle size={24} className="animate-spin text-white" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <span>Tiếp tục</span>
                <ArrowRight size={24} className="text-white" />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
