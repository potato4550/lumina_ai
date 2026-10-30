"use client";

import React from "react";
import { DetectionScores } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  ShieldCheck,
  AlertOctagon,
  Cpu,
  BrainCircuit,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";

interface ScoreCardsProps {
  scores: DetectionScores;
}

export function ScoreCards({ scores }: ScoreCardsProps) {
  const cards = [
    {
      label: "Planet Probability",
      value: `${scores.planetProbability}%`,
      sub: "Bayesian Ephemeris Likelihood",
      icon: Sparkles,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      accent: "from-emerald-500/10 to-transparent",
    },
    {
      label: "Confidence Rating",
      value: scores.confidenceLevel,
      sub: "Multi-Instrument Validation",
      icon: ShieldCheck,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      accent: "from-blue-500/10 to-transparent",
    },
    {
      label: "False Positive Rate",
      value: `${scores.falsePositiveRate}%`,
      sub: "Eclipsing Binary Probability",
      icon: AlertOctagon,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      accent: "from-amber-500/10 to-transparent",
    },
    {
      label: "CNN Classifier",
      value: `${scores.cnnScore}%`,
      sub: "1D-ConvNet Feature Score",
      icon: Cpu,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      accent: "from-purple-500/10 to-transparent",
    },
    {
      label: "LLM Physics Score",
      value: `${scores.llmScore}%`,
      sub: "Astro-Physical Consistency",
      icon: BrainCircuit,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      accent: "from-indigo-500/10 to-transparent",
    },
    {
      label: "Overall Score",
      value: `${scores.overallScore}%`,
      sub: "Composite Ensemble Index",
      icon: Award,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      accent: "from-rose-500/10 to-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: idx * 0.04 }}
        >
          <Card className="relative overflow-hidden border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-all">
            <div
              className={`absolute inset-0 bg-gradient-to-b ${card.accent} pointer-events-none`}
            />
            <CardContent className="p-4 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 truncate">
                  {card.label}
                </span>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-md border ${card.color}`}
                >
                  <card.icon className="h-3.5 w-3.5" />
                </div>
              </div>

              <div>
                <p className="text-xl font-extrabold tracking-tight text-slate-900 font-mono">
                  {card.value}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {card.sub}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
