import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  FileText,
  TrendingUp,
  Users,
  AlertCircle,
  Coins,
  Pencil,
  Clock,
  XCircle
} from "lucide-react";

function LoansDashboard() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loanType, setLoanType] = useState("DAILY");
  const [search, setSearch] = useState(() => {
  return sessionStorage.getItem("loansDashboardSearch") || "";
});
const DASHBOARD_SCROLL_KEY = "loanDashboardScroll";

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [areaFilter, setAreaFilter] = useState("ALL");
  const [maturityFilter, setMaturityFilter] = useState("ALL");

const LOAN_SCROLL_KEY = "loansDashboardScrollY";
const LOAN_RETURN_KEY = "loansDashboardReturning";
const LOAN_SEARCH_KEY = "loansDashboardSearch";

const saveLoanDashboardPosition = () => {
  sessionStorage.setItem(
    LOAN_SCROLL_KEY,
    String(window.scrollY)
  );

  sessionStorage.setItem(
    LOAN_RETURN_KEY,
    "1"
  );

  sessionStorage.setItem(
    LOAN_SEARCH_KEY,
    search
  );
};


  const [dashboard, setDashboard] = useState({
    totalLoans: 0,
    activeLoans: 0,
    closedLoans: 0,
    overdueLoans: 0,
    loanAmount: 0,
    outstanding: 0,
    totalPaid: 0,
    interest: 0,
    penalty: 0,
    todayTarget: 0,
    todayCollected: 0,
    todayPending: 0,
    overdueEmiAmount: 0,
    monthlyCollection: 0
  });

  useEffect(() => {
    loadLoans();
  }, []);
  useEffect(() => {
  const savedScroll = sessionStorage.getItem(
    DASHBOARD_SCROLL_KEY
  );

  if (savedScroll === null) return;

  const restore = () => {
    window.scrollTo(0, Number(savedScroll));
  };

  // Wait for dashboard data/UI to render
  setTimeout(restore, 100);
  setTimeout(restore, 300);
  setTimeout(restore, 600);

  // Remove after restoring
  setTimeout(() => {
    sessionStorage.removeItem(DASHBOARD_SCROLL_KEY);
  }, 800);
}, []);


  useEffect(() => {
    loadDashboard();
  }, [loanType]);
useEffect(() => {
  const returning =
    sessionStorage.getItem(LOAN_RETURN_KEY);

  const savedScroll =
    sessionStorage.getItem(LOAN_SCROLL_KEY);

  if (returning !== "1" || savedScroll === null) {
    return;
  }

  let attempts = 0;

  const restoreScroll = () => {
    window.scrollTo(
      0,
      Number(savedScroll)
    );

    attempts++;

    if (attempts < 30) {
      requestAnimationFrame(restoreScroll);
    } else {
      sessionStorage.removeItem(
        LOAN_RETURN_KEY
      );
    }
  };

  requestAnimationFrame(restoreScroll);
}, []);

  const loadLoans = async () => {
    try {
      const res = await axios.get("https://finance-project-0qqk.onrender.com/api/daily/loans");
      setLoans(res.data?.loans || []);
    } catch (error) {
      console.error("Error fetching credit loans registry portfolio:", error);
    }
  };


  const loadDashboard = async () => {
    try {
      const res = await axios.get(
        `https://finance-project-0qqk.onrender.com/api/daily/loan-dashboard?loanType=${loanType}`
      );
      if (res.data?.dashboard) {
        setDashboard(res.data.dashboard);
      }
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
    }
  };

