import { downloadCSV } from "../../lib/csv";

/**
 * Column order for Competition CSV export.
 * Includes meta, summed totals, per-segment fields, and CES.
 */
export const COMP_COLS = [
  "date", "event", "opponent", "nation", "round", "result", "score",
  // summed totals
  "A_ATT", "P_ATT", "A_PR", "P_PR", "A_CNT", "P_CNT", "A_SI", "P_SI",
  // per-segment: Early (E), Mid (M), Late (L)
  "A_ATT_E","P_ATT_E","A_ATT_M","P_ATT_M","A_ATT_L","P_ATT_L",
  "A_PR_E","P_PR_E","A_PR_M","P_PR_M","A_PR_L","P_PR_L",
  "A_CNT_E","P_CNT_E","A_CNT_M","P_CNT_M","A_CNT_L","P_CNT_L",
  "A_SI_E","P_SI_E","A_SI_M","P_SI_M","A_SI_L","P_SI_L",
  // metrics + meta
  "CES", "createdAt"
];

/**
 * Export helper for competition bouts.
 * @param {Array<Object>} compBouts
 */
export function exportCompetition(compBouts = []) {
  return downloadCSV("competition.csv", compBouts, COMP_COLS);
}
