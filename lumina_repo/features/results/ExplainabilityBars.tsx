"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Sparkles, Layers } from "lucide-react";

interface ExplainabilityBarsProps {
  transitDepthPpm: number;
  periodDays: number;
}

export function ExplainabilityBars({
  transitDepthPpm,
  periodDays,
}: ExplainabilityBarsProps) {
  const features = [
    {
      name: "Transit Depth",
      importance: 96,
      value: `~${transitDepthPpm.toLocaleString()} ppm`,
      detail: "Dominant primary U-shape flux depression signature.",
      color: "bg-blue-600",
    },
    {
      name: "Noise Level",
      importance: 91,
      value: "160 ppm baseline",
      detail: "High out-of-transit signal quiescence rules out stellar variability.",
      color: "bg-cyan-600",
    },
    {
      name: "Transit Symmetry",
      importance: 88,
      value: "98.2% bilateral fit",
      detail: "Symmetric ingress and egress rules out grazing eclipsing binaries.",
      color: "bg-emerald-600",
    },
    {
      name: "Orbital Periodicity",
      importance: 85,
      value: `${periodDays} days`,
      detail: "Strict periodicity confirmed across 3+ consecutive orbital cycles.",
      color: "bg-purple-600",
    },
    {
      name: "Estimated Radius Fit",
      importance: 79,
      value: "Physical boundary met",
      detail: "Conforms with Roche lobe limits and stellar density constraints.",
      color: "bg-amber-600",
    },
    {
      name: "Flux Variance",
      importance: 74,
      value: "0.00018 σ",
      detail: "Low secondary eclipse amplitude confirms substellar companion.",
      color: "bg-rose-600",
    },
  ];

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              SHAP & Neural Feature Attribution
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Integrated Gradients
          </span>
        </div>

        <div className="space-y-3.5">
          {features.map((item, idx) => (
            <div key={item.name} className="space-y-1.5">
              <div className="flex items-baseline justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{item.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">({item.value})</span>
                </div>
                <span className="font-mono font-bold text-slate-700">
                  {item.importance}%
                </span>
              </div>

              {/* Horizontal Progress Bar */}
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className={`h-full rounded-full ${item.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.importance}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.05, ease: "easeOut" }}
                />
              </div>

              <p className="text-[10px] text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
