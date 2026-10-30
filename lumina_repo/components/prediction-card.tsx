"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PredictionResult } from "@/lib/types";

interface PredictionCardProps {
  prediction: PredictionResult;
}

const priorityStyles = {
  High: "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-red-50 text-red-700 border-red-200",
};

export function PredictionCard({ prediction }: PredictionCardProps) {
  const metrics = [
    { label: "Physics Score", value: `${prediction.physicsScore}%` },
    { label: "Transit Depth", value: `${prediction.transitDepth} ppm` },
    { label: "Orbital Period", value: `${prediction.orbitalPeriod} days` },
    { label: "Habitability", value: `${(prediction.habitabilityScore * 100).toFixed(0)}%` },
    { label: "Radius", value: prediction.radius },
    { label: "Eq. Temperature", value: prediction.equilibriumTemp },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                Prediction
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {prediction.candidateId}
              </Badge>
            </div>
            <Badge
              className={`text-[11px] ${priorityStyles[prediction.priority]}`}
            >
              {prediction.priority} Priority
            </Badge>
          </div>
          <CardTitle className="mt-2 text-2xl">
            {prediction.classification}
          </CardTitle>
          <p className="text-xs text-[var(--muted-foreground)]">
            {prediction.candidateName} — {prediction.hostStar}
          </p>
        </CardHeader>

        <CardContent>
          {/* Large confidence display */}
          <div className="mb-4 flex items-baseline gap-3">
            <span className="text-4xl font-bold tracking-tight">
              {prediction.confidence}%
            </span>
            <span className="text-sm text-[var(--muted-foreground)]">
              confidence
            </span>
          </div>

          <div className="mb-4 h-2 overflow-hidden rounded-full bg-[var(--secondary)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${prediction.confidence}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-[var(--primary)]"
            />
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-md border border-[var(--border)] bg-[var(--secondary)] p-3"
              >
                <p className="text-[10px] text-[var(--muted-foreground)]">
                  {m.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold">{m.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
