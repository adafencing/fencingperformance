// src/features/competition/CompetitionBoutForm.jsx
import { useState } from "react";

import { todayISO } from "../../lib/dates";
import { div } from "../../lib/metrics";
import { downloadCSV } from "../../lib/csv";

import Stepper from "../../components/Stepper";
import ACTION_THEME from "../../components/actionThemes";

export default function CompetitionBoutForm({ onSave, compBouts = [] }) {
  const ROUND_OPTIONS = ["Pools","DE256","DE128","DE96","DE64","DE32","DE16","DE8","SF","F"];

  const [form, setForm] = useState({
    date: todayISO(),
    event: "",
    opponent: "",
    nation: "",
    round: "Pools",
    result: "W",
    // NEW: split score into two inputs; keep combined "score" for CSV / storage
    scoreMe: "",
    scoreOpp: "",
    score: "",

    // Segmented actions
    A_ATT_E: 0, P_ATT_E: 0, A_ATT_M: 0, P_ATT_M: 0, A_ATT_L: 0, P_ATT_L: 0,
    A_PR_E:  0, P_PR_E:  0, A_PR_M:  0, P_PR_M:  0, A_PR_L:  0, P_PR_L:  0,
    A_CNT_E: 0, P_CNT_E: 0, A_CNT_M: 0, P_CNT_M: 0, A_CNT_L: 0, P_CNT_L: 0,
    A_SI_E:  0, P_SI_E:  0, A_SI_M:  0, P_SI_M:  0, A_SI_L:  0, P_SI_L:  0,
  });

  const [segTab, setSegTab] = useState("E");
  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const sum3 = (base) => (form[`${base}_E`]||0) + (form[`${base}_M`]||0) + (form[`${base}_L`]||0);
  const totals = {
    A_ATT: sum3("A_ATT"), P_ATT: sum3("P_ATT"),
    A_PR:  sum3("A_PR"),  P_PR:  sum3("P_PR"),
    A_CNT: sum3("A_CNT"), P_CNT: sum3("P_CNT"),
    A_SI:  sum3("A_SI"),  P_SI:  sum3("P_SI"),
  };

  const sumA = totals.A_ATT + totals.A_PR + totals.A_CNT + totals.A_SI;
  const sumP = totals.P_ATT + totals.P_PR + totals.P_CNT + totals.P_SI;
  const CES = Math.round(div(sumP, sumA) * 100);
  const cesColor = CES>=70 ? "text-emerald-600" : CES>=50 ? "text-amber-600" : "text-rose-600";

  const computeScoreString = (me, opp) => {
    const a = (me ?? "").toString().trim();
    const b = (opp ?? "").toString().trim();
    if (a === "" && b === "") return "";
    return `${a === "" ? 0 : a}-${b === "" ? 0 : b}`;
  };

  const SegmentGrid = ({ segKey, title }) => {
    const rows = [
      { key: "ATT", label: "Attack",            a: `A_ATT_${segKey}`, p: `P_ATT_${segKey}`, theme: ACTION_THEME.ATT },
      { key: "PR",  label: "Parry–Riposte",     a: `A_PR_${segKey}`,  p: `P_PR_${segKey}`,  theme: ACTION_THEME.PR  },
      { key: "CNT", label: "Counter",           a: `A_CNT_${segKey}`, p: `P_CNT_${segKey}`, theme: ACTION_THEME.CNT },
      { key: "SI",  label: "Second-Intention",  a: `A_SI_${segKey}`,  p: `P_SI_${segKey}`,  theme: ACTION_THEME.SI  },
    ];

    return (
      <div className="rounded-xl border border-slate-200 p-3">
        <div className="text-sm font-semibold mb-2">{title} — Actions</div>

        {/* Column headers */}
        <div className="grid grid-cols-3 gap-3 text-sm font-medium mb-2">
          <div className="text-left">Type</div>
          <div className="text-center">Attempts</div>
          <div className="text-center">Points</div>
        </div>

        {rows.map((r) => (
          <div key={r.key} className="grid grid-cols-3 gap-3 items-center">
            {/* Simple label only (description input removed) */}
            <div className="font-semibold">{r.label}</div>

            <div className="flex justify-center">
              <Stepper value={form[r.a]} onChange={(v)=>setField(r.a, v)} theme={r.theme} />
            </div>

            <div className="flex justify-center">
              <Stepper value={form[r.p]} onChange={(v)=>setField(r.p, v)} theme={r.theme} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const save = () => {
    const finalScore = computeScoreString(form.scoreMe, form.scoreOpp);
    const row = {
      ...form,
      score: finalScore, // ensure combined score is saved
      ...totals,
      CES,
      createdAt: new Date().toISOString(),
      type: "competition",
    };
    onSave(row);
    alert("Competition bout saved ✔");

    setForm((s)=>({
      ...s,
      scoreMe: "", scoreOpp: "", score: "",
      A_ATT_E:0,P_ATT_E:0, A_ATT_M:0,P_ATT_M:0, A_ATT_L:0,P_ATT_L:0,
      A_PR_E:0,P_PR_E:0,   A_PR_M:0,P_PR_M:0,   A_PR_L:0,P_PR_L:0,
      A_CNT_E:0,P_CNT_E:0, A_CNT_M:0,P_CNT_M:0, A_CNT_L:0,P_CNT_L:0,
      A_SI_E:0,P_SI_E:0,   A_SI_M:0,P_SI_M:0,   A_SI_L:0,P_SI_L:0,
    }));
  };

  const COMP_COLS = [
    "date","event","opponent","nation","round","result","score",
    "A_ATT","P_ATT","A_PR","P_PR","A_CNT","P_CNT","A_SI","P_SI",
    "A_ATT_E","P_ATT_E","A_ATT_M","P_ATT_M","A_ATT_L","P_ATT_L",
    "A_PR_E","P_PR_E","A_PR_M","P_PR_M","A_PR_L","P_PR_L",
    "A_CNT_E","P_CNT_E","A_CNT_M","P_CNT_M","A_CNT_L","P_CNT_L",
    "A_SI_E","P_SI_E","A_SI_M","P_SI_M","A_SI_L","P_SI_L",
    "CES","createdAt"
  ];
  const exportCompetition = () => downloadCSV("competition.csv", compBouts, COMP_COLS);

  const SegTabBtn = ({ id, label }) => (
    <button
      type="button"
      onClick={()=>setSegTab(id)}
      className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm ${
        segTab===id ? "bg-black text-white border-black" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-5">
      {/* Top bar with bout counter */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Competition bouts saved: <span className="font-semibold">{compBouts.length}</span>
        </div>
      </div>

      {/* Meta */}
      <div className="grid sm:grid-cols-6 gap-3">
        <label className="text-sm">
          <span className="block mb-1">Date</span>
          <input
            type="date"
            value={form.date}
            onChange={(e)=>setForm({...form,date:e.target.value})}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm sm:col-span-2">
          <span className="block mb-1">Event</span>
          <input
            type="text"
            value={form.event}
            onChange={(e)=>setForm({...form,event:e.target.value})}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          <span className="block mb-1">Opponent</span>
          <input
            type="text"
            value={form.opponent}
            onChange={(e)=>setForm({...form,opponent:e.target.value})}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          <span className="block mb-1">Nation</span>
          <input
            type="text"
            value={form.nation}
            onChange={(e)=>setForm({...form,nation:e.target.value})}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          <span className="block mb-1">Round</span>
          <select
            value={form.round}
            onChange={(e)=>setForm({...form,round:e.target.value})}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            {ROUND_OPTIONS.map((r)=>(<option key={r} value={r}>{r}</option>))}
          </select>
        </label>
      </div>

      {/* Score & Result */}
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="text-sm">
          <span className="block mb-1">Result</span>
          <select
            value={form.result}
            onChange={(e)=>setForm({...form,result:e.target.value})}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option>W</option>
            <option>L</option>
          </select>
        </label>

        {/* NEW: two equal score inputs (no spinners), combined into form.score */}
        <div className="text-sm sm:col-span-2">
          <span className="block mb-1">Score</span>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="Me"
              value={form.scoreMe}
              onChange={(e)=>{
                const v = e.target.value;
                setForm((s)=>({ ...s, scoreMe: v, score: computeScoreString(v, s.scoreOpp) }));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2
                         [appearance:textfield]
                         [&::-webkit-outer-spin-button]:appearance-none
                         [&::-webkit-inner-spin-button]:appearance-none"
            />
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="Opponent"
              value={form.scoreOpp}
              onChange={(e)=>{
                const v = e.target.value;
                setForm((s)=>({ ...s, scoreOpp: v, score: computeScoreString(s.scoreMe, v) }));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2
                         [appearance:textfield]
                         [&::-webkit-outer-spin-button]:appearance-none
                         [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>

      {/* Segments */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <SegTabBtn id="E" label="R1 Early" />
          <SegTabBtn id="M" label="R2 Mid" />
          <SegTabBtn id="L" label="R3 Late" />
        </div>

        {segTab==="E" && <SegmentGrid segKey="E" title="Early Segment" />}
        {segTab==="M" && <SegmentGrid segKey="M" title="Mid Segment" />}
        {segTab==="L" && <SegmentGrid segKey="L" title="Late Segment" />}
      </div>

      {/* CES */}
      <div className="rounded-xl border border-slate-200 p-3">
        <div className="text-xs text-slate-500 mb-1">Composite Efficiency (from all segments)</div>
        <div className={`text-3xl font-semibold ${cesColor}`}>{isNaN(CES)?0:CES}</div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-2 ${CES>=70?"bg-emerald-500":CES>=50?"bg-amber-500":"bg-rose-500"}`}
            style={{ width: `${isNaN(CES)?0:CES}%` }}
          />
        </div>
      </div>

      {/* Export CSV */}
      <div className="rounded-xl border border-slate-200 p-3">
        <div className="text-sm font-semibold mb-2">Export — Competition CSV</div>
        <p className="text-xs text-slate-600 mb-3">Download all competition bouts with segmented actions and CES.</p>
        <button
          type="button"
          onClick={exportCompetition}
          className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
        >
          Download Competition CSV
        </button>
      </div>

      <button onClick={save} className="w-full px-4 py-2 rounded-lg bg-slate-900 text-white">
        Save Competition Bout
      </button>
    </div>
  );
}



