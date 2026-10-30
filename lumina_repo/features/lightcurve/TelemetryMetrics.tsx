"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { LightCurveTelemetry } from "@/types";
import {
  Activity,
  Calendar,
  Layers,
  Zap,
  Clock,
  Scale,
  Globe,
} from "lucide-react";

interface TelemetryMetricsProps {
  telemetry: LightCurveTelemetry;
}

function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
}: {
  value: number;
  decimals?: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 750; // ms
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (value - start) * eased;
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplay(value);
      }
    };

    requestAnimationFrame(update);
  }, [value]);

  return (
    <span>
      {display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export function TelemetryMetrics({ telemetry }: TelemetryMetricsProps) {
  const items = [
    {
      label: "Transit Depth",
      value: telemetry.transitDepthPpm,
      decimals: 0,
      suffix: " ppm",
      icon: Activity,
      desc: "Relative flux depression",
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      label: "Orbital Period",
      value: telemetry.orbitalPeriodDays,
      decimals: 2,
      suffix: " d",
      icon: Calendar,
      desc: "Ephemeris cycle interval",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Data Points",
      value: telemetry.dataPointsCount,
      decimals: 0,
      suffix: "",
      icon: Layers,
      desc: "Photometric cadence points",
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      label: "SNR",
      value: telemetry.snr,
      decimals: 1,
      suffix: " σ",
      icon: Zap,
      desc: "Signal-to-noise ratio",
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      label: "Duration",
      value: telemetry.durationHours,
      decimals: 2,
      suffix: " h",
      icon: Clock,
      desc: "Ingress to egress time",
      color: "text-cyan-600 bg-cyan-50 border-cyan-200",
    },
    {
      label: "Symmetry",
      value: telemetry.symmetryPercent,
      decimals: 1,
      suffix: "%",
      icon: Scale,
      desc: "Transit profile bilateral fit",
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      label: "Estimated Radius",
      value: telemetry.estimatedRadiusEarth,
      decimals: 2,
      suffix: " R⊕",
      icon: Globe,
      desc: "Planetary radius relative to Earth",
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
      {items.map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.04 }}
        >
          <Card className="border-[var(--border)] shadow-sm hover:border-slate-300 transition-colors">
            <CardContent className="p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[var(--muted-foreground)] truncate">
                  {item.label}
                </span>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-md border ${item.color}`}
                >
                  <item.icon className="h-3 w-3" />
                </div>
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight text-slate-900 font-mono">
                  <AnimatedNumber
                    value={item.value}
                    decimals={item.decimals}
                    suffix={item.suffix}
                  />
                </p>
                <p className="text-[10px] text-[var(--muted-foreground)] truncate mt-0.5">
                  {item.desc}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
