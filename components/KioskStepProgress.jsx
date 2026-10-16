"use client";

import { Check } from "lucide-react";

export default function KioskStepProgress({ steps = [], currentStep = 1 }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="w-full bg-white border-b-2 border-slate-200 py-3 sm:py-5 px-4 sm:px-12 select-none shadow-sm">
      <div className="mx-auto max-w-4xl flex items-center justify-between relative">
        {/* Horizontal Connecting Line */}
        <div
          aria-hidden="true"
          className="absolute top-9 sm:top-10 left-12 right-12 h-1 bg-slate-200 -z-0"
        >
          <div
            className="h-full bg-[#0f2852] transition-all duration-300"
            style={{
              width: `${((Math.min(currentStep, steps.length) - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={stepNum}
              className="relative z-10 flex flex-col items-center flex-1 text-center"
            >
              {/* "Bước X" small header like kiosk photo */}
              <span
                className={`text-xs sm:text-sm font-extrabold mb-1.5 uppercase tracking-wider ${
                  isCurrent
                    ? "text-[#0f2852] font-black"
                    : isCompleted
                    ? "text-emerald-700"
                    : "text-slate-400"
                }`}
              >
                Bước {stepNum}
              </span>

              {/* Step Circle */}
              <div
                className={`flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full text-base sm:text-xl font-black border-2 sm:border-3 transition-all ${
                  isCompleted
                    ? "bg-[#0f2852] border-[#0f2852] text-white shadow-sm"
                    : isCurrent
                    ? "bg-[#0f2852] border-[#0f2852] text-white ring-4 ring-blue-200 shadow-md scale-105"
                    : "bg-white border-slate-300 text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <Check size={22} strokeWidth={3.5} className="text-white" />
                ) : (
                  <span>{stepNum}</span>
                )}
              </div>

              {/* Step Title */}
              <span
                className={`mt-2 text-xs sm:text-base font-extrabold max-w-[150px] sm:max-w-[200px] leading-snug ${
                  isCurrent
                    ? "text-[#0f2852] font-black"
                    : isCompleted
                    ? "text-slate-700"
                    : "text-slate-400"
                }`}
              >
                {step.title}
              </span>

              {step.subtitle && (
                <span
                  className={`hidden sm:block text-[11px] sm:text-xs font-semibold leading-tight mt-0.5 max-w-[140px] ${
                    isCurrent ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  {step.subtitle}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
