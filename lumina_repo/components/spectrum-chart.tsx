"use client";

import dynamic from "next/dynamic";
import type { SpectrumData } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface SpectrumChartProps {
  data: SpectrumData;
  height?: number;
}

export function SpectrumChart({ data, height = 280 }: SpectrumChartProps) {
  const wavelengths = data.points.map((p) => p.wavelength);
  const depths = data.points.map((p) => p.depth * 1e6); // Convert to ppm

  const annotations = data.detectedGases.map((gas) => ({
    x: gas.wavelength,
    y: Math.max(...depths) * 0.95,
    text: gas.name,
    showarrow: true,
    arrowhead: 0,
    arrowcolor: "#2563EB",
    ax: 0,
    ay: -25,
    font: { size: 10, color: "#2563EB" },
  }));

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">Transmission Spectrum</span>
          <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">
            Wavelength range: {data.wavelengthRange[0]}–{data.wavelengthRange[1]} µm ·
            SNR: {data.spectralSNR}
          </p>
        </div>
        <div className="flex gap-1.5">
          {data.detectedGases.slice(0, 3).map((gas) => (
            <Badge key={gas.name} variant="outline" className="text-[10px]">
              {gas.name}
            </Badge>
          ))}
        </div>
      </div>
      <div className="rounded border border-[var(--border)] bg-[var(--secondary)] p-2">
        <Plot
          data={[
            {
              x: wavelengths,
              y: depths,
              type: "scatter",
              mode: "lines",
              line: { color: "#2563EB", width: 1.5 },
              fill: "tozeroy",
              fillcolor: "rgba(37, 99, 235, 0.08)",
              hovertemplate:
                "λ: %{x:.2f} µm<br>Depth: %{y:.1f} ppm<extra></extra>",
            },
          ]}
          layout={{
            height,
            margin: { t: 10, b: 40, l: 60, r: 20 },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { family: "Inter, system-ui, sans-serif", size: 11, color: "#6B7280" },
            xaxis: {
              title: { text: "Wavelength (µm)", font: { size: 11 } },
              gridcolor: "#E5E7EB",
              zerolinecolor: "#E5E7EB",
            },
            yaxis: {
              title: { text: "Transit Depth (ppm)", font: { size: 11 } },
              gridcolor: "#E5E7EB",
              zerolinecolor: "#E5E7EB",
            },
            annotations,
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
