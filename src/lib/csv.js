/**
 * Escape a value for CSV (handles quotes, commas, newlines).
 */
function esc(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Convert rows into CSV string.
 * @param {Array<Object>} rows
 * @param {Array<string>} cols
 * @returns {string}
 */
export function toCSV(rows, cols) {
  const header = cols.map(esc).join(",");
  const lines = rows.map((r) => cols.map((k) => esc(r[k])).join(","));
  return [header, ...lines].join("\n");
}

/**
 * Trigger a CSV download in the browser.
 * @param {string} filename
 * @param {Array<Object>} rows
 * @param {Array<string>} cols
 */
export function downloadCSV(filename, rows, cols) {
  const csv = toCSV(rows, cols);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
