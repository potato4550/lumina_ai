"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface TrainingProgressProps {
  currentStage: string;
  overallProgress: number;
  totalStages: number;
  completedStages: number;
}

export function TrainingProgress({
  currentStage,
  overallProgress,
  totalStages,
  completedStages,
}: TrainingProgressProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium">Overall Progress</span>
        <span className="text-xs font-mono text-[var(--muted-foreground)]">
          {completedStages}/{totalStages} stages
        </span>
      </div>

      <Progress value={overallProgress} className="h-2" />

      <div className="mt-3 flex items-center justify-between">
        <motion.span
          key={currentStage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-[var(--muted-foreground)]"
        >
          {completedStages < totalStages ? (
            <>
              Running:{" "}
              <span className="font-medium text-[var(--foreground)]">
                {currentStage}
              </span>
            </>
          ) : (
            <span className="font-medium text-green-600">
              Analysis complete
            </span>
          )}
        </motion.span>
        <span className="text-sm font-semibold">
          {Math.round(overallProgress)}%
        </span>
      </div>
    </div>
  );
}
