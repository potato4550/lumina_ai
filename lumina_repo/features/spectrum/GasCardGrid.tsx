"use client";

import React, { useState } from "react";
import { GasDetection } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Info, CheckCircle2, AlertTriangle } from "lucide-react";

interface GasCardGridProps {
  gases: GasDetection[];
}

export function GasCardGrid({ gases }: GasCardGridProps) {
  const [hoveredGasId, setHoveredGasId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Atmospheric Biosignatures & Chemical Inventory (8 Trace Gases)
          </h3>
          <p className="text-xs text-slate-500">
            Hover over any gas card to inspect physical absorption bands, atmospheric equilibrium, and biomarker classification.
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-slate-500">
          {gases.filter((g) => g.confidence > 70).length} Primary Detections
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {gases.map((gas, index) => {
          const isHigh = gas.confidence >= 75;
          const isMedium = gas.confidence >= 50 && gas.confidence < 75;

          return (
            <motion.div
              key={gas.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              onMouseEnter={() => setHoveredGasId(gas.id)}
              onMouseLeave={() => setHoveredGasId(null)}
              className="relative"
            >
              <Card
                className={`relative overflow-hidden transition-all duration-200 hover:shadow-md cursor-help border-slate-200 ${
                  hoveredGasId === gas.id ? "ring-2 ring-blue-500/30 border-blue-400" : ""
                }`}
              >
                {/* Top colored accent indicator */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: gas.color }}
                />

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900">
                          {gas.name}
                        </span>
                        <span
                          className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${gas.color}18`,
                            color: gas.color,
                          }}
                        >
                          {gas.formula}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        λ Peak: {gas.absorptionPeakMicrons} µm
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 font-medium ${
                        isHigh
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : isMedium
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      {gas.confidence}% Conf.
                    </Badge>
                  </div>

                  {/* Abundance metric */}
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-slate-500">Estimated Abundance</span>
                    <span className="font-mono text-sm font-bold text-slate-800">
                      {gas.abundance} {gas.abundanceUnit}
                    </span>
                  </div>

                  {/* Animated Abundance Bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: gas.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(10, gas.confidence))}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Gas Explanation (Hovered or always present as concise note) */}
                  <div className="min-h-[42px] pt-1">
                    <p className="text-[11px] leading-relaxed text-slate-600 line-clamp-2">
                      {gas.explanation}
                    </p>
                  </div>
                </CardContent>

                {/* Hover Tooltip Overlay */}
                <AnimatePresence>
                  {hoveredGasId === gas.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-0 z-10 flex flex-col justify-between bg-slate-900/95 p-4 text-white backdrop-blur-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                          <span className="font-semibold text-xs flex items-center gap-1">
                            <Info className="h-3 w-3 text-cyan-400" />
                            {gas.name} ({gas.formula})
                          </span>
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold"
                            style={{ backgroundColor: gas.color, color: "#ffffff" }}
                          >
                            {gas.confidence}%
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-200 leading-relaxed">
                          {gas.explanation}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Abundance: {gas.abundance} {gas.abundanceUnit}</span>
                        <span>Band: {gas.absorptionPeakMicrons} µm</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
