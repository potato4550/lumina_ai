"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-14">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--secondary)] px-2.5 py-1 text-xs text-[var(--muted-foreground)]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Research platform · v2.4.1
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="mt-4 text-4xl font-bold tracking-tight"
            >
              Explainable AI for Exoplanet Discovery
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="mt-3 max-w-lg text-base leading-relaxed text-[var(--muted-foreground)]"
            >
              Analyze astronomical light curves using explainable artificial
              intelligence and physics-based validation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="mt-5 flex flex-wrap items-center gap-3"
            >
              <Link href="/analyze">
                <Button size="lg" className="h-10 px-5">
                  Upload Light Curve
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/analyze">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-10 px-5 text-[var(--muted-foreground)]"
                >
                  <span className="flex items-center gap-2">
                    See how it works
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="shrink-0 rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                Latest detection run
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-green-500" />
                running
              </span>
            </div>
            <div className="rounded border border-[var(--border)] bg-[var(--secondary)] p-3">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-xs text-[var(--muted-foreground)]">
                  KIC 8462852
                </span>
                <span className="text-sm font-semibold">98.7% confidence</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--secondary)]">
                <div className="h-full w-[98.7%] rounded-full bg-[var(--primary)]" />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                <span>21,500 observations</span>
                <span>3.4 day period</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
