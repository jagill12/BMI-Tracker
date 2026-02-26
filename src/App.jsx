import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const toFixed = (n, d = 2) => (Number.isFinite(n) ? Number(n.toFixed(d)) : "—");
const cmToMeters = (cm) => cm / 100;
const inchesToMeters = (inches) => inches * 0.0254;
const lbToKg = (lb) => lb * 0.45359237;

const categories = [
  { name: "Underweight", min: 0, max: 18.5, color: "text-blue-600" },
  { name: "Normal", min: 18.5, max: 24.9, color: "text-emerald-600" },
  { name: "Overweight", min: 25, max: 29.9, color: "text-amber-600" },
  { name: "Obesity", min: 30, max: Infinity, color: "text-rose-600" },
];

function categorize(bmi) {
  for (const c of categories) if (bmi >= c.min && bmi < c.max) return c;
  return categories[0];
}

const LS_KEY = "bmi-tracker-history-v1";

export default function App() {
  const [version, setVersion] = useState("v1"); // v1 | v2 | v3
  const [unitSystem, setUnitSystem] = useState("metric"); // metric | imperial
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [heightIn, setHeightIn] = useState(69);
  const [weightLb, setWeightLb] = useState(154);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    if (version === "v3") localStorage.setItem(LS_KEY, JSON.stringify(history));
  }, [history, version]);

  const meters = useMemo(
    () => (unitSystem === "metric" ? cmToMeters(Number(heightCm)) : inchesToMeters(Number(heightIn))),
    [unitSystem, heightCm, heightIn]
  );
  const kilograms = useMemo(
    () => (unitSystem === "metric" ? Number(weightKg) : lbToKg(Number(weightLb))),
    [unitSystem, weightKg, weightLb]
  );

  const bmi = useMemo(() => {
    const m = meters;
    if (!m || !kilograms || m <= 0) return NaN;
    return kilograms / (m * m);
  }, [meters, kilograms]);

  useEffect(() => {
    if (version === "v1") return;
    const e = {};
    const h = unitSystem === "metric" ? Number(heightCm) : Number(heightIn);
    const w = unitSystem === "metric" ? Number(weightKg) : Number(weightLb);
    if (!Number.isFinite(h) || h <= 0) e.height = "Enter a positive number for height.";
    if (!Number.isFinite(w) || w <= 0) e.weight = "Enter a positive number for weight.";
    if (unitSystem === "metric" && (h < 50 || h > 250)) e.height = "Height (cm) looks unusual (50–250).";
    if (unitSystem === "imperial" && (h < 20 || h > 100)) e.height = "Height (in) looks unusual (20–100).";
    if (unitSystem === "metric" && (w < 20 || w > 350)) e.weight = "Weight (kg) looks unusual (20–350).";
    if (unitSystem === "imperial" && (w < 44 || w > 770)) e.weight = "Weight (lb) looks unusual (44–770).";
    setErrors(e);
  }, [unitSystem, heightCm, heightIn, weightKg, weightLb, version]);

  const canSave = useMemo(() => version === "v3" && Number.isFinite(bmi) && Object.keys(errors).length === 0, [version, bmi, errors]);

  function saveEntry() {
    if (!canSave) return;
    const entry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      height: unitSystem === "metric" ? `${heightCm} cm` : `${heightIn} in`,
      weight: unitSystem === "metric" ? `${weightKg} kg` : `${weightLb} lb`,
      bmi: Number(bmi.toFixed(2)),
      category: categorize(bmi).name,
      note: note.trim(),
    };
    setHistory((h) => [entry, ...h]);
    setNote("");
  }
  function deleteEntry(id) { setHistory((h) => h.filter((e) => e.id !== id)); }
  function clearAll() { if (confirm("Clear all saved BMI entries?")) setHistory([]); }

  const chartData = [...history].reverse().map((e) => ({ date: new Date(e.date).toLocaleDateString(), bmi: e.bmi }));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">BMI Calculator & Tracker</h1>
            <p className="text-sm text-slate-600">Versioned demo: V1 → V2 → V3</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Version:</label>
            <select className="rounded border px-2 py-1" value={version} onChange={(e) => setVersion(e.target.value)}>
              <option value="v1">V1</option>
              <option value="v2">V2</option>
              <option value="v3">V3</option>
            </select>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: inputs */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold">Units</span>
              <div className="text-sm">
                <label className="mr-3">
                  <input type="radio" className="mr-1 align-middle"
                    checked={unitSystem === "metric"} onChange={() => setUnitSystem("metric")} />
                  Metric
                </label>
                <label>
                  <input type="radio" className="mr-1 align-middle"
                    checked={unitSystem === "imperial"} onChange={() => setUnitSystem("imperial")} />
                  Imperial
                </label>
              </div>
            </div>

            {unitSystem === "metric" ? (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm">Height (cm)</label>
                  <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="w-full rounded border px-3 py-2" />
                  {version !== "v1" && errors.height && <p className="mt-1 text-xs text-rose-600">{errors.height}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm">Weight (kg)</label>
                  <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="w-full rounded border px-3 py-2" />
                  {version !== "v1" && errors.weight && <p className="mt-1 text-xs text-rose-600">{errors.weight}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm">Height (inches)</label>
                  <input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} className="w-full rounded border px-3 py-2" />
                  {version !== "v1" && errors.height && <p className="mt-1 text-xs text-rose-600">{errors.height}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm">Weight (lb)</label>
                  <input type="number" value={weightLb} onChange={(e) => setWeightLb(e.target.value)} className="w-full rounded border px-3 py-2" />
                  {version !== "v1" && errors.weight && <p className="mt-1 text-xs text-rose-600">{errors.weight}</p>}
                </div>
              </div>
            )}

            {version === "v3" && (
              <>
                <div className="my-4 h-px w-full bg-slate-200" />
                <label className="mb-1 block text-sm">Note (optional)</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g., Morning after run" className="w-full rounded border px-3 py-2" />
                <div className="mt-3 flex gap-2">
                  <button onClick={saveEntry} disabled={!canSave} className="rounded bg-slate-900 px-3 py-2 text-white disabled:opacity-50">Save to history</button>
                  <button
                    onClick={() => {
                      const header = ["date", "height", "weight", "bmi", "category", "note"];
                      const rows = history.map((e) =>
                        header.map((k) => `"${String(e[k] ?? "").replaceAll('"', '""')}"`).join(",")
                      );
                      const csv = [header.join(","), ...rows].join("\n");
                      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `bmi_history_${new Date().toISOString().slice(0, 10)}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    disabled={!history.length}
                    className="rounded border px-3 py-2 disabled:opacity-50"
                  >
                    Export CSV
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right: results & history */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <p className="text-sm text-slate-600">Your BMI</p>
                  <div className="text-4xl font-semibold">{Number.isFinite(bmi) ? toFixed(bmi, 2) : "—"}</div>
                </div>
                {Number.isFinite(bmi) && version !== "v1" && (
                  <div>
                    <p className="text-sm text-slate-600">Category</p>
                    <div className={`text-xl font-semibold ${categorize(bmi).color}`}>{categorize(bmi).name}</div>
                  </div>
                )}
              </div>
              {Number.isFinite(bmi) && version !== "v1" && (
                <p className="mt-3 text-sm text-slate-700">
                  {{
                    Underweight: "Consider nutrient-dense meals and strength training; consult a professional.",
                    Normal: "Great! Maintain balanced nutrition, regular activity, and sleep.",
                    Overweight: "Small sustainable changes (whole foods, daily walks) can help.",
                    Obesity: "Work with a clinician; combine nutrition, activity, sleep, stress management.",
                  }[categorize(bmi).name] || ""}
                </p>
              )}
              {version === "v1" && (
                <p className="mt-3 text-sm text-slate-600">V1 shows the core BMI calculation. Switch to V2 for categories & tips, V3 for history & charts.</p>
              )}
            </div>

            {version === "v3" && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold">Trend</h3>
                  {history.length ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis domain={[10, 45]} tick={{ fontSize: 12 }} />
                          <RTooltip />
                          <Line type="monotone" dataKey="bmi" dot />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">No history yet. Save entries to see your trend.</p>
                  )}
                </div>

                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">History</h3>
                    <button onClick={clearAll} disabled={!history.length} className="rounded bg-rose-600 px-3 py-2 text-white disabled:opacity-50">
                      Clear all
                    </button>
                  </div>
                  <div className="max-h-56 space-y-3 overflow-auto pr-1">
                    {history.length ? (
                      history.map((e) => (
                        <div key={e.id} className="rounded-xl border bg-white p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold">{new Date(e.date).toLocaleString()}</div>
                              <div className="text-xs text-slate-600">{e.height} • {e.weight}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">BMI {e.bmi}</div>
                              <div className="text-xs text-slate-600">{e.category}</div>
                            </div>
                          </div>
                          {e.note && <div className="mt-2 text-xs text-slate-700">Note: {e.note}</div>}
                          <div className="mt-2">
                            <button onClick={() => setHistory((h) => h.filter((x) => x.id !== e.id))} className="rounded border px-2 py-1 text-sm">
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-600">No entries saved.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-lg font-semibold">Version Breakdown</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
                <li><strong>V1:</strong> Core BMI calculation (metric/imperial).</li>
                <li><strong>V2:</strong> Validation, categories, tips, nicer UI.</li>
                <li><strong>V3:</strong> History in localStorage, chart, CSV export.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
