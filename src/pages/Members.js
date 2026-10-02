import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiPlus,
  FiSearch,
  FiMail,
  FiPhone,
  FiChevronDown,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiUser,
  FiMoreHorizontal,
  FiEye,
  FiEdit,
  FiTrash2,
  FiInbox,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// Deterministic avatar accent so the same member always gets the same color
const AVATAR_THEMES = [
  { bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-100" },
  { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-100" },
  { bg: "bg-sky-50", text: "text-sky-600", ring: "ring-sky-100" },
  { bg: "bg-teal-50", text: "text-teal-600", ring: "ring-teal-100" },
  { bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-100" },
  { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-100" },
];

const getAvatarTheme = (seed) => {
  const str = seed || "MB";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_THEMES[Math.abs(hash) % AVATAR_THEMES.length];
};

function Members() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("newest");
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [societyFilter, setSocietyFilter] = useState("all");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
  });

  useEffect(() => {
    fetchMembers();
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get(
        "https://finance-project-0qqk.onrender.com/api/reports/dashboard"
      );
      setStats(res.data || { totalMembers: 0, activeMembers: 0 });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://finance-project-0qqk.onrender.com/api/member/all"
      );
      setMembers(res.data.members || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this member?"
    );
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `https://finance-project-0qqk.onrender.com/api/member/delete/${id}`
      );
      alert(res.data.message || "Member deleted successfully");
      fetchMembers();
    } catch (error) {
      alert(error.response?.data?.message || "Delete Failed");
    }
  };

  // Filter functionality by search criteria
  const filteredMembers = members.filter((member) => {
    const searchText = search.trim().toLowerCase();
    return (
      member.name?.toLowerCase().includes(searchText) ||
      member.memberId?.toLowerCase().includes(searchText) ||
      member.mobile?.includes(searchText) ||
      member.email?.toLowerCase().includes(searchText)
    );
  });

  // Filter functionality by assigned society name
  const dynamicFilteredMembers = filteredMembers.filter((member) => {
    if (societyFilter === "all") return true;
    return member.societyId?.societyName === societyFilter;
  });

  // Derive payment status from the actual pending/overdue amounts.
  // Do not trust a stale member.status value when money is still pending.
  const getPaymentStatus = (member) => {
    const rawStatus = String(member?.status || "").toUpperCase();
    const pendingAmount = Number(member?.pendingAmount || 0);
    const overdueAmount = Number(member?.overdueAmount || 0);
    const pendingPenalty = Number(member?.pendingPenaltyTillToday || 0);

    // Completed only when there is no unpaid balance.
    if (
      rawStatus === "COMPLETED" &&
      pendingAmount <= 0 &&
      overdueAmount <= 0
    ) {
      return "COMPLETED";
    }

    // Any overdue balance has priority.
    if (overdueAmount > 0 || rawStatus === "OVERDUE") {
      return "OVERDUE";
    }

    // Current due/pending installment.
    if (
      pendingAmount > 0 ||
      pendingPenalty > 0 ||
      rawStatus === "DUE"
    ) {
      return "DUE";
    }

    // ACTIVE is an account/member status, not a payment status.
    // If there is no pending balance, display PAID.
    if (rawStatus === "ACTIVE" || rawStatus === "PAID") {
      return "PAID";
    }

    return rawStatus || "PAID";
  };

  // Dynamic sorting engine based on selection
  const sortedMembers = [...dynamicFilteredMembers].sort((a, b) => {
    const statusA = getPaymentStatus(a);
    const statusB = getPaymentStatus(b);

    switch (sortBy) {
      case "az":
        return (a.name || "").localeCompare(b.name || "");
      case "za":
        return (b.name || "").localeCompare(a.name || "");
      case "highestPaid":
        return (b.totalPaid || 0) - (a.totalPaid || 0);
      case "highestPending":
        return (b.pendingAmount || 0) - (a.pendingAmount || 0);
      case "highestPenalty":
        return (b.totalPenaltyPaid || 0) - (a.totalPenaltyPaid || 0);
      case "active":
        return statusA === "PAID" ? -1 : 1;
      case "due":
        return statusA === "DUE" ? -1 : 1;
      case "overdue":
        return statusA === "OVERDUE" ? -1 : 1;
      case "completed":
        return statusA === "COMPLETED" ? -1 : 1;
      case "oldest":
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  // Extract CSS payload mapping for status pills
  const getStatusBadgeStyle = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "PAID" || s === "ACTIVE") {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    }
    if (s === "DUE") {
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
    }
    if (s === "OVERDUE") {
      return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200";
    }
    if (s === "COMPLETED") {
      return "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200";
    }
    return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
  };

  const getStatusDotStyle = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "PAID" || s === "ACTIVE") return "bg-emerald-500";
    if (s === "DUE") return "bg-amber-500";
    if (s === "OVERDUE") return "bg-rose-500";
    if (s === "COMPLETED") return "bg-sky-500";
    return "bg-slate-400";
  };

  // Fallback initial string generator
  const getInitials = (name) => {
    if (!name) return "MB";
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Share of dues already collected, used for the ledger progress bar
  const getPaidRatio = (member) => {
    const paid = member.totalPaid || 0;
    const overdue = member.overdueAmount || 0;
    const total = paid + overdue;
    if (total <= 0) return paid > 0 ? 100 : 0;
    return Math.round((paid / total) * 100);
  };

  const uniqueSocieties = [...new Set(members.map((m) => m.societyId?.societyName).filter(Boolean))];

  const hasActiveFilters = search.trim() !== "" || societyFilter !== "all" || sortBy !== "newest";

  const statCards = [
    {
      label: "Active Members",
      value: stats.activeMembers,
      icon: FiUser,
      accent: "text-indigo-600",
      iconBg: "bg-indigo-50",
      iconText: "text-indigo-600",
    },
    {
      label: "Paid Operators",
      value: members.filter((m) => getPaymentStatus(m) === "PAID").length,
      icon: FiCheckCircle,
      accent: "text-emerald-600",
      iconBg: "bg-emerald-50",
      iconText: "text-emerald-600",
    },
    {
      label: "Late Payments",
      value: members.filter((m) => getPaymentStatus(m) === "DUE").length,
      icon: FiClock,
      accent: "text-amber-600",
      iconBg: "bg-amber-50",
      iconText: "text-amber-600",
    },
    {
      label: "Overdue Alerts",
      value: members.filter((m) => getPaymentStatus(m) === "OVERDUE").length,
      icon: FiAlertCircle,
      accent: "text-rose-600",
      iconBg: "bg-rose-50",
      iconText: "text-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7fb] font-sans text-slate-800 antialiased">
      <div className="mx-auto max-w-[1400px] space-y-4 p-3 sm:space-y-6 sm:p-6 lg:p-8">

        {/* TOP HEADER SECTION */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 sm:text-[11px]">
                Member Registry
              </span>
            </div>
            <h1 className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-2xl">
              Members Management
            </h1>
            <p className="mt-0.5 max-w-xl text-xs font-medium text-slate-500 sm:mt-1 sm:text-sm">
              Audit configurations and personal registries of all centralized pool members.
            </p>
          </div>

          <button
            onClick={() => navigate("/add-member")}
            className="flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] sm:w-auto sm:px-5 sm:text-sm"
          >
            <FiPlus className="stroke-[3] text-base" /> Add Member
          </button>
        </div>

        {/* STATS ANALYTICAL COUNTER BLOCKS */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, iconBg, iconText }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md sm:p-5"
            >
              <div className="min-w-0">
                <span className="block truncate text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[11px]">
                  {label}
                </span>
                <h2 className="mt-0.5 truncate text-xl font-black text-slate-900 sm:mt-1 sm:text-3xl">
                  {loading ? (
                    <span className="inline-block h-6 w-8 animate-pulse rounded bg-slate-200 align-middle sm:h-7 sm:w-10" />
                  ) : (
                    value
                  )}
                </h2>
              </div>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm sm:h-12 sm:w-12 sm:text-lg ${iconBg} ${iconText}`}>
                <Icon className="stroke-[2.5]" />
              </div>
            </div>
          ))}
        </div>

        {/* MAIN CONTENT REGISTRY CONTAINER */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* CONTROLS BAR */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wide text-slate-900 sm:text-sm">
                All Registered Members
              </h3>
              <p className="mt-0.5 text-xs font-medium text-slate-400">
                A multi-tenant distribution list of registered system actors.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
              {/* Search Input */}
              <div className="relative col-span-1 sm:col-span-2 lg:w-64">
                <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input
                  type="text"
                  placeholder="Search ID, name, mobile…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-800 outline-none transition-colors focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Society Filter */}
              <div className="relative w-full lg:w-auto">
                <select
                  value={societyFilter}
                  onChange={(e) => setSocietyFilter(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-8 text-xs font-bold text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-indigo-400"
                >
                  <option value="all">All Societies</option>
                  {uniqueSocieties.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500" />
              </div>

              {/* Sort Options */}
              <div className="relative w-full lg:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-8 text-xs font-bold text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-indigo-400"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="az">A → Z</option>
                  <option value="za">Z → A</option>
                  <option value="highestPaid">Highest Paid</option>
                  <option value="highestPending">Highest Pending</option>
                  <option value="highestPenalty">Highest Penalty</option>
                  <option value="active">Status: Active</option>
                  <option value="due">Status: Due</option>
                  <option value="overdue">Status: Overdue</option>
                  <option value="completed">Status: Completed</option>
                </select>
                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500" />
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setSearch("");
                  setSortBy("newest");
                  setSocietyFilter("all");
                }}
                disabled={!hasActiveFilters}
                className="col-span-1 sm:col-span-2 lg:col-span-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-rose-50"
              >
                <FiX className="text-sm" /> Reset Filters
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3 sm:px-6">
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:text-[11px]">Filtered:</span>
              {search.trim() && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 sm:text-[11px]">
                  “{search}”
                </span>
              )}
              {societyFilter !== "all" && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 sm:text-[11px]">
                  {societyFilter}
                </span>
              )}
              <span className="ml-auto text-[10px] font-bold text-slate-400 sm:text-[11px]">
                {sortedMembers.length} of {members.length} shown
              </span>
            </div>
          )}

          {/* 1. DESKTOP & TABLET DATA TABLE (Shown on lg screens and up) */}
          <div className="hidden w-full overflow-x-auto lg:block">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Member Profile</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact Metadata</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned Society</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Ledger Status</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Paid</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Balance</th>
                  <th className="w-20 px-6 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`}>
                      <td className="px-6 py-4" colSpan={7}>
                        <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
                      </td>
                    </tr>
                  ))}

                {!loading &&
                  sortedMembers.map((member) => {
                    const theme = getAvatarTheme(member.name || member.memberId);
                    const paidRatio = getPaidRatio(member);
                    return (
                      <tr
                        key={member._id}
                        className="cursor-pointer transition-colors hover:bg-slate-50"
                        onClick={() => navigate(`/memberprofile/${member._id}`)}
                      >
                        {/* Profile */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-4 ${theme.bg} ${theme.text} ${theme.ring}`}>
                              {getInitials(member.name)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="truncate text-sm font-black tracking-tight text-slate-900">
                                {member.name}
                              </h4>
                              <p className="mt-0.5 text-[11px] font-bold text-indigo-600">
                                ID: {member.memberId}
                              </p>
                              <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                Joined: {member.joiningDate ? new Date(member.joiningDate).toLocaleDateString("en-IN") : "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="space-y-1 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                              <FiPhone className="text-[11px] text-slate-400" />
                              <span>{member.mobile || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FiMail className="text-[11px] text-slate-400" />
                              <span className="max-w-[180px] truncate">{member.email || "N/A"}</span>
                            </div>
                          </div>
                        </td>

                        {/* Society */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-block rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-xs">
                            {member.societyId?.societyName || "Not Assigned"}
                          </span>
                        </td>

                        {/* Ledger Status */}
                        <td className="whitespace-nowrap px-6 py-4">
                          {(() => {
                            const paymentStatus = getPaymentStatus(member);
                            return (
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusBadgeStyle(paymentStatus)}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotStyle(paymentStatus)}`} />
                                {paymentStatus}
                              </span>
                            );
                          })()}
                        </td>

                        {/* Total Paid */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="w-28">
                            <span className="text-sm font-black text-slate-900">
                              ₹{member.totalPaid ? member.totalPaid.toLocaleString("en-IN") : "0"}
                            </span>
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${paidRatio}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Pending Balance */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex flex-col">
                            <span className={`text-sm font-black ${member.overdueAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                              ₹{(member.overdueAmount || 0).toLocaleString("en-IN")}
                            </span>
                            <span className={`mt-0.5 text-[11px] font-bold ${member.currentPenalty > 0 ? "text-amber-600" : "text-slate-400"}`}>
                              Penalty: ₹{(member.pendingPenaltyTillToday || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="whitespace-nowrap px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === member._id ? null : member._id)}
                              className="cursor-pointer rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
                            >
                              <FiMoreHorizontal className="text-lg" />
                            </button>

                            {activeMenuId === member._id && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setActiveMenuId(null)}
                                />
                                <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      navigate(`/memberprofile/${member._id}`);
                                    }}
                                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                  >
                                    <FiEye className="text-slate-400" /> View
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      navigate(`/edit-member/${member._id}`);
                                    }}
                                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                                  >
                                    <FiEdit className="text-indigo-500" /> Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      deleteMember(member._id);
                                    }}
                                    className="flex w-full cursor-pointer items-center gap-2 border-t border-slate-100 px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                  >
                                    <FiTrash2 className="text-rose-500" /> Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {!loading && sortedMembers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <FiInbox className="text-2xl" />
                        <span className="text-sm font-bold">No matching registry records found.</span>
                        <span className="text-xs font-medium">Try adjusting your search or filters.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 2. MOBILE & TABLET CARD RESPONSIVE LAYOUT (Shown on screens < lg) */}
          <div className="divide-y divide-slate-100 lg:hidden">
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`m-skeleton-${i}`} className="p-4">
                  <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
                </div>
              ))}

            {!loading && sortedMembers.length === 0 && (
              <div className="flex flex-col items-center gap-2 p-10 text-center text-slate-400">
                <FiInbox className="text-2xl" />
                <span className="text-xs font-bold uppercase tracking-wider">No matching records</span>
                <span className="text-[11px] font-medium normal-case">Try adjusting your search or filters.</span>
              </div>
            )}

            {!loading &&
              sortedMembers.map((member) => {
                const theme = getAvatarTheme(member.name || member.memberId);
                const paidRatio = getPaidRatio(member);
                return (
                  <div
                    key={member._id}
                    className="space-y-3 bg-white p-4 transition-colors active:bg-slate-50/80"
                    onClick={() => navigate(`/memberprofile/${member._id}`)}
                  >
                    {/* Header: Avatar, Info, Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-4 ${theme.bg} ${theme.text} ${theme.ring}`}>
                          {getInitials(member.name)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-black text-slate-900">{member.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-indigo-600">ID: {member.memberId}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] font-medium text-slate-400">
                              Joined: {member.joiningDate ? new Date(member.joiningDate).toLocaleDateString("en-IN") : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {(() => {
                        const paymentStatus = getPaymentStatus(member);
                        return (
                          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${getStatusBadgeStyle(paymentStatus)}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotStyle(paymentStatus)}`} />
                            {paymentStatus}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Content Matrix Grid */}
                    <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
                      <div>
                        <span className="block text-[9px] font-bold uppercase text-slate-400">Total Paid</span>
                        <span className="font-black text-slate-900">₹{member.totalPaid ? member.totalPaid.toLocaleString("en-IN") : "0"}</span>
                        <div className="mt-1.5 h-1.5 w-full max-w-[100px] overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${paidRatio}%` }} />
                        </div>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold uppercase text-slate-400">Overdue</span>
                        <span className={`font-black ${member.overdueAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                          ₹{(member.overdueAmount || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[9px] font-bold uppercase text-slate-400">Society Cluster</span>
                        <span className="block truncate font-semibold text-slate-700">{member.societyId?.societyName || "Not Assigned"}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold uppercase text-slate-400">Pending Penalty</span>
                        <span className="font-bold text-amber-600">₹{(member.pendingPenaltyTillToday || 0).toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* Contact & Touch Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
                      <div className="flex flex-wrap items-center gap-3">
                        {member.mobile && (
                          <a
                            href={`tel:${member.mobile}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 font-semibold text-slate-600 hover:text-indigo-600"
                          >
                            <FiPhone className="text-slate-400" /> {member.mobile}
                          </a>
                        )}
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hidden items-center gap-1 font-semibold text-slate-600 hover:text-indigo-600 sm:flex"
                          >
                            <FiMail className="text-slate-400" /> {member.email}
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/memberprofile/${member._id}`)}
                          className="flex cursor-pointer items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold uppercase text-slate-700 hover:bg-slate-200"
                        >
                          <FiEye className="text-[11px]" /> View
                        </button>
                        <button
                          onClick={() => navigate(`/edit-member/${member._id}`)}
                          className="flex cursor-pointer items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[10px] font-bold uppercase text-indigo-600 hover:bg-indigo-100"
                        >
                          <FiEdit className="text-[11px]" /> Edit
                        </button>
                        <button
                          onClick={() => deleteMember(member._id)}
                          className="flex cursor-pointer items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[10px] font-bold uppercase text-rose-600 hover:bg-rose-100"
                        >
                          <FiTrash2 className="text-[11px]" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Members;