"use client";

import React from "react";
import Link from "next/link";
import { useExoplanetStore } from "@/lib/store";
import { ResultsDashboard } from "@/features/results/ResultsDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Telescope, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ResultsPage() {
  const { currentAnalysis } = useExoplanetStore();

  if (!currentAnalysis) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-slate-50/50 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="max-w-md w-full"
        >
          <Card className="border-slate-200 bg-white shadow-sm text-center p-8">
            <CardContent className="space-y-4 p-0">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
                <Telescope className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  No analysis available
                </h2>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  You haven&apos;t run a detection workflow yet. Ingest a photometric light curve from Kepler or TESS to train the deep learning CNN and characterize atmospheric biosignatures.
                </p>
              </div>

              <div className="pt-2">
                <Link href="/analyze/light-curve">
                  <Button size="lg" className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>Start a new detection</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50/50 py-8">
      <div className="mx-auto max-w-[1200px] px-6">
        <ResultsDashboard analysis={currentAnalysis} />
      </div>
    </div>
  );
}
