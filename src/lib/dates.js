/**
 * Return today's date in YYYY-MM-DD format (ISO string slice).
 */
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Return an array of the last n dates (including endISO), in YYYY-MM-DD format.
 * @param {string} endISO - date string YYYY-MM-DD
 * @param {number} n - number of days
 */
export function lastNDates(endISO, n) {
  const out = [];
  const end = new Date(`${endISO}T00:00:00`);
  for (let i = 0; i < n; i++) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}
