"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useExoplanetStore } from "@/lib/store";
import {
  Activity,
  Waves,
  Brain,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    step: 1,
    label: "Light Curve",
    href: "/analyze/light-curve",
    icon: Activity,
    detail: "Transit Photometry",
  },
  {
    step: 2,
    label: "Spectrum",
    href: "/analyze/spectrum",
    icon: Waves,
    detail: "Atmospheric Characterization",
  },
  {
    step: 3,
    label: "Train AI",
    href: "/analyze/train",
    icon: Brain,
    detail: "1D CNN Neural Vetting",
  },
  {
    step: 4,
    label: "Results",
    href: "/results",
    icon: CheckCircle2,
    detail: "Validation & PDF Report",
  },
];

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isLightCurveLoaded,
    isSpectrumGenerated,
    isTrainingComplete,
    currentAnalysis,
    setActiveStep,
  } = useExoplanetStore();

  const getCurrentStepNumber = () => {
    if (pathname.includes("/light-curve")) return 1;
    if (pathname.includes("/spectrum")) return 2;
    if (pathname.includes("/train")) return 3;
    if (pathname.includes("/results")) return 4;
    return 1;
  };

  const currentStep = getCurrentStepNumber();

  // Keyboard shortcut listener: Left arrow for back, Right arrow or Enter for forward
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (currentStep === 1 && isLightCurveLoaded) {
          router.push("/analyze/spectrum");
        } else if (currentStep === 2 && isSpectrumGenerated) {
          router.push("/analyze/train");
        } else if (currentStep === 3 && isTrainingComplete) {
          router.push("/results");
        }
      } else if (e.key === "ArrowLeft") {
        if (currentStep === 2) router.push("/analyze/light-curve");
        else if (currentStep === 3) router.push("/analyze/spectrum");
        else if (currentStep === 4) router.push("/analyze/train");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, isLightCurveLoaded, isSpectrumGenerated, isTrainingComplete, router]);

  const canNavigateTo = (stepNum: number) => {
    if (stepNum === 1) return true;
    if (stepNum === 2) return isLightCurveLoaded;
    if (stepNum === 3) return isSpectrumGenerated;
    if (stepNum === 4) return isTrainingComplete || !!currentAnalysis;
    return false;
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50/50">
      {/* Interactive NASA Mission Stepper Bar */}
      <div className="sticky top-14 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-xs">
        <div className="mx-auto max-w-[1200px] px-6 py-3">
          <div className="flex items-center justify-between overflow-x-auto py-1">
            {steps.map((s, idx) => {
              const isActive = currentStep === s.step;
              const isCompleted = currentStep > s.step;
              const isAccessible = canNavigateTo(s.step);
              const Icon = s.icon;

              return (
                <React.Fragment key={s.step}>
                  {idx > 0 && (
                    <div
                      className={`h-0.5 w-6 sm:w-12 transition-colors mx-2 ${
                        isCompleted ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    />
                  )}

                  <Link
                    href={s.href}
                    onClick={(e) => {
                      if (!isAccessible) {
                        e.preventDefault();
                      } else {
                        setActiveStep(s.step);
                      }
                    }}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-1.5 transition-all text-left ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-600/30 shadow-xs"
                        : isCompleted
                        ? "text-slate-800 hover:bg-slate-100 cursor-pointer"
                        : isAccessible
                        ? "text-slate-600 hover:bg-slate-50 cursor-pointer"
                        : "text-slate-400 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-mono font-bold transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white shadow-xs"
                          : isCompleted
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span>{s.step}</span>
                      )}
                    </div>

                    <div className="hidden sm:block">
                      <p className="text-xs leading-none">{s.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
                        {s.detail}
                      </p>
                    </div>
                  </Link>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Workspace Content Area */}
      <div className="mx-auto max-w-[1200px] px-6 py-8">{children}</div>
    </div>
  );
}
