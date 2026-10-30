"use client";

import React, { useState, useRef } from "react";
import { parseCSVToLightCurve } from "@/lib/mockAnalysis";
import { LightCurvePoint, LightCurveTelemetry } from "@/types";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface UploadDropzoneProps {
  onDataLoaded: (
    points: LightCurvePoint[],
    telemetry: LightCurveTelemetry,
    filename: string
  ) => void;
}

export function UploadDropzone({ onDataLoaded }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setIsParsing(true);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        // Simulate realistic parse time for skeleton animation
        setTimeout(() => {
          const result = parseCSVToLightCurve(text);
          const telemetry: LightCurveTelemetry = {
            transitDepthPpm: result.inferredDepthPpm,
            orbitalPeriodDays: result.inferredPeriodDays,
            dataPointsCount: result.points.length,
            snr: result.snr,
            durationHours: result.durationHours,
            symmetryPercent: result.symmetryPercent,
            estimatedRadiusEarth: result.estimatedRadius,
          };

          onDataLoaded(result.points, telemetry, file.name.replace(/\.[^/.]+$/, ""));
          setIsParsing(false);
          toast.success(`Parsed ${result.points.length.toLocaleString()} observations from ${file.name}`);
        }, 800);
      } catch (err) {
        setIsParsing(false);
        toast.error("Failed to parse CSV file. Please verify column formatting.");
      }
    };

    reader.onerror = () => {
      setIsParsing(false);
      toast.error("Error reading file.");
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleQuickSynthetic = () => {
    setIsParsing(true);
    setTimeout(() => {
      const result = parseCSVToLightCurve(""); // Triggers fallback realistic generator
      const telemetry: LightCurveTelemetry = {
        transitDepthPpm: result.inferredDepthPpm,
        orbitalPeriodDays: result.inferredPeriodDays,
        dataPointsCount: result.points.length,
        snr: result.snr,
        durationHours: result.durationHours,
        symmetryPercent: result.symmetryPercent,
        estimatedRadiusEarth: result.estimatedRadius,
      };
      onDataLoaded(result.points, telemetry, "Synthetic-Target-Exo");
      setUploadedFileName("Synthetic-Target-Exo.csv");
      setIsParsing(false);
      toast.success("Generated realistic synthetic Kepler-cadence transit data");
    }, 600);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <FileCode className="h-4 w-4 text-blue-600" />
            Custom Light Curve CSV
          </h3>
          <p className="text-xs text-slate-500">
            Import telemetry formatted as <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">time_bjd, relative_flux, [flux_err]</code>.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleQuickSynthetic}
          disabled={isParsing}
          className="h-7 text-xs gap-1 text-slate-700"
        >
          <Sparkles className="h-3 w-3 text-blue-600" />
          Generate Sample
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt,.dat"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
          }
        }}
      />

      {isParsing ? (
        <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50/40 p-8 text-center animate-pulse space-y-3">
          <div className="mx-auto h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
            <Upload className="h-4 w-4 text-blue-600 animate-bounce" />
          </div>
          <div className="space-y-1.5 max-w-xs mx-auto">
            <div className="h-3 bg-blue-200 rounded w-3/4 mx-auto" />
            <div className="h-2 bg-blue-100 rounded w-1/2 mx-auto" />
          </div>
          <p className="text-xs text-blue-700 font-medium">
            Parsing photometric cadence and computing transit ephemeris...
          </p>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all ${
            isDragging
              ? "border-blue-600 bg-blue-50/50 scale-[0.99]"
              : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
          }`}
        >
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <Upload className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium text-slate-800">
            {uploadedFileName ? (
              <span className="flex items-center justify-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {uploadedFileName} loaded
              </span>
            ) : (
              "Drag and drop your photometric CSV file here, or click to browse"
            )}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Supports Kepler, TESS, and CHEOPS exported CSV archives (up to 50MB)
          </p>
        </div>
      )}
    </div>
  );
}
