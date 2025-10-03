import { useEffect, useState } from "react";

import { todayISO } from "../../lib/dates";
import { div } from "../../lib/metrics";
import { downloadCSV } from "../../lib/csv";

import Stepper from "../../components/Stepper";
import ACTION_THEME from "../../components/actionThemes";

export default function TrainingBoutForm({ onSave, trainingBouts = [] }) {
  const [form, setForm] = useState({
    date: todayISO(),
    opponent: "",
    result: "W",
    // NEW: split score into two fields; we still keep "score" string for CSV compatibility
    scoreMe: "",
    scoreOpp: "",
    score: "",

    A_ATT: 0, P_ATT: 0,
    A_PR: 0,  P_PR: 0,
    A_CNT: 0, P_CNT: 0,
    A_SI: 0,  P_SI: 0,
  });

  useEffect(() => {
    try {
      const last = JSON.parse(localStorage.getItem("lastTrainingMeta"));
      if (last?.opponent) setForm((s) => ({ ...s, opponent: last.opponent }));
    } catch {}
  }, []);

  // keep CES as before
  const sumA = (form.A_ATT||0) + (form.A_PR||0) + (form.A_CNT||0) + (form.A_SI||0);
  const sumP = (form.P_ATT||0) + (form.P_PR||0) + (form.P_CNT||0) + (form.P_SI||0);
  const CES = Math.round(div(sumP, sumA) * 100);
  const cesColor = CES>=70 ? "text-emerald-600" : CES>=50 ? "text-amber-600" : "text-rose-600";

  const computeScoreString = (me, opp) => {
    const a = (me ?? "").toString().trim();
    const b = (opp ?? "").toString().trim();
    if (a === "" && b === "") return "";
    return `${a === "" ? 0 : a}-${b === "" ? 0 : b}`;
  };

  const save = () => {
    const finalScore = computeScoreString(form.scoreMe, form.scoreOpp);
    const row = {
      ...form,
      score: finalScore, // ensure CSV "score" is filled
      CES,
      createdAt: new Date().toISOString(),
      type: "training",
    };
    onSave(row);
    localStorage.setItem("lastTrainingMeta", JSON.stringify({ opponent: form.opponent }));
    alert("Training bout saved ✔");

    setForm((s)=>({
      ...s,
      scoreMe: "",
      scoreOpp: "",
      score: "",
      A_ATT:0,P_ATT:0,A_PR:0,P_PR:0,A_CNT:0,P_CNT:0,A_SI:0,P_SI:0
    }));
  };

  const TRAIN_COLS = [
    "date","opponent","result","score",
    "A_ATT","P_ATT","A_PR","P_PR","A_CNT","P_CNT","A_SI","P_SI",
    "CES","createdAt"
  ];
  const exportTraining = () => downloadCSV("training.csv", trainingBouts, TRAIN_COLS);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-5">
      {/* Top bar with bout counter */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Training bouts saved: <span className="font-semibold">{trainingBouts.length}</span>
        </div>
      </div>

      {/* Meta row */}
      <div className="grid sm:grid-cols-4 gap-3">
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
          <span className="block mb-1">Opponent</span>
          <input
            type="text"
            placeholder="Name / initials"
            value={form.opponent}
            onChange={(e)=>setForm({...form,opponent:e.target.value})}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

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
      </div>

      {/* Score (equal width, inline placeholders; no spinners) */}
<div className="text-sm">
  <span className="block mb-1">Score</span>
  <div className="grid grid-cols-2 gap-3 max-w-sm">
    <input
      type="number"
      inputMode="numeric"
      min={0}
      step={1}
      placeholder="Me"
      value={form.scoreMe}
      onChange={(e) => {
        const v = e.target.value;
        setForm((s) => ({ ...s, scoreMe: v, score: computeScoreString(v, s.scoreOpp) }));
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
      onChange={(e) => {
        const v = e.target.value;
        setForm((s) => ({ ...s, scoreOpp: v, score: computeScoreString(s.scoreMe, v) }));
      }}
      className="w-full rounded-lg border border-slate-300 px-3 py-2
                 [appearance:textfield]
                 [&::-webkit-outer-spin-button]:appearance-none
                 [&::-webkit-inner-spin-button]:appearance-none"
    />
  </div>
</div>


      {/* Actions grid (labels simplified; description boxes removed) */}
      <div>
        <div className="text-sm font-semibold mb-2">Actions</div>

        {/* Column headers */}
        <div className="grid grid-cols-3 gap-3 text-sm font-medium mb-2">
          <div className="text-left">Type</div>
          <div className="text-center">Attempts</div>
          <div className="text-center">Points</div>
        </div>

        {/* Attack */}
        <div className="grid grid-cols-3 gap-3 items-center">
          <div className="font-semibold">Attack</div>
          <div className="flex justify-center">
            <Stepper value={form.A_ATT} onChange={(v)=>setForm({...form,A_ATT:v})} theme={ACTION_THEME.ATT} />
          </div>
          <div className="flex justify-center">
            <Stepper value={form.P_ATT} onChange={(v)=>setForm({...form,P_ATT:v})} theme={ACTION_THEME.ATT} />
          </div>
        </div>

        {/* Parry Riposte */}
        <div className="grid grid-cols-3 gap-3 items-center mt-2">
          <div className="font-semibold">Parry Riposte</div>
          <div className="flex justify-center">
            <Stepper value={form.A_PR} onChange={(v)=>setForm({...form,A_PR:v})} theme={ACTION_THEME.PR} />
          </div>
          <div className="flex justify-center">
            <Stepper value={form.P_PR} onChange={(v)=>setForm({...form,P_PR:v})} theme={ACTION_THEME.PR} />
          </div>
        </div>

        {/* Counter */}
        <div className="grid grid-cols-3 gap-3 items-center mt-2">
          <div className="font-semibold">Counter</div>
          <div className="flex justify-center">
            <Stepper value={form.A_CNT} onChange={(v)=>setForm({...form,A_CNT:v})} theme={ACTION_THEME.CNT} />
          </div>
          <div className="flex justify-center">
            <Stepper value={form.P_CNT} onChange={(v)=>setForm({...form,P_CNT:v})} theme={ACTION_THEME.CNT} />
          </div>
        </div>

        {/* Second Intention */}
        <div className="grid grid-cols-3 gap-3 items-center mt-2">
          <div className="font-semibold">Second Intention</div>
          <div className="flex justify-center">
            <Stepper value={form.A_SI} onChange={(v)=>setForm({...form,A_SI:v})} theme={ACTION_THEME.SI} />
          </div>
          <div className="flex justify-center">
            <Stepper value={form.P_SI} onChange={(v)=>setForm({...form,P_SI:v})} theme={ACTION_THEME.SI} />
          </div>
        </div>
      </div>

      {/* Live CES */}
      <div className="rounded-xl border border-slate-200 p-3">
        <div className="text-xs text-slate-500 mb-1">Composite Efficiency (live)</div>
        <div className={`text-3xl font-semibold ${cesColor}`}>{isNaN(CES)?0:CES}</div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-2 ${CES>=70?"bg-emerald-500":CES>=50?"bg-amber-500":"bg-rose-500"}`}
            style={{ width: `${isNaN(CES)?0:CES}%` }}
          />
        </div>
        <div className="text-xs text-slate-500 mt-1">Green ≥ 70 • Yellow 50–69 • Red &lt; 50</div>
      </div>

      {/* Export CSV */}
      <div className="rounded-xl border border-slate-200 p-3">
        <div className="text-sm font-semibold mb-2">Export — Training CSV</div>
        <p className="text-xs text-slate-600 mb-3">Download all training bouts with actions and CES.</p>
        <button
          type="button"
          onClick={exportTraining}
          className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
        >
          Download Training CSV
        </button>
      </div>

      <button onClick={save} className="w-full px-4 py-2 rounded-lg bg-slate-900 text-white">
        Save Training Bout
      </button>
    </div>
  );
}




