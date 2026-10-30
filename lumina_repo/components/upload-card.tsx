"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Loader2 } from "lucide-react";
import type { LightCurveData, LightCurvePoint } from "@/lib/types";

interface UploadCardProps {
  onUpload: (data: LightCurveData) => void;
}

function generateMockFromFile(filename: string): LightCurveData {
  const observations = Math.floor(Math.random() * 25000) + 8000;
  const points: LightCurvePoint[] = [];
  const period = 2 + Math.random() * 10;
  const depth = 0.0001 + Math.random() * 0.0003;
  for (let i = 0; i < 500; i++) {
    const t = (i / 500) * period * 3;
    const phase = ((t % period) / period + 0.5) % 1;
    let flux = 1.0;
    if (Math.abs(phase - 0.5) < 0.04) {
      const x = (phase - 0.5) / 0.04;
      flux = 1.0 - depth * (1 - x * x);
    }
    flux += (Math.random() - 0.5) * 0.0003;
    points.push({ time: t, flux });
  }
  return {
    points,
    observations,
    noiseLevel: 0.0003 + Math.random() * 0.0003,
    transitDepth: depth,
    orbitalPeriod: period,
    cadence: "30 min",
    targetName: filename.replace(/\.[^/.]+$/, ""),
  };
}

export function UploadCard({ onUpload }: UploadCardProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const simulateUpload = useCallback(
    (filename: string) => {
      setUploading(true);
      setProgress(0);
      setUploadedFile(filename);
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 15 + 5;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          setUploading(false);
          setProgress(100);
          const data = generateMockFromFile(filename);
          onUpload(data);
        } else {
          setProgress(Math.round(p));
        }
      }, 250);
    },
    [onUpload]
  );

  const handleFile = useCallback(
    (f: File) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      if (!["csv", "fits", "hdf5", "txt"].includes(ext)) return;
      simulateUpload(f.name);
    },
    [simulateUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Upload CSV</CardTitle>
        <CardDescription className="text-xs">
          Upload a light curve file to analyze
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`relative flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed p-6 transition-colors ${
            dragOver
              ? "border-[var(--primary)] bg-primary/5"
              : "border-[var(--border)] hover:border-primary/40"
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOver(false);
          }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".csv,.fits,.hdf5,.txt";
            input.onchange = (e) => {
              const files = (e.target as HTMLInputElement).files;
              if (files?.length) handleFile(files[0]);
            };
            input.click();
          }}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
              <span className="mt-2 text-sm font-medium">{uploadedFile}</span>
              <span className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                Processing light curve data...
              </span>
              <div className="mt-3 w-full max-w-[200px]">
                <Progress value={progress} className="h-1.5" />
                <p className="mt-1 text-center text-[10px] text-[var(--muted-foreground)]">
                  {progress}%
                </p>
              </div>
            </div>
          ) : uploadedFile && !uploading ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <FileText className="h-6 w-6 text-[var(--primary)]" />
              <span className="mt-2 text-sm font-medium">{uploadedFile}</span>
              <span className="mt-0.5 text-xs text-green-600 font-medium">
                Ready
              </span>
            </motion.div>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--secondary)]">
                <Upload className="h-4 w-4 text-[var(--muted-foreground)]" />
              </div>
              <span className="mt-3 text-sm text-[var(--muted-foreground)]">
                Drag and drop a light curve file
              </span>
              <span className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                CSV, FITS, HDF5 — up to 500 MB
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
