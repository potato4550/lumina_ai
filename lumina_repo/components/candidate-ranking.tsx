"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { CandidateRankRow, CandidateStatus, PriorityLevel } from "@/lib/types";

interface CandidateRankingProps {
  candidates: CandidateRankRow[];
}

const statusStyles: Record<CandidateStatus, string> = {
  Confirmed: "bg-green-50 text-green-700 border-green-200",
  Likely: "bg-blue-50 text-blue-700 border-blue-200",
  "Needs Review": "bg-amber-50 text-amber-700 border-amber-200",
  Unlikely: "bg-red-50 text-red-700 border-red-200",
};

const priorityStyles: Record<PriorityLevel, string> = {
  High: "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-red-50 text-red-700 border-red-200",
};

export function CandidateRanking({ candidates }: CandidateRankingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Candidate Ranking</CardTitle>
            <span className="text-[10px] text-[var(--muted-foreground)]">
              {candidates.length} candidates
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">Candidate</TableHead>
                  <TableHead className="text-[11px] text-right">
                    Confidence
                  </TableHead>
                  <TableHead className="text-[11px] text-right">
                    Physics Score
                  </TableHead>
                  <TableHead className="text-[11px]">Priority</TableHead>
                  <TableHead className="text-[11px]">Status</TableHead>
                  <TableHead className="text-[11px]">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="border-b border-[var(--border)] hover:bg-[var(--secondary)] transition-colors"
                  >
                    <TableCell>
                      <div>
                        <span className="text-xs font-medium">
                          {c.candidate}
                        </span>
                        <p className="text-[10px] font-mono text-[var(--muted-foreground)]">
                          {c.id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`text-xs font-mono font-medium ${
                          c.confidence >= 95
                            ? "text-green-600"
                            : c.confidence >= 80
                              ? "text-[var(--primary)]"
                              : "text-red-500"
                        }`}
                      >
                        {c.confidence.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-xs font-mono text-[var(--muted-foreground)]">
                        {c.physicsScore.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${priorityStyles[c.priority]}`}
                      >
                        {c.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${statusStyles[c.status]}`}
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {c.chips.map((chip) => (
                          <span
                            key={chip}
                            className="rounded border border-[var(--border)] bg-[var(--secondary)] px-1.5 py-0.5 text-[9px] text-[var(--muted-foreground)] whitespace-nowrap"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
