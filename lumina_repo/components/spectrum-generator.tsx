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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Upload, Loader2 } from "lucide-react";
import { SpectrumChart } from "@/components/spectrum-chart";
import { MOCK_SPECTRUM } from "@/lib/mock-data";
import type { SpectrumData } from "@/lib/types";

interface SpectrumGeneratorProps {
  onComplete: (data: SpectrumData) => void;
}

export function SpectrumGenerator({ onComplete }: SpectrumGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [spectrum, setSpectrum] = useState<SpectrumData | null>(null);

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 12 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setGenerating(false);
        setProgress(100);
        setSpectrum(MOCK_SPECTRUM);
        onComplete(MOCK_SPECTRUM);
      } else {
        setProgress(Math.round(p));
      }
    }, 200);
  }, [onComplete]);

  const handleUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.txt";
    input.onchange = () => {
      // Mock: use the same spectrum data regardless of file
      setGenerating(true);
      setProgress(0);
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 20 + 10;
        if (p >= 100) {
          clearInterval(interval);
          setGenerating(false);
          setProgress(100);
          setSpectrum(MOCK_SPECTRUM);
          onComplete(MOCK_SPECTRUM);
        } else {
          setProgress(Math.round(p));
        }
      }, 200);
    };
    input.click();
  }, [onComplete]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Transmission Spectrum</CardTitle>
          <CardDescription className="text-xs">
            Generate a simulated spectrum or upload your own wavelength/depth CSV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="generate">
            <TabsList className="mb-4">
              <TabsTrigger value="generate" className="text-xs">
                <Sparkles className="mr-1.5 h-3 w-3" />
                Generate Simulated
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-xs">
                <Upload className="mr-1.5 h-3 w-3" />
                Upload CSV
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              {generating ? (
                <div className="flex flex-col items-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
                  <span className="mt-2 text-sm font-medium">
                    Generating spectrum...
                  </span>
                  <div className="mt-3 w-full max-w-[200px]">
                    <Progress value={progress} className="h-1.5" />
                    <p className="mt-1 text-center text-[10px] text-[var(--muted-foreground)]">
                      {progress}%
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6">
                  <p className="text-xs text-[var(--muted-foreground)] max-w-sm text-center mb-4">
                    Simulate a transmission spectrum based on the uploaded light
                    curve parameters and atmospheric models.
                  </p>
                  <Button onClick={handleGenerate} size="sm">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Generate Spectrum
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload">
              <div className="flex flex-col items-center py-6">
                <p className="text-xs text-[var(--muted-foreground)] max-w-sm text-center mb-4">
                  Upload a CSV file with wavelength (µm) and transit depth
                  columns.
                </p>
                <Button onClick={handleUpload} variant="outline" size="sm">
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Choose File
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Spectrum results */}
      {spectrum && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <SpectrumChart data={spectrum} />

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Gas Detection
                </p>
                <p className="mt-1 text-lg font-bold">
                  {spectrum.detectedGases.length} gases
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Spectral SNR
                </p>
                <p className="mt-1 text-lg font-bold">{spectrum.spectralSNR}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Wavelength Range
                </p>
                <p className="mt-1 text-lg font-bold">
                  {spectrum.wavelengthRange[0]}–{spectrum.wavelengthRange[1]} µm
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Detected Gases
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {spectrum.detectedGases.map((g) => (
                    <Badge
                      key={g.name}
                      variant="outline"
                      className="text-[10px]"
                    >
                      {g.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
