"use client";

import { Delete, RotateCcw, Sparkles } from "lucide-react";

export default function TouchNumpad({
  value,
  onChange,
  maxLength = 12,
  allowLetters = false,
  sampleCode = "",
  sampleLabel = "Mã mẫu",
}) {
  const handleDigit = (digit) => {
    if (value.length < maxLength) {
      onChange(value + digit);
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange("");
  };

  const handleSampleFill = () => {
    if (sampleCode) {
      onChange(sampleCode);
    }
  };

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ];

  return (
    <div className="w-full select-none rounded-3xl bg-slate-100/90 border-2 border-slate-200 p-3 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs sm:text-sm uppercase font-extrabold tracking-wider text-slate-500">
          Bàn phím số cảm ứng Kiosk
        </span>
        {sampleCode && (
          <button
            type="button"
            onClick={handleSampleFill}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0f2852] text-xs sm:text-sm font-bold border border-blue-200 transition active:scale-95"
          >
            <Sparkles size={15} className="text-[#0f2852]" />
            <span>{sampleLabel}: <strong className="font-mono">{sampleCode}</strong></span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        {keys.map((row) =>
          row.map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="flex h-16 sm:h-20 items-center justify-center rounded-2xl bg-white border-2 border-slate-200 text-3xl sm:text-4xl font-black text-[#0f2852] shadow-sm transition hover:border-[#0f2852] hover:bg-blue-50/50 active:scale-95 active:bg-blue-100 focus:outline-none"
            >
              {digit}
            </button>
          ))
        )}

        {/* Row 4: Clear, 0, Backspace */}
        <button
          type="button"
          onClick={handleClear}
          aria-label="Xóa toàn bộ"
          className="flex h-16 sm:h-20 items-center justify-center gap-1.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-700 font-extrabold text-base sm:text-lg shadow-sm transition hover:bg-rose-100 active:scale-95 focus:outline-none"
        >
          <RotateCcw size={20} />
          <span>Xóa</span>
        </button>

        <button
          type="button"
          onClick={() => handleDigit("0")}
          className="flex h-16 sm:h-20 items-center justify-center rounded-2xl bg-white border-2 border-slate-200 text-3xl sm:text-4xl font-black text-[#0f2852] shadow-sm transition hover:border-[#0f2852] hover:bg-blue-50/50 active:scale-95 active:bg-blue-100 focus:outline-none"
        >
          0
        </button>

        <button
          type="button"
          onClick={handleBackspace}
          aria-label="Xóa 1 ký tự"
          className="flex h-16 sm:h-20 items-center justify-center gap-1.5 rounded-2xl bg-slate-200 border-2 border-slate-300 text-slate-800 font-extrabold text-base sm:text-lg shadow-sm transition hover:bg-slate-300 active:scale-95 focus:outline-none"
        >
          <Delete size={22} />
          <span>Lùi</span>
        </button>
      </div>

      {allowLetters && (
        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-2 sm:gap-3 justify-center">
          {["BN-", "7A-", "KB-", "CC-"].map((prefix) => (
            <button
              key={prefix}
              type="button"
              onClick={() => {
                if (!value.startsWith(prefix)) {
                  onChange(prefix + value.replace(/^[A-Z0-9]+-/, ""));
                }
              }}
              className="px-4 py-2 rounded-xl bg-white border-2 border-slate-200 hover:border-[#0f2852] text-sm sm:text-base font-bold text-[#0f2852] transition active:scale-95 shadow-sm"
            >
              Tiền tố {prefix}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
