// src/features/dashboard/Dashboard.jsx
import { useMemo, useState } from "react";
import Modal from "../../components/Modal";
import GuideTabs from "./GuideTabs";
import { CES_TEXT, SE_TEXT, TSE_TEXT } from "./metricsCopy";
import { todayISO, lastNDates } from "../../lib/dates";
import {
  computeCESFromTotals,
  computeSeasonEfficiency,
  computeActionSuccessData,
} from "../../lib/metrics";
import ActionSuccessRadar from "./ActionSuccessRadar";

export default function Dashboard({ trainingBouts = [], compBouts = [], lessons = [] }) {
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideTab, setGuideTab] = useState("CES");

  const today = todayISO();
  const last7 = lastNDates(today, 7);

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

  const todayCalc = computeCESFromTotals(todayTotals);
  const winCalc   = computeCESFromTotals(winTotals);

  // Season Efficiency using default settings from metrics.js
  const se = computeSeasonEfficiency({ trainingBouts, compBouts, lessons });

  // Radar data for action success %
  const radarData = computeActionSuccessData(trainingBouts, compBouts);

  // TSE (Time-segment Efficiency)
  const segmentTotals = { early: { A:0,P:0 }, mid:{A:0,P:0}, late:{A:0,P:0} };
  compBouts.forEach(b => {
    ["E","M","L"].forEach((seg, idx) => {
      const key = idx===0?"early":idx===1?"mid":"late";
      segmentTotals[key].A += (b[`A_ATT_${seg}`]||0)+(b[`A_PR_${seg}`]||0)+(b[`A_CNT_${seg}`]||0)+(b[`A_SI_${seg}`]||0);
      segmentTotals[key].P += (b[`P_ATT_${seg}`]||0)+(b[`P_PR_${seg}`]||0)+(b[`P_CNT_${seg}`]||0)+(b[`P_SI_${seg}`]||0);
    });
  });
  const segEff = Object.values(segmentTotals).map(s => (s.A>0? s.P/s.A : 0));
  const TSE = Math.round((segEff.reduce((a,b)=>a+b,0)/ (segEff.length||1))*100);

  const barColor = (v) => (v >= 70 ? "bg-emerald-500" : v >= 50 ? "bg-amber-500" : "bg-rose-500");
  const safePercent = (val) => (Number.isFinite(val) ? val : 0);

  const CESExtra = (totals, label) => (
    <div className="text-xs text-slate-500 mt-2">
      {label} attempts: {(totals.A_ATT || 0)+(totals.A_PR||0)+(totals.A_CNT||0)+(totals.A_SI||0)}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setGuideOpen(true)}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          type="button"
        >
          Metrics Guide
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* CES Today */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-lg font-semibold">Composite Efficiency — Today</div>
          <div className={`text-4xl font-bold ${todayCalc.CES>=70?"text-emerald-600":todayCalc.CES>=50?"text-amber-600":"text-rose-600"}`}>
            {safePercent(todayCalc.CES)}
          </div>
          <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-2 ${barColor(todayCalc.CES)}`} style={{width:`${safePercent(todayCalc.CES)}%`}}/>
          </div>
          {CESExtra(todayTotals,"Attempts today")}
        </div>

        {/* CES Last 7d */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-lg font-semibold">Composite Efficiency — Last 7 Days</div>
          <div className={`text-4xl font-bold ${winCalc.CES>=70?"text-emerald-600":winCalc.CES>=50?"text-amber-600":"text-rose-600"}`}>
            {safePercent(winCalc.CES)}
          </div>
          <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-2 ${barColor(winCalc.CES)}`} style={{width:`${safePercent(winCalc.CES)}%`}}/>
          </div>
          {CESExtra(winTotals,"Attempts (7d)")}
        </div>

        {/* SE */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-lg font-semibold">Season Efficiency (SE)</div>
          <div className="text-4xl font-bold">{Number.isFinite(se.SE) ? `${se.SE}%` : "0%"}</div>
          <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-2 ${barColor(se.SE)}`} style={{width:`${safePercent(se.SE)}%`}}/>
          </div>
          <div className="text-xs text-slate-600 mt-2 space-y-1">
            <div>
              Victories (Training + Competition):{" "}
              <span className="font-medium">{se.totals.victories}</span>
              {" / "}
              <span className="font-medium">{se.totals.totalBouts}</span>
              {" "}bouts — Base success:{" "}
              <span className="font-medium">{se.baseSuccessPct}%</span>
            </div>
            <div>Touches made (Training + Competition): <span className="font-medium">{se.totals.touchesTotal}</span></div>
            <div>Lessons received: <span className="font-medium">{se.totals.lessonsCount}</span></div>
            <div className="text-slate-500">
              Workload Index: <span className="font-medium">{se.workloadIndex}</span>
              {" "} (bouts {se.factors.boutsFactor}, lessons {se.factors.lessonsFactor}, touches {se.factors.touchesFactor})
            </div>
          </div>
        </div>

        {/* TSE */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-lg font-semibold">Time-segment Efficiency (TSE)</div>
          <div className="text-4xl font-bold">{Number.isFinite(TSE)? `${TSE}%`:"0%"}</div>
          <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-2 ${barColor(TSE)}`} style={{width:`${safePercent(TSE)}%`}}/>
          </div>
          <div className="text-xs text-slate-500 mt-2">Avg. efficiency across Early / Mid / Late segments</div>
        </div>

        {/* Action Points Share Radar */}
<div className="rounded-2xl border bg-white p-4 md:col-span-2">
  <div className="text-lg font-semibold">Action Points Share % — Training vs Competition</div>
  <ActionSuccessRadar data={radarData} />
  <div className="text-xs text-slate-500 mt-2">
    Each value is the share of **points scored** in that action family out of all points for that series (Training or Competition). Attempts are not used.
  </div>
</div>
      </div>

      {/* Metrics Guide modal */}
      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="Metrics Guide">
        <div className="mb-3"><GuideTabs active={guideTab} setActive={setGuideTab} /></div>
        <div className="mt-2">
          {guideTab==="CES" && CES_TEXT}
          {guideTab==="SE"  && SE_TEXT}
          {guideTab==="TSE" && TSE_TEXT}
        </div>
      </Modal>
    </div>
  );
}

