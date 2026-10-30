"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Brain,
  ShieldCheck,
  FileText,
  ArrowRight,
  Database,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload Light Curve",
    description:
      "Import CSV data from Kepler, TESS, or ground-based observatories. Select from preloaded candidates or bring your own.",
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "6-layer CNN evaluates transit signals through noise reduction, feature extraction, and physics-based validation.",
  },
  {
    icon: ShieldCheck,
    title: "Explainable Predictions",
    description:
      "Every prediction includes a chain of evidence, feature contributions, and attention maps for full transparency.",
  },
  {
    icon: FileText,
    title: "Scientific Reports",
    description:
      "Generate comprehensive reports with prediction summaries, gas detection, and recommendations for follow-up.",
  },
];

const pipelineSteps = [
  { icon: Database, label: "Data Ingestion", detail: "Raw photometry from MAST archive" },
  { icon: BarChart3, label: "Signal Processing", detail: "Detrending, BLS periodogram" },
  { icon: Brain, label: "Neural Detection", detail: "6-layer Transformer evaluation" },
  { icon: CheckCircle2, label: "Physics Validation", detail: "12 constraint checks" },
];

const stats = [
  { value: "12,847", label: "Candidates analyzed" },
  { value: "94.2%", label: "Detection precision" },
  { value: "847", label: "Confirmed detections" },
  { value: "14.2 TB", label: "Data processed" },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* Features */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-14">
          <div className="mb-8">
            <p className="text-xs font-medium text-[var(--primary)]">
              Capabilities
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">
              End-to-end detection pipeline
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
              From raw photometry to validated planet candidates — every step is
              transparent, reproducible, and explainable.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="group rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--secondary)] transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                  <feature.icon className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)]" />
                </div>
                <h3 className="text-sm font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted-foreground)]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline Overview */}
      <section className="border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto max-w-[1200px] px-6 py-14">
          <div className="mb-8 flex items-baseline justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--primary)]">
                How it works
              </p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight">
                Detection Pipeline
              </h2>
            </div>
            <div className="hidden items-center gap-2 text-xs text-[var(--muted-foreground)] sm:flex">
              <div className="h-px w-8 bg-[var(--border)]" />
              <span>4 stages</span>
              <div className="h-px w-8 bg-[var(--border)]" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pipelineSteps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="flex flex-col items-center rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm text-center"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-primary/5">
                  <step.icon className="h-4.5 w-4.5 text-[var(--primary)]" />
                </div>
                <span className="text-[10px] font-medium text-[var(--primary)] uppercase tracking-wide">
                  {i + 1}. {step.label}
                </span>
                <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                  {step.detail}
                </p>
                {i < pipelineSteps.length - 1 && (
                  <ArrowRight className="mt-3 h-3 w-3 text-[var(--border)] rotate-90 lg:hidden" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-14">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm"
              >
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="/analyze">
              <Button size="lg" className="h-10 px-6">
                Start Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
