"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { SpectrumPoint, GasDetection } from "@/types";
import { Sparkles, Waves } from "lucide-react";

interface RechartsSpectrumProps {
  points: SpectrumPoint[];
  gases: GasDetection[];
  targetName: string;
}

export function RechartsSpectrum({
  points,
  gases,
  targetName,
}: RechartsSpectrumProps) {
  const { yDomain, gasAnnotations } = useMemo(() => {
    if (!points || points.length === 0) {
      return { yDomain: [0, 0.1], gasAnnotations: [] };
    }

    const depths = points.map((p) => p.depth);
    const min = Math.min(...depths);
    const max = Math.max(...depths);
    const padding = (max - min) * 0.2 || 0.01;

    const annotations = gases
      .filter((g) => g.confidence > 50)
      .map((g) => ({
        x: g.absorptionPeakMicrons,
        label: `${g.formula} (${g.absorptionPeakMicrons}µm)`,
        color: g.color,
      }));

    return {
      yDomain: [
        Number(Math.max(0, min - padding).toFixed(3)),
        Number((max + padding).toFixed(3)),
      ],
      gasAnnotations: annotations,
    };
  }, [points, gases]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">
              Atmospheric Transmission Spectrum
            </h3>
            <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-medium text-cyan-700 border border-cyan-200">
              {targetName} Atmosphere
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Wavelength-dependent transit depth profile (0.6 µm – 5.0 µm) indicating atmospheric molecular absorption.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <Waves className="h-3.5 w-3.5 text-cyan-600" />
          <span>JWST NIRSpec & MIRI Simulation</span>
        </div>
      </div>

      <div className="h-[340px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={points}
            margin={{ top: 15, right: 25, left: 10, bottom: 25 }}
          >
            <defs>
              <linearGradient id="spectrumGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="wavelength"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val) => `${val}µm`}
              label={{
                value: "Wavelength (µm)",
                position: "insideBottom",
                offset: -15,
                fontSize: 11,
                fill: "#64748b",
              }}
            />
            <YAxis
              domain={yDomain}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val) => `${val}%`}
              label={{
                value: "Transit Depth (%)",
                angle: -90,
                position: "insideLeft",
                offset: 5,
                fontSize: 11,
                fill: "#64748b",
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as SpectrumPoint;
                  // Check if near any gas peak
                  const nearbyGas = gases.find(
                    (g) => Math.abs(g.absorptionPeakMicrons - data.wavelength) < 0.15
                  );

                  return (
                    <div className="rounded-lg border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur-sm space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                        <span>Spectral Channel</span>
                      </div>
                      <div className="text-slate-600">
                        Wavelength:{" "}
                        <span className="font-mono text-slate-900">
                          {data.wavelength.toFixed(3)} µm
                        </span>
                      </div>
                      <div className="text-slate-600">
                        Apparent Depth:{" "}
                        <span className="font-mono font-medium text-cyan-600">
                          {data.depth.toFixed(4)}%
                        </span>
                      </div>
                      {nearbyGas && (
                        <div
                          className="mt-1 pt-1 border-t border-slate-100 font-semibold"
                          style={{ color: nearbyGas.color }}
                        >
                          Absorption feature: {nearbyGas.name} ({nearbyGas.formula})
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            {gasAnnotations.map((ann) => (
              <ReferenceLine
                key={ann.label}
                x={ann.x}
                stroke={ann.color}
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: ann.label,
                  position: "top",
                  fontSize: 10,
                  fill: ann.color,
                  fontWeight: 600,
                }}
              />
            ))}
            <Area
              type="monotone"
              dataKey="depth"
              stroke="#0284c7"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#spectrumGradient)"
              isAnimationActive={true}
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
        <span className="font-medium text-slate-700">Key Atmospheric Bands:</span>
        {gasAnnotations.map((ann) => (
          <span key={ann.label} className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: ann.color }}
            />
            <span className="font-medium text-slate-800">{ann.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
