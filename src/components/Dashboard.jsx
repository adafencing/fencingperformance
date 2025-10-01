// src/components/Dashboard.jsx
import React, { useMemo, useState } from "react";

/* ---------- Local helper stubs (self-contained) ----------
   If you already have project utils, replace these with imports. */
const D_todayISO = () => new Date().toISOString().slice(0, 10);
const D_lastNDates = (endISO, n) => {
  const out = [];
  const d = new Date(endISO);
  for (let i = 0; i < n; i++) {
    const dd = new Date(d);
    dd.setDate(d.getDate() - i);
    out.push(dd.toISOString().slice(0, 10));
  }
  return out;
};
const D_computeCESFromTotals = (t) => {
  const safeDiv = (a, b) => (b > 0 ? a / b : 0);
  const w = { w_att: 0.25, w_pr: 0.25, w_cnt: 0.25, w_si: 0.25 };
  const EC_Att = safeDiv(t.P_ATT || 0, t.A_ATT || 0);
  const EC_PR  = safeDiv(t.P_PR  || 0, t.A_PR  || 0);
  const EC_CNT = safeDiv(t.P_CNT || 0, t.A_CNT || 0);
  const EC_SI  = safeDiv(t.P_SI  || 0, t.A_SI  || 0);
  const be = Math.max(0, Math.min(1, EC_Att*w.w_att + EC_PR*w.w_pr + EC_CNT*w.w_cnt + EC_SI*w.w_si));
  return { CES: Math.round(be * 100) };
};
/* -------------------------------------------------------- */

