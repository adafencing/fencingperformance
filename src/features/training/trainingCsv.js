import { downloadCSV } from "../../lib/csv";

/**
 * Column order for Training CSV export.
 */
export const TRAIN_COLS = [
  "date",
  "opponent",
  "result",
  "score",
  "A_ATT",
  "P_ATT",
  "A_PR",
  "P_PR",
  "A_CNT",
  "P_CNT",
  "A_SI",
  "P_SI",
  "CES",
  "createdAt",
];

/**
 * Export helper for training bouts.
 * @param {Array<Object>} trainingBouts
 */
export function exportTraining(trainingBouts = []) {
  return downloadCSV("training.csv", trainingBouts, TRAIN_COLS);
}
