"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResult } from "@/types";
import { ScoreCards } from "./ScoreCards";
import { DetectionChart } from "./DetectionChart";
import { ExplainabilityBars } from "./ExplainabilityBars";
import { DecisionReasoningCard } from "./DecisionReasoningCard";
import { GasCardGrid } from "../spectrum/GasCardGrid";
import { generateExoplanetPDF } from "@/lib/pdf-generator";
import { useExoplanetStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileDown,
  RotateCcw,
  Sparkles,
  Telescope,
  CheckCircle2,
  BookmarkCheck,
  Compass,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ResultsDashboardProps {
  analysis: AnalysisResult;
}

export function ResultsDashboard({ analysis }: ResultsDashboardProps) {
  const router = useRouter();
  const { lightCurvePoints, resetWorkflow } = useExoplanetStore();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    toast.info("Assembling official NASA-style Exoplanet Validation PDF report...");
    try {
      await generateExoplanetPDF(analysis);
      toast.success(`Downloaded Lumina Report for ${analysis.candidate.name}`);
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF document.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleStartNew = () => {
    resetWorkflow();
    router.push("/analyze/light-curve");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Step 4 of 4: Validated
            </span>
            <span className="text-xs font-mono text-slate-500">
              MISSION REF: {analysis.id}
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {analysis.candidate.name} Detection & Characterization
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Host Star: <span className="font-semibold text-slate-800">{analysis.candidate.hostStar}</span> | Spectral Class: {analysis.candidate.spectralType} | Constellation: {analysis.candidate.constellation}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartNew}
            className="h-9 gap-1.5 text-xs border-slate-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New Detection
          </Button>

          <Button
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="h-9 gap-2 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <FileDown className="h-4 w-4" />
            <span>{isGeneratingPdf ? "Building PDF..." : "Download NASA PDF Report"}</span>
          </Button>
        </div>
      </div>

      {/* 6 Key Score Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Ensemble Detection Scores
        </h3>
        <ScoreCards scores={analysis.scores} />
      </div>

      {/* Primary Detection Curve and Feature Importance */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DetectionChart
            points={lightCurvePoints}
            periodDays={analysis.telemetry.orbitalPeriodDays}
            depthPpm={analysis.telemetry.transitDepthPpm}
            targetName={analysis.candidate.name}
          />
        </div>

        <div className="lg:col-span-1">
          <ExplainabilityBars
            transitDepthPpm={analysis.telemetry.transitDepthPpm}
            periodDays={analysis.telemetry.orbitalPeriodDays}
          />
        </div>
      </div>

      {/* Decision Card */}
      <DecisionReasoningCard
        conclusion={analysis.decisionConclusion}
        candidateName={analysis.candidate.name}
        periodDays={analysis.telemetry.orbitalPeriodDays}
      />

      {/* Detected Atmospheric Gases */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Atmospheric Transmission Spectroscopy Results
        </h3>
        <GasCardGrid gases={analysis.detectedGases} />
      </div>

      {/* Scientific Follow-up Recommendations */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Observational Follow-up Recommendations
            </h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {analysis.recommendations.map((rec, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-700 leading-relaxed flex items-start gap-2"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700 font-mono">
                  {i + 1}
                </span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
