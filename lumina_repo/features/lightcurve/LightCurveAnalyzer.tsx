"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useExoplanetStore } from "@/lib/store";
import { DatasetCards } from "./DatasetCards";
import { UploadDropzone } from "./UploadDropzone";
import { RechartsLightCurve } from "./RechartsLightCurve";
import { TelemetryMetrics } from "./TelemetryMetrics";
import { Button } from "@/components/ui/button";
import { ArrowRight, Waves } from "lucide-react";
import { motion } from "framer-motion";

export function LightCurveAnalyzer() {
  const router = useRouter();
  const {
    selectedCandidate,
    lightCurvePoints,
    telemetry,
    selectCandidate,
    setCustomLightCurve,
    setActiveStep,
  } = useExoplanetStore();

  const handleNext = () => {
    setActiveStep(2);
    router.push("/analyze/spectrum");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            Step 1 of 4
          </span>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Photometric Analysis
          </span>
        </div>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Light Curve Ingestion & Ephemeris
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-3xl">
          Ingest high-precision transit photometry from Kepler, TESS, or ground-based surveys. Inspect the phase-folded flux dip and verify physical parameters before advancing to atmospheric modeling.
        </p>
      </div>

      {/* Dataset Selection Cards */}
      <DatasetCards
        selectedId={selectedCandidate.id}
        onSelect={(cand) => selectCandidate(cand)}
      />

      {/* Drag & Drop Custom Uploader */}
      <UploadDropzone
        onDataLoaded={(points, metrics, name) => {
          setCustomLightCurve(points, metrics, name);
        }}
      />

      {/* Telemetry Metrics with Animated Numbers */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Derived Astrophysical Parameters
        </h3>
        <TelemetryMetrics telemetry={telemetry} />
      </div>

      {/* Interactive Recharts Light Curve */}
      <RechartsLightCurve
        points={lightCurvePoints}
        targetName={selectedCandidate.name}
        transitDepthPpm={telemetry.transitDepthPpm}
        periodDays={telemetry.orbitalPeriodDays}
      />

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          Target: <span className="font-semibold text-slate-900">{selectedCandidate.name}</span> ({selectedCandidate.spectralType})
        </div>

        <Button
          size="lg"
          onClick={handleNext}
          className="h-10 px-6 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <span>Proceed to Transmission Spectrum</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
