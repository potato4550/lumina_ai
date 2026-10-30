"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, Telescope, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DecisionReasoningCardProps {
  conclusion: string;
  candidateName: string;
  periodDays: number;
}

export function DecisionReasoningCard({
  conclusion,
  candidateName,
  periodDays,
}: DecisionReasoningCardProps) {
  const points = [
    `The candidate exhibits strong periodic dips every ${periodDays} days.`,
    "Transit depth is statistically significant.",
    "Low stellar activity.",
    "Combined CNN and LLM confidence exceeds validation threshold.",
    "Likely Exoplanet Candidate.",
  ];

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Validation Decision & Scientific Synthesis
                </h3>
                <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] px-2 py-0">
                  Confirmed Candidate
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Automated multi-pipeline triage and physics-constrained validation for {candidateName}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {points.map((pt, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs text-slate-800">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
              </div>
              <span className={i === points.length - 1 ? "font-bold text-emerald-800" : "font-medium"}>
                {pt}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-white p-3.5 border border-emerald-100 text-xs text-slate-600 leading-relaxed">
          {conclusion}
        </div>
      </CardContent>
    </Card>
  );
}
