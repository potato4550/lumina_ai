"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  Brush,
} from "recharts";
import { LightCurvePoint } from "@/types";
import { Button } from "@/components/ui/button";
import { ZoomIn, RotateCcw, Crosshair } from "lucide-react";

interface RechartsLightCurveProps {
  points: LightCurvePoint[];
  targetName: string;
  transitDepthPpm: number;
  periodDays: number;
}

export function RechartsLightCurve({
  points,
  targetName,
  transitDepthPpm,
  periodDays,
}: RechartsLightCurveProps) {
  const [zoomInTransit, setZoomInTransit] = useState(false);

  // Compute min/max values for smooth Y axis scaling
  const { chartData, yDomain, transitWindow } = useMemo(() => {
    if (!points || points.length === 0) {
      return { chartData: [], yDomain: [0.99, 1.01], transitWindow: null };
    }

    let minFlux = 1.0;
    let maxFlux = 1.0;

    // Find the deepest point to locate the transit center
    let lowestPoint = points[0];
    for (const p of points) {
      if (p.flux < minFlux) minFlux = p.flux;
      if (p.flux > maxFlux) maxFlux = p.flux;
      if (p.flux < lowestPoint.flux) lowestPoint = p;
    }

    const padding = (maxFlux - minFlux) * 0.2 || 0.002;
    const yMin = Number((minFlux - padding).toFixed(5));
    const yMax = Number((maxFlux + padding).toFixed(5));

    // Approximate transit window around the primary transit dip
    const transitRadius = periodDays * 0.04;
    const tCenter = lowestPoint.time;
    const transitWindow = {
      start: Math.max(0, tCenter - transitRadius),
      end: tCenter + transitRadius,
    };

    let filtered = points;
    if (zoomInTransit) {
      filtered = points.filter(
        (p) => p.time >= transitWindow.start && p.time <= transitWindow.end
      );
      if (filtered.length < 10) filtered = points; // fallback if too narrow
    }

    const formatted = filtered.map((p) => ({
      time: Number(p.time.toFixed(4)),
      flux: Number(p.flux.toFixed(6)),
      dipPpm: Math.round((1.0 - p.flux) * 1e6),
    }));

    return { chartData: formatted, yDomain: [yMin, yMax], transitWindow };
  }, [points, zoomInTransit, periodDays]);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
              Phase-Resolved Light Curve
            </h3>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-[var(--primary)] border border-blue-200">
              {targetName}
            </span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Normalized relative stellar flux vs Barycentric Julian Date (days).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={zoomInTransit ? "default" : "outline"}
            className="h-7 text-xs px-2.5 gap-1.5"
            onClick={() => setZoomInTransit(!zoomInTransit)}
          >
            <ZoomIn className="h-3 w-3" />
            {zoomInTransit ? "Full Curve" : "Zoom In-Transit"}
          </Button>
          {zoomInTransit && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs px-2"
              onClick={() => setZoomInTransit(false)}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="h-[360px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val) => `${val}d`}
              label={{
                value: "Time (BJD - Days)",
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
              tickFormatter={(val) => val.toFixed(4)}
              label={{
                value: "Relative Flux",
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
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur-sm space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Crosshair className="h-3.5 w-3.5 text-blue-600" />
                        <span>Telemetry Point</span>
                      </div>
                      <div className="text-slate-600">
                        Time: <span className="font-mono text-slate-900">{data.time} d</span>
                      </div>
                      <div className="text-slate-600">
                        Flux: <span className="font-mono text-slate-900">{data.flux}</span>
                      </div>
                      <div className="text-slate-600">
                        Dip Depth:{" "}
                        <span className="font-mono font-medium text-blue-600">
                          {data.dipPpm} ppm
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {transitWindow && !zoomInTransit && (
              <ReferenceArea
                x1={Number(transitWindow.start.toFixed(3))}
                x2={Number(transitWindow.end.toFixed(3))}
                stroke="#3b82f6"
                strokeOpacity={0.4}
                fill="#3b82f6"
                fillOpacity={0.08}
              />
            )}
            <Line
              type="monotone"
              dataKey="flux"
              stroke="#2563eb"
              strokeWidth={1.75}
              dot={chartData.length < 100 ? { r: 2, fill: "#2563eb" } : false}
              activeDot={{ r: 5, fill: "#1d4ed8", stroke: "#ffffff", strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={800}
            />
            <Brush
              dataKey="time"
              height={24}
              stroke="#94a3b8"
              fill="#f8fafc"
              tickFormatter={() => ""}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--muted-foreground)] pt-1 border-t border-[var(--border)]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
            Observed Flux
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded bg-blue-100 border border-blue-400" />
            Detected Transit Occultation
          </span>
        </div>
        <span>Target Depth Reference: ~{transitDepthPpm.toLocaleString()} ppm</span>
      </div>
    </div>
  );
}
