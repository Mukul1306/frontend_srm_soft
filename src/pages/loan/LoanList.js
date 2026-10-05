import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { 
  FiSearch, 
  FiFilter, 
  FiPlus, 
  FiDollarSign, 
  FiActivity, 
  FiLock,
  FiEye,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock
} from "react-icons/fi";
import CreateLoan from "./CreateLoan";

const LoanList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Keep search/filter when leaving this page and coming back.
  // URL is preferred, then sessionStorage is used as a fallback.
  const SEARCH_STORAGE_KEY = "adminLoanListSearch";
  const STATUS_STORAGE_KEY = "adminLoanListStatus";

  const getStoredValue = (key, fallback = "") => {
    try {
      return sessionStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  };

  const [search, setSearch] = useState(() =>
    searchParams.get("search") ?? getStoredValue(SEARCH_STORAGE_KEY, "")
  );

  const [statusFilter, setStatusFilter] = useState(() =>
    searchParams.get("status") ?? getStoredValue(STATUS_STORAGE_KEY, "All Status")
  );

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
  const [dashboard, setDashboard] = useState({
    loanDistributed: 0,
    outstandingAmount: 0,
    monthlyInterestCollection: 0,
    pendingInterest: 0,
    activeLoans: 0,
    closedLoans: 0,
  });

  // Restore the last search/filter when returning to this page.
  // Also respect browser Back / Forward when URL parameters are present.
  useEffect(() => {
    const urlHasSearch = searchParams.has("search");
    const urlHasStatus = searchParams.has("status");

    if (urlHasSearch) {
      const urlSearch = searchParams.get("search") || "";
      setSearch(urlSearch);

      try {
        sessionStorage.setItem(SEARCH_STORAGE_KEY, urlSearch);
      } catch {}
    }

    if (urlHasStatus) {
      const urlStatus = searchParams.get("status") || "All Status";
      setStatusFilter(urlStatus);

      try {
        sessionStorage.setItem(STATUS_STORAGE_KEY, urlStatus);
      } catch {}
    }
  }, [searchParams]);

  // If this page was opened again without query parameters,
  // restore the saved search/filter into the URL as well.
  useEffect(() => {
    const savedSearch = getStoredValue(SEARCH_STORAGE_KEY, "");
    const savedStatus = getStoredValue(STATUS_STORAGE_KEY, "All Status");

    const nextParams = new URLSearchParams(searchParams);
    let changed = false;

    if (!searchParams.has("search") && savedSearch) {
      nextParams.set("search", savedSearch);
      changed = true;
    }

    if (!searchParams.has("status") && savedStatus && savedStatus !== "All Status") {
      nextParams.set("status", savedStatus);
      changed = true;
    }

    if (changed) {
      setSearch(savedSearch);
      setStatusFilter(savedStatus || "All Status");
      setSearchParams(nextParams, { replace: true });
    }
    // Run only when the page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchLoans();
    fetchDashboard();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await axios.get("https://finance-project-0qqk.onrender.com/api/loans/list");
      setLoans(res.data.loans || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load loans from ledger streams.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("https://finance-project-0qqk.onrender.com/api/loans/dashboard");
      setDashboard(res.data.dashboard || {});
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);

    try {
      sessionStorage.setItem(SEARCH_STORAGE_KEY, value);
    } catch {}

    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("search", value);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);

    try {
      sessionStorage.setItem(STATUS_STORAGE_KEY, value);
    } catch {}

    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "All Status") {
      newParams.set("status", value);
    } else {
      newParams.delete("status");
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleCloseLoan = async (loanId) => {
    const confirmClose = window.confirm("Are you sure you want to permanently close this active loan position?");
    if (!confirmClose) return;

    try {
      await axios.put(`https://finance-project-0qqk.onrender.com/api/loans/close/${loanId}`);
      alert("Loan Position Closed Successfully");
      fetchLoans();
      fetchDashboard();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to execute loan closure");
    }
  };

  const getStatusStyle = (status) => {
    const cleanStatus = (status || "").toUpperCase();
    switch (cleanStatus) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CLOSED":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "DUE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "OVERDUE":
        return "bg-rose-50 text-rose-700 border-rose-200 animate-pulse";
      default:
        return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-[70vh] text-slate-500 font-semibold text-xs sm:text-sm bg-[#f8fafc]">
        <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        Synchronizing Ledger Matrix Core System...
      </div>
    );
  }

  const filteredLoans = loans.filter((item) => {
   const matchesStatus =
  statusFilter === "All Status" ||
  item.status === statusFilter ||
  (statusFilter === "DUE" && item.currentEmiStatus === "DUE") ||
  (statusFilter === "OVERDUE" && item.currentEmiStatus === "OVERDUE");

    const matchesSearch = 
      (item.memberId?.name || "").toLowerCase().includes(search.toLowerCase()) || 
      (item.societyId?.societyName || "").toLowerCase().includes(search.toLowerCase()) ||
      (item._id || "").toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-3 sm:p-6 lg:p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-800 antialiased space-y-4 sm:space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-[#0f172a] uppercase tracking-wide">
            Loans & Credit Portfolios
          </h1>
          <p className="text-[#64748b] text-xs sm:text-sm font-medium mt-1">
            Manage active credit lending terms, balance metrics, dynamic monthly interest pools, and structural closures.
          </p>
        </div>
        <button 
          onClick={() => setIsNewLoanOpen(true)}
          className="w-full md:w-auto bg-[#1e60ff] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <FiPlus className="stroke-[3] text-base" /> Issue New Credit Allocation
        </button>
      </div>

      {/* DASHBOARD METRICS */}
      <div className="space-y-6">
        <div>
          <h2 className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">
            Principal & Financial Exposure
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-4 sm:p-6 text-white shadow-xs">
              <div className="flex justify-between items-center gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest opacity-80 font-bold truncate">Loan Distributed</p>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black mt-1 sm:mt-2 truncate">
                    ₹{(dashboard.loanDistributed || 0).toLocaleString("en-IN")}
                  </h2>
                  <p className="text-[10px] sm:text-xs mt-1 sm:mt-2 opacity-80 truncate">Active Principal Given</p>
                </div>
                <div className="bg-white/20 p-2.5 sm:p-4 rounded-xl shrink-0">
                  <FiDollarSign className="text-xl sm:text-3xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-4 sm:p-6 text-white shadow-xs">
              <div className="flex justify-between items-center gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest opacity-80 font-bold truncate">Outstanding Amount</p>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black mt-1 sm:mt-2 truncate">
                    ₹{(dashboard.outstandingAmount || 0).toLocaleString("en-IN")}
                  </h2>
                  <p className="text-[10px] sm:text-xs mt-1 sm:mt-2 opacity-80 truncate">Principal + Pending Interest</p>
                </div>
                <div className="bg-white/20 p-2.5 sm:p-4 rounded-xl shrink-0">
                  <FiAlertTriangle className="text-xl sm:text-3xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-4 sm:p-6 text-white shadow-xs sm:col-span-2 lg:col-span-1">
              <div className="flex justify-between items-center gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest opacity-80 font-bold truncate">Monthly Interest</p>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black mt-1 sm:mt-2 truncate">
                    ₹{(dashboard.monthlyInterestCollection || 0).toLocaleString("en-IN")}
                  </h2>
                  <p className="text-[10px] sm:text-xs mt-1 sm:mt-2 opacity-80 truncate">Collected This Month</p>
                </div>
                <div className="bg-white/20 p-2.5 sm:p-4 rounded-xl shrink-0">
                  <FiActivity className="text-xl sm:text-3xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">
            Collections & Portfolio Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-4 sm:p-6 text-white shadow-xs">
              <div className="flex justify-between items-center gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest opacity-80 font-bold truncate">Pending Interest</p>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black mt-1 sm:mt-2 truncate">
                    ₹{(dashboard.pendingInterest || 0).toLocaleString("en-IN")}
                  </h2>
                  <p className="text-[10px] sm:text-xs mt-1 sm:mt-2 opacity-80 truncate">Till Today</p>
                </div>
                <div className="bg-white/20 p-2.5 sm:p-4 rounded-xl shrink-0">
                  <FiClock className="text-xl sm:text-3xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-4 sm:p-6 text-white shadow-xs">
              <div className="flex justify-between items-center gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest opacity-80 font-bold truncate">Active Loans</p>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black mt-1 sm:mt-2 truncate">
                    {dashboard.activeLoans || 0}
                  </h2>
                  <p className="text-[10px] sm:text-xs mt-1 sm:mt-2 opacity-80 truncate">Running Accounts</p>
                </div>
                <div className="bg-white/20 p-2.5 sm:p-4 rounded-xl shrink-0">
                  <FiCheckCircle className="text-xl sm:text-3xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl p-4 sm:p-6 text-white shadow-xs sm:col-span-2 lg:col-span-1">
              <div className="flex justify-between items-center gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest opacity-80 font-bold truncate">Closed Loans</p>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black mt-1 sm:mt-2 truncate">
                    {dashboard.closedLoans || 0}
                  </h2>
                  <p className="text-[10px] sm:text-xs mt-1 sm:mt-2 opacity-80 truncate">Completed Accounts</p>
                </div>
                <div className="bg-white/20 p-2.5 sm:p-4 rounded-xl shrink-0">
                  <FiLock className="text-xl sm:text-3xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLS BAR */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] text-sm sm:text-base" />
          <input
            type="text"
            placeholder="Search borrower by name, cluster society, or ID..."
            className="w-full bg-slate-50 border border-[#e2e8f0] rounded-xl pl-11 pr-4 py-2.5 text-xs outline-none focus:border-blue-400 font-semibold text-slate-800 transition-colors placeholder:text-slate-400"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        
        <div className="relative w-full sm:w-auto">
          <select
            className="w-full sm:w-auto appearance-none bg-slate-50 border border-[#e2e8f0] rounded-xl pl-10 pr-10 py-2.5 text-xs font-black text-slate-700 outline-none cursor-pointer focus:border-blue-400 transition-colors"
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="All Status">All Matrix Status</option>
            <option value="ACTIVE">ACTIVE POSITIONS</option>
            <option value="DUE">DUE INSTALLMENTS</option>
            <option value="OVERDUE">OVERDUE ARREARS</option>
            <option value="CLOSED">CLOSED VAULT ARCHIVES</option>
          </select>
          <FiFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">▼</span>
        </div>
      </div>

      {/* DESKTOP TABLE (Hidden on screens below lg) */}
      <div className="hidden lg:block bg-white border border-[#e2e8f0] rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6 text-center w-12">#</th>
                <th className="py-4 px-6">Borrower Specifications</th>
                <th className="py-4 px-6">Society Cluster</th>
                <th className="py-4 px-6">Principal Value</th>
                <th className="py-4 px-6">Interest Rate</th>
                <th className="py-4 px-6">Lifecycle Schedule</th>
                <th className="py-4 px-6">Arrears & Status</th>
                <th className="py-4 px-6 text-center">Status State</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-16 text-slate-400 font-semibold bg-white">
                    No active loan ledger parameters match your filtered configuration parameters.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan, index) => {
                  const resolvedStatus =
  loan.currentEmiStatus || loan.status;

                  return (
                    <tr key={loan._id} className="hover:bg-slate-50/60 transition-colors duration-150">
                      <td className="py-4 px-6 text-center font-bold text-slate-400">{index + 1}</td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-[#1e60ff] flex items-center justify-center font-black text-[10px] shrink-0">
                            {(loan.memberId?.name || "N A").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 leading-tight">{loan.memberId?.name || "Deleted Ledger Position"}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">UUID: {loan._id?.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-extrabold text-slate-800">{loan.societyId?.societyName || "Standalone Vault"}</p>
                        <p className="text-[#1e60ff] font-extrabold uppercase tracking-widest text-[9px] mt-0.5">Corporate Cluster</p>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-black text-slate-900 text-sm">₹{(loan.principalAmount || 0).toLocaleString("en-IN")}</p>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-extrabold text-slate-800">₹{(loan.monthlyInterest || 0).toLocaleString("en-IN")}<span className="text-[10px] text-slate-400 font-normal"> /mo</span></p>
                        <p className="text-[10px] text-emerald-600 font-black mt-0.5">Factor: {loan.interestPerHundred || 0}% per ₹100</p>
                      </td>

                      <td className="py-4 px-6 space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-800 font-semibold">
                          <span className="text-[10px] text-slate-400 font-bold uppercase w-8">EST:</span>
                          {loan.loanGivenDate ? new Date(loan.loanGivenDate).toLocaleDateString("en-IN") : "N/A"}
                        </div>
                        <div className="flex items-center gap-1 text-rose-600 font-semibold">
                          <span className="text-[10px] text-rose-400 font-bold uppercase w-8">EXP:</span>
                          {loan.loanEndDate ? new Date(loan.loanEndDate).toLocaleDateString("en-IN") : "N/A"}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {loan.pendingEmis > 0 ? (
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between gap-2">
                              <span className="text-slate-400">Pending EMI:</span>
                              <span className="font-black text-red-600">{loan.pendingEmis}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="text-slate-400">Pending Int:</span>
                              <span className="font-black text-orange-600">₹{loan.pendingInterest?.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="text-slate-400">Outstanding:</span>
                              <span className="font-black text-blue-600">₹{loan.outstandingAmount?.toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-emerald-50 text-emerald-700 text-center rounded-lg py-1 px-2 font-bold text-[10px]">
                            ✓ All EMI Paid
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1 border rounded-md text-[10px] font-black tracking-wider inline-block uppercase ${getStatusStyle(resolvedStatus)}`}>
                          {resolvedStatus}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex justify-center items-center gap-1.5">
                          <button
                            onClick={() => navigate(`/loan-details/${loan._id}`)}
                            className="bg-white border border-[#e2e8f0] text-slate-700 font-extrabold text-[10px] uppercase tracking-wider px-3 py-2 rounded-xl hover:bg-slate-50 transition flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <FiEye /> View
                          </button>

                          {loan.status === "ACTIVE" && (
                            <>
                              <button
                                onClick={() => navigate(`/collect-interest/${loan._id}`)}
                                className="bg-[#eff6ff] border border-[#bfdbfe] text-[#1e60ff] font-extrabold text-[10px] uppercase tracking-wider px-3 py-2 rounded-xl hover:bg-blue-100 transition flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <FiClock /> Collect
                              </button>
                              <button
                                onClick={() => handleCloseLoan(loan._id)}
                                className="bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-[10px] uppercase tracking-wider px-3 py-2 rounded-xl hover:bg-rose-100 transition shadow-xs cursor-pointer"
                              >
                                Terminate
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE & TABLET CARD LIST (Visible on screens below lg) */}
      <div className="block lg:hidden space-y-3 sm:space-y-4">
        {filteredLoans.length === 0 ? (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 sm:p-8 text-center text-slate-400 font-semibold text-xs uppercase tracking-wider">
            No active loan ledger parameters match your filtered configuration parameters.
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const resolvedStatus =
  loan.currentEmiStatus || loan.status;

            return (
              <div key={loan._id} className="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 text-[#1e60ff] flex items-center justify-center font-black text-xs shrink-0">
                      {(loan.memberId?.name || "N A").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-slate-900 text-sm truncate">{loan.memberId?.name || "Deleted Member"}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase truncate">UUID: {loan._id?.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 border rounded-md text-[9px] sm:text-[10px] font-black tracking-wider uppercase shrink-0 ${getStatusStyle(resolvedStatus)}`}>
                    {resolvedStatus}
                  </span>
                </div>

                {/* Key Financial Specifications Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Principal</span>
                    <span className="font-black text-slate-900 text-sm">₹{(loan.principalAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Monthly Int.</span>
                    <span className="font-bold text-slate-800">₹{(loan.monthlyInterest || 0).toLocaleString("en-IN")}</span>
                    <span className="text-[9px] text-emerald-600 block font-bold">({loan.interestPerHundred || 0}% / ₹100)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Society Cluster</span>
                    <span className="font-semibold text-slate-700 truncate block">{loan.societyId?.societyName || "Standalone Vault"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Pending EMIs</span>
                    <span className={`font-black ${loan.pendingEmis > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                      {loan.pendingEmis > 0 ? `${loan.pendingEmis} Pending` : "Fully Paid"}
                    </span>
                  </div>
                </div>

                {/* Additional Details for Complete Parity */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-2 pt-1 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-800 font-semibold">
                      <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">EST:</span>
                      {loan.loanGivenDate ? new Date(loan.loanGivenDate).toLocaleDateString("en-IN") : "N/A"}
                    </span>
                    <span className="text-rose-600 font-semibold">
                      <span className="text-[10px] text-rose-400 font-bold uppercase mr-1">EXP:</span>
                      {loan.loanEndDate ? new Date(loan.loanEndDate).toLocaleDateString("en-IN") : "N/A"}
                    </span>
                  </div>

                  {loan.pendingEmis > 0 && (
                    <div className="flex gap-3 text-[10px]">
                      <span className="text-slate-500">Pending Int: <strong className="text-orange-600 font-black">₹{loan.pendingInterest?.toLocaleString("en-IN")}</strong></span>
                      <span className="text-slate-500">Outstanding: <strong className="text-blue-600 font-black">₹{loan.outstandingAmount?.toLocaleString("en-IN")}</strong></span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => navigate(`/loan-details/${loan._id}`)}
                    className="flex-1 bg-white border border-[#e2e8f0] text-slate-700 font-extrabold text-[10px] sm:text-xs uppercase tracking-wider py-2.5 rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    <FiEye /> Specs
                  </button>

                  {loan.status === "ACTIVE" && (
                    <>
                      <button
                        onClick={() => navigate(`/collect-interest/${loan._id}`)}
                        className="flex-1 bg-[#eff6ff] border border-[#bfdbfe] text-[#1e60ff] font-extrabold text-[10px] sm:text-xs uppercase tracking-wider py-2.5 rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      >
                        <FiClock /> Collect
                      </button>
                      <button
                        onClick={() => handleCloseLoan(loan._id)}
                        className="bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-[10px] sm:text-xs uppercase tracking-wider px-3.5 py-2.5 rounded-xl hover:bg-rose-100 transition shadow-xs cursor-pointer"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <CreateLoan 
        isOpen={isNewLoanOpen} 
        onClose={() => setIsNewLoanOpen(false)} 
        onLoanCreated={() => {
          fetchLoans();
          fetchDashboard();
        }} 
      />

    </div>
  );
};

export default LoanList;