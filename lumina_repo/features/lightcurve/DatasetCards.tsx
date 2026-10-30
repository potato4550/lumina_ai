"use client";

import React, { useState } from "react";
import { PRESET_CANDIDATES } from "@/lib/mockAnalysis";
import { CandidateDataset } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Check, Orbit, Compass } from "lucide-react";

interface DatasetCardsProps {
  selectedId: string;
  onSelect: (candidate: CandidateDataset) => void;
}

export function DatasetCards({ selectedId, onSelect }: DatasetCardsProps) {
  const [search, setSearch] = useState("");

  const filteredCandidates = PRESET_CANDIDATES.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.hostStar.toLowerCase().includes(q) ||
      c.constellation.toLowerCase().includes(q) ||
      c.spectralType.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            Validated Observatory Benchmarks
          </h3>
        </div>
        <div className="relative w-48 sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search datasets..."
            className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {filteredCandidates.map((candidate) => {
          const isSelected = candidate.id === selectedId;

          return (
            <Card
              key={candidate.id}
              onClick={() => onSelect(candidate)}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? "border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/20"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900">
                        {candidate.name}
                      </span>
                      {isSelected && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {candidate.hostStar}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                    {candidate.constellation}
                  </Badge>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {candidate.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px]">
                  <div>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Orbit className="h-2.5 w-2.5" /> Period
                    </span>
                    <span className="font-mono font-medium text-slate-800">
                      {candidate.orbitalPeriodDays} d
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Compass className="h-2.5 w-2.5" /> Depth
                    </span>
                    <span className="font-mono font-medium text-slate-800">
                      {candidate.transitDepthPpm.toLocaleString()} ppm
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
