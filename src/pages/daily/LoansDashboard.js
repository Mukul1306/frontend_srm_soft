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
  Eye,
  CheckCircle2,
  XCircle,
  X,
  Loader2
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

  // Pending loan request management
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingTerminationRequests, setPendingTerminationRequests] = useState([]);
const [showTerminationRequests, setShowTerminationRequests] = useState(false);
const [selectedTerminationRequest, setSelectedTerminationRequest] = useState(null);
const [showTerminationDetails, setShowTerminationDetails] = useState(false);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestActionLoading, setRequestActionLoading] = useState(false);
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
      const res = await axios.get("https://aws.srmfinance.online/api/daily/loans");
      setLoans(res.data?.loans || []);
    } catch (error) {
      console.error("Error fetching credit loans registry portfolio:", error);
    }
  };


  const loadDashboard = async () => {
    try {
      const res = await axios.get(
        `https://aws.srmfinance.online/api/daily/loan-dashboard?loanType=${loanType}`
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
      `https://aws.srmfinance.online/api/daily/close-loan/${loan._id}`
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

  // LOAD PENDING AGENT LOAN REQUESTS
  const loadPendingRequests = async () => {
    try {
      setRequestLoading(true);
      const res = await axios.get(
        "https://aws.srmfinance.online/api/daily/loan-requests"
      );

     const requests = res.data?.requests || [];

setPendingRequests(
  requests.filter(
    (request) =>
      request.status === "PENDING" &&
      request.requestType !== "LOAN_TERMINATION"
  )
);
    } catch (error) {
      console.error("Error fetching pending loan requests:", error);
      alert(
        error.response?.data?.message ||
          "Failed to load pending loan requests."
      );
    } finally {
      setRequestLoading(false);
    }
  };
 
  const loadPendingTerminationRequests = async () => {
  try {
    setRequestLoading(true);

    const res = await axios.get(
      "https://aws.srmfinance.online  /api/daily/loan-requests"
    );

    const requests = res.data?.requests || [];

    setPendingTerminationRequests(
      requests.filter(
        (request) =>
          request.status === "PENDING" &&
          request.requestType === "LOAN_TERMINATION"
      )
    );
  } catch (error) {
    console.error(
      "Error fetching pending termination requests:",
      error
    );

    alert(
      error.response?.data?.message ||
        "Failed to load termination requests."
    );
  } finally {
    setRequestLoading(false);
  }
};

const approveTerminationRequest = async (requestId) => {
  const confirmed = window.confirm(
    "Approve this termination request?\n\n" +
    "This will permanently close the loan."
  );

  if (!confirmed) return;

  try {
    setRequestActionLoading(true);

    await axios.put(
      `https://aws.srmfinance.online/api/daily/loan-termination-request/${requestId}/approve`
    );

    alert(
      "Termination request approved. Loan has been closed successfully."
    );

    setShowTerminationDetails(false);
    setSelectedTerminationRequest(null);

    await loadPendingTerminationRequests();
    await loadLoans();
    await loadDashboard();

  } catch (error) {
    console.error(
      "Approve termination request error:",
      error
    );

    alert(
      error.response?.data?.message ||
        "Failed to approve termination request."
    );
  } finally {
    setRequestActionLoading(false);
  }
};

const rejectTerminationRequest = async (requestId) => {
  const reason =
    window.prompt(
      "Enter rejection reason (optional):"
    ) || "";

  try {
    setRequestActionLoading(true);

    await axios.put(
      `https://aws.srmfinance.online/api/daily/loan-termination-request/  ${requestId}/reject`,
      {
        rejectionReason: reason,
      }
    );

    alert(
      "Termination request rejected. The loan remains active."
    );

    setShowTerminationDetails(false);
    setSelectedTerminationRequest(null);

    await loadPendingTerminationRequests();
    await loadLoans();
    await loadDashboard();

  } catch (error) {
    console.error(
      "Reject termination request error:",
      error
    );

    alert(
      error.response?.data?.message ||
        "Failed to reject termination request."
    );
  } finally {
    setRequestActionLoading(false);
  }
};



  const openPendingRequests = async () => {
    setShowPendingRequests(true);
    await loadPendingRequests();
  };

  const viewRequest = (request) => {
    setSelectedRequest(request);
    setShowRequestDetails(true);
  };

  const approveRequest = async (requestId) => {
    const confirmed = window.confirm(
      "Approve this loan request? This will create the actual loan account."
    );

    if (!confirmed) return;

    try {
      setRequestActionLoading(true);

      await axios.put(
        `https://aws.srmfinance.online/api/daily/loan-request/${requestId}/approve`
      );

      alert("Loan request approved successfully. The actual loan has been created.");

      setShowRequestDetails(false);
      setSelectedRequest(null);

      await loadPendingRequests();
      await loadLoans();
      await loadDashboard();
    } catch (error) {
      console.error("Approve loan request error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to approve loan request."
      );
    } finally {
      setRequestActionLoading(false);
    }
  };

  const rejectRequest = async (requestId) => {
    const reason = window.prompt("Enter rejection reason (optional):") || "";

    try {
      setRequestActionLoading(true);

      await axios.put(
        `https://aws.srmfinance.online/api/daily/loan-request/${requestId}/reject`,
        { rejectionReason: reason }
      );

      alert("Loan request rejected successfully.");

      setShowRequestDetails(false);
      setSelectedRequest(null);

      await loadPendingRequests();
    } catch (error) {
      console.error("Reject loan request error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to reject loan request."
      );
    } finally {
      setRequestActionLoading(false);
    }
  };

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
              onClick={openPendingRequests}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold px-3.5 sm:px-4 py-2.5 rounded-xl text-xs tracking-wider uppercase shadow-sm transition-all cursor-pointer"
            >
              <Clock size={16} className="shrink-0" />
              <span>Pending Requests</span>
              {pendingRequests.length > 0 && (
                <span className="min-w-5 h-5 px-1 rounded-full bg-white text-amber-600 text-[10px] flex items-center justify-center font-black">
                  {pendingRequests.length}
                </span>
              )}
            </button>
         <button
  type="button"
  onClick={async () => {
    setShowTerminationRequests(true);
    await loadPendingTerminationRequests();
  }}
  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold px-3.5 sm:px-4 py-2.5 rounded-xl text-xs tracking-wider uppercase shadow-sm transition-all cursor-pointer"
>
  <XCircle size={16} className="shrink-0" />

  <span>Close Requests</span>

  {pendingTerminationRequests.length > 0 && (
    <span className="min-w-5 h-5 px-1 rounded-full bg-white text-rose-600 text-[10px] flex items-center justify-center font-black">
      {pendingTerminationRequests.length}
    </span>
  )}
</button>


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

        {/* =====================================================
            PENDING LOAN REQUESTS MODAL
        ===================================================== */}
        {showPendingRequests && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto">
            <div className="bg-white w-full max-w-6xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] sm:max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-4 sm:px-7 py-3.5 border-b border-slate-100 shrink-0">
                <div className="min-w-0 pr-2">
                  <h2 className="text-base sm:text-xl font-black text-slate-900 truncate">
                    Pending Loan Requests
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">
                    Review loan requests submitted by agents before creating the actual loan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPendingRequests(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 sm:p-6 overflow-y-auto">
                {requestLoading ? (
                  <div className="py-14 flex items-center justify-center gap-2 text-sm text-slate-500">
                    <Loader2 size={18} className="animate-spin" />
                    Loading pending requests...
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="py-14 text-center">
                    <CheckCircle2 className="mx-auto text-emerald-500" size={38} />
                    <p className="font-black text-slate-900 mt-3">
                      No Pending Requests
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      All agent loan requests have been processed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => {
                      const member = request.member || {};
                      const agent = request.assignedAgent || {};

                      return (
                        <div
                          key={request._id}
                          className="border border-slate-200 rounded-2xl p-3 sm:p-4 hover:border-blue-200 transition"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-black text-slate-900 text-sm sm:text-base truncate">
                                  {request.borrowerName ||
                                    member.memberName ||
                                    "Unknown Member"}
                                </h3>

                                <span className="text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                                  {request.loanType}
                                </span>

                                <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                                  PENDING
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3">
                                <MiniInfo
                                  label="Member ID"
                                  value={
                                    request.memberId ||
                                    member.memberId ||
                                    "—"
                                  }
                                />
                                <MiniInfo
                                  label="Loan Amount"
                                  value={`₹${Number(
                                    request.loanAmount || 0
                                  ).toLocaleString("en-IN")}`}
                                />
                                <MiniInfo
                                  label="Interest"
                                  value={`${request.interestRate || 0}%`}
                                />
                                <MiniInfo
                                  label="Agent"
                                  value={
                                    agent.name ||
                                    agent.agentName ||
                                    request.assignedAgent?.name ||
                                    "Agent"
                                  }
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => viewRequest(request)}
                              className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
                            >
                              <Eye size={15} />
                              View Full Details
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
        )}

{showTerminationRequests && (
  <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto">

    <div className="bg-white w-full max-w-6xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 sm:px-7 py-3.5 border-b border-slate-100 shrink-0">

        <div className="min-w-0 pr-2">

          <h2 className="text-base sm:text-xl font-black text-slate-900 truncate">
            Pending Close Requests
          </h2>

          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
            Review loan termination requests submitted by agents.
          </p>

        </div>

        <button
          type="button"
          onClick={() => {
            setShowTerminationRequests(false);
            setSelectedTerminationRequest(null);
          }}
          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 shrink-0"
        >
          <X size={18} />
        </button>

      </div>

      {/* BODY */}
      <div className="p-3 sm:p-6 overflow-y-auto">

        {requestLoading ? (

          <div className="py-14 flex items-center justify-center gap-2 text-sm text-slate-500">

            <Loader2
              size={18}
              className="animate-spin"
            />

            Loading close requests...

          </div>

        ) : pendingTerminationRequests.length === 0 ? (

          <div className="py-14 text-center">

            <CheckCircle2
              className="mx-auto text-emerald-500"
              size={38}
            />

            <p className="font-black text-slate-900 mt-3">
              No Pending Close Requests
            </p>

            <p className="text-xs text-slate-500 mt-1">
              All loan termination requests have been processed.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {pendingTerminationRequests.map((request) => {

              const loan = request.loan || {};
              const member = request.member || {};
              const agent = request.assignedAgent || {};

              return (
                <div
                  key={request._id}
                  className="border border-slate-200 rounded-2xl p-3 sm:p-4 hover:border-rose-200 transition"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">

                    <div className="flex-1 min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-black text-slate-900 text-sm sm:text-base">
                          {request.borrowerName ||
                            member.memberName ||
                            loan.borrowerName ||
                            "Unknown Member"}
                        </h3>

                        <span className="text-[9px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200 rounded-full px-2 py-0.5">
                          CLOSE REQUEST
                        </span>

                        <span className="text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                          PENDING
                        </span>

                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mt-3">

                        <MiniInfo
                          label="Loan Number"
                          value={
                            request.loanNumber ||
                            loan.loanNumber ||
                            "—"
                          }
                        />

                        <MiniInfo
                          label="Member ID"
                          value={
                            request.memberId ||
                            member.memberId ||
                            loan.memberId ||
                            "—"
                          }
                        />

                        <MiniInfo
                          label="Outstanding"
                          value={`₹${Number(
                            request.outstandingAmount ??
                              loan.outstandingAmount ??
                              0
                          ).toLocaleString("en-IN")}`}
                        />

                        <MiniInfo
                          label="Agent"
                          value={
                            agent.name ||
                            agent.agentName ||
                            "Agent"
                          }
                        />

                        <MiniInfo
                          label="Reason"
                          value={
                            request.terminationReason ||
                            request.reason ||
                            "No reason"
                          }
                        />

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTerminationRequest(request);
                        setShowTerminationDetails(true);
                      }}
                      className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shrink-0"
                    >
                      <Eye size={15} />
                      Review Request
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
)}


{showTerminationDetails &&
  selectedTerminationRequest && (

  <div className="fixed inset-0 z-[110] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto">

    <div className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">

      {/* HEADER */}

      <div className="flex items-center justify-between px-4 sm:px-7 py-4 border-b border-slate-100">

        <div>

          <h2 className="text-base sm:text-xl font-black text-slate-900">
            Close Loan Request
          </h2>

          <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
            Review the termination request before approval.
          </p>

        </div>

        <button
          type="button"
          onClick={() => {
            setShowTerminationDetails(false);
            setSelectedTerminationRequest(null);
          }}
          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
        >
          <X size={18} />
        </button>

      </div>


      {/* DETAILS */}

      <div className="p-4 sm:p-7 overflow-y-auto space-y-4">

        <DetailSection title="Loan Information">

          <DetailItem
            label="Borrower"
            value={
              selectedTerminationRequest.borrowerName ||
              selectedTerminationRequest.member?.memberName ||
              selectedTerminationRequest.loan?.borrowerName
            }
          />

          <DetailItem
            label="Loan Number"
            value={
              selectedTerminationRequest.loanNumber ||
              selectedTerminationRequest.loan?.loanNumber
            }
          />

          <DetailItem
            label="Member ID"
            value={
              selectedTerminationRequest.memberId ||
              selectedTerminationRequest.member?.memberId ||
              selectedTerminationRequest.loan?.memberId
            }
          />

          <DetailItem
            label="Loan Amount"
            value={`₹${Number(
              selectedTerminationRequest.loanAmount ||
              selectedTerminationRequest.loan?.loanAmount ||
              0
            ).toLocaleString("en-IN")}`}
          />

          <DetailItem
            label="Total Paid"
            value={`₹${Number(
              selectedTerminationRequest.totalPaid ??
              selectedTerminationRequest.loan?.totalPaid ??
              0
            ).toLocaleString("en-IN")}`}
          />

          <DetailItem
            label="Outstanding"
            value={`₹${Number(
              selectedTerminationRequest.outstandingAmount ??
              selectedTerminationRequest.loan?.outstandingAmount ??
              0
            ).toLocaleString("en-IN")}`}
          />

          <DetailItem
            label="Loan Status"
            value={
              selectedTerminationRequest.loan?.status ||
              selectedTerminationRequest.loanStatus ||
              "ACTIVE"
            }
          />

          <DetailItem
            label="Loan Type"
            value={
              selectedTerminationRequest.loanType ||
              selectedTerminationRequest.loan?.loanType
            }
          />

        </DetailSection>


        <DetailSection title="Termination Request">

          <DetailItem
            label="Requested By"
            value={
              selectedTerminationRequest.assignedAgent?.name ||
              selectedTerminationRequest.assignedAgent?.agentName ||
              "Agent"
            }
          />

          <DetailItem
            label="Request Date"
            value={formatDate(
              selectedTerminationRequest.createdAt
            )}
          />

          <DetailItem
            label="Reason"
            value={
              selectedTerminationRequest.terminationReason ||
              selectedTerminationRequest.reason ||
              "No reason provided"
            }
          />

        </DetailSection>


        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">

          <p className="text-xs text-rose-800">

            <strong>Approval:</strong>{" "}
            Approving this request will change the loan status
            to <strong>CLOSED</strong>.

          </p>

          <p className="text-xs text-emerald-700 mt-2">

            <strong>Rejection:</strong>{" "}
            Rejecting this request will NOT close the loan.
            The loan will remain in its current status.

          </p>

        </div>

      </div>


      {/* ACTIONS */}

      <div className="border-t border-slate-100 px-4 sm:px-7 py-3 sm:py-4 flex flex-col sm:flex-row justify-end gap-2 bg-slate-50">

        <button
          type="button"
          disabled={requestActionLoading}
          onClick={() =>
            rejectTerminationRequest(
              selectedTerminationRequest._id
            )
          }
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-black text-xs sm:text-sm"
        >

          {requestActionLoading ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <XCircle size={17} />
          )}

          Reject Close Request

        </button>


        <button
          type="button"
          disabled={requestActionLoading}
          onClick={() =>
            approveTerminationRequest(
              selectedTerminationRequest._id
            )
          }
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-black text-xs sm:text-sm"
        >

          {requestActionLoading ? (
            <>
              <Loader2
                size={17}
                className="animate-spin"
              />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 size={17} />
              Approve & Close Loan
            </>
          )}

        </button>

      </div>

    </div>

  </div>
)}

        {/* =====================================================
            COMPLETE REQUEST DETAILS MODAL
        ===================================================== */}
        {showRequestDetails && selectedRequest && (
          <div className="fixed inset-0 z-[110] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto">
            <div className="bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] sm:max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-4 sm:px-7 py-3.5 border-b border-slate-100 shrink-0">
                <div className="min-w-0 pr-2">
                  <h2 className="text-base sm:text-xl font-black text-slate-900 truncate">
                    Loan Request Details
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">
                    Review complete information before approval.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowRequestDetails(false);
                    setSelectedRequest(null);
                  }}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3.5 sm:p-7 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
                <DetailSection title="Borrower Information">
                  <DetailItem
                    label="Member Name"
                    value={
                      selectedRequest.borrowerName ||
                      selectedRequest.member?.memberName ||
                      "—"
                    }
                  />
                  <DetailItem
                    label="Member ID"
                    value={
                      selectedRequest.memberId ||
                      selectedRequest.member?.memberId ||
                      "—"
                    }
                  />
                  <DetailItem
                    label="Father Name"
                    value={selectedRequest.fatherName}
                  />
                  <DetailItem
                    label="Gender"
                    value={selectedRequest.gender}
                  />
                  <DetailItem
                    label="Date of Birth"
                    value={formatDate(selectedRequest.dob)}
                  />
                  <DetailItem
                    label="Mobile"
                    value={
                      selectedRequest.mobile ||
                      selectedRequest.member?.mobile
                    }
                  />
                  <DetailItem
                    label="Alternate Mobile"
                    value={selectedRequest.alternateMobile}
                  />
                  <DetailItem
                    label="Email"
                    value={selectedRequest.email}
                  />
                  <DetailItem
                    label="Address"
                    value={selectedRequest.address}
                  />
                  <DetailItem
                    label="City"
                    value={selectedRequest.city}
                  />
                  <DetailItem
                    label="District"
                    value={selectedRequest.district}
                  />
                  <DetailItem
                    label="State"
                    value={selectedRequest.state}
                  />
                  <DetailItem
                    label="Pincode"
                    value={selectedRequest.pincode}
                  />
                </DetailSection>

                <DetailSection title="Loan Information">
                  <DetailItem
                    label="Loan Type"
                    value={selectedRequest.loanType}
                  />
                  <DetailItem
                    label="Loan Amount"
                    value={`₹${Number(
                      selectedRequest.loanAmount || 0
                    ).toLocaleString("en-IN")}`}
                  />
                  <DetailItem
                    label="Interest Rate"
                    value={`${selectedRequest.interestRate || 0}%`}
                  />
                  <DetailItem
                    label="Duration Days"
                    value={selectedRequest.durationDays}
                  />
                  <DetailItem
                    label="Duration Weeks"
                    value={selectedRequest.durationWeeks}
                  />
                  <DetailItem
                    label="Duration Months"
                    value={selectedRequest.durationMonths}
                  />
                  <DetailItem
                    label="Loan Tenure"
                    value={
                      selectedRequest.loanTenureMonths
                        ? `${selectedRequest.loanTenureMonths} Months`
                        : "—"
                    }
                  />
                  <DetailItem
                    label="Loan Date"
                    value={formatDate(selectedRequest.loanDate)}
                  />
                  <DetailItem
                    label="Start Date"
                    value={formatDate(selectedRequest.startDate)}
                  />
                  <DetailItem
                    label="End Date"
                    value={formatDate(selectedRequest.endDate)}
                  />
                  <DetailItem
                    label="Total Interest"
                    value={`₹${Number(
                      selectedRequest.totalInterest || 0
                    ).toLocaleString("en-IN")}`}
                  />
                  <DetailItem
                    label="Total Payable"
                    value={`₹${Number(
                      selectedRequest.totalPayable || 0
                    ).toLocaleString("en-IN")}`}
                  />
                  <DetailItem
                    label="EMI Amount"
                    value={`₹${Number(
                      selectedRequest.emiAmount || 0
                    ).toLocaleString("en-IN")}`}
                  />
                  <DetailItem
                    label="Total Installments"
                    value={selectedRequest.totalInstallments}
                  />
                </DetailSection>

                <DetailSection title="Nominee & Penalty">
                  <DetailItem
                    label="Nominee Name"
                    value={selectedRequest.nomineeName}
                  />
                  <DetailItem
                    label="Nominee Mobile"
                    value={selectedRequest.nomineeMobile}
                  />
                  <DetailItem
                    label="Grace Period"
                    value={
                      selectedRequest.gracePeriod != null
                        ? `${selectedRequest.gracePeriod} Days`
                        : "—"
                    }
                  />
                  <DetailItem
                    label="Penalty Type"
                    value={selectedRequest.penaltyType}
                  />
                  <DetailItem
                    label="Penalty Value"
                    value={selectedRequest.penaltyValue}
                  />
                </DetailSection>

                <DetailSection title="Security & Documents">
                  <DetailItem
                    label="Security Type"
                    value={selectedRequest.securityType}
                  />
                  <DetailItem
                    label="Security Details"
                    value={selectedRequest.securityDetails}
                  />
                  <DetailItem
                    label="Aadhaar"
                    value={selectedRequest.aadhaarNumber || "—"}
                  />
                  <DetailItem
                    label="PAN"
                    value={selectedRequest.panNumber || "—"}
                  />
                  <DetailItem
                    label="Cheque 1"
                    value={selectedRequest.cheque1Number}
                  />
                  <DetailItem
                    label="Cheque 2"
                    value={selectedRequest.cheque2Number}
                  />
                  <DetailItem
                    label="Passport Photo"
                    value={yesNo(selectedRequest.passportPhotoSubmitted)}
                  />
                  <DetailItem
                    label="Aadhaar Submitted"
                    value={yesNo(selectedRequest.aadhaarSubmitted)}
                  />
                  <DetailItem
                    label="PAN Submitted"
                    value={yesNo(selectedRequest.panSubmitted)}
                  />
                  <DetailItem
                    label="Cheque 1 Submitted"
                    value={yesNo(selectedRequest.cheque1Submitted)}
                  />
                  <DetailItem
                    label="Cheque 2 Submitted"
                    value={yesNo(selectedRequest.cheque2Submitted)}
                  />
                  <DetailItem
                    label="Stamp Paper"
                    value={yesNo(selectedRequest.stampPaperSubmitted)}
                  />
                </DetailSection>

                <DetailSection title="Agent & Remarks">
                  <DetailItem
                    label="Assigned Agent"
                    value={
                      selectedRequest.assignedAgent?.name ||
                      selectedRequest.assignedAgent?.agentName ||
                      selectedRequest.assignedAgent?._id ||
                      "—"
                    }
                  />
                  <DetailItem
                    label="Area"
                    value={selectedRequest.areaName}
                  />
                  <DetailItem
                    label="Remarks"
                    value={selectedRequest.remarks}
                  />
                  <DetailItem
                    label="Request Created"
                    value={formatDate(selectedRequest.createdAt)}
                  />
                </DetailSection>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 sm:p-4">
                  <p className="text-xs text-amber-800">
                    <strong>Approval warning:</strong> Approving this request
                    creates the actual loan account. After approval, the loan
                    becomes available in the normal loan ledger for collection.
                  </p>
                </div>
              </div>

              {/* APPROVE / REJECT */}
              <div className="border-t border-slate-100 px-4 sm:px-7 py-3 sm:py-4 flex flex-col sm:flex-row justify-end gap-2 bg-slate-50 shrink-0">
                <button
                  type="button"
                  disabled={requestActionLoading}
                  onClick={() => rejectRequest(selectedRequest._id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-black text-xs sm:text-sm cursor-pointer"
                >
                  <XCircle size={17} />
                  Reject Request
                </button>

                <button
                  type="button"
                  disabled={requestActionLoading}
                  onClick={() => approveRequest(selectedRequest._id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-black text-xs sm:text-sm cursor-pointer"
                >
                  {requestActionLoading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      Approve & Create Loan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --- REQUEST MODAL HELPERS --- */
function MiniInfo({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate">
        {label}
      </p>
      <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
        {value || "—"}
      </p>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <div className="bg-slate-50 px-3.5 sm:px-4 py-2 sm:py-2.5 border-b border-slate-200">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 p-3 sm:p-4">
        {children}
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">
        {label}
      </p>
      <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 break-words">
        {value || "—"}
      </p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function yesNo(value) {
  if (value === true) return "Submitted";
  if (value === false) return "Not Submitted";
  return "—";
}

/* --- HELPER: REUSABLE STATUS BADGE --- */
function StatusBadge({ status }) {
  const getStyles = () => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "DUE":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "OVERDUE":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "CLOSED":
  return "bg-slate-100 text-slate-700 border-slate-200";

case "PAID":
  return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full border text-[9px] sm:text-[10px] font-extrabold tracking-wide shrink-0 ${getStyles()}`}>
      {status || "N/A"}
    </span>
  );
}

/* --- HELPER: DASHBOARD STAT CARD --- */
function DashboardCard({ title, value, icon, bgColor, borderColor, valueColor = "text-slate-900", subtitle }) {
  return (
    <div
      className={`bg-white border border-slate-200/80 border-l-4 ${borderColor} rounded-2xl p-3 sm:p-4 shadow-sm flex items-start justify-between gap-2 transition-transform hover:-translate-y-0.5 duration-200`}
    >
      <div className="space-y-0.5 min-w-0 flex-1">
        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
          {title}
        </p>
        <h2 className={`text-sm sm:text-lg lg:text-xl font-black ${valueColor} truncate tracking-tight`}>{value}</h2>
        {subtitle && <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">{subtitle}</p>}
      </div>
      <div className={`p-1.5 sm:p-2.5 rounded-xl shrink-0 ${bgColor}`}>{icon}</div>
    </div>
  );
}

/* --- HELPER: STRATEGY TAB BUTTON --- */
function TabButton({ active, onClick, label, activeColor }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 min-w-[70px] sm:min-w-[80px] px-3 py-2 text-xs font-extrabold rounded-xl tracking-wide transition-all duration-200 whitespace-nowrap cursor-pointer ${
        active ? activeColor : "text-slate-500 hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );
}

export default LoansDashboard;