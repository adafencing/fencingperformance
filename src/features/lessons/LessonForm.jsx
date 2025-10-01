import { useState } from "react";
import Field from "../../components/Field";

/**
 * Lesson Form
 * Props:
 *  - onSave(row)
 */
export default function LessonForm({ onSave }) {
  const DURATION_OPTIONS = [20, 30, 40, 60];

  const [data, setData] = useState({
    athlete: "",
    date: "",
    durationMin: 60,
    notes: "",
  });
  const [saved, setSaved] = useState(false);

  const up = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const row = { ...data, createdAt: new Date().toISOString() };
    if (onSave) onSave(row);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold mb-4">Lesson</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Athlete Name" required>
          <input
            type="text"
            placeholder="Name"
            className="w-full rounded-lg border px-3 py-2"
            value={data.athlete}
            onChange={(e) => up("athlete", e.target.value)}
            required
          />
        </Field>

        <Field label="Date of Lesson" required>
          <input
            type="date"
            className="w-full rounded-lg border px-3 py-2"
            value={data.date}
            onChange={(e) => up("date", e.target.value)}
            required
          />
        </Field>

        <Field label="Duration (min)" required>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={data.durationMin}
            onChange={(e) => up("durationMin", Number(e.target.value))}
            required
          >
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Coach Notes">
        <textarea
          rows={4}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Extra context, technical cues, remarks"
          value={data.notes}
          onChange={(e) => up("notes", e.target.value)}
        />
      </Field>

      <div className="flex items-center gap-3 mt-4">
        <button type="submit" className="rounded-xl bg-black text-white px-4 py-2">
          Save Lesson
        </button>
        {saved && <span className="text-sm text-green-700">Saved ✓</span>}
      </div>
    </form>
  );
}
