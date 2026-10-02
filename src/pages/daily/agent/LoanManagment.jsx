import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileText,
  TrendingUp,
  Users,
  AlertCircle,
  Coins,
  ChevronRight,
  CheckCircle2,
  Plus,
  X,
  Send,
  User,
  Calculator,
} from "lucide-react";

const API = "https://finance-project-0qqk.onrender.com/api/daily";

function LoansDashboard() {
  const navigate = useNavigate();

  const [loans, setLoans] = useState([]);
  const [loanType, setLoanType] = useState(() => {
    return sessionStorage.getItem("dailyLoanType") || "DAILY";
  });

const [search, setSearch] = useState(
  () => sessionStorage.getItem("dailyLoanSearch") || ""
);

const handleSearchChange = (e) => {
  const value = e.target.value;

  setSearch(value);

  sessionStorage.setItem(
    "dailyLoanSearch",
    value
  );
};
  // =========================================================
  // CREATE LOAN REQUEST STATES
  // =========================================================
  const [showCreateLoan, setShowCreateLoan] = useState(false);
  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  const emptyLoanForm = () => ({
    member: "",
    loanAmount: "",
    interestRate: "",
    loanType: "DAILY",

    durationDays: "",
    durationWeeks: "",
    durationMonths: "",
    loanTenureMonths: "10",

    loanDate: new Date().toISOString().split("T")[0],

    nomineeName: "",
    nomineeMobile: "",

    gracePeriod: "0",
    penaltyType: "FIXED",
    penaltyValue: "0",

    aadhaarNumber: "",
    aadhaarSubmitted: false,
    panNumber: "",
    panSubmitted: false,
    cheque1Number: "",
    cheque2Number: "",
    cheque1Submitted: false,
    cheque2Submitted: false,
    passportPhotoSubmitted: false,
    stampPaperSubmitted: false,

    securityType: "UNSECURED",
    securityDetails: "",

    guarantor1Name: "",
    guarantor1FatherName: "",
    guarantor1Gender: "",
    guarantor1Dob: "",
    guarantor1Mobile: "",
    guarantor1AlternateMobile: "",
    guarantor1Email: "",
    guarantor1Address: "",
    guarantor1City: "",
    guarantor1District: "",
    guarantor1State: "",
    guarantor1Pincode: "",
    guarantor1PhotoSubmitted: false,
    guarantor1AadhaarNumber: "",
    guarantor1AadhaarSubmitted: false,
    guarantor1PanNumber: "",
    guarantor1PanSubmitted: false,
    guarantor1Cheque1Number: "",
    guarantor1Cheque2Number: "",
    guarantor1Cheque1Submitted: false,
    guarantor1Cheque2Submitted: false,
    guarantor1StampPaperSubmitted: false,
    guarantor1SecurityType: "UNSECURED",
    guarantor1SecurityDetails: "",

    guarantor2Name: "",
    guarantor2FatherName: "",
    guarantor2Gender: "",
    guarantor2Dob: "",
    guarantor2Mobile: "",
    guarantor2AlternateMobile: "",
    guarantor2Email: "",
    guarantor2Address: "",
    guarantor2City: "",
    guarantor2District: "",
    guarantor2State: "",
    guarantor2Pincode: "",
    guarantor2PhotoSubmitted: false,
    guarantor2AadhaarNumber: "",
    guarantor2AadhaarSubmitted: false,
    guarantor2PanNumber: "",
    guarantor2PanSubmitted: false,
    guarantor2Cheque1Number: "",
    guarantor2Cheque2Number: "",
    guarantor2Cheque1Submitted: false,
    guarantor2Cheque2Submitted: false,
    guarantor2StampPaperSubmitted: false,
    guarantor2SecurityType: "UNSECURED",
    guarantor2SecurityDetails: "",

    remarks: "",
  });

  const [loanForm, setLoanForm] = useState(emptyLoanForm());

  const [selectedMember, setSelectedMember] = useState(null);

  // =========================================================
  // LOAD EXISTING LOANS
  // =========================================================
  useEffect(() => {
    loadLoans();
  }, []);
  
  useEffect(() => {
  return () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };
}, []);

 const loadLoans = async () => {
  try {
    const agent = JSON.parse(
      localStorage.getItem("agent")
    );

    console.log("AGENT FROM LOCAL STORAGE:", agent);
    console.log("AGENT ID:", agent?._id);

    if (!agent?._id) {
      console.error("NO AGENT ID FOUND");
      return;
    }

    const url =
      `${API}/agent-loans/${agent._id}`;

    console.log("LOAN API URL:", url);

    const res = await axios.get(url);

    console.log(
      "LOAN API STATUS:",
      res.status
    );

    console.log(
      "LOAN API RESPONSE:",
      res.data
    );

    setLoans(
      res.data.loans || []
    );

  } catch (error) {

    console.error(
      "========== LOAN API ERROR =========="
    );

    console.error(
      "STATUS:",
      error.response?.status
    );

    console.error(
      "BACKEND RESPONSE:",
      error.response?.data
    );

    console.error(
      "MESSAGE:",
      error.message
    );

    console.error(
      "FULL ERROR:",
      error
    );

    console.error(
      "===================================="
    );
  }
};


const requestTermination = async (loan) => {

  const agent =
    JSON.parse(
      localStorage.getItem("agent")
    );

  if (!agent?._id) {
    alert("Agent session not found.");
    return;
  }

  if (loan.status === "CLOSED") {
    alert("This loan is already closed.");
    return;
  }

  if (
    loan.terminationStatus ===
    "PENDING"
  ) {
    alert(
      "Termination request is already pending."
    );
    return;
  }

  const reason =
    window.prompt(
      "Enter termination reason:"
    );

  if (reason === null) return;

  const confirmed =
    window.confirm(
      `Send termination request?\n\n` +
      `Member: ${
        loan.member?.memberName ||
        loan.borrowerName ||
        "Unknown"
      }\n` +
      `Loan: ${
        loan.loanNumber || "—"
      }\n` +
      `Outstanding: ₹${
        Number(
          loan.outstandingAmount || 0
        ).toLocaleString("en-IN")
      }`
    );

  if (!confirmed) return;

  try {

    setSubmitting(true);

  await axios.post(
  `${API}/loan-termination-request/${loan._id}`,
  {
    agentId: agent._id,
    reason,
  }
);

    alert(
      "Termination request sent successfully. Waiting for admin approval."
    );

    await loadLoans();

  } catch (error) {

    console.error(
      "Termination request error:",
      error
    );

    alert(
      error.response?.data?.message ||
      "Failed to send termination request."
    );

  } finally {

    setSubmitting(false);

  }
};

  // =========================================================
  // SEARCH REGISTERED MEMBERS
  // =========================================================
