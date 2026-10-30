"use client";

import dynamic from "next/dynamic";
import type { LightCurveData } from "@/lib/types";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface LightCurveChartProps {
  data: LightCurveData;
  height?: number;
}

export function LightCurveChart({ data, height = 280 }: LightCurveChartProps) {
  const times = data.points.map((p) => p.time);
  const fluxes = data.points.map((p) => p.flux);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Light Curve — {data.targetName}
            </span>
            <span className="rounded bg-green-50 border border-green-200 px-1.5 py-0.5 text-[10px] text-green-600 font-medium">
              Transit detected
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">
            Cadence: {data.cadence} · {data.observations.toLocaleString()}{" "}
            observations
          </p>
        </div>
      </div>
      <div className="rounded border border-[var(--border)] bg-[var(--secondary)] p-2">
        <Plot
          data={[
            {
              x: times,
              y: fluxes,
              type: "scattergl",
              mode: "markers",
              marker: {
                color: "#2563EB",
                size: 2.5,
                opacity: 0.6,
              },
              hovertemplate:
                "Time: %{x:.2f} d<br>Flux: %{y:.6f}<extra></extra>",
            },
          ]}
          layout={{
            height,
            margin: { t: 10, b: 40, l: 60, r: 20 },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { family: "Inter, system-ui, sans-serif", size: 11, color: "#6B7280" },
            xaxis: {
              title: { text: "Time (days)", font: { size: 11 } },
              gridcolor: "#E5E7EB",
              zerolinecolor: "#E5E7EB",
            },
            yaxis: {
              title: { text: "Relative Flux", font: { size: 11 } },
              gridcolor: "#E5E7EB",
              zerolinecolor: "#E5E7EB",
            },
          }}
          config={{
            displayModeBar: false,
            responsive: true,
          }}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
