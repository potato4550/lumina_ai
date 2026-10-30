"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { TrainingProgress } from "@/components/training-progress";
import { PIPELINE_STAGES } from "@/lib/mock-data";
import type { PipelineStage, PipelineStageStatus } from "@/lib/types";

interface PipelineStepperProps {
  onComplete: () => void;
}

export function PipelineStepper({ onComplete }: PipelineStepperProps) {
  const [stages, setStages] = useState<PipelineStage[]>(() =>
    PIPELINE_STAGES.map((s) => ({ ...s, status: "pending" as PipelineStageStatus }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);

  const totalStages = stages.length;
  const completedStages = stages.filter((s) => s.status === "complete").length;
  const currentStage = stages[currentIndex]?.label ?? "Complete";
  const overallProgress = (completedStages / totalStages) * 100;

  const advanceStage = useCallback(() => {
    setStages((prev) => {
      const next = [...prev];
      if (currentIndex < next.length) {
        next[currentIndex] = { ...next[currentIndex], status: "complete" };
      }
      if (currentIndex + 1 < next.length) {
        next[currentIndex + 1] = {
          ...next[currentIndex + 1],
          status: "running",
        };
      }
      return next;
    });
    setCurrentIndex((prev) => prev + 1);
    setStageProgress(0);
  }, [currentIndex]);

  // Start the first stage
  useEffect(() => {
    setStages((prev) => {
      const next = [...prev];
      next[0] = { ...next[0], status: "running" };
      return next;
    });
  }, []);

  // Animate stage progress
  useEffect(() => {
    if (currentIndex >= totalStages) {
      onComplete();
      return;
    }

    const duration = stages[currentIndex]?.durationMs ?? 2000;
    const tick = 100;
    const increment = (tick / duration) * 100;

    const interval = setInterval(() => {
      setStageProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(interval);
          advanceStage();
          return 100;
        }
        return next;
      });
    }, tick);

    return () => clearInterval(interval);
  }, [currentIndex, totalStages, stages, advanceStage, onComplete]);

  return (
    <div className="space-y-4">
      <TrainingProgress
        currentStage={currentStage}
        overallProgress={overallProgress}
        totalStages={totalStages}
        completedStages={completedStages}
      />

      <div className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-medium">Analysis Pipeline</h3>

        <div className="relative space-y-0">
          {/* Vertical connector line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[var(--border)]" />

          {stages.map((stage, i) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="relative flex items-start gap-3 py-2.5"
            >
              {/* Status icon */}
              <div className="relative z-10 shrink-0">
                <AnimatePresence mode="wait">
                  {stage.status === "complete" ? (
                    <motion.div
                      key="complete"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CheckCircle2 className="h-[30px] w-[30px] text-green-500" />
                    </motion.div>
                  ) : stage.status === "running" ? (
                    <motion.div
                      key="running"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Loader2 className="h-[30px] w-[30px] animate-spin text-[var(--primary)]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pending"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Circle className="h-[30px] w-[30px] text-[var(--border)]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${
                      stage.status === "complete"
                        ? "text-green-600"
                        : stage.status === "running"
                          ? "text-[var(--foreground)]"
                          : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {stage.label}
                  </span>
                  {stage.status === "running" && (
                    <span className="text-[10px] text-[var(--primary)] animate-pulse-subtle">
                      Processing...
                    </span>
                  )}
                  {stage.status === "complete" && (
                    <span className="text-[10px] text-green-600">Done</span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                  {stage.description}
                </p>

                {/* Per-stage progress */}
                {stage.status === "running" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-[var(--secondary)]"
                  >
                    <motion.div
                      className="h-full rounded-full bg-[var(--primary)]"
                      style={{ width: `${stageProgress}%` }}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
