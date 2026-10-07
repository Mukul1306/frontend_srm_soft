import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ShieldAlert,
  Users,
  UserCheck,
  CheckCircle2,
  XCircle,
  Percent,
  IndianRupee,
  Calendar,
  AlertTriangle,
  Search,
  Check,
  RotateCcw,
  Sparkles,
  Info
} from "lucide-react";

// =====================================================
// AWS BACKEND
// =====================================================
const API_BASE = "https://aws.srmfinance.online/api/daily";

// =====================================================
// DEFAULT RULE
// =====================================================
const DEFAULT_RULE = {
  enabled: true,
  penaltyType: "PERCENTAGE",
  penaltyValue: 0,
  gracePeriod: 0,
  maxPenalty: 0,
};

const PenaltySettings = () => {
  // =====================================================
  // STATE
  // =====================================================
  const [appliesTo, setAppliesTo] = useState("BOTH");
  const [scope, setScope] = useState("ALL");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [existingPolicy, setExistingPolicy] = useState(null);
  const [rule, setRule] = useState({ ...DEFAULT_RULE });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD INITIAL DATA
  // =====================================================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [policyResponse, membersResponse] = await Promise.all([
        axios.get(`${API_BASE}/penalty-control`),
        axios.get(`${API_BASE}/penalty-control/members`),
      ]);

      if (policyResponse.data?.success) {
        const policy = policyResponse.data.policy || null;
        setExistingPolicy(policy);
        if (policy) {
          loadRuleFromPolicy(policy, appliesTo);
        }
      }

      if (membersResponse.data?.success) {
        setMembers(membersResponse.data.members || []);
      }
    } catch (err) {
      console.error("LOAD PENALTY CONTROL ERROR:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load penalty control configurations."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRuleFromPolicy = (policy, target) => {
    if (!policy) {
      setRule({ ...DEFAULT_RULE });
      return;
    }

    if (target === "LOAN") {
      setRule({ ...DEFAULT_RULE, ...(policy.loan || {}) });
      return;
    }

    if (target === "DAILY_SAVING") {
      setRule({ ...DEFAULT_RULE, ...(policy.dailySaving || {}) });
      return;
    }

    if (target === "BOTH") {
      setRule({ ...DEFAULT_RULE, ...(policy.loan || {}) });
    }
  };

  const handleAppliesToChange = (value) => {
    setAppliesTo(value);
    if (existingPolicy) {
      loadRuleFromPolicy(existingPolicy, value);
    } else {
      setRule({ ...DEFAULT_RULE });
    }
    setMessage("");
    setError("");
  };

  const updateRule = (field, value) => {
    setRule((previous) => ({
      ...previous,
      [field]: value,
    }));
    setMessage("");
    setError("");
  };

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return members;

    return members.filter((member) => {
      const name = member.memberName || member.name || "";
      const memberId = member.memberId || "";
      const mobile = member.mobile || "";

      return (
        String(name).toLowerCase().includes(keyword) ||
        String(memberId).toLowerCase().includes(keyword) ||
        String(mobile).toLowerCase().includes(keyword)
      );
    });
  }, [members, search]);

  const toggleMember = (memberId) => {
    setSelectedMembers((previous) =>
      previous.includes(memberId)
        ? previous.filter((id) => id !== memberId)
        : [...previous, memberId]
    );
    setMessage("");
    setError("");
  };

  const selectAllFiltered = () => {
    const ids = filteredMembers.map((m) => m._id);
    setSelectedMembers((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const clearMembers = () => {
    setSelectedMembers([]);
  };

  const validateForm = () => {
    if (!["LOAN", "DAILY_SAVING", "BOTH"].includes(appliesTo)) {
      setError("Please select Loan, Daily Saving, or Both.");
      return false;
    }

    if (!["ALL", "SPECIFIC"].includes(scope)) {
      setError("Please select member scope.");
      return false;
    }

    if (scope === "SPECIFIC" && selectedMembers.length === 0) {
      setError("Please select at least one member.");
      return false;
    }

    const penaltyValue = Number(rule.penaltyValue);
    const gracePeriod = Number(rule.gracePeriod);
    const maxPenalty = Number(rule.maxPenalty);

    if (!Number.isFinite(penaltyValue) || penaltyValue < 0) {
      setError("Penalty value must be 0 or greater.");
      return false;
    }

    if (!Number.isFinite(gracePeriod) || gracePeriod < 0) {
      setError("Grace period must be 0 or greater.");
      return false;
    }

    if (!Number.isFinite(maxPenalty) || maxPenalty < 0) {
      setError("Maximum penalty must be 0 or greater.");
      return false;
    }

    if (rule.penaltyType === "PERCENTAGE" && penaltyValue > 100) {
      setError("Percentage cannot be greater than 100%.");
      return false;
    }

    return true;
  };

  const handleApplyPolicy = async () => {
    setMessage("");
    setError("");

    if (!validateForm()) return;

    const confirmed = window.confirm(
      "Are you sure you want to apply this penalty policy?\n\n" +
        "This will update penalty calculation parameters across all eligible accounts."
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      const payload = {
        appliesTo,
        scope,
        memberIds: scope === "SPECIFIC" ? selectedMembers : [],
        rule: {
          enabled: rule.enabled !== false,
          penaltyType: rule.penaltyType,
          penaltyValue: Number(rule.penaltyValue || 0),
          gracePeriod: Number(rule.gracePeriod || 0),
          maxPenalty: Number(rule.maxPenalty || 0),
        },
      };

      const response = await axios.post(`${API_BASE}/penalty-control`, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      });

      if (!response.data || response.data.success !== true) {
        throw new Error(
          response.data?.message || "Backend failed to process policy."
        );
      }

      setMessage(
        response.data.message || "Penalty policy applied successfully."
      );
      setError("");
      await loadData();

      if (scope === "ALL") {
        setSelectedMembers([]);
      }
    } catch (err) {
      console.error("APPLY PENALTY POLICY ERROR:", err);
      if (err.response) {
        setError(
          err.response.data?.message || `Server Error: ${err.response.status}`
        );
      } else if (err.request) {
        setError(
          "Network request sent but no response returned from AWS server."
        );
      } else {
        setError(err.message || "Failed to apply penalty policy.");
      }
    } finally {
      setSaving(false);
    }
  };

  const preview = useMemo(() => {
    const amount = 1000;
    const value = Number(rule.penaltyValue || 0);
    const max = Number(rule.maxPenalty || 0);
    let penalty = 0;

    if (rule.penaltyType === "FIXED") {
      penalty = value;
    } else {
      penalty = (amount * value) / 100;
    }

    if (max > 0) {
      penalty = Math.min(penalty, max);
    }

    return {
      amount,
      penalty,
      total: amount + penalty,
    };
  }, [rule.penaltyType, rule.penaltyValue, rule.maxPenalty]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm font-semibold text-slate-600">
          Loading Penalty Control Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-3 sm:p-5 md:p-8 antialiased">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <ShieldAlert size={22} />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Penalty Control
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure centralized overdue penalties, grace periods, and account scopes.
            </p>
          </div>
        </div>

        {/* ================= ALERTS ================= */}
        {message && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50/90 text-emerald-800 shadow-sm">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Policy Applied Successfully</p>
              <p className="text-xs text-emerald-700 mt-0.5">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50/90 text-rose-800 shadow-sm">
            <XCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Action Failed</p>
              <p className="text-xs text-rose-700 mt-0.5 break-words">{error}</p>
            </div>
          </div>
        )}

        {/* ================= MAIN CONFIGURATION GRID ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* ================= LEFT / MAIN BUILDER ================= */}
          <div className="xl:col-span-2 space-y-6">
            {/* STEP 1: APPLY TO */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Target Account Type
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* LOAN */}
                <button
                  type="button"
                  onClick={() => handleAppliesToChange("LOAN")}
                  className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                    appliesTo === "LOAN"
                      ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="p-2 rounded-lg bg-blue-100 text-blue-700 text-lg font-bold">
                      ₹
                    </span>
                    {appliesTo === "LOAN" && (
                      <Check size={16} className="text-blue-600" />
                    )}
                  </div>
                  <p className="font-extrabold text-sm text-slate-900 mt-3">
                    Loan Accounts
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Apply rules only to loan products
                  </p>
                </button>

                {/* DAILY SAVING */}
                <button
                  type="button"
                  onClick={() => handleAppliesToChange("DAILY_SAVING")}
                  className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                    appliesTo === "DAILY_SAVING"
                      ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700 text-lg">
                      <Calendar size={18} />
                    </span>
                    {appliesTo === "DAILY_SAVING" && (
                      <Check size={16} className="text-blue-600" />
                    )}
                  </div>
                  <p className="font-extrabold text-sm text-slate-900 mt-3">
                    Daily Saving
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Apply rules only to saving accounts
                  </p>
                </button>

                {/* BOTH */}
                <button
                  type="button"
                  onClick={() => handleAppliesToChange("BOTH")}
                  className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                    appliesTo === "BOTH"
                      ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="p-2 rounded-lg bg-indigo-100 text-indigo-700 text-lg">
                      <RotateCcw size={18} />
                    </span>
                    {appliesTo === "BOTH" && (
                      <Check size={16} className="text-blue-600" />
                    )}
                  </div>
                  <p className="font-extrabold text-sm text-slate-900 mt-3">
                    Both Accounts
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Loan + Daily Saving portfolio
                  </p>
                </button>
              </div>
            </div>

            {/* STEP 2: MEMBER SCOPE */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Target Member Scope
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScope("ALL")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    scope === "ALL"
                      ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                      <Users size={18} />
                    </div>
                    {scope === "ALL" && <Check size={16} className="text-blue-600" />}
                  </div>
                  <p className="font-extrabold text-sm text-slate-900 mt-3">
                    All Active Members
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Broad update across all registered holders
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setScope("SPECIFIC")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    scope === "SPECIFIC"
                      ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                      <UserCheck size={18} />
                    </div>
                    {scope === "SPECIFIC" && (
                      <Check size={16} className="text-blue-600" />
                    )}
                  </div>
                  <p className="font-extrabold text-sm text-slate-900 mt-3">
                    Specific Selected Members
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Target only chosen account IDs
                  </p>
                </button>
              </div>

              {/* SELECT MEMBERS PANEL */}
              {scope === "SPECIFIC" && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Choose Individual Members
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {selectedMembers.length} member(s) currently highlighted
                      </p>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={selectAllFiltered}
                        className="flex-1 sm:flex-initial text-xs px-3 py-1.5 font-bold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700"
                      >
                        Select All Filtered
                      </button>
                      <button
                        type="button"
                        onClick={clearMembers}
                        className="flex-1 sm:flex-initial text-xs px-3 py-1.5 font-bold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* SEARCH */}
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search member name, ID or mobile..."
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  {/* MEMBER CHECKLIST */}
                  <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                    {filteredMembers.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 font-medium">
                        No matching members found.
                      </div>
                    ) : (
                      filteredMembers.map((member) => {
                        const id = member._id;
                        const selected = selectedMembers.includes(id);

                        return (
                          <label
                            key={id}
                            className={`flex items-center gap-3 p-3 text-xs cursor-pointer transition ${
                              selected
                                ? "bg-blue-50/70"
                                : "hover:bg-slate-50/80"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleMember(id)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-900 truncate">
                                {member.memberName || member.name || "Unnamed"}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                ID: {member.memberId || "N/A"} • Mobile:{" "}
                                {member.mobile || "N/A"}
                              </p>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: PENALTY RULE CONFIG */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
                  3
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Penalty Calculation Parameters
                </h2>
              </div>

              {/* AUTO PENALTY TOGGLE */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <p className="font-extrabold text-sm text-slate-900">
                    Automated Penalty Engine
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enable automatic calculation on overdue items
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateRule("enabled", !rule.enabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    rule.enabled ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      rule.enabled ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* TYPE TOGGLE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Penalty Metric Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateRule("penaltyType", "FIXED")}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      rule.penaltyType === "FIXED"
                        ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-500/20"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <IndianRupee size={15} /> Fixed Amount (₹)
                  </button>

                  <button
                    type="button"
                    onClick={() => updateRule("penaltyType", "PERCENTAGE")}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      rule.penaltyType === "PERCENTAGE"
                        ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-500/20"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Percent size={15} /> Percentage Rate (%)
                  </button>
                </div>
              </div>

              {/* INPUT FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* VALUE */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Penalty Value {rule.penaltyType === "PERCENTAGE" ? "(%)" : "(₹)"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={rule.penaltyType === "PERCENTAGE" ? 100 : undefined}
                    value={rule.penaltyValue}
                    onChange={(e) => updateRule("penaltyValue", e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* GRACE PERIOD */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Grace Period (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rule.gracePeriod}
                    onChange={(e) => updateRule("gracePeriod", e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* MAX PENALTY */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Maximum Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rule.maxPenalty}
                    onChange={(e) => updateRule("maxPenalty", e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    0 = Unlimited max cap
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT SIDE / PREVIEW & ACTIONS ================= */}
          <div className="space-y-6">
            {/* PREVIEW CARD */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles size={18} className="text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Live Impact Preview
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Sample output computed on a baseline overdue amount of ₹1,000.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Sample Base Amount</span>
                  <span className="font-bold text-slate-800">₹1,000.00</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Computed Penalty</span>
                  <span className="font-bold text-rose-600">
                    + ₹{preview.penalty.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm">
                  <span>Estimated Total</span>
                  <span className="text-blue-700">₹{preview.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* CURRENT ACTIVE POLICY */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Info size={18} className="text-slate-400" />
                <h2 className="text-base font-bold text-slate-900">
                  Active System Policy
                </h2>
              </div>

              {existingPolicy ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-600">Loan Engine</span>
                    <span className="font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {existingPolicy.loan?.penaltyType || "-"} •{" "}
                      {existingPolicy.loan?.penaltyValue ?? 0}
                      {existingPolicy.loan?.penaltyType === "PERCENTAGE" ? "%" : "₹"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-600">Daily Saving</span>
                    <span className="font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {existingPolicy.dailySaving?.penaltyType || "-"} •{" "}
                      {existingPolicy.dailySaving?.penaltyValue ?? 0}
                      {existingPolicy.dailySaving?.penaltyType === "PERCENTAGE"
                        ? "%"
                        : "₹"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No active server configuration loaded.
                </p>
              )}
            </div>

            {/* WARNING NOTE */}
            <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/70 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertTriangle size={16} />
                <span>Underwriting Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800/90">
                Applying updates parameters on active accounts. Past settled ledger receipts and paid installments are locked and unaffected.
              </p>
            </div>

            {/* ACTION PANEL */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Scope Mode</span>
                  <span className="font-bold text-slate-800">
                    {scope === "ALL" ? "All Accounts" : `${selectedMembers.length} Members`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Target Type</span>
                  <span className="font-bold text-slate-800">
                    {appliesTo === "DAILY_SAVING"
                      ? "Daily Saving"
                      : appliesTo === "LOAN"
                      ? "Loan"
                      : "Loan + Daily Saving"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={handleApplyPolicy}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-sm active:scale-[0.99] cursor-pointer"
              >
                {saving ? "Applying Policy..." : "Apply Penalty Policy"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PenaltySettings;