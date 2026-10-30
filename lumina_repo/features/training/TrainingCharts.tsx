"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrainingMetrics } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, Award } from "lucide-react";

interface TrainingChartsProps {
  metrics: TrainingMetrics[];
  totalEpochs: number;
}

export function TrainingCharts({ metrics, totalEpochs }: TrainingChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Loss Graph */}
      <Card className="border-slate-200 bg-white">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-50 border border-rose-200 text-rose-600">
                <TrendingDown className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">
                  Binary Cross-Entropy Loss
                </h4>
                <p className="text-[10px] text-slate-500">
                  Training vs Validation Loss per epoch
                </p>
              </div>
            </div>
            {metrics.length > 0 && (
              <span className="font-mono text-xs font-bold text-rose-600">
                Loss: {metrics[metrics.length - 1].loss.toFixed(4)}
              </span>
            )}
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics}
                margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="epoch"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  domain={[1, totalEpochs]}
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TrainingMetrics;
                      return (
                        <div className="rounded border border-slate-200 bg-white p-2 text-[11px] shadow">
                          <p className="font-semibold text-slate-800">Epoch {data.epoch}</p>
                          <p className="text-rose-600">Train Loss: {data.loss.toFixed(4)}</p>
                          <p className="text-amber-600">Val Loss: {data.valLoss.toFixed(4)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="loss"
                  name="Training Loss"
                  stroke="#e11d48"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="valLoss"
                  name="Validation Loss"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Accuracy Graph */}
      <Card className="border-slate-200 bg-white">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 border border-emerald-200 text-emerald-600">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">
                  Model Classification Accuracy
                </h4>
                <p className="text-[10px] text-slate-500">
                  Transit vs Noise Discrimination Rate
                </p>
              </div>
            </div>
            {metrics.length > 0 && (
              <span className="font-mono text-xs font-bold text-emerald-600">
                Val Acc: {(metrics[metrics.length - 1].valAccuracy * 100).toFixed(1)}%
              </span>
            )}
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics}
                margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="epoch"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  domain={[1, totalEpochs]}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  domain={[0.5, 1.0]}
                  tickFormatter={(v) => `${Math.round(v * 100)}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TrainingMetrics;
                      return (
                        <div className="rounded border border-slate-200 bg-white p-2 text-[11px] shadow">
                          <p className="font-semibold text-slate-800">Epoch {data.epoch}</p>
                          <p className="text-blue-600">Train Acc: {(data.accuracy * 100).toFixed(1)}%</p>
                          <p className="text-emerald-600">Val Acc: {(data.valAccuracy * 100).toFixed(1)}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  name="Training Accuracy"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="valAccuracy"
                  name="Validation Accuracy"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
