import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FiArrowLeft,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiFileText,
  FiX,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

const ITEMS_PER_PAGE = 10;

const AgentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const [agent, setAgent] = useState(null);
  const [summary, setSummary] = useState({});
  const [members, setMembers] = useState([]);
  const [cashSummary, setCashSummary] = useState({});
  const [depositHistory, setDepositHistory] = useState([]);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveForm, setReceiveForm] = useState({
    amount: "",
    paymentMode: "CASH",
    remark: ""
  });

  // Pagination states
  const [collectionsPage, setCollectionsPage] = useState(1);
  const [depositsPage, setDepositsPage] = useState(1);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `https://aws.srmfinance.online/api/daily/agent-profile/${id}`
      );
      setAgent(res.data.agent);
      setSummary(res.data.summary);
      setMembers(res.data.members);
      setCollections(res.data.collections || []);
      setMonthlyHistory(res.data.monthlyCollectionHistory || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCashSummary = async () => {
    try {
      const res = await axios.get(
        `https://aws.srmfinance.online/api/daily/cash-summary/${id}`
      );
      setCashSummary(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDepositHistory = async () => {
    try {
      const res = await axios.get(
        `https://aws.srmfinance.online/api/daily/deposit-history/${id}`
      );
      setDepositHistory(res.data.deposits || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchCashSummary();
    fetchDepositHistory();
  }, [id]);

  const receiveMoney = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://aws.srmfinance.online/api/daily/receive-money",
        {
          agentId: id,
          amount: Number(receiveForm.amount),
          paymentMode: receiveForm.paymentMode,
          remark: receiveForm.remark,
          receivedBy: "ADMIN"
        }
      );
      alert("Amount Received Successfully");
      setShowReceiveModal(false);
      setReceiveForm({
        amount: "",
        paymentMode: "CASH",
        remark: ""
      });
      fetchCashSummary();
      fetchDepositHistory();
    } catch (err) {
      console.log(err);
      alert("Failed");
    }
  };

  // Pagination Calculations
  const totalCollectionPages = Math.ceil(collections.length / ITEMS_PER_PAGE) || 1;
  const paginatedCollections = collections.slice(
    (collectionsPage - 1) * ITEMS_PER_PAGE,
    collectionsPage * ITEMS_PER_PAGE
  );

  const totalDepositPages = Math.ceil(depositHistory.length / ITEMS_PER_PAGE) || 1;
  const paginatedDeposits = depositHistory.slice(
    (depositsPage - 1) * ITEMS_PER_PAGE,
    depositsPage * ITEMS_PER_PAGE
  );

  // Reusable pagination control (keeps page-number buttons compact on small screens)
  const PaginationControls = ({ page, totalPages, onChange }) => {
    if (totalPages <= 1) return null;

    // On very small screens, show a condensed set of page buttons
    const getVisiblePages = () => {
      if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
      const pages = new Set([1, totalPages, page, page - 1, page + 1]);
      return Array.from(pages)
        .filter((p) => p >= 1 && p <= totalPages)
        .sort((a, b) => a - b);
    };

    const visiblePages = getVisiblePages();

    return (
      <div className="p-3 sm:p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-500 bg-slate-50/50">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <button
            disabled={page === 1}
            onClick={() => onChange(Math.max(page - 1, 1))}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <FiChevronLeft className="text-base" />
          </button>
          {visiblePages.map((pageNum, idx) => {
            const prevPage = visiblePages[idx - 1];
            const showEllipsis = prevPage && pageNum - prevPage > 1;
            return (
              <div key={pageNum} className="flex items-center gap-1">
                {showEllipsis && <span className="px-1 text-slate-300">…</span>}
                <button
                  onClick={() => onChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    page === pageNum
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              </div>
            );
          })}
          <button
            disabled={page === totalPages}
            onClick={() => onChange(Math.min(page + 1, totalPages))}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <FiChevronRight className="text-base" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-20 flex flex-col items-center justify-center text-slate-400 font-bold min-h-screen bg-[#f8fafc]">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs uppercase tracking-wider text-center">Loading Agent Profile Data...</span>
      </div>
    );
  }

  return (
    <div className="p-3 xs:p-4 sm:p-6 lg:p-10 space-y-5 sm:space-y-8 bg-[#f8fafc] min-h-screen font-sans text-slate-800">

      {/* Header Panel Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <FiArrowLeft className="text-base" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg xs:text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase break-words">Agent Profile View</h1>
            <p className="text-slate-500 text-[11px] sm:text-sm mt-0.5">View demographic stats, tracking reports, and financial ledger history.</p>
          </div>
        </div>

        <button
          onClick={() => setShowReceiveModal(true)}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <FiDollarSign className="stroke-[3] text-sm" /> Receive Money
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-xs p-4 xs:p-5 sm:p-8 flex flex-col lg:flex-row justify-between gap-6 lg:gap-8">
        <div className="space-y-3 w-full lg:max-w-md min-w-0">
          <div>
            <span className={`px-2 py-0.5 border text-[9px] font-black rounded-md uppercase tracking-wider ${
              (agent?.status || "ACTIVE").toUpperCase() === "ACTIVE"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}>
              {agent?.status || "Active"}
            </span>
            <h2 className="text-lg xs:text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2 break-words">{agent?.name || "-"}</h2>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5 flex items-start gap-1.5 break-words">
              <FiMapPin className="shrink-0 mt-0.5" /> <span>{agent?.operationalArea || "No Route Assigned"}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 pt-2 text-xs font-medium text-slate-600">
            <p className="truncate">Father: <strong className="text-slate-900 font-bold">{agent?.fatherName || "-"}</strong></p>
            <p>Gender: <strong className="text-slate-900 font-bold">{agent?.gender || "-"}</strong></p>
            <p className="sm:col-span-2 flex items-center gap-1.5 text-slate-500">
              <FiCalendar className="text-slate-400 shrink-0" /> DOB: <strong className="text-slate-900 font-semibold">{agent?.dob ? new Date(agent.dob).toLocaleDateString("en-IN") : "-"}</strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-7/12 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8 text-xs font-semibold text-slate-700">
          <div className="flex items-start gap-2.5 min-w-0">
            <FiPhone className="text-slate-400 text-base shrink-0 mt-0.5" />
            <div className="truncate">
              <p className="text-slate-900 font-bold">{agent?.mobile || "-"}</p>
              {agent?.alternateMobile && <p className="text-slate-400 font-medium text-[11px] mt-0.5">{agent?.alternateMobile} (Alt)</p>}
            </div>
          </div>
          <div className="flex items-start gap-2.5 min-w-0">
            <FiMail className="text-slate-400 text-base shrink-0 mt-0.5" />
            <p className="truncate text-slate-900 font-bold">{agent?.email || "-"}</p>
          </div>
          <div className="flex items-start gap-2.5 sm:col-span-2 min-w-0">
            <FiMapPin className="text-slate-400 text-base shrink-0 mt-0.5" />
            <p className="text-slate-500 font-medium leading-relaxed break-words">{agent?.address || "No Address Recorded"}</p>
          </div>
        </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-3 xs:p-4 sm:p-5 flex justify-between items-center shadow-xs min-w-0">
          <div className="min-w-0">
            <span className="text-[9px] xs:text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">Daily Target</span>
            <h2 className="text-base xs:text-lg sm:text-xl font-black text-blue-600 mt-1 truncate">₹{(summary.dailyTarget || 0).toLocaleString("en-IN")}</h2>
          </div>
          <div className="w-9 h-9 xs:w-10 xs:h-10 shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-base border border-blue-100/50">
            <FiDollarSign />
          </div>
        </div>

      {/* TODAY'S COLLECTION */}
<div className="bg-white border border-slate-200 rounded-2xl p-3 xs:p-4 sm:p-5 flex justify-between items-center shadow-xs min-w-0">
  <div className="min-w-0">
    <span className="text-[9px] xs:text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">
      Today's Collection
    </span>

    <h2 className="text-base xs:text-lg sm:text-xl font-black text-emerald-600 mt-1 truncate">
      ₹{(summary.todayCollection || 0).toLocaleString("en-IN")}
    </h2>
  </div>

  <div className="w-9 h-9 xs:w-10 xs:h-10 shrink-0 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-base border border-emerald-100/50">
    <FiDollarSign />
  </div>
</div>


{/* TODAY'S ACTUAL COLLECTION */}
<div className="bg-white border border-slate-200 rounded-2xl p-3 xs:p-4 sm:p-5 flex justify-between items-center shadow-xs min-w-0">
  <div className="min-w-0">
    <span className="text-[9px] xs:text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">
      Today's Actual Collection
    </span>

    <h2 className="text-base xs:text-lg sm:text-xl font-black text-green-700 mt-1 truncate">
      ₹{(summary.todayActualCollection || 0).toLocaleString("en-IN")}
    </h2>
  </div>

  <div className="w-9 h-9 xs:w-10 xs:h-10 shrink-0 bg-green-50 text-green-700 rounded-xl flex items-center justify-center text-base border border-green-100/50">
    <FiDollarSign />
  </div>
</div>

        {/* Pending Target */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 xs:p-4 sm:p-5 flex justify-between items-center shadow-xs min-w-0">
          <div className="min-w-0">
            <span className="text-[9px] xs:text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">
              Pending Target
            </span>
            <h2 className="text-base xs:text-lg sm:text-xl font-black text-red-600 mt-1 truncate">
              ₹{(summary.todayPending || 0).toLocaleString("en-IN")}
            </h2>
          </div>
          <div className="w-9 h-9 xs:w-10 xs:h-10 shrink-0 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-base">
            <FiDollarSign />
          </div>
        </div>

        {/* Pending Till Today */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 xs:p-4 sm:p-5 flex justify-between items-center shadow-xs min-w-0">
          <div className="min-w-0">
            <span className="text-[9px] xs:text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">
              Pending Till Today
            </span>
            <h2 className="text-base xs:text-lg sm:text-xl font-black text-orange-600 mt-1 truncate">
              ₹{(summary.pendingTillToday || 0).toLocaleString("en-IN")}
            </h2>
          </div>
          <div className="w-9 h-9 xs:w-10 xs:h-10 shrink-0 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-base">
            <FiDollarSign />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3 xs:p-4 sm:p-5 flex justify-between items-center shadow-xs min-w-0">
          <div className="min-w-0">
            <span className="text-[9px] xs:text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">Monthly Collection</span>
            <h2 className="text-base xs:text-lg sm:text-xl font-black text-green-600 mt-1 truncate">₹{(summary.monthlyCollection || 0).toLocaleString("en-IN")}</h2>
          </div>
          <div className="w-9 h-9 xs:w-10 xs:h-10 shrink-0 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-base">
            <FiDollarSign />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3 xs:p-4 sm:p-5 flex justify-between items-center shadow-xs min-w-0">
          <div className="min-w-0">
            <span className="text-[9px] xs:text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">Total Collection</span>
            <h2 className="text-base xs:text-lg sm:text-xl font-black text-blue-600 mt-1 truncate">₹{(summary.totalCollection || 0).toLocaleString("en-IN")}</h2>
          </div>
          <div className="w-9 h-9 xs:w-10 xs:h-10 shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-base border border-blue-100/50">
            <FiDollarSign />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3 xs:p-4 sm:p-5 flex justify-between items-center shadow-xs min-w-0">
          <div className="min-w-0">
            <span className="text-[9px] xs:text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">Assigned Members</span>
            <h2 className="text-base xs:text-lg sm:text-xl font-black text-purple-600 mt-1 truncate">{summary.totalMembers || 0} Units</h2>
          </div>
          <div className="w-9 h-9 xs:w-10 xs:h-10 shrink-0 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-base border border-purple-100/50">
            <FiUsers />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3 xs:p-4 sm:p-5 flex justify-between items-center shadow-xs min-w-0">
          <div className="min-w-0">
            <span className="text-[9px] xs:text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">Pending Cash</span>
            <h2 className="text-base xs:text-lg sm:text-xl font-black text-rose-600 mt-1 truncate">₹{(cashSummary.pendingAmount || 0).toLocaleString("en-IN")}</h2>
          </div>
          <div className="w-9 h-9 xs:w-10 xs:h-10 shrink-0 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-base border border-rose-100/50">
            <FiDollarSign />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3 xs:p-4 sm:p-5 flex justify-between items-center shadow-xs col-span-2 sm:col-span-2 lg:col-span-1 min-w-0">
          <div className="min-w-0">
            <span className="text-[9px] xs:text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">Amount Submitted</span>
            <h2 className="text-base xs:text-lg sm:text-xl font-black text-indigo-600 mt-1 truncate">₹{(cashSummary.totalDeposit || 0).toLocaleString("en-IN")}</h2>
          </div>
          <div className="w-9 h-9 xs:w-10 xs:h-10 shrink-0 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-base border border-indigo-100/50">
            <FiDollarSign />
          </div>
        </div>
      </div>

      {/* ================= MONTHLY COLLECTION HISTORY ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
        <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
          Monthly Collection History
        </h3>

        {/* Desktop / tablet table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[480px] text-left border-collapse text-xs font-semibold text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-3">Month</th>
                <th className="p-3">Saving</th>
                <th className="p-3">Loan EMI</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyHistory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-slate-400 font-bold uppercase">No Monthly Logs Available</td>
                </tr>
              ) : (
                monthlyHistory.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{item.month}</td>
                    <td className="p-3 text-emerald-600 font-bold">₹{item.savingCollection}</td>
                    <td className="p-3 text-orange-600 font-bold">₹{item.loanCollection}</td>
                    <td className="p-3 font-black text-slate-900">₹{item.totalCollection}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden space-y-2.5">
          {monthlyHistory.length === 0 ? (
            <p className="p-4 text-center text-slate-400 font-bold uppercase text-xs">No Monthly Logs Available</p>
          ) : (
            monthlyHistory.map((item, index) => (
              <div key={index} className="border border-slate-150 bg-slate-50 rounded-xl p-3.5 space-y-1.5">
                <p className="font-black text-slate-900 text-sm">{item.month}</p>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Saving</span>
                  <span className="text-emerald-600 font-bold">₹{item.savingCollection}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Loan EMI</span>
                  <span className="text-orange-600 font-bold">₹{item.loanCollection}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold pt-1.5 border-t border-slate-200">
                  <span className="text-slate-500">Total</span>
                  <span className="text-slate-900 font-black">₹{item.totalCollection}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= DOCUMENT DETAILS ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 shadow-xs">
        <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
          <FiFileText className="text-blue-600 text-sm shrink-0" /> Verification Documents & Legal Ledger Info
        </h3>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 text-xs font-semibold text-slate-600">
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between gap-2 min-w-0">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Aadhaar Profile Identification</span>
            <p className="text-slate-900 font-bold break-all">{agent?.aadhaarNumber || "N/A"}</p>
            <span className={`w-fit px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider border ${agent?.aadhaarReceived ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              {agent?.aadhaarReceived ? "✅ Received" : "❌ Pending"}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between gap-2 min-w-0">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">PAN Card Portfolio Reference</span>
            <p className="text-slate-900 font-bold break-all">{agent?.panNumber || "N/A"}</p>
            <span className={`w-fit px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider border ${agent?.panReceived ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              {agent?.panReceived ? "✅ Received" : "❌ Pending"}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between gap-2 min-w-0">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Legal Executed Bond Verification</span>
            <p className="text-slate-900 font-bold">Indemnity Agreement</p>
            <span className={`w-fit px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider border ${agent?.stampPaperReceived ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              {agent?.stampPaperReceived ? "✅ Received" : "❌ Pending"}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between gap-2 min-w-0">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Roster Inclusion Timeline</span>
            <p className="text-slate-900 font-bold">Onboarding Record</p>
            <span className="w-fit bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider">
              🗓️ {agent?.joiningDate ? new Date(agent.joiningDate).toLocaleDateString("en-IN") : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* ================= COLLECTION HISTORY (PAGINATED) ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">Route Collection Logs</h2>
          <span className="w-fit bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider">
            {collections.length} Total Records
          </span>
        </div>

        {/* Desktop / tablet table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse text-xs font-semibold text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 sm:px-6 py-3.5">Date</th>
                <th>Type</th>
                <th className="px-4 sm:px-6 py-3.5">Client Profile</th>
                <th className="px-4 sm:px-6 py-3.5">Contact Link</th>
                <th className="px-4 sm:px-6 py-3.5 text-center">Base Remittance</th>
                <th className="px-4 sm:px-6 py-3.5 text-center">Overdue Penalty</th>
                <th className="px-4 sm:px-6 py-3.5 text-center">Total Yield</th>
                <th className="px-4 sm:px-6 py-3.5 text-center">Channel Route</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCollections.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 font-bold text-slate-400 uppercase tracking-wider">
                    No active transaction matrices cataloged.
                  </td>
                </tr>
              ) : (
                paginatedCollections.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 sm:px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                      {item.collectionDate ? new Date(item.collectionDate).toLocaleDateString("en-IN") : "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.type === "LOAN EMI" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-bold text-slate-800">
                      {item.member?.memberName || item.member?.name || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {item.member?.mobile || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center font-bold text-blue-600 whitespace-nowrap">
                      ₹{item.dailyAmount || 0}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center font-bold text-rose-500 whitespace-nowrap">
                      ₹{item.penalty || 0}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center font-black text-emerald-600 whitespace-nowrap">
                      ₹{item.totalAmount || 0}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 border text-[9px] font-black rounded uppercase tracking-wider ${
                        item.paymentMethod === "CASH"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {item.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile / small-tablet card list */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedCollections.length === 0 ? (
            <p className="text-center py-10 font-bold text-slate-400 uppercase tracking-wider text-xs px-4">
              No active transaction matrices cataloged.
            </p>
          ) : (
            paginatedCollections.map((item, index) => (
              <div key={index} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {item.member?.memberName || item.member?.name || "-"}
                    </p>
                    <p className="text-slate-400 text-[11px] font-semibold mt-0.5">
                      {item.collectionDate ? new Date(item.collectionDate).toLocaleDateString("en-IN") : "-"}
                      {item.member?.mobile ? ` • ${item.member.mobile}` : ""}
                    </p>
                  </div>
                  <span className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-bold ${
                    item.type === "LOAN EMI" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {item.type}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 rounded-xl p-2.5">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Base</span>
                    <span className="block text-xs font-bold text-blue-600 mt-0.5">₹{item.dailyAmount || 0}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Penalty</span>
                    <span className="block text-xs font-bold text-rose-500 mt-0.5">₹{item.penalty || 0}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Total</span>
                    <span className="block text-xs font-black text-emerald-600 mt-0.5">₹{item.totalAmount || 0}</span>
                  </div>
                </div>

                <span className={`inline-block px-2.5 py-0.5 border text-[9px] font-black rounded uppercase tracking-wider ${
                  item.paymentMethod === "CASH"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}>
                  {item.paymentMethod}
                </span>
              </div>
            ))
          )}
        </div>

        <PaginationControls
          page={collectionsPage}
          totalPages={totalCollectionPages}
          onChange={setCollectionsPage}
        />
      </div>

      {/* ================= DEPOSIT HISTORY (PAGINATED) ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">Vault Settlement History</h2>
          <span className="w-fit bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider">
            {depositHistory.length} Total Settlements
          </span>
        </div>

        {/* Desktop / tablet table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[550px] text-left border-collapse text-xs font-semibold text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 sm:px-6 py-3.5">Settlement Date</th>
                <th className="px-4 sm:px-6 py-3.5">Liquid Equivalent</th>
                <th className="px-4 sm:px-6 py-3.5">Payment Node Type</th>
                <th className="px-4 sm:px-6 py-3.5">Administrative Audit Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDeposits.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 font-bold text-slate-400 uppercase tracking-wider">
                    No historic terminal settlements archived.
                  </td>
                </tr>
              ) : (
                paginatedDeposits.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 sm:px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                      {item.depositDate ? new Date(item.depositDate).toLocaleDateString("en-IN") : "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-black text-indigo-600 whitespace-nowrap">
                      ₹{item.amount}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider">
                        {item.paymentMode}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-slate-500 font-medium italic">
                      {item.remark || "System transaction record confirmed."}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden divide-y divide-slate-100">
          {paginatedDeposits.length === 0 ? (
            <p className="text-center py-10 font-bold text-slate-400 uppercase tracking-wider text-xs px-4">
              No historic terminal settlements archived.
            </p>
          ) : (
            paginatedDeposits.map((item) => (
              <div key={item._id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm">
                      {item.depositDate ? new Date(item.depositDate).toLocaleDateString("en-IN") : "-"}
                    </p>
                    <span className="inline-block mt-1 bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider">
                      {item.paymentMode}
                    </span>
                  </div>
                  <p className="font-black text-indigo-600 text-sm shrink-0">₹{item.amount}</p>
                </div>
                <p className="text-slate-500 font-medium italic text-xs">
                  {item.remark || "System transaction record confirmed."}
                </p>
              </div>
            ))
          )}
        </div>

        <PaginationControls
          page={depositsPage}
          totalPages={totalDepositPages}
          onChange={setDepositsPage}
        />
      </div>

      {/* OVERLAY CASH REMITTANCE MODAL */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-[2px] transition-all overflow-y-auto">
          <div className="bg-white w-full max-w-md my-auto rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[92vh] sm:max-h-[90vh]">

            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">Terminal Vault Receipt</h2>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold mt-0.5">Reconcile current unsubmitted route assets.</p>
              </div>
              <button
                onClick={() => setShowReceiveModal(false)}
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors cursor-pointer shrink-0"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={receiveMoney} className="p-4 sm:p-6 space-y-4 sm:space-y-5 bg-slate-50/50 overflow-y-auto">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex justify-between items-center shadow-2xs">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Route Unsubmitted Outstanding</span>
                  <h1 className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">
                    ₹{(cashSummary.pendingAmount || 0).toLocaleString("en-IN")}
                  </h1>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Remittance Sum Count</label>
                <input
                  type="number"
                  required
                  value={receiveForm.amount}
                  onChange={(e) => setReceiveForm({ ...receiveForm, amount: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="Enter dynamic amount value"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Liquidation Node Channel</label>
                <select
                  value={receiveForm.paymentMode}
                  onChange={(e) => setReceiveForm({ ...receiveForm, paymentMode: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Audit Record Remark</label>
                <textarea
                  rows="3"
                  value={receiveForm.remark}
                  onChange={(e) => setReceiveForm({ ...receiveForm, remark: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all resize-none"
                  placeholder="Optional management system logging annotations..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Confirm Receive
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AgentProfile;