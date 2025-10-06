// src/features/dashboard/ActionSuccessRadar.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// === Label color + size settings ===
const AXIS_LABEL_FONT_SIZE = 20; // tweak if you want bigger/smaller

// Normalize label (remove different dash types, collapse spaces, lowercase)
const normalizeLabel = (raw) =>
  String(raw || "")
    .toLowerCase()
    .replace(/[‐-‒–—-]/g, " ") // various hyphens/dashes -> space
    .replace(/\s+/g, " ")
    .trim();

// Map normalized labels to colors
const CATEGORY_COLOR_BY_KEY = {
  attack: "#ef4444",            // red
  "parry riposte": "#10b981",   // green
  counter: "#60a5fa",           // light blue
  "second intention": "#f59e0b" // yellow
};

// ✨ NEW: Map normalized full labels → short labels (edit as you wish)
const SHORT_LABEL_BY_KEY = {
  attack: "ATT",
  "parry riposte": "P-R",
  counter: "CTR",
  "second intention": "2IN",
};

// Fallback abbreviation builder if a label isn't in SHORT_LABEL_BY_KEY
const buildAbbrev = (original) => {
  const norm = normalizeLabel(original);
  if (!norm) return "";
  const parts = norm.split(" ");
  if (parts.length >= 2) {
    // Take initials of up to first 2–3 words, e.g. "second intention" -> "SI"
    return parts.slice(0, 3).map(w => w[0]).join("").toUpperCase();
  }
  // Single word: first 3 chars uppercased
  return norm.slice(0, 3).toUpperCase();
};

// Get the short label we will render on the axis
const getShortLabel = (original) => {
  const norm = normalizeLabel(original);
  return SHORT_LABEL_BY_KEY[norm] || buildAbbrev(original);
};

export default function ActionSuccessRadar({ data = [], height }) {
  // Auto-detect label key
  const labelKey = useMemo(() => {
    if (!data || !data.length) return "label";
    const candidates = ["label", "axis", "action", "name"];
    const keys = Object.keys(data[0] || {});
    return candidates.find((k) => keys.includes(k)) || "label";
  }, [data]);

  // Auto-detect numeric series (e.g., ["Training", "Competition"] or ["value"])
  const seriesKeys = useMemo(() => {
    if (!data || !data.length) return ["value"];
    const sample = data[0];
    return Object.keys(sample).filter((k) => {
      if (k === labelKey) return false;
      const v = sample[k];
      return typeof v === "number" && Number.isFinite(v);
    });
  }, [data, labelKey]);

  // Responsive height (taller on phones) unless explicitly provided
  const [autoH, setAutoH] = useState(420);
  useEffect(() => {
    if (height) return; // respect explicit height
    const compute = () => {
      const w = window.innerWidth || 1024;
      if (w < 360) return 520;
      if (w < 420) return 500;
      if (w < 480) return 480;
      if (w < 640) return 460;
      if (w < 768) return 420;
      if (w < 1024) return 400;
      return 420;
    };
    const apply = () => setAutoH(compute());
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [height]);

  const H = height || autoH;

  // Series colors (lines/fills)
  const palette = ["#2563eb", "#f59e0b", "#10b981", "#ef4444"];

  // Keep the legend from overlapping the chart when shown
  const topMargin = seriesKeys.length > 1 ? 40 : 12;

  // Colored/bigger axis labels — now using short labels
  const renderColoredTick = (props) => {
    const { x, y, payload, textAnchor } = props;
    const original = String(payload?.value ?? "");
    const normalized = normalizeLabel(original);
    const fill = CATEGORY_COLOR_BY_KEY[normalized] || "#0f172a"; // slate-900 default
    const shortText = getShortLabel(original);

    return (
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        fill={fill}
        fontWeight={700}
        fontSize={AXIS_LABEL_FONT_SIZE}
      >
        {shortText}
      </text>
    );
  };

  return (
    <div style={{ width: "100%", height: H }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: topMargin, right: 24, bottom: 12, left: 24 }}>
          <PolarGrid />

          {/* Shortened, colored axis labels */}
          <PolarAngleAxis dataKey={labelKey} tick={renderColoredTick} />

          {/* 🔕 Hide radial tick labels (0%, 25%, 50%, 75%, 100%) */}
          <PolarRadiusAxis angle={0} domain={[0, 100]} tick={false} />

          {/* Tooltip still shows values as percentages; remove formatter if you want raw numbers */}
          <Tooltip formatter={(v) => `${v}%`} />

          {/* One or more series */}
          {seriesKeys.map((key, idx) => (
            <Radar
              key={key}
              name={key}
              dataKey={key}
              stroke={palette[idx % palette.length]}
              fill={palette[idx % palette.length]}
              fillOpacity={0.45}
            />
          ))}

          {/* Series labels in the top-right corner */}
          {seriesKeys.length > 1 && (
            <Legend
              verticalAlign="top"
              align="right"
              layout="horizontal"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ top: 0, right: 0, lineHeight: "16px" }}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