const searchMembers = (value) => {
  setMemberSearch(value);

  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }

  if (!value || value.trim().length < 2) {
    setMembers([]);
    setMemberLoading(false);
    return;
  }

  searchTimeoutRef.current = setTimeout(async () => {
    try {
      setMemberLoading(true);

      const agent = JSON.parse(localStorage.getItem("agent"));

      if (!agent?._id) {
        console.error("NO AGENT ID FOUND");
        setMembers([]);
        return;
      }

      const res = await axios.get(
        `${API}/loan-search/${encodeURIComponent(
          value.trim()
        )}?agentId=${agent._id}`
      );

      setMembers(res.data.members || []);
    } catch (error) {
      console.error("Member search error:", error);
      setMembers([]);
    } finally {
      setMemberLoading(false);
    }
  }, 300);
};

  // =========================================================
  // SELECT MEMBER
  // =========================================================
  const handleSelectMember = (member) => {
    setSelectedMember(member);

    setLoanForm((prev) => ({
      ...prev,
      member: member._id,
    }));

    setMemberSearch(
      `${member.memberName || ""} (${member.memberId || ""})`
    );

    setMembers([]);
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setLoanForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // CHANGE LOAN TYPE
  // =========================================================
  const handleLoanTypeChange = (type) => {
    setLoanForm((prev) => ({
      ...prev,
      loanType: type,
      durationDays: "",
      durationWeeks: "",
      durationMonths: "",
    }));
  };

  // =========================================================
  // CALCULATE PREVIEW
  // =========================================================
 const calculatePreview = () => {
  const amount = Number(loanForm.loanAmount || 0);
  const rate = Number(loanForm.interestRate || 0);

  let installments = 0;
  let totalInterest = 0;
  let totalPayable = amount;
  let emi = 0;

  if (loanForm.loanType === "DAILY") {
    installments = Number(loanForm.durationDays || 0);

    const interestMonths = installments / 30;

    totalInterest = Math.round(
      (amount * rate * interestMonths) / 100
    );

    totalPayable = amount + totalInterest;

    emi =
      installments > 0
        ? Math.ceil(totalPayable / installments)
        : 0;
  }

  else if (loanForm.loanType === "WEEKLY") {
    installments = Number(loanForm.durationWeeks || 0);

    const interestMonths = Number(
      loanForm.loanTenureMonths || 0
    );

    totalInterest = Math.round(
      (amount * rate * interestMonths) / 100
    );

    totalPayable = amount + totalInterest;

    emi =
      installments > 0
        ? Math.ceil(totalPayable / installments)
        : 0;
  }

  else if (loanForm.loanType === "MONTHLY") {
    installments = Number(loanForm.durationMonths || 0);

    const interestMonths = installments;

    totalInterest = Math.round(
      (amount * rate * interestMonths) / 100
    );

    totalPayable = amount + totalInterest;

    emi =
      installments > 0
        ? Math.ceil(totalPayable / installments)
        : 0;
  }

  else if (loanForm.loanType === "FIXED") {
    // FIXED = interest-only loan
    // Principal is NOT included in monthly payment

    installments = 0;

    // One month's interest
    totalInterest = Math.round(
      (amount * rate) / 100
    );

    // Principal remains outstanding
    totalPayable = amount;

    // Monthly payment = interest only
    emi = totalInterest;
  }

  return {
    installments,
    totalInterest,
    totalPayable,
    emi,
  };
};

  // =========================================================
  // SEND LOAN REQUEST
  // =========================================================
  const submitLoanRequest = async (e) => {
    e.preventDefault();

    try {
      if (!selectedMember?._id) {
        alert("Please select a registered member.");
        return;
      }

      if (!loanForm.loanAmount || Number(loanForm.loanAmount) <= 0) {
        alert("Please enter a valid loan amount.");
        return;
      }

      if (
        loanForm.interestRate === "" ||
        Number(loanForm.interestRate) < 0
      ) {
        alert("Please enter a valid interest rate.");
        return;
      }

      if (
        loanForm.loanType === "DAILY" &&
        (!loanForm.durationDays ||
          Number(loanForm.durationDays) <= 0)
      ) {
        alert("Please enter duration in days.");
        return;
      }

      if (
        loanForm.loanType === "WEEKLY" &&
        (!loanForm.durationWeeks ||
          Number(loanForm.durationWeeks) <= 0)
      ) {
        alert("Please enter duration in weeks.");
        return;
      }

      if (
        loanForm.loanType === "MONTHLY" &&
        (!loanForm.durationMonths ||
          Number(loanForm.durationMonths) <= 0)
      ) {
        alert("Please enter duration in months.");
        return;
      }

      setSubmitting(true);

      const agent = JSON.parse(localStorage.getItem("agent"));

      const payload = {
        member: selectedMember._id,
        agentId: agent?._id,

        loanAmount: Number(loanForm.loanAmount),
        interestRate: Number(loanForm.interestRate),
        loanType: loanForm.loanType,

        durationDays:
          loanForm.loanType === "DAILY"
            ? Number(loanForm.durationDays || 0)
            : 0,

        durationWeeks:
          loanForm.loanType === "WEEKLY"
            ? Number(loanForm.durationWeeks || 0)
            : 0,

        durationMonths:
          loanForm.loanType === "MONTHLY"
            ? Number(loanForm.durationMonths || 0)
            : 0,

        loanTenureMonths: Number(loanForm.loanTenureMonths || 10),

        loanDate: loanForm.loanDate,
        startDate: loanForm.loanDate,

        nomineeName: loanForm.nomineeName,
        nomineeMobile: loanForm.nomineeMobile,

        gracePeriod: Number(loanForm.gracePeriod || 0),
        penaltyType: loanForm.penaltyType,
        penaltyValue: Number(loanForm.penaltyValue || 0),

        aadhaarNumber: loanForm.aadhaarNumber,
        aadhaarSubmitted: loanForm.aadhaarSubmitted,
        panNumber: loanForm.panNumber,
        panSubmitted: loanForm.panSubmitted,
        cheque1Number: loanForm.cheque1Number,
        cheque2Number: loanForm.cheque2Number,
        cheque1Submitted: loanForm.cheque1Submitted,
        cheque2Submitted: loanForm.cheque2Submitted,
        passportPhotoSubmitted: loanForm.passportPhotoSubmitted,
        stampPaperSubmitted: loanForm.stampPaperSubmitted,

        securityType: loanForm.securityType,
        securityDetails: loanForm.securityDetails,

        guarantor1Name: loanForm.guarantor1Name,
        guarantor1FatherName: loanForm.guarantor1FatherName,
        guarantor1Gender: loanForm.guarantor1Gender,
        guarantor1Dob: loanForm.guarantor1Dob || null,
        guarantor1Mobile: loanForm.guarantor1Mobile,
        guarantor1AlternateMobile: loanForm.guarantor1AlternateMobile,
        guarantor1Email: loanForm.guarantor1Email,
        guarantor1Address: loanForm.guarantor1Address,
        guarantor1City: loanForm.guarantor1City,
        guarantor1District: loanForm.guarantor1District,
        guarantor1State: loanForm.guarantor1State,
        guarantor1Pincode: loanForm.guarantor1Pincode,
        guarantor1PhotoSubmitted: loanForm.guarantor1PhotoSubmitted,
        guarantor1AadhaarNumber: loanForm.guarantor1AadhaarNumber,
        guarantor1AadhaarSubmitted: loanForm.guarantor1AadhaarSubmitted,
        guarantor1PanNumber: loanForm.guarantor1PanNumber,
        guarantor1PanSubmitted: loanForm.guarantor1PanSubmitted,
        guarantor1Cheque1Number: loanForm.guarantor1Cheque1Number,
        guarantor1Cheque2Number: loanForm.guarantor1Cheque2Number,
        guarantor1Cheque1Submitted: loanForm.guarantor1Cheque1Submitted,
        guarantor1Cheque2Submitted: loanForm.guarantor1Cheque2Submitted,
        guarantor1StampPaperSubmitted: loanForm.guarantor1StampPaperSubmitted,
        guarantor1SecurityType: loanForm.guarantor1SecurityType,
        guarantor1SecurityDetails: loanForm.guarantor1SecurityDetails,

        guarantor2Name: loanForm.guarantor2Name,
        guarantor2FatherName: loanForm.guarantor2FatherName,
        guarantor2Gender: loanForm.guarantor2Gender,
        guarantor2Dob: loanForm.guarantor2Dob || null,
        guarantor2Mobile: loanForm.guarantor2Mobile,
        guarantor2AlternateMobile: loanForm.guarantor2AlternateMobile,
        guarantor2Email: loanForm.guarantor2Email,
        guarantor2Address: loanForm.guarantor2Address,
        guarantor2City: loanForm.guarantor2City,
        guarantor2District: loanForm.guarantor2District,
        guarantor2State: loanForm.guarantor2State,
        guarantor2Pincode: loanForm.guarantor2Pincode,
        guarantor2PhotoSubmitted: loanForm.guarantor2PhotoSubmitted,
        guarantor2AadhaarNumber: loanForm.guarantor2AadhaarNumber,
        guarantor2AadhaarSubmitted: loanForm.guarantor2AadhaarSubmitted,
        guarantor2PanNumber: loanForm.guarantor2PanNumber,
        guarantor2PanSubmitted: loanForm.guarantor2PanSubmitted,
        guarantor2Cheque1Number: loanForm.guarantor2Cheque1Number,
        guarantor2Cheque2Number: loanForm.guarantor2Cheque2Number,
        guarantor2Cheque1Submitted: loanForm.guarantor2Cheque1Submitted,
        guarantor2Cheque2Submitted: loanForm.guarantor2Cheque2Submitted,
        guarantor2StampPaperSubmitted: loanForm.guarantor2StampPaperSubmitted,
        guarantor2SecurityType: loanForm.guarantor2SecurityType,
        guarantor2SecurityDetails: loanForm.guarantor2SecurityDetails,

        remarks: loanForm.remarks,
      };

      await axios.post(`${API}/loan-request`, payload);

      alert(
        "Loan request submitted successfully. Waiting for Admin approval."
      );

      closeCreateLoan();

      await loadLoans();
    } catch (error) {
      console.error("Loan request error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to submit loan request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================
  const closeCreateLoan = () => {
    setShowCreateLoan(false);
    setSelectedMember(null);
    setMembers([]);
    setMemberSearch("");
    setLoanForm(emptyLoanForm());
  };
const getTerminationState = (loan) => {
  if (loan.status === "CLOSED") {
    return "CLOSED";
  }

  if (loan.terminationStatus === "PENDING") {
    return "PENDING";
  }

  if (loan.terminationStatus === "REJECTED") {
    return "REJECTED";
  }

  return "NONE";
};


  
  // =========================================================
  // FILTER EXISTING LOANS
  // =========================================================
 const filteredLoans = loans
  .filter((loan) => {
    const targetName =
      loan.member?.memberName ||
      loan.borrowerName ||
      "";

    const memberId =
      loan.member?.memberId ||
      "";

    const mobile =
      loan.member?.mobile ||
      loan.mobile ||
      "";

    const searchText = search.toLowerCase().trim();

    return (
      loan.loanType === loanType &&
      (
        !searchText ||
        targetName.toLowerCase().includes(searchText) ||
        memberId.toLowerCase().includes(searchText) ||
        mobile.includes(searchText)
      )
    );
  })
  .sort((a, b) => {
    // CLOSED LOANS ALWAYS GO TO THE END
    const aClosed = a.status === "CLOSED";
    const bClosed = b.status === "CLOSED";

    if (aClosed && !bClosed) return 1;
    if (!aClosed && bClosed) return -1;

    // Keep original order for loans
    // having the same closed/non-closed status
    return 0;
  });

  const currentLoans = loans.filter(
    (item) => item.loanType === loanType
  );

  const totalDisbursed = currentLoans.reduce(
    (sum, item) =>
      sum + (item.loanAmount || 0),
    0
  );

  const totalDue = currentLoans.reduce(
    (sum, item) =>
      sum + (item.outstandingAmount || 0),
    0
  );

  const pendingAccounts = loans.filter(
    (item) =>
      item.status === "DUE" ||
      item.status === "OVERDUE"
  ).length;

  const closedLoans = loans.filter(
    (loan) => loan.status === "CLOSED"
  ).length;

  const preview = calculatePreview();

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 text-slate-800 space-y-5 sm:space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Loans Ledger
          </h1>

          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Collect EMIs, track active portfolios, and submit new loan requests.
          </p>
        </div>

        {/* CREATE LOAN BUTTON */}
        <button
          type="button"
          onClick={() => setShowCreateLoan(true)}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus size={18} />
          Create Loan
        </button>
      </div>

      {/* =====================================================
          ANALYTICS
      ===================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">

        <DashboardCard
          title="Disbursed"
          value={`₹${totalDisbursed.toLocaleString("en-IN")}`}
          icon={TrendingUp}
          color="blue"
        />

        <DashboardCard
          title="Active Loans"
          value={currentLoans.length}
          icon={Users}
          color="emerald"
        />

        <DashboardCard
          title="Pending Action"
          value={pendingAccounts}
          icon={AlertCircle}
          color="rose"
        />

        <DashboardCard
          title="Outstanding"
          value={`₹${totalDue.toLocaleString("en-IN")}`}
          icon={Coins}
          color="amber"
        />

        <DashboardCard
          title="Closed Loans"
          value={closedLoans}
          icon={CheckCircle2}
          color="indigo"
        />

      </div>

      {/* =====================================================
          TABS + SEARCH
      ===================================================== */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">

        <div className="flex bg-slate-200/60 p-1 rounded-2xl overflow-x-auto no-scrollbar gap-1 w-full lg:w-auto">

          <TabButton
            active={loanType === "DAILY"}
            onClick={() => {
              setLoanType("DAILY");
              sessionStorage.setItem(
                "dailyLoanType",
                "DAILY"
              );
            }}
            label="Daily EMI"
            activeColor="bg-blue-600 text-white shadow-sm"
          />

          <TabButton
            active={loanType === "WEEKLY"}
            onClick={() => {
              setLoanType("WEEKLY");
              sessionStorage.setItem(
                "dailyLoanType",
                "WEEKLY"
              );
            }}
            label="Weekly"
            activeColor="bg-purple-600 text-white shadow-sm"
          />

          <TabButton
            active={loanType === "MONTHLY"}
            onClick={() => {
              setLoanType("MONTHLY");
              sessionStorage.setItem(
                "dailyLoanType",
                "MONTHLY"
              );
            }}
            label="Monthly"
            activeColor="bg-emerald-600 text-white shadow-sm"
          />

          <TabButton
            active={loanType === "FIXED"}
            onClick={() => {
              setLoanType("FIXED");
              sessionStorage.setItem(
                "dailyLoanType",
                "FIXED"
              );
            }}
            label="Fixed"
            activeColor="bg-amber-600 text-white shadow-sm"
          />

        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xs w-full lg:max-w-xs focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">

          <Search
            size={16}
            className="text-slate-400 shrink-0"
          />
<input
  type="text"
  placeholder="Search Member ID, Name, Phone..."
  value={search}
  onChange={handleSearchChange}
  className="w-full bg-transparent outline-none text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400"
/>

        </div>
      </div>

      {/* {/* =====================================================
    MOBILE LOANS
===================================================== */}
<div className="block lg:hidden divide-y divide-slate-100">

  {filteredLoans.map((loan) => {

    const name =
      loan.member?.memberName ||
      loan.borrowerName ||
      "Unknown Member";

    const mobile =
      loan.member?.mobile ||
      loan.mobile ||
      "—";

    const memberId =
      loan.member?.memberId ||
      "—";

    const isPending =
      loan.status === "DUE" ||
      loan.status === "OVERDUE";

    const durationText =
      loan.loanType === "DAILY"
        ? `${loan.durationDays || 0} Days`
        : loan.loanType === "WEEKLY"
        ? `${loan.durationWeeks || 0} Weeks`
        : loan.loanType === "MONTHLY"
        ? `${loan.durationMonths || 0} Months`
        : loan.loanType === "FIXED"
        ? "Interest Only"
        : "—";

    return (
      <div
        key={loan._id}
        className="p-4 space-y-3 bg-white"
      >

        {/* =================================================
            MEMBER HEADER
        ================================================= */}

        <div className="flex justify-between items-start gap-2">

          <div className="min-w-0">

            <span className="text-[10px] font-black text-slate-400 block tracking-wider">
              {memberId}
            </span>

            <h4 className="text-sm font-black text-slate-900 truncate">
              {name}
            </h4>

            <span className="text-[11px] text-slate-500 font-bold block mt-0.5">
              {mobile}
            </span>

          </div>

          <StatusBadge
            status={loan.status}
          />

        </div>

        {/* =================================================
            LOAN INFORMATION
        ================================================= */}

        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">

          {/* LOAN AMOUNT */}

          <div>
            <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">
              Loan Amount
            </span>

            <span className="text-slate-800 font-black text-xs">
              ₹{(loan.loanAmount || 0).toLocaleString("en-IN")}
            </span>
          </div>


          {/* BASE EMI */}

          <div>
            <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">
              Base EMI
            </span>

            <span className="text-blue-600 font-black text-xs">
              ₹{(loan.emiAmount || 0).toLocaleString("en-IN")}
            </span>
          </div>
{/* PAST DUE EMI */}

<div className="pt-1">
  <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">
    Past Due EMI
  </span>

  <span
    className={`font-black text-xs ${
      (loan.pastDueEMIAmount || 0) > 0
        ? "text-rose-600"
        : "text-emerald-600"
    }`}
  >
    ₹{Number(
      loan.pastDueEMIAmount || 0
    ).toLocaleString("en-IN")}
  </span>

  <span className="text-[10px] text-slate-400 font-bold ml-1">
    ({loan.pastDueEMIs || 0} EMI)
  </span>
</div>

          {/* OUTSTANDING */}

          <div className="pt-1">
            <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">
              Outstanding
            </span>

            <span className="text-rose-600 font-black text-xs">
              ₹{(loan.outstandingAmount || 0).toLocaleString("en-IN")}
            </span>
          </div>


          {/* PAID */}

          <div className="pt-1">
            <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">
              Paid
            </span>

            <span className="text-emerald-600 font-black text-xs">
              ₹{(loan.totalPaid || 0).toLocaleString("en-IN")}
            </span>
          </div>

        </div>

        {/* =================================================
            EXTRA LOAN DETAILS
        ================================================= */}

        <div className="flex items-center justify-between px-1">

          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
              Loan Type
            </span>

            <p className="text-[11px] font-extrabold text-slate-700">
              {loan.loanType || "—"}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
              Duration
            </span>

            <p className="text-[11px] font-extrabold text-slate-700">
              {durationText}
            </p>
          </div>

        </div>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

       {/* =================================================
    ACTION BUTTONS
================================================= */}

<div className="grid grid-cols-2 gap-2 pt-1">

{/* COLLECT / VIEW - ACTIVE LOANS ONLY */}

{loan.status !== "CLOSED" &&
  loan.status !== "TERMINATED" &&
  loan.terminationStatus !== "TERMINATED" && (
    <button
      type="button"
      onClick={() =>
        navigate(`/agent/loan/${loan._id}`)
      }
      className="
        inline-flex
        items-center
        justify-center
        gap-1.5
        bg-blue-600
        hover:bg-blue-700
        text-white
        font-bold
        px-3
        py-1.5
        rounded-xl
        text-xs
        transition
        active:scale-95
        shadow-xs
      "
    >
      <FileText size={13} />
      Collect / View
    </button>
  )}

{/* TERMINATION */}

{loan.status !== "CLOSED" &&
 loan.status !== "TERMINATED" &&
 loan.status !== "REJECTED" ? (

  (() => {
    const terminationState = getTerminationState(loan);

    if (terminationState === "PENDING") {
      return (
        <button
          type="button"
          disabled
          className="
            w-full
            bg-amber-50
            text-amber-700
            border
            border-amber-200
            py-2.5
            rounded-xl
            font-black
            text-xs
            uppercase
            tracking-wider
            flex
            items-center
            justify-center
            gap-1
          "
        >
          <AlertCircle size={14} />
          Request Pending
        </button>
      );
    }

    if (terminationState === "REJECTED") {
      return (
        <button
          type="button"
          disabled={submitting}
          onClick={() => requestTermination(loan)}
          className="
            w-full
            bg-red-50
            hover:bg-red-100
            active:bg-red-200
            text-red-700
            border
            border-red-200
            py-2.5
            rounded-xl
            font-black
            text-xs
            uppercase
            tracking-wider
            flex
            items-center
            justify-center
            gap-1
            transition-all
          "
        >
          <X size={14} />
          Request Again
        </button>
      );
    }

    return (
      <button
        type="button"
        disabled={submitting}
        onClick={() => requestTermination(loan)}
        className="
          w-full
          bg-red-50
          hover:bg-red-100
          active:bg-red-200
          text-red-700
          border
          border-red-200
          py-2.5
          rounded-xl
          font-black
          text-xs
          uppercase
          tracking-wider
          flex
          items-center
          justify-center
          gap-1
          transition-all
        "
      >
        <X size={14} />
        Close Request
      </button>
    );
  })()

) : (

  <div
    className="
      w-full
      bg-slate-100
      text-slate-400
      py-2.5
      rounded-xl
      font-black
      text-xs
      uppercase
      tracking-wider
      flex
      items-center
      justify-center
    "
  >
    Closed
  </div>

)}

</div>

      </div>
    );
  })}


  {filteredLoans.length === 0 && (
    <div className="text-center py-12 text-slate-400 font-semibold text-xs">
      No active loan accounts found for this criteria.
    </div>
  )}

</div>

      {/* =====================================================
          DESKTOP TABLE
      ===================================================== */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead>

              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] text-slate-400 font-bold uppercase tracking-wider">

                <th className="py-3.5 px-5">
                  Borrower Info
                </th>

                <th className="py-3.5 px-4 text-right">
                  Principal
                </th>

                <th className="py-3.5 px-4 text-right">
                  EMI Amount
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

                <th className="py-3.5 px-5 text-center">
                  Action
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

                const memberId =
                  loan.member?.memberId ||
                  "—";

                return (
                  <tr
                    key={loan._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >

                    <td className="py-3.5 px-5">

                      <p className="font-bold text-slate-900 text-sm">
                        {calculatedName}
                      </p>

                      <div className="flex items-center gap-2 mt-0.5">

                        <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                          {loan.interestRate}% Interest
                        </span>

                        <span className="text-[11px] text-slate-400">
                          ID: {memberId} • {calculatedMobile}
                        </span>

                      </div>

                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ₹{(loan.loanAmount || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4 text-right">

                      <p className="font-bold text-slate-800">
                        ₹{(loan.emiAmount || 0).toLocaleString("en-IN")}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {loan.loanType === "DAILY"
                          ? `${loan.durationDays} Days`
                          : loan.loanType === "WEEKLY"
                          ? `${(loan.durationDays || 0) / 7} Weeks`
                          : `${loan.durationMonths} Months`}
                      </p>

                    </td>

                    <td className="py-3.5 px-4 text-center">

                      <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-slate-100 text-slate-600 rounded-md px-2 py-0.5">
                        {loan.loanType}
                      </span>

                    </td>

                    <td className="py-3.5 px-4 text-right">

                      <p className="font-black text-slate-900">
                        ₹{(loan.outstandingAmount || 0).toLocaleString("en-IN")}
                      </p>

                      <p className="text-[10px] text-slate-400">
                        Paid: ₹{(loan.totalPaid || 0).toLocaleString("en-IN")}
                      </p>

                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={loan.status} />
                    </td>

                  <td className="py-3.5 px-5 text-center">
  <div className="flex items-center justify-center gap-2">

  
{/* COLLECT / VIEW - ACTIVE LOANS ONLY */}

{loan.status !== "CLOSED" &&
  loan.status !== "TERMINATED" &&
  loan.terminationStatus !== "TERMINATED" && (
    <button
      type="button"
      onClick={() =>
        navigate(`/agent/loan/${loan._id}`)
      }
      className="
        w-full
        bg-blue-600
        hover:bg-blue-700
        active:bg-blue-800
        text-white
        py-2.5
        rounded-xl
        font-black
        text-xs
        uppercase
        tracking-wider
        shadow-xs
        flex
        items-center
        justify-center
        gap-1
        transition-all
      "
    >
      Collect / View

      <ChevronRight size={14} />
    </button>
  )}


   {/* TERMINATION REQUEST */}

{loan.status !== "CLOSED" &&
  loan.status !== "REJECTED" && (

  (() => {
    const terminationState = getTerminationState(loan);

    if (terminationState === "PENDING") {
      return (
        <span
          className="
            inline-flex
            items-center
            justify-center
            gap-1.5
            bg-amber-50
            text-amber-700
            border
            border-amber-200
            font-bold
            px-3
            py-1.5
            rounded-xl
            text-xs
          "
        >
          <AlertCircle size={13} />
          Request Pending
        </span>
      );
    }

    if (terminationState === "REJECTED") {
      return (
        <button
          type="button"
          disabled={submitting}
          onClick={() => requestTermination(loan)}
          className="
            inline-flex
            items-center
            justify-center
            gap-1.5
            bg-red-50
            hover:bg-red-100
            text-red-700
            border
            border-red-200
            font-bold
            px-3
            py-1.5
            rounded-xl
            text-xs
            transition
            active:scale-95
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          <X size={13} />
          Request Again
        </button>
      );
    }

    return (
      <button
        type="button"
        disabled={submitting}
        onClick={() => requestTermination(loan)}
        className="
          inline-flex
          items-center
          justify-center
          gap-1.5
          bg-red-50
          hover:bg-red-100
          text-red-700
          border
          border-red-200
          font-bold
          px-3
          py-1.5
          rounded-xl
          text-xs
          transition
          active:scale-95
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >
        <X size={13} />
        Close Request
      </button>
    );
  })()

)}

  </div>
</td>

                  </tr>
                );
              })}

              {filteredLoans.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-slate-400 text-xs font-medium italic"
                  >
                    No matching credit positions or active underwritten loans found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* =====================================================
          CREATE LOAN REQUEST MODAL
      ===================================================== */}
      {showCreateLoan && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-5 overflow-y-auto">

          <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-2 sm:my-5">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Coins size={20} />
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    Create Loan
                  </h2>

                  <p className="text-xs text-slate-500">
                    Submit loan request for Admin approval
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={closeCreateLoan}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X size={18} />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={submitLoanRequest}
              className="p-5 sm:p-7 space-y-6"
            >
              {/* MEMBER */}
              <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <SectionTitle title="Member Details" />
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => searchMembers(e.target.value)}
                    placeholder="Search registered Member ID, Name or Mobile..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                  {memberLoading && (
                    <span className="absolute right-3 top-3 text-xs text-slate-400">Searching...</span>
                  )}
                  {members.length > 0 && (
                    <div className="mt-2 bg-white border rounded-xl shadow-lg max-h-52 overflow-y-auto">
                      {members.map((member) => (
                        <button
                          key={member._id}
                          type="button"
                          onClick={() => handleSelectMember(member)}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-0"
                        >
                      <p className="font-bold text-sm">
  {member.memberName}
</p>

<p className="text-xs text-slate-500">
  {member.memberId} • {member.mobile}
</p>

<p className="text-[11px] text-blue-600 font-semibold mt-1">
  Area: {member.areaGroup?.areaName || "Not Assigned"}
  {" • "}
  Agent: {member.assignedAgent?.name || "Not Assigned"}
</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedMember && (
                  <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 grid sm:grid-cols-4 gap-3">
  <MiniField
    label="Member Name"
    value={selectedMember.memberName}
  />

  <MiniField
    label="Member ID"
    value={selectedMember.memberId}
  />

  <MiniField
    label="Father Name"
    value={selectedMember.fatherName}
  />

  <MiniField
    label="Mobile"
    value={selectedMember.mobile}
  />

  <MiniField
    label="Gender"
    value={selectedMember.gender}
  />

  <MiniField
    label="DOB"
    value={formatDate(selectedMember.dob)}
  />

  <MiniField
    label="Area"
    value={selectedMember.areaGroup?.areaName}
  />

  <MiniField
    label="Assigned Agent"
    value={selectedMember.assignedAgent?.name}
  />
</div>
                )}
              </section>

              {/* LOAN DETAILS */}
              <section>
                <SectionTitle title="Loan Details" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {["DAILY", "WEEKLY", "MONTHLY", "FIXED"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleLoanTypeChange(type)}
                      className={`py-3 rounded-xl text-xs font-black border ${
                        loanForm.loanType === type
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <FormInput label="Loan Amount" name="loanAmount" type="number" value={loanForm.loanAmount} onChange={handleFormChange} required />
                  <FormInput label="Interest Rate (%)" name="interestRate" type="number" value={loanForm.interestRate} onChange={handleFormChange} required />
                  {loanForm.loanType === "DAILY" && (
                    <FormInput label="Duration (Days)" name="durationDays" type="number" value={loanForm.durationDays} onChange={handleFormChange} required />
                  )}
                  {loanForm.loanType === "WEEKLY" && (
                    <FormInput label="Duration (Weeks)" name="durationWeeks" type="number" value={loanForm.durationWeeks} onChange={handleFormChange} required />
                  )}
                  {loanForm.loanType === "MONTHLY" && (
                    <FormInput label="Duration (Months)" name="durationMonths" type="number" value={loanForm.durationMonths} onChange={handleFormChange} required />
                  )}
                  {loanForm.loanType === "FIXED" && (
                    <FormInput label="Loan Tenure (Months)" name="loanTenureMonths" type="number" value={loanForm.loanTenureMonths} onChange={handleFormChange} required />
                  )}
                  <FormInput label="Loan Date" name="loanDate" type="date" value={loanForm.loanDate} onChange={handleFormChange} required />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <PreviewBox label="Installments" value={preview.installments} />
                  <PreviewBox label="Interest" value={`₹${preview.totalInterest.toLocaleString("en-IN")}`} />
                  <PreviewBox label="Total Payable" value={`₹${preview.totalPayable.toLocaleString("en-IN")}`} />
                  <PreviewBox label="EMI" value={`₹${preview.emi.toLocaleString("en-IN")}`} />
                </div>
              </section>

              {/* NOMINEE + PENALTY */}
              <section className="border rounded-2xl p-4">
                <SectionTitle title="Nominee & Penalty Settings" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormInput label="Nominee Name" name="nomineeName" value={loanForm.nomineeName} onChange={handleFormChange} />
                  <FormInput label="Nominee Mobile" name="nomineeMobile" type="tel" value={loanForm.nomineeMobile} onChange={handleFormChange} />
                  <FormInput label="Grace Period (Days)" name="gracePeriod" type="number" value={loanForm.gracePeriod} onChange={handleFormChange} />
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Penalty Type</label>
                    <select name="penaltyType" value={loanForm.penaltyType} onChange={handleFormChange} className="w-full border rounded-xl px-3 py-3 text-sm bg-white">
                      <option value="FIXED">Fixed</option>
                      <option value="PERCENTAGE">Percentage</option>
                    </select>
                  </div>
                  <FormInput label="Penalty Value" name="penaltyValue" type="number" value={loanForm.penaltyValue} onChange={handleFormChange} />
                </div>
              </section>

              {/* CUSTOMER DOCUMENTS */}
              <section className="border rounded-2xl p-4">
                <SectionTitle title="Customer Documents" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormInput label="Aadhaar Number" name="aadhaarNumber" value={loanForm.aadhaarNumber} onChange={handleFormChange} />
                  <FormInput label="PAN Number" name="panNumber" value={loanForm.panNumber} onChange={handleFormChange} />
                  <FormInput label="Cheque Number 1" name="cheque1Number" value={loanForm.cheque1Number} onChange={handleFormChange} />
                  <FormInput label="Cheque Number 2" name="cheque2Number" value={loanForm.cheque2Number} onChange={handleFormChange} />
                </div>
                <CheckboxGrid
                  items={[
                    ["passportPhotoSubmitted", "2 Passport Photos Received"],
                    ["aadhaarSubmitted", "Aadhaar Copy Received"],
                    ["panSubmitted", "PAN Copy Received"],
                    ["cheque1Submitted", "Blank Signed Cheque 1"],
                    ["cheque2Submitted", "Blank Signed Cheque 2"],
                    ["stampPaperSubmitted", "Stamp Paper Received"],
                  ]}
                  form={loanForm}
                  setForm={setLoanForm}
                />
              </section>

              {/* SECURITY */}
              <section className="border rounded-2xl p-4">
                <SectionTitle title="Security Details" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Loan Security</label>
                    <select name="securityType" value={loanForm.securityType} onChange={handleFormChange} className="w-full border rounded-xl px-3 py-3 text-sm bg-white">
                      <option value="UNSECURED">Unsecured Loan</option>
                      <option value="SECURED">Secured Loan</option>
                    </select>
                  </div>
                  {loanForm.securityType === "SECURED" && (
                    <FormInput label="Security Given" name="securityDetails" value={loanForm.securityDetails} onChange={handleFormChange} placeholder="Gold / Property / Vehicle" />
                  )}
                </div>
              </section>

              {/* GUARANTOR 1 */}
              <GuarantorSection
                number="1"
                prefix="guarantor1"
                form={loanForm}
                setForm={setLoanForm}
                handleFormChange={handleFormChange}
              />

              {/* GUARANTOR 2 */}
              <GuarantorSection
                number="2"
                prefix="guarantor2"
                form={loanForm}
                setForm={setLoanForm}
                handleFormChange={handleFormChange}
              />

              {/* REMARKS */}
              <section>
                <SectionTitle title="Remarks" />
                <textarea
                  name="remarks"
                  value={loanForm.remarks}
                  onChange={handleFormChange}
                  rows={4}
                  placeholder="Additional remarks..."
                  className="w-full border rounded-xl px-3 py-3 text-sm outline-none focus:border-blue-500 resize-none"
                />
              </section>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                <strong>Important:</strong> This form sends a complete loan request to Admin.
                No actual loan account is created until Admin approves it.
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                <button type="button" onClick={closeCreateLoan} className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black text-sm">
                  {submitting ? "Sending..." : <><Send size={17} /> Send Complete Loan Request</>}
                </button>
              </div>
            </form>

          </div>

        </div>
      )}

    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
      {title}
    </h3>
  );
}

function MiniField({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase font-bold text-slate-400">{label}</p>
      <p className="text-xs font-bold text-slate-800 mt-0.5">{value || "—"}</p>
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

function CheckboxGrid({ items, form, setForm }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
      {items.map(([name, label]) => (
        <label key={name} className="flex items-center gap-3 text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(form[name])}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, [name]: e.target.checked }))
            }
          />
          {label}
        </label>
      ))}
    </div>
  );
}

function GuarantorSection({ number, prefix, form, setForm, handleFormChange }) {
  const field = (suffix) => `${prefix}${suffix}`;

  const checks = [
    [field("PhotoSubmitted"), "Passport Photo Received"],
    [field("AadhaarSubmitted"), "Aadhaar Copy Received"],
    [field("PanSubmitted"), "PAN Copy Received"],
    [field("Cheque1Submitted"), "Cheque 1 Received"],
    [field("Cheque2Submitted"), "Cheque 2 Received"],
    [field("StampPaperSubmitted"), "Stamp Paper Received"],
  ];

  return (
    <section className="border rounded-2xl p-4">
      <SectionTitle title={`Guarantor ${number} (Optional)`} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormInput label="Name" name={field("Name")} value={form[field("Name")]} onChange={handleFormChange} />
        <FormInput label="Father / Husband Name" name={field("FatherName")} value={form[field("FatherName")]} onChange={handleFormChange} />
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Gender</label>
          <select name={field("Gender")} value={form[field("Gender")]} onChange={handleFormChange} className="w-full border rounded-xl px-3 py-3 text-sm bg-white">
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <FormInput label="Date of Birth" name={field("Dob")} type="date" value={form[field("Dob")]} onChange={handleFormChange} />
        <FormInput label="Mobile" name={field("Mobile")} type="tel" value={form[field("Mobile")]} onChange={handleFormChange} />
        <FormInput label="Alternate Mobile" name={field("AlternateMobile")} type="tel" value={form[field("AlternateMobile")]} onChange={handleFormChange} />
        <FormInput label="Email" name={field("Email")} type="email" value={form[field("Email")]} onChange={handleFormChange} />
        <FormInput label="Address" name={field("Address")} value={form[field("Address")]} onChange={handleFormChange} />
        <FormInput label="City / Village" name={field("City")} value={form[field("City")]} onChange={handleFormChange} />
        <FormInput label="District" name={field("District")} value={form[field("District")]} onChange={handleFormChange} />
        <FormInput label="State" name={field("State")} value={form[field("State")]} onChange={handleFormChange} />
        <FormInput label="Pincode" name={field("Pincode")} value={form[field("Pincode")]} onChange={handleFormChange} />
        <FormInput label="Aadhaar Number" name={field("AadhaarNumber")} value={form[field("AadhaarNumber")]} onChange={handleFormChange} />
        <FormInput label="PAN Number" name={field("PanNumber")} value={form[field("PanNumber")]} onChange={handleFormChange} />
        <FormInput label="Cheque Number 1" name={field("Cheque1Number")} value={form[field("Cheque1Number")]} onChange={handleFormChange} />
        <FormInput label="Cheque Number 2" name={field("Cheque2Number")} value={form[field("Cheque2Number")]} onChange={handleFormChange} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Guarantor Security</label>
          <select name={field("SecurityType")} value={form[field("SecurityType")]} onChange={handleFormChange} className="w-full border rounded-xl px-3 py-3 text-sm bg-white">
            <option value="UNSECURED">Unsecured</option>
            <option value="SECURED">Secured</option>
          </select>
        </div>
        {form[field("SecurityType")] === "SECURED" && (
          <FormInput label="Security Details" name={field("SecurityDetails")} value={form[field("SecurityDetails")]} onChange={handleFormChange} />
        )}
      </div>

      <CheckboxGrid
        items={checks}
        form={form}
        setForm={setForm}
      />
    </section>
  );
}

/* =========================================================
   FORM INPUT
========================================================= */
function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>

      <label className="block text-xs font-bold text-slate-600 mb-1.5">
        {label}
        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={
          type === "number"
            ? "0"
            : undefined
        }
        className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
      />

    </div>
  );
}

/* =========================================================
   PREVIEW BOX
========================================================= */
function PreviewBox({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-blue-100">

      <p className="text-[10px] font-bold uppercase text-slate-400">
        {label}
      </p>

      <p className="font-black text-slate-900 mt-1 text-sm">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   ANALYTICS CARD
========================================================= */
function DashboardCard({
  title,
  value,
  icon: Icon,
  color,
}) {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-100",
    emerald:
      "bg-emerald-500/10 text-emerald-600 border-emerald-100",
    rose:
      "bg-rose-500/10 text-rose-600 border-rose-100",
    amber:
      "bg-amber-500/10 text-amber-600 border-amber-100",
    indigo:
      "bg-indigo-500/10 text-indigo-600 border-indigo-100",
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center justify-between">

      <div className="space-y-1">

        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </p>

        <h2 className="text-lg sm:text-xl font-black text-slate-900">
          {value}
        </h2>

      </div>

      <div
        className={`p-2 sm:p-2.5 rounded-xl ${colorMap[color]}`}
      >
        <Icon size={18} />
      </div>

    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */
function StatusBadge({ status }) {
  const badgeStyles = {
    ACTIVE:
      "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    DUE:
      "bg-amber-50 text-amber-700 border-amber-200/80",
    OVERDUE:
      "bg-rose-50 text-rose-700 border-rose-200/80",
    CLOSED:
      "bg-blue-50 text-blue-700 border-blue-200/80",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
        badgeStyles[status] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   TAB BUTTON
========================================================= */
function TabButton({
  active,
  onClick,
  label,
  activeColor,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
        active
          ? activeColor
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
      }`}
    >
      {label}
    </button>
  );
}

export default LoansDashboard;