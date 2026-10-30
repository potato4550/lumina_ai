"use client";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { AnalysisResult } from "@/types";

export async function generateExoplanetPDF(analysis: AnalysisResult): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait in points
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  // Colors
  const darkNavy = rgb(0.06, 0.09, 0.16); // #0f172a
  const nasaBlue = rgb(0.15, 0.39, 0.92); // #2563eb
  const slateText = rgb(0.39, 0.45, 0.55); // #64748b
  const lightBg = rgb(0.96, 0.97, 0.98); // #f8fafc
  const lineBorder = rgb(0.88, 0.91, 0.94); // #e2e8f0
  const greenVerdict = rgb(0.09, 0.64, 0.29); // #16a34a

  let y = height - 40;

  // 1. Top Header Banner
  page.drawRectangle({
    x: 35,
    y: y - 55,
    width: width - 70,
    height: 60,
    color: lightBg,
    borderColor: lineBorder,
    borderWidth: 1,
  });

  page.drawText("LUMINA ASTROPHYSICAL OBSERVATORY & EXOPLANET ARCHIVE", {
    x: 48,
    y: y - 20,
    size: 9,
    font: fontBold,
    color: nasaBlue,
  });

  page.drawText("EXOPLANET CANDIDATE VALIDATION REPORT", {
    x: 48,
    y: y - 36,
    size: 14,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText(`MISSION ID: ${analysis.id}  |  DATE: ${new Date(analysis.timestamp).toUTCString().slice(0, 22)}`, {
    x: 48,
    y: y - 48,
    size: 7.5,
    font: fontMono,
    color: slateText,
  });

  y -= 75;

  // 2. Target Identification & Verdict Banner
  page.drawRectangle({
    x: 35,
    y: y - 35,
    width: width - 70,
    height: 38,
    color: rgb(0.93, 0.98, 0.94),
    borderColor: rgb(0.74, 0.91, 0.77),
    borderWidth: 1,
  });

  page.drawText(`TARGET: ${analysis.candidate.name.toUpperCase()}  (${analysis.candidate.hostStar})`, {
    x: 48,
    y: y - 16,
    size: 11,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText("VERDICT: HIGH-CONFIDENCE EXOPLANET CANDIDATE (VALIDATED)", {
    x: 48,
    y: y - 28,
    size: 8.5,
    font: fontBold,
    color: greenVerdict,
  });

  page.drawText(`PROBABILITY: ${analysis.scores.planetProbability}%`, {
    x: width - 180,
    y: y - 20,
    size: 11,
    font: fontBold,
    color: greenVerdict,
  });

  y -= 50;

  // 3. Score Breakdown Box
  page.drawText("I. MULTI-MODEL DETECTION CONFIDENCE METRICS", {
    x: 35,
    y,
    size: 9,
    font: fontBold,
    color: darkNavy,
  });

  y -= 14;

  const scoreItems = [
    { label: "Planet Probability", val: `${analysis.scores.planetProbability}%` },
    { label: "Confidence Level", val: analysis.scores.confidenceLevel },
    { label: "False Positive Rate", val: `${analysis.scores.falsePositiveRate}%` },
    { label: "1D-CNN Score", val: `${analysis.scores.cnnScore}%` },
    { label: "LLM Reasoning Score", val: `${analysis.scores.llmScore}%` },
    { label: "Overall Score", val: `${analysis.scores.overallScore}%` },
  ];

  const colWidth = (width - 70) / 6;
  scoreItems.forEach((item, i) => {
    const xPos = 35 + i * colWidth;
    page.drawRectangle({
      x: xPos,
      y: y - 32,
      width: colWidth - 4,
      height: 32,
      color: lightBg,
      borderColor: lineBorder,
      borderWidth: 1,
    });
    page.drawText(item.label, {
      x: xPos + 5,
      y: y - 12,
      size: 6,
      font: fontRegular,
      color: slateText,
    });
    page.drawText(item.val, {
      x: xPos + 5,
      y: y - 25,
      size: 9,
      font: fontBold,
      color: darkNavy,
    });
  });

  y -= 48;

  // 4. Astrophysical Ephemeris Parameters Table
  page.drawText("II. DERIVED ASTROPHYSICAL PARAMETERS", {
    x: 35,
    y,
    size: 9,
    font: fontBold,
    color: darkNavy,
  });

  y -= 14;

  const telemetryItems = [
    [
      { label: "Host Star", val: analysis.candidate.hostStar },
      { label: "Spectral Type", val: analysis.candidate.spectralType },
      { label: "Transit Depth", val: `${analysis.telemetry.transitDepthPpm} ppm` },
    ],
    [
      { label: "Orbital Period", val: `${analysis.telemetry.orbitalPeriodDays} days` },
      { label: "Transit Duration", val: `${analysis.telemetry.durationHours} hours` },
      { label: "Signal-to-Noise", val: `${analysis.telemetry.snr} sigma` },
    ],
    [
      { label: "Estimated Radius", val: `${analysis.telemetry.estimatedRadiusEarth} Earth Radii` },
      { label: "Profile Symmetry", val: `${analysis.telemetry.symmetryPercent}%` },
      { label: "Distance", val: `${analysis.candidate.distanceLightYears} light-years` },
    ],
  ];

  telemetryItems.forEach((row) => {
    row.forEach((cell, ci) => {
      const xPos = 35 + ci * 175;
      page.drawText(`${cell.label}:`, {
        x: xPos,
        y: y - 10,
        size: 7.5,
        font: fontRegular,
        color: slateText,
      });
      page.drawText(cell.val, {
        x: xPos + 80,
        y: y - 10,
        size: 7.5,
        font: fontBold,
        color: darkNavy,
      });
    });
    y -= 14;
  });

  y -= 20;

  // 5. Atmospheric Transmission Biosignature Inventory
  page.drawText("III. ATMOSPHERIC SPECTROSCOPY & GAS ABUNDANCES", {
    x: 35,
    y,
    size: 9,
    font: fontBold,
    color: darkNavy,
  });

  y -= 14;

  const gasColWidth = (width - 70) / 4;
  analysis.detectedGases.forEach((gas, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const xPos = 35 + col * gasColWidth;
    const yPos = y - row * 34;

    page.drawRectangle({
      x: xPos,
      y: yPos - 26,
      width: gasColWidth - 4,
      height: 28,
      color: lightBg,
      borderColor: lineBorder,
      borderWidth: 1,
    });

    page.drawText(`${gas.name} (${gas.formula})`, {
      x: xPos + 5,
      y: yPos - 10,
      size: 7,
      font: fontBold,
      color: darkNavy,
    });

    page.drawText(`Confidence: ${gas.confidence}% | ${gas.abundance} ${gas.abundanceUnit}`, {
      x: xPos + 5,
      y: yPos - 21,
      size: 6.5,
      font: fontRegular,
      color: slateText,
    });
  });

  y -= 80;

  // 6. Explainable AI Reasoning & Synthesis
  page.drawText("IV. EXPLAINABLE AI REASONING & DECISION CONCLUSION", {
    x: 35,
    y,
    size: 9,
    font: fontBold,
    color: darkNavy,
  });

  y -= 12;

  page.drawRectangle({
    x: 35,
    y: y - 65,
    width: width - 70,
    height: 65,
    color: lightBg,
    borderColor: lineBorder,
    borderWidth: 1,
  });

  const conclusionLines = [
    analysis.decisionConclusion.slice(0, 95),
    analysis.decisionConclusion.slice(95, 190),
    analysis.decisionConclusion.slice(190, 285),
    analysis.decisionConclusion.slice(285),
  ];

  conclusionLines.forEach((l, idx) => {
    if (l) {
      page.drawText(l.trim(), {
        x: 45,
        y: y - 14 - idx * 11,
        size: 7.5,
        font: fontRegular,
        color: darkNavy,
      });
    }
  });

  y -= 80;

  // 7. Follow-up Recommendations
  page.drawText("V. OFFICIAL SCIENTIFIC RECOMMENDATIONS", {
    x: 35,
    y,
    size: 9,
    font: fontBold,
    color: darkNavy,
  });

  y -= 14;

  analysis.recommendations.forEach((rec, idx) => {
    page.drawText(`[${idx + 1}]  ${rec}`, {
      x: 45,
      y: y - 10,
      size: 7.5,
      font: fontRegular,
      color: darkNavy,
    });
    y -= 14;
  });

  // 8. Footer & Sign-off
  page.drawLine({
    start: { x: 35, y: 45 },
    end: { x: width - 35, y: 45 },
    thickness: 0.5,
    color: lineBorder,
  });

  page.drawText("Lumina Astro-Informatics Platform — Generated in browser via WebGL CNN & TensorFlow.js", {
    x: 35,
    y: 32,
    size: 7,
    font: fontRegular,
    color: slateText,
  });

  page.drawText("CONFIDENTIAL SCIENTIFIC REPORT — FOR ASTRONOMICAL VALIDATION USE ONLY", {
    x: width - 305,
    y: 32,
    size: 6.5,
    font: fontBold,
    color: slateText,
  });

  // Compile PDF bytes
  const pdfBytes = await pdfDoc.save();

  // Trigger browser file download
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Lumina_Exoplanet_Report_${analysis.candidate.name.replace(/\s+/g, "_")}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
