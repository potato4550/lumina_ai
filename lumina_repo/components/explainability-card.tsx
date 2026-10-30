"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import type { ExplainabilityData } from "@/lib/types";

interface ExplainabilityCardProps {
  data: ExplainabilityData;
}

export function ExplainabilityCard({ data }: ExplainabilityCardProps) {
  return (
    <div className="space-y-4">
      {/* Why did the AI predict this? */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            Why did the AI predict this?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {data.reasons.map((reason, i) => (
            <motion.div
              key={reason.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06 }}
              className="flex items-start gap-2.5"
            >
              {reason.passed ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              )}
              <div>
                <span className="text-xs font-medium">{reason.label}</span>
                <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">
                  {reason.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Feature Importance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Feature Importance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.featureImportance.map((f) => (
            <div key={f.feature}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)]">
                  {f.feature}
                </span>
                <span className="text-xs font-medium">
                  {(f.importance * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--secondary)]">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${f.importance * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className={`h-full rounded-full ${
                    f.direction === "positive"
                      ? "bg-[var(--primary)]"
                      : "bg-red-400"
                  }`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Attention Visualization */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Attention Visualization</CardTitle>
            <span className="text-[10px] text-[var(--muted-foreground)]">
              t₀ ± 3.0 days
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded border border-[var(--border)] bg-[var(--secondary)] p-2">
            <div className="flex gap-0.5">
              {data.attentionWeights.map((weight, i) => {
                const inTransit = i >= 24 && i <= 36;
                return (
                  <div
                    key={i}
                    className="h-8 w-1 rounded-sm"
                    style={{
                      opacity: weight,
                      backgroundColor: inTransit
                        ? "rgba(37, 99, 235, 0.9)"
                        : "rgba(107, 114, 128, 0.12)",
                    }}
                  />
                );
              })}
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
              <span>−3.0 d</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1.5 rounded-full bg-[var(--primary)]" />
                <span className="text-[var(--primary)]">Transit window</span>
              </div>
              <span>+3.0 d</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Confidence Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {data.confidenceBreakdown.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {item.label}
                  </span>
                  <span className="text-xs font-medium">{item.value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--secondary)]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Stacked bar summary */}
          <div className="mt-4 flex h-3 overflow-hidden rounded-full">
            {data.confidenceBreakdown.map((item) => (
              <motion.div
                key={item.label}
                initial={{ width: 0 }}
                whileInView={{ width: `${item.value}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="h-full first:rounded-l-full last:rounded-r-full"
                style={{ backgroundColor: item.color }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