/* ---------- Small UI helpers ---------- */
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-[min(720px,92vw)] max-h-[80vh] overflow-auto rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">Close</button>
        </div>
        <div className="mt-3 text-sm leading-6 text-slate-700">{children}</div>
      </div>
    </div>
  );
}
function GuideTabs({ active, setActive }) {
  const Tab = ({ id, label }) => (
    <button
      onClick={() => setActive(id)}
      className={`px-3 py-1.5 rounded-lg border text-sm ${
        active === id ? "bg-black text-white border-black" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className="flex flex-wrap gap-2">
      <Tab id="CES" label="CES" />
      <Tab id="SE" label="SE" />
      <Tab id="TSE" label="TSE" />
    </div>
  );
}

/* ---------- Metrics copy (concise) ---------- */
const CES_TEXT = (
  <div>
    <p className="mb-2"><b>Composite Efficiency Score (CES)</b> is a 0–100 snapshot of how efficiently a fencer converts actions into points right now.</p>
    <ul className="list-disc ml-5 mb-2">
      <li><b>Why:</b> one number for trend + quick read.</li>
      <li><b>Traffic lights:</b> Green ≥ 70; Yellow 50–69; Red &lt; 50.</li>
    </ul>
  </div>
);
const SE_TEXT = (
  <div>
    <p className="mb-2"><b>Season Efficiency (SE)</b> reflects whether fencing/training across the season translated into sustainable wins.</p>
    <ul className="list-disc ml-5 mb-2">
      <li><b>Micro vs. Macro:</b> CES = snapshot; SE = season report card.</li>
      <li><b>Base:</b> win rate (wins / total bouts).</li>
    </ul>
  </div>
);
const TSE_TEXT = (
  <div>
    <p className="mb-2"><b>Time-segment Efficiency (TSE)</b> compares efficiency across Early, Mid, and Late thirds of a bout.</p>
    <ul className="list-disc ml-5 mb-2">
      <li><b>Why:</b> shows slow starts, late fade, or steady control.</li>
      <li><b>How:</b> log attempts & points per segment.</li>
    </ul>
  </div>
);

/* ---------- Dashboard component ---------- */
export default function Dashboard({ trainingBouts = [], compBouts = [], lessons = [] }) {
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideTab, setGuideTab] = useState("CES");
  const [popup, setPopup] = useState(null); // "CES" | "SE" | "TSE" | null

  const today = D_todayISO();
  const last7 = D_lastNDates(today, 7);

  const totalsOf = (rows) =>
    rows.reduce(
      (acc, r) => ({
        A_ATT: (acc.A_ATT || 0) + (+r.A_ATT || 0),
        P_ATT: (acc.P_ATT || 0) + (+r.P_ATT || 0),
        A_PR:  (acc.A_PR  || 0) + (+r.A_PR  || 0),
        P_PR:  (acc.P_PR  || 0) + (+r.P_PR  || 0),
        A_CNT: (acc.A_CNT || 0) + (+r.A_CNT || 0),
        P_CNT: (acc.P_CNT || 0) + (+r.P_CNT || 0),
        A_SI:  (acc.A_SI  || 0) + (+r.A_SI  || 0),
        P_SI:  (acc.P_SI  || 0) + (+r.P_SI  || 0),
      }),
      {}
    );

  const todaysTrain = useMemo(() => trainingBouts.filter((b) => b.date === today), [trainingBouts, today]);
  const todaysComp  = useMemo(() => compBouts.filter((b) => b.date === today), [compBouts, today]);
  const winTrain    = useMemo(() => trainingBouts.filter((b) => last7.includes(b.date)), [trainingBouts, last7]);
  const winComp     = useMemo(() => compBouts.filter((b) => last7.includes(b.date)), [compBouts, last7]);

  const todayTotals = totalsOf([...todaysTrain, ...todaysComp]);
  const winTotals   = totalsOf([...winTrain, ...winComp]);

  const todayCalc = D_computeCESFromTotals(todayTotals);
  const winCalc   = D_computeCESFromTotals(winTotals);

  const totalBouts = compBouts.length;
  const victories  = compBouts.filter((b) => (String(b.result || "")).toUpperCase() === "W").length;
  const SE = Math.round((totalBouts ? victories / totalBouts : 0) * 100);

  const barColor = (v) => (v >= 70 ? "bg-emerald-500" : v >= 50 ? "bg-amber-500" : "bg-rose-500");
  const safePercent = (val) => {
    const n = typeof val === "number" ? val : Number(val || 0);
    return Number.isFinite(n) ? n : 0;
  };

  const InfoBtn = ({ onClick, label = "i" }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label="About this metric"
      className="rounded-full border w-6 h-6 flex items-center justify-center text-xs font-semibold hover:bg-gray-50"
      title="About this metric"
    >
      {label}
    </button>
  );

  const Card = ({ title, metricKey, value, extra }) => {
    const v = safePercent(value);
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">{title}</div>
          <InfoBtn onClick={() => setPopup(metricKey)} />
        </div>
        <div className={`text-4xl font-bold ${v >= 70 ? "text-emerald-600" : v >= 50 ? "text-amber-600" : "text-rose-600"}`}>
          {v}
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div className={`h-2 ${barColor(v)}`} style={{ width: `${v}%` }} />
        </div>
        {extra}
      </div>
    );
  };

  const CESExtra = (totals, label) => (
    <div className="text-xs text-slate-500 mt-2">
      {label} attempts (all bouts): {(totals.A_ATT || 0) + (totals.A_PR || 0) + (totals.A_CNT || 0) + (totals.A_SI || 0)}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-end">
        <button onClick={() => setGuideOpen(true)} className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50" type="button">
          Metrics Guide
        </button>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Composite Efficiency — Today"      metricKey="CES" value={todayCalc.CES} extra={CESExtra(todayTotals, "Attempts today")} />
        <Card title="Composite Efficiency — Last 7 Days" metricKey="CES" value={winCalc.CES}   extra={CESExtra(winTotals, "Attempts (7d)")} />
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Season Efficiency (SE)</div>
            <InfoBtn onClick={() => setPopup("SE")} />
          </div>
          <div className="text-4xl font-bold">{Number.isFinite(SE) ? `${SE}%` : "0%"}</div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div className={`h-2 ${barColor(SE)}`} style={{ width: `${SE}%` }} />
          </div>
          <div className="text-xs text-slate-500 mt-2">Victories: {victories} • Bouts: {totalBouts} • SE = Victories / Bouts (base)</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Season Lessons</div>
            <InfoBtn onClick={() => setPopup("TSE")} />
          </div>
          <div className="text-4xl font-bold">{lessons.length}</div>
          <div className="text-xs text-slate-500 mt-2">Logged lessons total this season.</div>
        </div>
      </div>

      {/* Per-metric quick popups */}
      <Modal open={popup === "CES"} onClose={() => setPopup(null)} title="About Composite Efficiency (CES)">{CES_TEXT}</Modal>
      <Modal open={popup === "SE"}  onClose={() => setPopup(null)} title="About Season Efficiency (SE)">{SE_TEXT}</Modal>
      <Modal open={popup === "TSE"} onClose={() => setPopup(null)} title="About Time-segment Efficiency (TSE)">{TSE_TEXT}</Modal>

      {/* Global Metrics Guide */}
      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="Metrics Guide">
        <div className="mb-3"><GuideTabs active={guideTab} setActive={setGuideTab} /></div>
        <div className="mt-2">
          {guideTab === "CES" && CES_TEXT}
          {guideTab === "SE"  && SE_TEXT}
          {guideTab === "TSE" && TSE_TEXT}
        </div>
      </Modal>
    </div>
  );
}
