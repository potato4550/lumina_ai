"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, FileText } from "lucide-react";
import type { ReportData } from "@/lib/types";

interface ReportCardProps {
  report: ReportData;
}

export function ReportCard({ report }: ReportCardProps) {
  const handleDownload = () => {
    alert(
      "PDF generation will be available when the backend is connected.\n\nReport: " +
        report.title
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--primary)]" />
              <CardTitle className="text-sm">Scientific Report</CardTitle>
            </div>
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download PDF
            </Button>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {report.title}
          </p>
          <p className="text-[10px] text-[var(--muted-foreground)]">
            Generated: {new Date(report.generatedAt).toLocaleDateString()} ·
            Candidate: {report.candidateId}
          </p>
        </CardHeader>

        <CardContent className="space-y-0">
          {report.sections.map((section, i) => (
            <div key={section.title}>
              {i > 0 && <Separator className="my-3" />}
              <div>
                <h4 className="text-xs font-semibold">{section.title}</h4>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted-foreground)]">
                  {section.content}
                </p>
              </div>
            </div>
          ))}

          <Separator className="my-3" />

          {/* Recommendation banner */}
          <div className="rounded-md border border-green-200 bg-green-50 p-3">
            <p className="text-xs font-semibold text-green-700">
              Recommendation
            </p>
            <p className="mt-0.5 text-[11px] text-green-800">
              {report.recommendation}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
