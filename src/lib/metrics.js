/**
 * src/lib/metrics.js
 * Shared metric utilities for the app.
 */

/* ------------------------- Basic helpers ------------------------- */

/** Safe divide: returns 0 when denominator is falsy. */
export const div = (a, b) => (b ? a / b : 0);

/** Clamp a number to [0, 1], treating undefined/null as 0. */
export const clamp01 = (x) => Math.max(0, Math.min(1, x || 0));


/* -------------------- Composite Efficiency (CES) -------------------- */
/**
 * Compute Composite Efficiency Score (CES) from action totals.
 * Expects an object with summed attempts & points for each action family:
 *   { A_ATT, P_ATT, A_PR, P_PR, A_CNT, P_CNT, A_SI, P_SI }
 * Returns { CES } where CES is 0–100 integer.
 */
export function computeCESFromTotals(t = {}) {
  const A =
    (t.A_ATT || 0) +
    (t.A_PR  || 0) +
    (t.A_CNT || 0) +
    (t.A_SI  || 0);

  const P =
    (t.P_ATT || 0) +
    (t.P_PR  || 0) +
    (t.P_CNT || 0) +
    (t.P_SI  || 0);

  const ratio = A > 0 ? P / A : 0;
  const CES = Math.round(clamp01(ratio) * 100);
  return { CES };
}


/* ---------------- Season Efficiency (SE) utilities ---------------- */
/** Sum touches made (points scored) across bouts rows. */
export function sumTouchesMade(rows = []) {
  return rows.reduce(
    (acc, r) =>
      acc +
      (+r.P_ATT || 0) +
      (+r.P_PR  || 0) +
      (+r.P_CNT || 0) +
      (+r.P_SI  || 0),
    0
  );
}

/** Count victories in a list of bouts (expects b.result = 'W'|'L'). */
export function countVictories(rows = []) {
  return rows.reduce(
    (acc, b) => acc + (String(b.result || "").toUpperCase() === "W" ? 1 : 0),
    0
  );
}

/** Linear factor with caps for workload normalization. */
function cappedLinearFactor(ratio, minCap = 0.6, maxCap = 1.2) {
  const r = clamp01(ratio);
  return Math.max(minCap, Math.min(maxCap, minCap + (maxCap - minCap) * r));
}

/**
 * Compute Season Efficiency (SE) per definition:
 *   SE = BaseSuccess × WorkloadIndex  (mapped to 0–100)
 *
 * BaseSuccess:
 *   totalVictories(T+C) / totalBouts(T+C)
 *
 * WorkloadIndex (weighted & capped):
 *   - boutsFactor:   cappedLinear(totalBouts / targetBouts)
 *   - lessonsFactor: cappedLinear(lessonsCount / targetLessons)
 *   - touchesFactor: cappedLinear(totalTouches / targetTouches)
 *
 * WorkloadIndex = wB*boutsFactor + wL*lessonsFactor + wT*touchesFactor
 *
 * Defaults are reasonable; can be wired to settings if needed later.
 */
export function computeSeasonEfficiency({
  trainingBouts = [],
  compBouts = [],
  lessons = [],
  targets = { bouts: 150, lessons: 30, touches: 800 },
  caps = { min: 0.6, max: 1.2 },
  weights = { bouts: 0.4, lessons: 0.3, touches: 0.3 },
} = {}) {
  const allBouts = [...trainingBouts, ...compBouts];

  const totalBouts = allBouts.length;
  const victories  = countVictories(allBouts);
  const baseSuccess = totalBouts ? victories / totalBouts : 0;

  const touchesTotal = sumTouchesMade(allBouts);
  const lessonsCount = lessons.length;

  // Workload factors
  const boutsFactor   = cappedLinearFactor(div(totalBouts, targets.bouts), caps.min, caps.max);
  const lessonsFactor = cappedLinearFactor(div(lessonsCount, targets.lessons), caps.min, caps.max);
  const touchesFactor = cappedLinearFactor(div(touchesTotal, targets.touches), caps.min, caps.max);

  const workloadIndex =
    (weights.bouts   ?? 0.4) * boutsFactor +
    (weights.lessons ?? 0.3) * lessonsFactor +
    (weights.touches ?? 0.3) * touchesFactor;

  // Final SE (0–100)
  const SE = Math.round(Math.min(1, baseSuccess * workloadIndex) * 100);

  return {
    SE, // 0–100
    baseSuccessPct: Math.round(baseSuccess * 100),
    workloadIndex: Number(workloadIndex.toFixed(2)),
    factors: {
      boutsFactor: Number(boutsFactor.toFixed(2)),
      lessonsFactor: Number(lessonsFactor.toFixed(2)),
      touchesFactor: Number(touchesFactor.toFixed(2)),
    },
    totals: {
      victories,
      totalBouts,
      touchesTotal,
      lessonsCount,
    },
  };
}


/* --------- Action Points Share % for Radar (Training vs Comp) --------- */
/**
 * Compute points-share % by action family, separately for Training & Competition.
 * Each series is normalized by its own total points so values are 0–100.
 *
 * Returned shape (for Recharts RadarChart):
 * [
 *   { action: "Attack", Training: 40, Competition: 35 },
 *   { action: "Parry–Riposte", Training: 30, Competition: 32 },
 *   { action: "Counter", Training: 20, Competition: 18 },
 *   { action: "Second-Intention", Training: 10, Competition: 15 },
 * ]
 */
export function computeActionSuccessData(trainingBouts = [], compBouts = []) {
  const FAMS = [
    { key: "ATT", label: "Attack" },
    { key: "PR",  label: "Parry–Riposte" },
    { key: "CNT", label: "Counter" },
    { key: "SI",  label: "Second-Intention" },
  ];

  const sumPoints = (rows, key) => rows.reduce((acc, r) => acc + (+r[key] || 0), 0);

  // Total points per series
  const P_train_total =
    sumPoints(trainingBouts, "P_ATT") +
    sumPoints(trainingBouts, "P_PR")  +
    sumPoints(trainingBouts, "P_CNT") +
    sumPoints(trainingBouts, "P_SI");

  const P_comp_total =
    sumPoints(compBouts, "P_ATT") +
    sumPoints(compBouts, "P_PR")  +
    sumPoints(compBouts, "P_CNT") +
    sumPoints(compBouts, "P_SI");

  return FAMS.map(({ key, label }) => {
    const P_train = sumPoints(trainingBouts, `P_${key}`);
    const P_comp  = sumPoints(compBouts,     `P_${key}`);

    const pctTrain = P_train_total > 0 ? Math.round((P_train / P_train_total) * 100) : 0;
    const pctComp  = P_comp_total  > 0 ? Math.round((P_comp  / P_comp_total)  * 100) : 0;

    return { action: label, Training: pctTrain, Competition: pctComp };
  });
}



