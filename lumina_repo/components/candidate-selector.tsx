"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PRELOADED_CANDIDATES } from "@/lib/mock-data";
import type { CandidateInfo } from "@/lib/types";

interface CandidateSelectorProps {
  onSelect: (candidate: CandidateInfo) => void;
  selectedId: string | null;
}

export function CandidateSelector({
  onSelect,
  selectedId,
}: CandidateSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Preloaded Candidates</CardTitle>
        <CardDescription className="text-xs">
          Select a known exoplanet candidate to analyze
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {PRELOADED_CANDIDATES.map((candidate, i) => {
          const isSelected = selectedId === candidate.id;
          return (
            <motion.button
              key={candidate.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              onClick={() => onSelect(candidate)}
              className={`flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors ${
                isSelected
                  ? "border-[var(--primary)] bg-primary/5"
                  : "border-[var(--border)] bg-white hover:border-primary/40 hover:bg-[var(--secondary)]"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium truncate">
                    {candidate.name}
                  </span>
                  <span className="shrink-0 rounded bg-[var(--secondary)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)]">
                    {candidate.spectralType}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">
                  {candidate.hostStar} ·{" "}
                  {candidate.observations.toLocaleString()} obs
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-mono text-[var(--muted-foreground)]">
                  P = {candidate.orbitalPeriod} d
                </p>
              </div>
            </motion.button>
          );
        })}
      </CardContent>
    </Card>
  );
}
