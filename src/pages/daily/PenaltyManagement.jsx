import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  Wallet,
  RefreshCw,
  Users,
  XCircle,
  ShieldAlert,
  ArrowUpRight,
  Phone,
} from "lucide-react";

const API_URL =
  "https://aws.srmfinance.online/api/daily/penalty/management";

const PenaltyManagement = () => {
  const [cards, setCards] = useState({
    dailyPenaltyPending: 0,
    dailyPenaltyCollected: 0,
    dailyPenaltyThisMonth: 0,
    loanPenaltyPending: 0,
    loanPenaltyCollected: 0,
    loanPenaltyThisMonth: 0,
  });

  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD DATA
  // ==========================================
  const loadPenaltyManagement = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      if (response.data?.success) {
        setCards(
          response.data.cards || {
            dailyPenaltyPending: 0,
            dailyPenaltyCollected: 0,
            dailyPenaltyThisMonth: 0,
            loanPenaltyPending: 0,
            loanPenaltyCollected: 0,
            loanPenaltyThisMonth: 0,
          }
        );
        setMembers(response.data.members || []);
      } else {
        setError(
          response.data?.message || "Unable to load penalty data at this time"
        );
      }
    } catch (err) {
      console.error("Penalty Management Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load penalty management records"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPenaltyManagement();
  }, []);

  // ==========================================
  // HELPERS
  // ==========================================
  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return members;

    return members.filter((member) => {
      return (
        String(member.memberId || "").toLowerCase().includes(query) ||
        String(member.memberName || "").toLowerCase().includes(query) ||
        String(member.mobile || "").toLowerCase().includes(query)
      );
    });
  }, [members, search]);

  // Modern Colored Cards Setup
  const dailyCards = [
    {
      title: "Daily Penalty Pending",
      subtitle: "Pending till today",
      value: cards.dailyPenaltyPending,
      icon: Clock3,
      theme: {
        cardBg: "bg-gradient-to-br from-rose-50/80 via-white to-rose-50/20",
        border: "border-rose-200/80 hover:border-rose-300",
        iconBg: "bg-rose-500/10 text-rose-600 ring-rose-500/20",
        valColor: "text-rose-950",
      },
    },
    {
      title: "Daily Penalty Collected",
      subtitle: "Lifetime collected",
      value: cards.dailyPenaltyCollected,
      icon: CheckCircle2,
      theme: {
        cardBg: "bg-gradient-to-br from-teal-50/80 via-white to-teal-50/20",
        border: "border-teal-200/80 hover:border-teal-300",
        iconBg: "bg-teal-500/10 text-teal-600 ring-teal-500/20",
        valColor: "text-teal-950",
      },
    },
    {
      title: "Daily This Month",
      subtitle: "Collected this month",
      value: cards.dailyPenaltyThisMonth,
      icon: CalendarDays,
      theme: {
        cardBg: "bg-gradient-to-br from-cyan-50/80 via-white to-cyan-50/20",
        border: "border-cyan-200/80 hover:border-cyan-300",
        iconBg: "bg-cyan-500/10 text-cyan-600 ring-cyan-500/20",
        valColor: "text-cyan-950",
      },
    },
  ];

  const loanCards = [
    {
      title: "Loan Penalty Pending",
      subtitle: "Pending till today",
      value: cards.loanPenaltyPending,
      icon: AlertCircle,
      theme: {
        cardBg: "bg-gradient-to-br from-amber-50/80 via-white to-amber-50/20",
        border: "border-amber-200/80 hover:border-amber-300",
        iconBg: "bg-amber-500/10 text-amber-600 ring-amber-500/20",
        valColor: "text-amber-950",
      },
    },
    {
      title: "Loan Penalty Collected",
      subtitle: "Lifetime collected",
      value: cards.loanPenaltyCollected,
      icon: Wallet,
      theme: {
        cardBg: "bg-gradient-to-br from-violet-50/80 via-white to-violet-50/20",
        border: "border-violet-200/80 hover:border-violet-300",
        iconBg: "bg-violet-500/10 text-violet-600 ring-violet-500/20",
        valColor: "text-violet-950",
      },
    },
    {
      title: "Loan This Month",
      subtitle: "Collected this month",
      value: cards.loanPenaltyThisMonth,
      icon: CalendarDays,
      theme: {
        cardBg: "bg-gradient-to-br from-fuchsia-50/80 via-white to-fuchsia-50/20",
        border: "border-fuchsia-200/80 hover:border-fuchsia-300",
        iconBg: "bg-fuchsia-500/10 text-fuchsia-600 ring-fuchsia-500/20",
        valColor: "text-fuchsia-950",
      },
    },
  ];

  const renderCard = (card) => {
    const Icon = card.icon;
    const { cardBg, border, iconBg, valColor } = card.theme;

    return (
      <div
        key={card.title}
        className={`group relative ${cardBg} border ${border} rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between min-w-0`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-500 truncate">
              {card.title}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
              {card.subtitle}
            </p>
          </div>
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 ring-1 group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon size={18} className="sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="mt-4 sm:mt-5 flex items-baseline justify-between gap-2 flex-wrap">
          <h3
            className={`text-xl sm:text-2xl lg:text-3xl font-black ${valColor} tracking-tight break-all`}
          >
            {formatMoney(card.value)}
          </h3>
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 group-hover:text-slate-700 flex items-center gap-0.5 transition-colors shrink-0">
            Overview <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    );
  };

  // ==========================================
  // MOBILE MEMBER CARD (replaces table row on small screens)
  // ==========================================
  const renderMemberCard = (member) => {
    const daily = Number(member.dailyPenaltyPending || 0);
    const loan = Number(member.loanPenaltyPending || 0);
    const total = Number(member.totalPenaltyPending ?? daily + loan);

    return (
      <div
        key={member._id || member.memberId}
        className="p-4 border-b border-slate-100 last:border-b-0 active:bg-indigo-50/40 transition-colors"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0">
              {member.memberName?.charAt(0)?.toUpperCase() || "M"}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">
                {member.memberName || "—"}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
                ID: {member.memberId || "—"}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-black tracking-tight shrink-0 ${
              total > 0
                ? "bg-gradient-to-r from-rose-50 to-amber-50 text-rose-700 border border-rose-200/80"
                : "bg-slate-100/80 text-slate-400 border border-slate-200/50"
            }`}
          >
            {formatMoney(total)}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 flex items-center gap-1">
              <Phone size={11} /> Mobile
            </p>
            <p className="text-xs font-semibold text-slate-600 mt-0.5 truncate">
              {member.mobile || "—"}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Daily
            </p>
            <p
              className={`text-xs font-extrabold mt-0.5 truncate ${
                daily > 0 ? "text-rose-600" : "text-slate-300"
              }`}
            >
              {formatMoney(daily)}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Loan
            </p>
            <p
              className={`text-xs font-extrabold mt-0.5 truncate ${
                loan > 0 ? "text-amber-600" : "text-slate-300"
              }`}
            >
              {formatMoney(loan)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // SKELETON LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900/5 p-3 xs:p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-7 sm:h-8 w-48 sm:w-64 bg-slate-200/80 rounded-xl" />
              <div className="h-3.5 sm:h-4 w-64 sm:w-80 max-w-full bg-slate-200/60 rounded-lg" />
            </div>
            <div className="h-10 w-full sm:w-28 bg-slate-200/80 rounded-xl" />
          </div>

          {[1, 2].map((group) => (
            <div key={group} className="space-y-4">
              <div className="h-5 sm:h-6 w-32 sm:w-40 bg-slate-200/80 rounded-lg" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-32 sm:h-36 bg-white/70 rounded-2xl border border-slate-200/60 p-5"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {/* =====================================
            HEADER WITH GRADIENT ACCENT
        ====================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <ShieldAlert size={22} className="sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight truncate">
                Penalty Management
              </h1>
              <p className="text-[11px] sm:text-sm font-semibold text-slate-500 mt-0.5 leading-snug">
                Monitor live recovery status for daily savings and loan penalties
              </p>
            </div>
          </div>

          <button
            onClick={loadPenaltyManagement}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] w-full sm:w-auto bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 active:scale-95 transition-all shadow-xs disabled:opacity-50 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          >
            <RefreshCw
              size={16}
              className={`text-slate-500 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* =====================================
            ERROR NOTICE
        ====================================== */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-200 rounded-2xl text-rose-700 shadow-2xs">
            <XCircle size={20} className="shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm font-bold break-words">{error}</div>
          </div>
        )}

        {/* =====================================
            DAILY SAVINGS SECTION
        ====================================== */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-5 rounded-full bg-gradient-to-b from-teal-500 to-emerald-600 shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Daily Savings Penalty Breakdown
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {dailyCards.map(renderCard)}
          </div>
        </section>

        {/* =====================================
            LOAN PENALTIES SECTION
        ====================================== */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-5 rounded-full bg-gradient-to-b from-violet-500 to-indigo-600 shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Loan Penalty Breakdown
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {loanCards.map(renderCard)}
          </div>
        </section>

        {/* =====================================
            MEMBER AUDIT: TABLE (md+) / CARD LIST (mobile)
        ====================================== */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          {/* SEARCH & TITLE TOOLBAR */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Member Penalty Audit
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                Detailed record of pending fines per account
              </p>
            </div>

            <div className="relative w-full md:w-80 shrink-0">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                inputMode="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, name, or phone..."
                className="w-full pl-10 pr-4 py-2.5 min-h-[44px] bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
            </div>
          </div>

          {/* EMPTY STATE (shared) */}
          {filteredMembers.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="flex flex-col items-center justify-center max-w-xs mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    No accounts match your query
                  </p>
                  <p className="text-xs text-slate-400">
                    Try adjusting your search criteria or clear the input.
                  </p>
                </div>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="px-3.5 py-2 min-h-[40px] text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    Reset Search Filter
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* MOBILE / TABLET CARD LIST — avoids horizontal scrolling on small screens */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredMembers.map(renderMemberCard)}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/60 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="px-5 py-3.5">Member</th>
                      <th className="px-5 py-3.5">Mobile</th>
                      <th className="px-5 py-3.5 text-right">Daily Penalty</th>
                      <th className="px-5 py-3.5 text-right">Loan Penalty</th>
                      <th className="px-5 py-3.5 text-right">Total Outstanding</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredMembers.map((member) => {
                      const daily = Number(member.dailyPenaltyPending || 0);
                      const loan = Number(member.loanPenaltyPending || 0);
                      const total = Number(
                        member.totalPenaltyPending ?? daily + loan
                      );

                      return (
                        <tr
                          key={member._id || member.memberId}
                          className="hover:bg-indigo-50/30 transition-colors group"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0">
                                {member.memberName?.charAt(0)?.toUpperCase() ||
                                  "M"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                  {member.memberName || "—"}
                                </p>
                                <p className="text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
                                  ID: {member.memberId || "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5 font-semibold text-slate-600 whitespace-nowrap">
                            {member.mobile || "—"}
                          </td>

                          <td className="px-5 py-3.5 text-right font-extrabold whitespace-nowrap">
                            <span
                              className={
                                daily > 0 ? "text-rose-600" : "text-slate-300"
                              }
                            >
                              {formatMoney(daily)}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-right font-extrabold whitespace-nowrap">
                            <span
                              className={
                                loan > 0 ? "text-amber-600" : "text-slate-300"
                              }
                            >
                              {formatMoney(loan)}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <span
                              className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-black tracking-tight transition-all ${
                                total > 0
                                  ? "bg-gradient-to-r from-rose-50 to-amber-50 text-rose-700 border border-rose-200/80 shadow-2xs"
                                  : "bg-slate-100/80 text-slate-400 border border-slate-200/50"
                              }`}
                            >
                              {formatMoney(total)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* FOOTER */}
          <div className="px-4 sm:px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col xs:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium">
            <span className="text-center xs:text-left">
              Showing{" "}
              <strong className="font-bold text-slate-800">
                {filteredMembers.length}
              </strong>{" "}
              of{" "}
              <strong className="font-bold text-slate-800">
                {members.length}
              </strong>{" "}
              members
            </span>

            {search && (
              <button
                onClick={() => setSearch("")}
                className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors min-h-[36px] px-2"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PenaltyManagement;