"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useExoplanetStore } from "@/lib/store";
import { RechartsSpectrum } from "./RechartsSpectrum";
import { GasCardGrid } from "./GasCardGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Waves,
  Upload,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { SpectrumPoint } from "@/types";

export function SpectrumAnalyzer() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    selectedCandidate,
    spectrumPoints,
    detectedGases,
    isSpectrumGenerated,
    generateSpectrum,
    setCustomSpectrum,
    setActiveStep,
  } = useExoplanetStore();

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generateSpectrum();
      setIsGenerating(false);
      toast.success(
        `Generated transmission spectrum for ${selectedCandidate.name} across 0.6–5.0 µm bands`
      );
    }, 500);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.trim().split("\n");
        const points: SpectrumPoint[] = [];

        for (const line of lines) {
          if (!line || line.startsWith("#") || line.toLowerCase().includes("wave"))
            continue;
          const parts = line.split(/[,\s\t]+/);
          if (parts.length >= 2) {
            const wl = parseFloat(parts[0]);
            const depth = parseFloat(parts[1]);
            if (!isNaN(wl) && !isNaN(depth)) {
              points.push({ wavelength: wl, depth });
            }
          }
        }

        if (points.length < 10) {
          toast.error("Insufficient data points in wavelength CSV.");
          return;
        }

        setCustomSpectrum(points);
        toast.success(`Loaded ${points.length} spectral bands from ${file.name}`);
      } catch (err) {
        toast.error("Error parsing wavelength CSV.");
      }
    };
    reader.readAsText(file);
  };

  const handleBack = () => {
    setActiveStep(1);
    router.push("/analyze/light-curve");
  };

  const handleNext = () => {
    setActiveStep(3);
    router.push("/analyze/train");
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
          <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-800">
            Step 2 of 4
          </span>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Atmospheric Characterization
          </span>
        </div>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Transmission Spectroscopy & Gas Detections
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-3xl">
          Evaluate wavelength-dependent transit depths to resolve chemical fingerprints. Identify atmospheric absorption features across 8 target biosignature molecules.
        </p>
      </div>

      {/* Generation Bar / Upload Options */}
      <Card className="border-slate-200 bg-white">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600">
              <Waves className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Spectroscopic Synthesis Engine
              </p>
              <p className="text-xs text-slate-500">
                Target: <span className="font-semibold text-slate-800">{selectedCandidate.name}</span> ({selectedCandidate.spectralType})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleCSVUpload}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-initial h-9 text-xs gap-1.5 border-slate-200"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-slate-500" />
              Upload Wavelength CSV
            </Button>

            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 sm:flex-initial h-9 text-xs gap-1.5 bg-cyan-700 hover:bg-cyan-800 text-white"
            >
              {isGenerating ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {isSpectrumGenerated ? "Regenerate Spectrum" : "Generate Spectrum"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {!isSpectrumGenerated ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 mb-3">
            <Waves className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            No Spectral Model Generated Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Click &quot;Generate Spectrum&quot; to synthesize JWST NIRSpec/MIRI observations for {selectedCandidate.name}, or upload an observational wavelength table.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-cyan-700 hover:bg-cyan-800 text-white gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Synthesize {selectedCandidate.name} Spectrum
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Recharts Transmission Spectrum */}
          <RechartsSpectrum
            points={spectrumPoints}
            gases={detectedGases}
            targetName={selectedCandidate.name}
          />

          {/* 8 Gas Cards with Abundance Bars & Hover Descriptions */}
          <GasCardGrid gases={detectedGases} />
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Button
          variant="outline"
          size="lg"
          onClick={handleBack}
          className="h-10 px-5 gap-2 border-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back: Light Curve</span>
        </Button>

        <Button
          size="lg"
          onClick={handleNext}
          disabled={!isSpectrumGenerated}
          className="h-10 px-6 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <span>Proceed to Train AI (CNN)</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
