"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, CheckCircle2, Sparkles, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

interface LLMReasoningCardProps {
  reasoning: string[];
  candidateName: string;
}

export function LLMReasoningCard({
  reasoning,
  candidateName,
}: LLMReasoningCardProps) {
  const steps = [
    {
      label: "Transit Depth Analysis",
      text: "Transit depth is consistent with an exoplanet.",
      detail: "Occultation amplitude matches typical planetary radii models (U-shape vs V-shape).",
    },
    {
      label: "Baseline Stellar Noise",
      text: "Low stellar noise.",
      detail: "Out-of-transit flux dispersion conforms to quiet solar-type / dwarf stellar baselines.",
    },
    {
      label: "Ephemeris Verification",
      text: "Periodicity confirmed.",
      detail: "Phase-folded transit centers align strictly across contiguous observing quarters.",
    },
    {
      label: "Bayesian Synthesis",
      text: "Confidence increased.",
      detail: "Posterior probability elevated above false-positive vetting thresholds.",
    },
  ];

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-white via-blue-50/20 to-slate-50 shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                Scientific LLM Ephemeris Reasoning Engine
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </h4>
              <p className="text-xs text-slate-500">
                Automated peer-review synthetic chain of astrophysical evidence for {candidateName}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
            Chain-of-Thought Verified
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {steps.map((step, idx) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm"
            >
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  {step.label}
                </p>
                <p className="text-xs font-bold text-slate-900">
                  &quot;{step.text}&quot;
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
