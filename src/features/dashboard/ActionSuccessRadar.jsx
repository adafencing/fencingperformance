// src/features/dashboard/ActionSuccessRadar.jsx
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";

const SERIES_COLORS = {
  trainingStroke: "#0d9488",              // teal-600
  trainingFill: "rgba(13,148,136,0.35)",
  compStroke: "#f43f5e",                  // rose-500
  compFill: "rgba(244,63,94,0.30)",
};

// Action label colors (axis tick colors)
const ACTION_LABEL_COLORS = {
  "Attack": "#ef4444",               // red-500
  "Parry–Riposte": "#16a34a",        // green-600 (en dash)
  "Parry-Riposte": "#16a34a",        // green-600 (hyphen fallback)
  "Counter": "#0ea5e9",              // sky-500 (light blue)
  "Second-Intention": "#f59e0b",     // amber-500 (yellow)
  "Second Intention": "#f59e0b",     // fallback without hyphen
};

function SideLabel({ align = "left", color, text }) {
  return (
    <div
      className={`w-24 sm:w-28 md:w-32 text-xs sm:text-sm font-medium text-slate-700 flex items-center ${
        align === "right" ? "justify-end text-right" : "justify-start text-left"
      }`}
      aria-label={`${text} series label`}
    >
      {align === "right" ? (
        <>
          <span className="mr-2 shrink-0 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
          <span>{text}</span>
        </>
      ) : (
        <>
          <span>{text}</span>
          <span className="ml-2 shrink-0 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        </>
      )}
    </div>
  );
}

// Custom tick to render bold, colored action labels
function AngleTick(props) {
  const { payload, x, y, textAnchor } = props;
  const value = payload?.value ?? "";
  const fill = ACTION_LABEL_COLORS[value] || "#334155"; // slate-700 fallback
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill={fill}
      fontWeight="700"
      fontSize="12"
    >
      {value}
    </text>
  );
}

/**
 * data shape:
 * [{ action: "Attack", Training: 72, Competition: 63 }, ...]
 */
export default function ActionSuccessRadar({ data = [] }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        {/* Left side label */}
        <SideLabel align="right" color={SERIES_COLORS.trainingStroke} text="Training" />

        {/* Chart */}
        <div className="flex-1 h-72">
          <ResponsiveContainer>
            <RadarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <PolarGrid />
              <PolarAngleAxis dataKey="action" tick={<AngleTick />} />
              <PolarRadiusAxis domain={[0, 100]} tickCount={6} />
              <Tooltip />
              <Radar
                name="Training"
                dataKey="Training"
                stroke={SERIES_COLORS.trainingStroke}
                fill={SERIES_COLORS.trainingFill}
                fillOpacity={1}
              />
              <Radar
                name="Competition"
                dataKey="Competition"
                stroke={SERIES_COLORS.compStroke}
                fill={SERIES_COLORS.compFill}
                fillOpacity={1}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Right side label */}
        <SideLabel align="left" color={SERIES_COLORS.compStroke} text="Competition" />
      </div>
    </div>
  );
}

