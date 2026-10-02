import React, { useEffect, useState } from "react";
import axios from "axios";
import { Settings, ShieldAlert, BadgeInfo, Save, ToggleLeft, ToggleRight, Scale } from "lucide-react";

function PenaltySettings() {
  const [form, setForm] = useState({
    fineAmount: 50,
    graceDays: 3,
    maxPenalty: 500,
    autoPenalty: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await axios.get(
        "https://finance-project-0qqk.onrender.com/api/daily/penalty-settings"
      );

      if (res.data.settings) {
        setForm(res.data.settings);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveSettings = async () => {
    try {
      await axios.post(
        "https://finance-project-0qqk.onrender.com/api/daily/penalty-settings",
        form
      );
      alert("Penalty Settings Saved");
    } catch (error) {
      alert("Save Failed");
    }
  };

  // Pre-calculated dynamic penalty value for preview box
  const projectedPenaltyResult = Math.min(
    (7 - Number(form.graceDays)) * Number(form.fineAmount),
    Number(form.maxPenalty)
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 space-y-6">
      
      {/* Title block banner */}
      <div>
        <h1 className="text-sm font-black text-slate-900 tracking-wider uppercase">
          Daily Savings Rules & Fines Policy
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure micro-transaction rules, system grace intervals, and ledger automation limits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Rule Engine Parameters Form (Spans 2 columns) */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden lg:col-span-2">
          
          <div className="p-5 border-b flex items-center gap-2 bg-slate-50/50">
            <Settings size={16} className="text-slate-400" />
            <h2 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
              Late Penalty Engine
            </h2>
          </div>

          <div className="p-5 space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Daily Fine Amount */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Daily Fine Amount (₹)
                </label>
                <input
                  type="number"
                  value={form.fineAmount}
                  onChange={(e) => setForm({ ...form, fineAmount: e.target.value })}
                  className="w-full border rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>

              {/* Grace Days */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Grace Days Allowed
                </label>
                <input
                  type="number"
                  value={form.graceDays}
                  onChange={(e) => setForm({ ...form, graceDays: e.target.value })}
                  className="w-full border rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
            </div>

            {/* Maximum Penalty */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Maximum Penalty Cap Limit (₹)
              </label>
              <input
                type="number"
                value={form.maxPenalty}
                onChange={(e) => setForm({ ...form, maxPenalty: e.target.value })}
                className="w-full border rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            {/* Auto Penalty Settings Checkbox Wrapper Box */}
            <div 
              onClick={() => setForm({ ...form, autoPenalty: !form.autoPenalty })}
              className="flex items-center justify-between border rounded-xl p-3.5 bg-slate-50/60 hover:bg-slate-50 cursor-pointer transition select-none"
            >
              <div className="flex items-start gap-2.5">
                <div className={`mt-0.5 ${form.autoPenalty ? "text-blue-600" : "text-slate-400"}`}>
                  <ShieldAlert size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Auto Penalty Allocation</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    Enables the centralized system engine to automatically track and apply daily charges.
                  </p>
                </div>
              </div>

              {/* Styled Interactive Switch Element View */}
              <div className="text-slate-400 transition-colors">
                {form.autoPenalty ? (
                  <ToggleRight size={32} className="text-blue-600" />
                ) : (
                  <ToggleLeft size={32} className="text-slate-300" />
                )}
              </div>
            </div>

            {/* Submission CTA Block */}
            <div className="pt-2 border-t border-dashed">
              <button
                onClick={saveSettings}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs tracking-wider uppercase shadow-sm transition"
              >
                <Save size={14} />
                Save Policy Configurations
              </button>
            </div>

          </div>
        </div>

        {/* Right Side: Projected Sandbox Live Calculation Preview Panel */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden h-fit">
          
          <div className="p-5 border-b flex items-center gap-2 bg-slate-50/50">
            <Scale size={16} className="text-slate-400" />
            <h2 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
              Penalty Engine Preview
            </h2>
          </div>

          <div className="p-5 space-y-4">
            
            {/* Context Notice Alert info banner */}
            <div className="flex gap-2 p-3 rounded-xl bg-blue-50/40 border border-blue-100/40 text-slate-500">
              <BadgeInfo size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-medium leading-relaxed">
                Calculated live metrics simulation evaluated against an assumption ledger record displaying <b>7 missed days</b> total default period.
              </p>
            </div>

            {/* Value Lists Summary */}
            <div className="space-y-2.5 pt-1 text-xs border-b border-dashed pb-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Simulation Cycle Default</span>
                <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">7 Missed Days</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Configured Grace Period</span>
                <span className="font-bold text-slate-700">{form.graceDays} Days</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">System fine metric value</span>
                <span className="font-bold text-slate-700">₹{Number(form.fineAmount).toLocaleString("en-IN")} / Day</span>
              </div>
            </div>

            {/* Projection Output Block Footer */}
            <div className="bg-red-50/50 border border-red-100/50 rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                Projected System Penalty
              </p>
              <h3 className="text-2xl font-black text-red-600 mt-1">
                ₹{(projectedPenaltyResult >= 0 ? projectedPenaltyResult : 0).toLocaleString("en-IN")}
              </h3>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default PenaltySettings;