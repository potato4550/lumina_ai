"use client";

import React, { use } from "react";
import Link from "next/link";
import { useExoplanetStore } from "@/lib/store";
import { ResultsDashboard } from "@/features/results/ResultsDashboard";
import { buildCompleteAnalysis, PRESET_CANDIDATES } from "@/lib/mockAnalysis";
import { Button } from "@/components/ui/button";
import { Telescope, ArrowLeft } from "lucide-react";

export default function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const resolvedParams = use(params);
  const { currentAnalysis, pastAnalyses } = useExoplanetStore();

  // Find analysis matching ID or use currentAnalysis
  let analysis =
    pastAnalyses.find((a) => a.id === resolvedParams.analysisId) ||
    (currentAnalysis?.id === resolvedParams.analysisId ? currentAnalysis : null);

  // If not found, match by candidate name or generate fallback
  if (!analysis) {
    if (currentAnalysis) {
      analysis = currentAnalysis;
    } else {
      // Find candidate from ID substring
      const matchedCand =
        PRESET_CANDIDATES.find((c) =>
          resolvedParams.analysisId.toLowerCase().includes(c.id)
        ) || PRESET_CANDIDATES[0];
      analysis = buildCompleteAnalysis(matchedCand, 97.4);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50/50 py-8">
      <div className="mx-auto max-w-[1200px] px-6">
        <ResultsDashboard analysis={analysis} />
      </div>
    </div>
  );
}