const closeLoan = async (loan) => {
  if (!loan?._id) return;

  if (loan.status === "CLOSED") {
    alert("This loan is already closed.");
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to close/terminate this loan?\n\nBorrower: ${
      loan.member?.memberName || loan.borrowerName || "Unknown"
    }\nOutstanding: ₹${Number(
      loan.outstandingAmount || 0
    ).toLocaleString("en-IN")}`
  );

  if (!confirmed) return;

  try {
    await axios.put(
      `https://finance-project-0qqk.onrender.com/api/daily/close-loan/${loan._id}`
    );

    alert("Loan closed successfully.");

    // Refresh dashboard data
    await loadLoans();
    await loadDashboard();
  } catch (error) {
    console.error("Close loan error:", error);

    alert(
      error.response?.data?.message ||
        "Failed to close loan."
    );
  }
};

  const areaOptions = [
    "ALL",
    ...new Set(
      loans
        .map(
          (loan) =>
            loan.areaGroup?.areaName ||
            loan.area?.areaName ||
            loan.areaName ||
            ""
        )
        .filter(Boolean)
    )
  ];

  const getMaturityDate = (loan) => {
    const value = loan.maturityDate || loan.endDate || loan.loanEndDate;
    if (!value) return null;
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inDays = (days) => {
    const end = new Date(today);
    end.setDate(end.getDate() + days);
    return end;
  };

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const firstDayOfMonthAfterNext = new Date(today.getFullYear(), today.getMonth() + 2, 1);

const getLoanDisplayStatus = (loan) => {

  if (loan.status === "CLOSED") {
    return "CLOSED";
  }

  if (loan.status === "PAID") {
    return "PAID";
  }

  if (loan.status === "OVERDUE") {
    return "OVERDUE";
  }

  if (loan.status === "DUE") {
    return "DUE";
  }

  return "ACTIVE";
};
  // FILTER AND SORT LOANS (CLOSED LOANS AUTOMATICALLY SENT TO BOTTOM)
  const filteredLoans = loans
    .filter((loan) => {
      const matchesLoanType = loan.loanType === loanType;

      const name = loan.member?.memberName || loan.borrowerName || "";
      const memberId = loan.member?.memberId || "";
      const mobile = loan.member?.mobile || loan.mobile || "";
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        name.toLowerCase().includes(searchText) ||
        memberId.toLowerCase().includes(searchText) ||
        mobile.includes(searchText);

      const loanArea =
        loan.areaGroup?.areaName || loan.area?.areaName || loan.areaName || "";
      const matchesArea = areaFilter === "ALL" || loanArea === areaFilter;

      const outstanding = Number(loan.outstandingAmount || 0);
      const pendingInstallments = Number(loan.pendingInstallments || 0);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && loan.status === "ACTIVE") ||
        (statusFilter === "CLOSED" && loan.status === "CLOSED") ||
        (statusFilter === "PENDING" && pendingInstallments > 0 && outstanding > 0) ||
        (statusFilter === "TIMEUP" &&
          loan.status !== "CLOSED" &&
          outstanding > 0 &&
          getMaturityDate(loan) &&
          getMaturityDate(loan) < today);

      const maturityDate = getMaturityDate(loan);
      let matchesMaturity = true;

      if (maturityFilter !== "ALL") {
        if (!maturityDate) {
          matchesMaturity = false;
        } else {
          const next10 = inDays(10);
          const next20 = inDays(20);

          if (maturityFilter === "NEXT_10") {
            matchesMaturity = maturityDate >= today && maturityDate <= next10;
          }
          if (maturityFilter === "NEXT_20") {
            matchesMaturity = maturityDate >= today && maturityDate <= next20;
          }
          if (maturityFilter === "THIS_MONTH") {
            matchesMaturity =
              maturityDate >= firstDayOfMonth && maturityDate < firstDayOfNextMonth;
          }
          if (maturityFilter === "NEXT_MONTH") {
            matchesMaturity =
              maturityDate >= firstDayOfNextMonth &&
              maturityDate < firstDayOfMonthAfterNext;
          }
        }
      }

      return (
        matchesLoanType && matchesSearch && matchesArea && matchesStatus && matchesMaturity
      );
    })
    .sort((a, b) => {
      // Move CLOSED loans to the bottom
      if (a.status === "CLOSED" && b.status !== "CLOSED") return 1;
      if (a.status !== "CLOSED" && b.status === "CLOSED") return -1;
      return 0;
    });

  const currentLoans = loans.filter((item) => item.loanType === loanType);

  const pendingAccounts = loans.filter((item) => {
    const pendingInstallments = Number(item.pendingInstallments || 0);
    const outstanding = Number(item.outstandingAmount || 0);
    return pendingInstallments > 0 && outstanding > 0;
  }).length;

  const closedLoans = loans.filter((loan) => loan.status === "CLOSED").length;

  return (
    <div className="p-3 sm:p-5 lg:p-6 xl:p-8 bg-slate-50 min-h-screen text-slate-800 space-y-4 sm:space-y-6 antialiased">
      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
        {/* --- TITLE HEADER OPERATIONS CONTROLS --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-full md:w-auto">
            <h1 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 tracking-wide uppercase truncate">
              Loans & Advances Ledger Matrix
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
              Monitor asset underwriting metrics, track live system risks, and administer active credit positions.
            </p>
          </div>

          <div className="flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => navigate("/daily/createloan")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold px-3.5 sm:px-4 py-2.5 rounded-xl text-xs tracking-wider uppercase shadow-sm transition-all cursor-pointer"
            >
              <Plus size={16} className="shrink-0" />
              <span>New Loan Agreement</span>
            </button>
          </div>
        </div>

        {/* --- ANALYTICS TRACKING CARDS METRICS GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
          <DashboardCard
            title="Total Capital Disbursed"
            value={`₹${(dashboard.loanAmount || 0).toLocaleString("en-IN")}`}
            icon={<TrendingUp size={18} className="text-blue-600" />}
            bgColor="bg-blue-50/50"
            borderColor="border-l-blue-500"
          />
          <DashboardCard
            title="Loan Amount in Field"
            value={`₹${(dashboard.loanAmountInField || 0).toLocaleString("en-IN")}`}
            icon={<Coins size={18} className="text-purple-600" />}
            bgColor="bg-purple-50/50"
            borderColor="border-l-purple-500"
            valueColor="text-purple-600"
            subtitle="Active loan principal"
          />
          <DashboardCard
            title="Monthly EMI Collection"
            value={`₹${(dashboard.monthlyCollection || 0).toLocaleString("en-IN")}`}
            icon={<Coins size={18} className="text-emerald-600" />}
            bgColor="bg-emerald-50/50"
            borderColor="border-l-emerald-500"
          />
          <DashboardCard
            title="Active Loan Holders"
            value={currentLoans.length}
            icon={<Users size={18} className="text-teal-600" />}
            bgColor="bg-teal-50/50"
            borderColor="border-l-teal-500"
          />
          <DashboardCard
            title="Pending Loans"
            value={pendingAccounts}
            icon={<AlertCircle size={18} className="text-rose-600" />}
            bgColor="bg-rose-50/50"
            borderColor="border-l-rose-500"
          />
          <DashboardCard
            title="Aggregate Liability Outstanding"
            value={`₹${(dashboard.outstanding || 0).toLocaleString("en-IN")}`}
            icon={<Coins size={18} className="text-amber-600" />}
            bgColor="bg-amber-50/50"
            borderColor="border-l-amber-500"
          />
          <DashboardCard
            title="Closed Loans"
            value={closedLoans}
            icon={<FileText size={18} className="text-indigo-600" />}
            bgColor="bg-indigo-50/50"
            borderColor="border-l-indigo-500"
          />
          <DashboardCard
            title={`Today's ${loanType} Target`}
            value={`₹${(dashboard.todayTarget || 0).toLocaleString("en-IN")}`}
            icon={<Coins size={18} className="text-blue-600" />}
            bgColor="bg-blue-50/50"
            borderColor="border-l-blue-500"
            subtitle="EMI due today"
          />
          <DashboardCard
            title="Today's Target Pending"
            value={`₹${(dashboard.todayPending || 0).toLocaleString("en-IN")}`}
            icon={<AlertCircle size={18} className="text-rose-600" />}
            bgColor="bg-rose-50/50"
            borderColor="border-l-rose-500"
            valueColor="text-rose-600"
            subtitle="Only today's target"
          />
          <DashboardCard
            title="Loan Collected Today"
            value={`₹${(dashboard.todayCollected || 0).toLocaleString("en-IN")}`}
            icon={<Coins size={18} className="text-emerald-600" />}
            bgColor="bg-emerald-50/50"
            borderColor="border-l-emerald-500"
            valueColor="text-emerald-600"
            subtitle="Actual collection today"
          />
          <DashboardCard
            title="Past Due EMI"
            value={`₹${(dashboard.overdueEmiAmount || 0).toLocaleString("en-IN")}`}
            icon={<Clock size={18} className="text-orange-600" />}
            bgColor="bg-orange-50/50"
            borderColor="border-l-orange-500"
            valueColor="text-orange-600"
            subtitle="EMI pending till today"
          />
        </div>

        {/* --- STRATEGY TABS AND SEARCH FILTERS WRAPPER --- */}
        <div className="flex flex-col gap-3">
          {/* Term Strategy Selector Tabs */}
          <div className="flex bg-slate-200/60 p-1 rounded-2xl border border-slate-200 w-full overflow-x-auto no-scrollbar space-x-1">
            <TabButton
              active={loanType === "DAILY"}
              onClick={() => setLoanType("DAILY")}
              label="Daily"
              activeColor="bg-blue-600 text-white shadow-sm"
            />
            <TabButton
              active={loanType === "WEEKLY"}
              onClick={() => setLoanType("WEEKLY")}
              label="Weekly"
              activeColor="bg-purple-600 text-white shadow-sm"
            />
            <TabButton
              active={loanType === "MONTHLY"}
              onClick={() => setLoanType("MONTHLY")}
              label="Monthly"
              activeColor="bg-emerald-600 text-white shadow-sm"
            />
            <TabButton
              active={loanType === "FIXED"}
              onClick={() => setLoanType("FIXED")}
              label="Fixed"
              activeColor="bg-orange-600 text-white shadow-sm"
            />
          </div>

          {/* Real-time Dynamic Search Box Component */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full">
            {/* SEARCH */}
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm focus-within:border-blue-500 transition-colors">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search borrower, ID or mobile..."
              value={search}
onChange={(e) => {
  const value = e.target.value;

  setSearch(value);

  sessionStorage.setItem(
    LOAN_SEARCH_KEY,
    value
  );
}}
                className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 placeholder-slate-400 min-w-0"
              />
            </div>

            {/* AREA */}
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer shadow-sm w-full transition-colors"
            >
              <option value="ALL">All Areas</option>
              {areaOptions
                .filter((area) => area !== "ALL")
                .map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
            </select>

            {/* STATUS */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer shadow-sm w-full transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Loans</option>
              <option value="PENDING">Pending Loans</option>
              <option value="TIMEUP">Time Up / Overdue</option>
              <option value="CLOSED">Closed Loans</option>
            </select>

            {/* MATURITY */}
            <select
              value={maturityFilter}
              onChange={(e) => setMaturityFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer shadow-sm w-full transition-colors"
            >
              <option value="ALL">All Maturity</option>
              <option value="NEXT_10">Maturity Next 10 Days</option>
              <option value="NEXT_20">Maturity Next 20 Days</option>
              <option value="THIS_MONTH">Maturity This Month</option>
              <option value="NEXT_MONTH">Maturity Next Month</option>
            </select>
          </div>
        </div>

        {/* =====================================================
            LOAN LIST
        ===================================================== */}

        {/* ================= DESKTOP / LARGE TABLET TABLE ================= */}
        {/* Switches on at lg (≈1024px) so phones AND portrait tablets get the
            touch-friendly card list below, avoiding a horizontally-scrolling
            table on medium screens. */}
        <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                {loanType} Loan Accounts
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {filteredLoans.length} accounts found
              </p>
            </div>

            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Desktop Ledger
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[1000px]">

              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">

                  <th className="py-3.5 px-4 lg:px-5 sticky left-0 bg-slate-50 z-10">
                    Borrower Info
                  </th>

                  <th className="py-3.5 px-4 text-right">
                    Principal
                  </th>

                  <th className="py-3.5 px-4 text-right">
                    EMI
                  </th>

                  <th className="py-3.5 px-4 text-center">
                    Type
                  </th>

                  <th className="py-3.5 px-4 text-right">
                    Outstanding
                  </th>

                  <th className="py-3.5 px-4 text-center">
                    Status
                  </th>

                  <th className="py-3.5 px-4 lg:px-5 text-center">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">

                {filteredLoans.map((loan) => {

                  const calculatedName =
                    loan.member?.memberName ||
                    loan.borrowerName ||
                    "Unknown Member";

                  const calculatedMobile =
                    loan.member?.mobile ||
                    loan.mobile ||
                    "—";

                  return (
                    <tr
                      key={loan._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >

                      {/* BORROWER */}
                      <td className="py-3.5 px-4 lg:px-5 sticky left-0 bg-white shadow-sm z-10">

                        <div className="space-y-0.5 max-w-[210px]">

                          <p className="font-bold text-slate-900 leading-snug truncate">
                            {calculatedName}
                          </p>

                          <p className="text-[10px] text-blue-600 font-semibold">
                            {loan.interestRate || 0}% Interest
                          </p>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400">

                            {loan.member?.memberId && (
                              <span>
                                ID: {loan.member.memberId}
                              </span>
                            )}

                            <span>
                              {calculatedMobile}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* PRINCIPAL */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">

                        <p className="font-bold text-blue-700 text-sm">
                          ₹{(loan.loanAmount || 0).toLocaleString("en-IN")}
                        </p>

                      </td>

                      {/* EMI */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">

                        <p className="font-bold text-slate-800">
                          ₹{(loan.emiAmount ||
                            0).toLocaleString("en-IN")}
                        </p>

                        <p className="text-[10px] text-slate-400 mt-0.5">

                          {loan.loanType === "DAILY"
                            ? `${loan.durationDays || 0} Days`
                            : loan.loanType === "WEEKLY"
                            ? `${Math.round(
                                (loan.durationDays || 0) / 7
                              )} Weeks`
                            : `${loan.durationMonths || 0} Months`}

                        </p>

                      </td>

                      {/* TYPE */}
                      <td className="py-3.5 px-4 text-center">

                        <span className="inline-flex text-[9px] font-extrabold uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1">

                          {loan.loanType}

                        </span>

                      </td>

                      {/* OUTSTANDING */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">

                        <p className="font-black text-slate-900">
                          ₹{(loan.outstandingAmount || 0).toLocaleString("en-IN")}
                        </p>

                        <p className="text-[10px] text-emerald-600 font-semibold">
                          Paid: ₹{(loan.totalPaid || 0).toLocaleString("en-IN")}
                        </p>

                        <p className="text-[10px] text-rose-600 font-semibold">
                          Penalty: ₹{(loan.pendingPenalty || 0).toLocaleString("en-IN")}
                        </p>

                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={getLoanDisplayStatus(loan)} />
                      </td>

                      {/* ACTIONS */}
                    {/* ACTIONS */}
<td className="py-3.5 px-4 lg:px-5">
  <div className="flex justify-center items-center gap-1.5">

    {/* COLLECT */}
    <button
      type="button"
      onClick={() => {
        sessionStorage.setItem(
          DASHBOARD_SCROLL_KEY,
          String(window.scrollY)
        );

        navigate(`/daily/loan/${loan._id}`);
      }}
      disabled={loan.status === "CLOSED"}
      className="inline-flex items-center gap-1.5 min-h-10 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-3 py-2 rounded-lg text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FileText size={14} />
      Collect
    </button>

    {/* EDIT */}
    <button
      type="button"
      onClick={() =>
        navigate(`/daily/edit-loan/${loan._id}`)
      }
      disabled={loan.status === "CLOSED"}
      className="inline-flex items-center gap-1.5 min-h-10 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold px-3 py-2 rounded-lg text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Pencil size={14} />
      Edit
    </button>

    {/* CLOSE / TERMINATE */}
    <button
      type="button"
      onClick={() => closeLoan(loan)}
      disabled={loan.status === "CLOSED"}
      className="inline-flex items-center gap-1.5 min-h-10 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold px-3 py-2 rounded-lg text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <XCircle size={14} />
      Close
    </button>

  </div>
</td>

                    </tr>
                  );

                })}



                {filteredLoans.length === 0 && (
                  <tr>

                    <td
                      colSpan={7}
                      className="text-center py-14 text-slate-400 text-xs font-medium"
                    >
                      No matching loan accounts found.
                    </td>

                  </tr>
                )}

              </tbody>

            </table>
          </div>

        </div>


        {/* ================= MOBILE & TABLET CARDS ================= */}
        {/* Visible on phones and portrait/landscape tablets (below lg). The
            inner grid widens itself at sm/md so tablets get a roomier
            2x2 -> 4-across layout instead of the same cramped 2-col phone view. */}
        <div className="lg:hidden space-y-3">

          <div className="flex items-center justify-between px-1">

            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                {loanType} Loans
              </h2>

              <p className="text-[10px] text-slate-400 mt-0.5">
                {filteredLoans.length} accounts
              </p>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-black uppercase">
              Card View
            </div>

          </div>


          {filteredLoans.length === 0 ? (

            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">

              <FileText
                size={32}
                className="mx-auto text-slate-300 mb-3"
              />

              <p className="text-sm font-bold text-slate-700">
                No Loan Accounts Found
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                Try changing your search or filters.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
              {filteredLoans.map((loan) => {

                const calculatedName =
                  loan.member?.memberName ||
                  loan.borrowerName ||
                  "Unknown Member";

                const calculatedMobile =
                  loan.member?.mobile ||
                  loan.mobile ||
                  "—";

                return (

                  <div
                    key={loan._id}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
                  >

                    {/* CARD HEADER */}
                    <div className="p-4 border-b border-slate-100">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0 flex-1">

                          <h3 className="text-sm font-black text-slate-900 truncate">
                            {calculatedName}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">

                            {loan.member?.memberId && (
                              <span className="text-[10px] font-semibold text-blue-600">
                                ID: {loan.member.memberId}
                              </span>
                            )}

                            <span className="text-[10px] text-slate-400">
                              {calculatedMobile}
                            </span>

                          </div>

                        </div>

                      <StatusBadge status={getLoanDisplayStatus(loan)} />
                      </div>

                    </div>


                    {/* MAIN MONEY DETAILS */}
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 xl:grid-cols-4 gap-2.5">

                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">

                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-wider">
                          Principal
                        </p>

                        <p className="text-sm font-black text-blue-700 mt-1">
                          ₹{(loan.loanAmount || 0).toLocaleString("en-IN")}
                        </p>

                      </div>


                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">

                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-wider">
                          EMI
                        </p>

                        <p className="text-sm font-black text-emerald-700 mt-1">
                          ₹{(loan.emiAmount || 0).toLocaleString("en-IN")}
                        </p>

                      </div>


                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">

                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          Outstanding
                        </p>

                        <p className="text-sm font-black text-slate-900 mt-1">
                          ₹{(loan.outstandingAmount || 0).toLocaleString("en-IN")}
                        </p>

                      </div>


                      <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">

                        <p className="text-[9px] font-black text-orange-500 uppercase tracking-wider">
                          Penalty
                        </p>

                        <p className="text-sm font-black text-orange-700 mt-1">
                          ₹{(loan.pendingPenalty || 0).toLocaleString("en-IN")}
                        </p>

                      </div>

                    </div>


                    {/* SECONDARY INFO */}
                    <div className="px-4 pb-3 mt-auto">

                      <div className="flex items-center justify-between gap-3 py-2.5 border-t border-slate-100">

                        <div>

                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Loan Type
                          </p>

                          <p className="text-xs font-black text-slate-800 mt-0.5">
                            {loan.loanType}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Interest
                          </p>

                          <p className="text-xs font-black text-blue-600 mt-0.5">
                            {loan.interestRate || 0}%
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center justify-between gap-3 py-2.5 border-t border-slate-100">

                        <div>

                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Total Paid
                          </p>

                          <p className="text-xs font-bold text-emerald-600 mt-0.5">
                            ₹{(loan.totalPaid || 0).toLocaleString("en-IN")}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Pending EMI
                          </p>

                          <p className="text-xs font-bold text-rose-600 mt-0.5">
                            {loan.pendingInstallments || 0}
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* CARD ACTIONS */}
                  {/* CARD ACTIONS */}
<div className="p-3.5 bg-slate-50 border-t border-slate-100 grid grid-cols-3 gap-2">



  {/* COLLECT */}
  <button
    type="button"
 onClick={() => {
  sessionStorage.setItem(
    DASHBOARD_SCROLL_KEY,
    String(window.scrollY)
  );

  navigate(`/daily/loan/${loan._id}`);
}}
    className="min-h-11 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black px-2 rounded-xl text-[11px] shadow-sm transition-all cursor-pointer"
  >
    <FileText size={14} />
    Collect
  </button>

  {/* EDIT */}
  <button
    type="button"
    onClick={() =>
      navigate(`/daily/edit-loan/${loan._id}`)
    }
    className="min-h-11 inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white font-black px-2 rounded-xl text-[11px] shadow-sm transition-all cursor-pointer"
  >
    <Pencil size={14} />
    Edit
  </button>
{/* CLOSE / TERMINATE */}
<button
  type="button"
  onClick={() => closeLoan(loan)}
  disabled={loan.status === "CLOSED"}
  className="min-h-11 inline-flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-black px-2 rounded-xl text-[11px] shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
>
  <XCircle size={14} />
  Close
</button>
</div>

                  </div>

                );

              })}
            </div>

          )}

        </div>

      </div>
    </div>
  );
}


// Reusable dashboard metric card.
function DashboardCard({
  title,
  value,
  icon,
  bgColor = "bg-white",
  borderColor = "border-l-slate-300",
  valueColor = "text-slate-900",
  subtitle,
}) {
  return (
    <div className={`min-w-0 rounded-2xl border border-slate-200 border-l-4 ${borderColor} ${bgColor} p-3 sm:p-4 shadow-sm`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
        <div className="shrink-0">{icon}</div>
      </div>
      <p className={`mt-2 text-lg sm:text-xl font-extrabold break-words ${valueColor}`}>{value}</p>
      {subtitle && <p className="mt-1 text-[10px] sm:text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}

// Reusable loan-type tab button.
function TabButton({ active, onClick, label, activeColor = "bg-blue-600 text-white" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
        active ? activeColor : "text-slate-600 hover:bg-white hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );
}

// Compact badge for the current loan status.
function StatusBadge({ status }) {
  const normalized = String(status || "UNKNOWN").toUpperCase();
  const styles = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
    PAID: "bg-blue-50 text-blue-700 border-blue-200",
    OVERDUE: "bg-rose-50 text-rose-700 border-rose-200",
    DEFAULTED: "bg-rose-50 text-rose-700 border-rose-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${styles[normalized] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
      {status || "Unknown"}
    </span>
  );
}

export default LoansDashboard;