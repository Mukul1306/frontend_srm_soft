import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Landmark,
  ArrowLeft,
  CreditCard,
  Clock,
  BadgeIndianRupee,
  AlertTriangle,
  Percent,
  Wallet,
  Phone,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Zap,
  Receipt,
  RefreshCw,
} from "lucide-react";

const API = "https://finance-project-0qqk.onrender.com/api/daily";

function LoanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================================================
  // LOAN DATA
  // =========================================================
  const [loanData, setLoanData] = useState(null);
  const [pendingInstallments, setPendingInstallments] = useState([]);

const [selectedInstallment, setSelectedInstallment] = useState(null);
const [paymentMethod, setPaymentMethod] = useState("CASH");

// =========================================================
// FIXED LOAN COLLECTION
// =========================================================
const [fixedPaymentMode, setFixedPaymentMode] = useState("INTEREST_ONLY");
const [fixedPrincipalAmount, setFixedPrincipalAmount] = useState("");
const [fixedCollecting, setFixedCollecting] = useState(false);

// =========================================================
// ADVANCE EMI
// =========================================================
const [collectionMode, setCollectionMode] = useState("NORMAL");
const [advanceCount, setAdvanceCount] = useState(1);
const [advancePreview, setAdvancePreview] = useState([]);
const [advanceLoading, setAdvanceLoading] = useState(false);
const [advanceCollecting, setAdvanceCollecting] = useState(false);

  // =========================================================
  // GENERAL
  // =========================================================
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);

  const loan = loanData?.loan;

  const agent = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("agent") || "{}");
    } catch {
      return {};
    }
  }, []);

  const agentId = agent?._id || agent?.id || null;

  // =========================================================
  // LOAD LOAN
  // =========================================================
  useEffect(() => {
    loadLoan();
  }, [id]);

  // =========================================================
  // LOAD PENDING INSTALLMENTS
  // =========================================================
  useEffect(() => {
    if (loan?._id) {
      loadPendingInstallments();
    }
  }, [loan?._id]);

  // =========================================================
  // LOAD LOAN DETAILS
  // =========================================================
  const loadLoan = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/loan-details/${id}`);

      setLoanData(res.data);
    } catch (error) {
      console.error("Error loading loan:", error);

      alert(
        error.response?.data?.message ||
          "Unable to load loan details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD PENDING INSTALLMENTS
  // =========================================================
  const loadPendingInstallments = async () => {
    if (!loan?._id) return;

    try {
      const res = await axios.get(
        `${API}/pending-installments/${loan._id}`
      );

      const installments = Array.isArray(res.data?.installments)
        ? res.data.installments
        : [];

      setPendingInstallments(installments);

      // Keep currently selected installment if it still exists.
      setSelectedInstallment((previous) => {
        if (!installments.length) {
          return null;
        }

        if (previous) {
          const stillPending = installments.find(
            (item) =>
              Number(item.installmentNo) ===
              Number(previous.installmentNo)
          );

          if (stillPending) {
            return stillPending;
          }
        }

        return installments[0];
      });
    } catch (error) {
      console.error("Error loading pending installments:", error);

      setPendingInstallments([]);
      setSelectedInstallment(null);
    }
  };

  // =========================================================
  // GET AGENT ID
  // =========================================================
  const getAgentId = () => {
    try {
      const storedAgent = JSON.parse(
        localStorage.getItem("agent") || "{}"
      );

      return storedAgent?._id || storedAgent?.id || null;
    } catch {
      return null;
    }
  };

  // =========================================================
  // NORMAL EMI COLLECTION
  // =========================================================
  const collectNormalEmi = async () => {
    if (!loan?._id) {
      alert("Loan information is missing.");
      return;
    }

    if (!selectedInstallment) {
      alert("Please select an installment.");
      return;
    }

    const currentAgentId = getAgentId();

    if (!currentAgentId) {
      alert("Agent information not found. Please login again.");
      return;
    }

    const installmentNo = Number(
      selectedInstallment.installmentNo
    );

    if (!installmentNo) {
      alert("Invalid installment number.");
      return;
    }

    try {
      setCollecting(true);

      const res = await axios.post(`${API}/collect-emi`, {
        loanId: loan._id,
        installmentNo,
        collectorType: "AGENT",
        collectorId: currentAgentId,
        paymentMethod,
      });

      alert(
        res.data?.message ||
          `EMI #${installmentNo} collected successfully.`
      );

      // Refresh loan and pending installment information.
      await loadLoan();

      // Explicitly reload after loan refresh.
      await loadPendingInstallments();
    } catch (error) {
      console.error("Normal EMI collection error:", error);

      alert(
        error.response?.data?.message ||
          "EMI collection failed. Please try again."
      );
    } finally {
      setCollecting(false);
    }
  };

  // =========================================================
// FIXED LOAN - INTEREST + PRINCIPAL COLLECTION
// =========================================================
const collectFixedPayment = async () => {
  if (!loan?._id) {
    alert("Loan information is missing.");
    return;
  }

  if (loan.loanType !== "FIXED") {
    alert("This collection is only available for FIXED loans.");
    return;
  }

  const currentAgentId = getAgentId();

  if (!currentAgentId) {
    alert("Agent information not found. Please login again.");
    return;
  }

  const currentPrincipal = Number(
    loan.outstandingAmount ??
      loan.loanAmount ??
      0
  );

  const interestRate = Number(loan.interestRate || 0);

  const currentInterest =
    (currentPrincipal * interestRate) / 100;

  let principalAmount = 0;

  if (fixedPaymentMode === "INTEREST_PRINCIPAL") {
    principalAmount = Number(fixedPrincipalAmount);

    if (
      !Number.isFinite(principalAmount) ||
      principalAmount <= 0
    ) {
      alert("Please enter a valid principal amount.");
      return;
    }

    if (principalAmount > currentPrincipal) {
      alert(
        `Principal payment cannot be more than current principal ₹${formatCurrency(
          currentPrincipal
        )}.`
      );
      return;
    }
  }

  const totalAmount = currentInterest + principalAmount;

  const confirmed = window.confirm(
    `Confirm FIXED Loan Collection?\n\n` +
      `Current Principal: ₹${formatCurrency(currentPrincipal)}\n` +
      `Interest: ₹${formatCurrency(currentInterest)}\n` +
      `Principal Payment: ₹${formatCurrency(principalAmount)}\n` +
      `Total Collection: ₹${formatCurrency(totalAmount)}\n` +
      `Payment Method: ${paymentMethod}`
  );

  if (!confirmed) {
    return;
  }

  try {
    setFixedCollecting(true);

    const res = await axios.post(
      `${API}/collect-fixed-interest-principal`,
      {
        loanId: loan._id,
        collectorType: "AGENT",
        collectorId: currentAgentId,
        paymentMethod,
        principalAmount,
      }
    );

    alert(
      res.data?.message ||
        "FIXED loan payment collected successfully."
    );

    setFixedPrincipalAmount("");

    await loadLoan();
    await loadPendingInstallments();
  } catch (error) {
    console.error(
      "FIXED loan collection error:",
      error
    );

    alert(
      error.response?.data?.message ||
        "FIXED loan collection failed. Please try again."
    );
  } finally {
    setFixedCollecting(false);
  }
};
  // =========================================================
  // CHANGE COLLECTION MODE
  // =========================================================
  const handleModeChange = async (mode) => {
    setCollectionMode(mode);

    if (mode === "NORMAL") {
      setAdvancePreview([]);
      setAdvanceCount(1);

      await loadPendingInstallments();
      return;
    }

    // Advance mode
    setAdvancePreview([]);

    // Load first preview automatically.
    await loadAdvancePreview(1);
  };

  // =========================================================
  // ADVANCE EMI PREVIEW
  // =========================================================
  const loadAdvancePreview = async (count = advanceCount) => {
    if (!loan?._id) {
      return;
    }

    const numericCount = Number(count);

    if (
      !Number.isInteger(numericCount) ||
      numericCount < 1 ||
      numericCount > 50
    ) {
      setAdvancePreview([]);
      return;
    }

    try {
      setAdvanceLoading(true);

      const res = await axios.get(
        `${API}/loan/${loan._id}/advance-preview`,
        {
          params: {
            count: numericCount,
          },
        }
      );

      /*
       * Support different possible backend response structures.
       *
       * Expected:
       * {
       *   installments: [...]
       * }
       *
       * Also supports:
       * {
       *   preview: [...]
       * }
       */
      const preview =
        res.data?.installments ||
        res.data?.preview ||
        res.data?.data?.installments ||
        res.data?.data ||
        [];

      setAdvancePreview(Array.isArray(preview) ? preview : []);
    } catch (error) {
      console.error("Advance preview error:", error);

      setAdvancePreview([]);

      alert(
        error.response?.data?.message ||
          "Unable to generate advance EMI preview."
      );
    } finally {
      setAdvanceLoading(false);
    }
  };

  // =========================================================
  // ADVANCE COUNT CHANGE
  // =========================================================
  const handleAdvanceCountChange = async (value) => {
    const count = Number(value);

    setAdvanceCount(count);

    if (
      !Number.isInteger(count) ||
      count < 1 ||
      count > 50
    ) {
      setAdvancePreview([]);
      return;
    }

    await loadAdvancePreview(count);
  };

  // =========================================================
  // ADVANCE EMI COLLECTION
  // =========================================================
  const collectAdvanceEmi = async () => {
    if (!loan?._id) {
      alert("Loan information is missing.");
      return;
    }

    const currentAgentId = getAgentId();

    if (!currentAgentId) {
      alert("Agent information not found. Please login again.");
      return;
    }

    const count = Number(advanceCount);

    if (!Number.isInteger(count) || count < 1) {
      alert("Please enter a valid Advance EMI count.");
      return;
    }

    if (count > 50) {
      alert("Maximum 50 Advance EMIs can be collected at once.");
      return;
    }

    if (!advancePreview.length) {
      alert("Please generate the Advance EMI preview first.");
      return;
    }

    if (advancePreview.length !== count) {
      alert(
        `Preview contains ${advancePreview.length} installment(s), but ${count} were requested. Please refresh the preview.`
      );
      return;
    }

    const total = advancePreview.reduce((sum, item) => {
      const amount =
        Number(item?.totalAmount) ||
        Number(item?.emiAmount) ||
        0;

      return sum + amount;
    }, 0);

    const confirmed = window.confirm(
      `Collect ${advancePreview.length} Advance EMI(s)?\n\n` +
        `Total Amount: ₹${total.toLocaleString("en-IN")}\n` +
        `Payment Method: ${paymentMethod}`
    );

    if (!confirmed) {
      return;
    }

    try {
      setAdvanceCollecting(true);

      const res = await axios.post(
        `${API}/collect-advance-loan`,
        {
          loanId: loan._id,
          advanceCount: count,
          collectorType: "AGENT",
          collectorId: currentAgentId,
          paymentMethod,
        }
      );

      alert(
        res.data?.message ||
          `${count} Advance EMI(s) collected successfully.`
      );

      // Refresh all loan information.
      await loadLoan();
      await loadPendingInstallments();

      // Clear advance preview.
      setAdvancePreview([]);

      // Keep Agent on Advance mode.
      setCollectionMode("ADVANCE");
      setAdvanceCount(1);
    } catch (error) {
      console.error("Advance EMI collection error:", error);

      alert(
        error.response?.data?.message ||
          "Advance EMI collection failed. Please try again."
      );
    } finally {
      setAdvanceCollecting(false);
    }
  };


  const collectFixedPendingEmi = async () => {
  if (!loan?._id) {
    alert("Loan information is missing.");
    return;
  }

  if (!selectedInstallment) {
    alert("Please select a pending installment.");
    return;
  }

  const currentAgentId = getAgentId();

  if (!currentAgentId) {
    alert("Agent information not found. Please login again.");
    return;
  }

  const installmentNo = Number(selectedInstallment.installmentNo);

  if (!Number.isInteger(installmentNo) || installmentNo < 1) {
    alert("Invalid installment number.");
    return;
  }

  const confirmed = window.confirm(
    `Confirm FIXED EMI Collection?\n\n` +
    `Installment: #${installmentNo}\n` +
    `Due Date: ${formatDate(selectedInstallment.dueDate)}\n` +
    `Interest: ₹${formatCurrency(selectedInstallment.emiAmount)}\n` +
    `Penalty: ₹${formatCurrency(selectedInstallment.penalty)}\n` +
    `Total: ₹${formatCurrency(selectedInstallment.totalAmount)}\n` +
    `Payment Method: ${paymentMethod}`
  );

  if (!confirmed) return;

  try {
    setCollecting(true);

    const res = await axios.post(
      `${API}/collect-fixed-interest-principal`,
      {
        loanId: loan._id,
        installmentNo,
        collectorType: "AGENT",
        collectorId: currentAgentId,
        paymentMethod,
        principalAmount: 0,
      }
    );

    alert(
      res.data?.message ||
        `FIXED EMI #${installmentNo} collected successfully.`
    );

    setSelectedInstallment(null);

    await loadLoan();
    await loadPendingInstallments();
  } catch (error) {
    console.error("FIXED pending EMI collection error:", error);

    alert(
      error.response?.data?.message ||
        "FIXED EMI collection failed. Please try again."
    );
  } finally {
    setCollecting(false);
  }
};

  // =========================================================
  // REFRESH
  // =========================================================
  const refreshData = async () => {
    try {
      setLoading(true);

      await loadLoan();

      if (loan?._id) {
        await loadPendingInstallments();
      }

      if (collectionMode === "ADVANCE" && advanceCount > 0) {
        await loadAdvancePreview(advanceCount);
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORMATTING
  // =========================================================
  const formatCurrency = (value) => {
    const amount = Number(value) || 0;

    return amount.toLocaleString("en-IN");
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("en-IN");
  };

  // =========================================================
  // ADVANCE TOTAL
  // =========================================================
  const advanceTotal = useMemo(() => {
    return advancePreview.reduce((sum, item) => {
      /*
       * IMPORTANT:
       * Advance EMI should not include future penalty.
       *
       * Therefore:
       * total = EMI amount
       *
       * We intentionally do NOT add:
       * item.penalty
       */
      const emi =
        Number(item?.emiAmount) ||
        Number(item?.amount) ||
        Number(loan?.emiAmount) ||
        0;

      return sum + emi;
    }, 0);
  }, [advancePreview, loan?.emiAmount]);

  // =========================================================
  // LOADING SCREEN
  // =========================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex flex-col items-center justify-center gap-3">
        <div className="w-11 h-11 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />

        <div className="text-slate-600 font-semibold">
          Loading Loan Details...
        </div>
      </div>
    );
  }

  // =========================================================
  // LOAN NOT FOUND
  // =========================================================
  if (!loan) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <AlertTriangle size={32} />
        </div>

        <h2 className="text-xl font-bold text-slate-800">
          Loan Record Not Found
        </h2>

        <p className="text-slate-500 mt-1 max-w-sm">
          The requested loan ID details do not exist or may have
          been deleted.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    );
  }

  // =========================================================
  // AGENT PAGE
  // =========================================================
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800 p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto space-y-5">

        {/* =====================================================
            TOP NAVIGATION
        ====================================================== */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft size={17} />
            Return to Member List
          </button>

          <button
            onClick={refreshData}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* =====================================================
            MAIN CARD
        ====================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {/* ===================================================
              HEADER
          ==================================================== */}
          <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Receipt size={20} />
                  </div>

                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Loan Collection
                    </h1>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Agent collection panel
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`inline-flex self-start md:self-auto items-center gap-2 px-3 py-2 rounded-full text-xs font-bold border ${
                  loan.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    loan.status === "ACTIVE"
                      ? "bg-emerald-500"
                      : "bg-rose-500"
                  }`}
                />

                {loan.status || "UNKNOWN"}
              </div>
            </div>
          </div>

          {/* ===================================================
              MEMBER DETAILS
          ==================================================== */}
          <div className="p-6 md:p-8">

            <div className="bg-[#f8fafc] rounded-2xl border border-slate-100 p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* MEMBER NAME */}
              <InfoItem
                icon={<User size={18} />}
                label="Member Name"
                value={loan.borrowerName}
              />

              {/* MOBILE */}
              <InfoItem
                icon={<Phone size={18} />}
                label="Mobile Number"
                value={loan.mobile}
              />

              {/* AREA */}
              <InfoItem
                icon={<MapPin size={18} />}
                label="Operational Area"
                value={loan.areaName}
              />

              {/* AGENT */}
              <InfoItem
                icon={<Wallet size={18} />}
                label="Assigned Agent"
                value={agent?.name || "Agent"}
              />
            </div>

            {/* =================================================
                LOAN SUMMARY
            ================================================== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">

              <SummaryCard
                label="Loan Amount"
                value={`₹${formatCurrency(loan.loanAmount)}`}
                icon={<BadgeIndianRupee size={17} />}
              />

            <SummaryCard
  label={loan.loanType === "FIXED" ? "Current Interest" : "EMI Amount"}
  value={`₹${formatCurrency(
    loan.loanType === "FIXED"
      ? (
          (Number(
            loan.outstandingAmount ??
              loan.loanAmount ??
              0
          ) *
            Number(loan.interestRate || 0)) /
          100
        )
      : loan.emiAmount
  )}`}
  icon={<CreditCard size={17} />}
/>
              <SummaryCard
                label="Total Paid"
                value={`₹${formatCurrency(loan.totalPaid)}`}
                icon={<Wallet size={17} />}
              />

              <SummaryCard
                label="Outstanding"
                value={`₹${formatCurrency(
                  loan.outstandingAmount
                )}`}
                icon={<AlertTriangle size={17} />}
              />
            </div>

            {/* =================================================
                COLLECTION SECTION
            ================================================== */}
            <div className="mt-7">

              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 mb-4">
                <Calendar size={17} className="text-blue-600" />
                Collection
              </div>

         {/* =================================================
    COLLECTION MODE
================================================== */}
{loan.loanType !== "FIXED" ? (
  <div className="bg-slate-100 rounded-2xl p-1.5 flex gap-1 mb-5">

    <button
      type="button"
      onClick={() => handleModeChange("NORMAL")}
      className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition ${
        collectionMode === "NORMAL"
          ? "bg-white text-blue-700 shadow-sm"
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      <span className="inline-flex items-center justify-center gap-2">
        <CreditCard size={17} />
        Normal EMI
      </span>
    </button>

    <button
      type="button"
      onClick={() => handleModeChange("ADVANCE")}
      className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition ${
        collectionMode === "ADVANCE"
          ? "bg-white text-amber-700 shadow-sm"
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      <span className="inline-flex items-center justify-center gap-2">
        <Zap size={17} />
        Advance EMI
      </span>
    </button>

  </div>
) : null}


{/* =================================================
    FIXED LOAN COLLECTION MODE
================================================== */}
{loan.loanType === "FIXED" && (
  <div className="space-y-5">

    {/* FIXED INFO */}
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
      <div className="flex items-start gap-3">

        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
          <Percent size={18} />
        </div>

        <div>
          <p className="font-extrabold text-blue-900 text-sm">
            FIXED Loan Collection
          </p>

          <p className="text-xs text-blue-700 mt-1 leading-5">
            Monthly interest is calculated on the current
            outstanding principal. Paying principal will
            reduce the next month's interest.
          </p>
        </div>

      </div>
    </div>

    {/* CURRENT LOAN CALCULATION */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

      <MetricCard
        label="Current Principal"
        value={`₹${formatCurrency(
          loan.outstandingAmount ??
            loan.loanAmount ??
            0
        )}`}
        type="blue"
      />

      <MetricCard
        label="Interest Rate"
        value={`${Number(
          loan.interestRate || 0
        )}%`}
        type="red"
      />

      <MetricCard
        label="Current Monthly Interest"
        value={`₹${formatCurrency(
          (
            Number(
              loan.outstandingAmount ??
                loan.loanAmount ??
                0
            ) *
              Number(loan.interestRate || 0)
          ) / 100
        )}`}
        type="green"
      />

    </div>

    {/* PAYMENT TYPE */}
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
        Payment Type
      </label>

      <div className="grid grid-cols-2 gap-2">

        <button
          type="button"
          onClick={() => {
            setFixedPaymentMode("INTEREST_ONLY");
            setFixedPrincipalAmount("");
          }}
          className={`py-3 px-4 rounded-xl text-sm font-bold border transition ${
            fixedPaymentMode === "INTEREST_ONLY"
              ? "bg-blue-50 text-blue-700 border-blue-300"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Interest Only
        </button>

        <button
          type="button"
          onClick={() =>
            setFixedPaymentMode(
              "INTEREST_PRINCIPAL"
            )
          }
          className={`py-3 px-4 rounded-xl text-sm font-bold border transition ${
            fixedPaymentMode ===
            "INTEREST_PRINCIPAL"
              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Interest + Principal
        </button>

      </div>
    </div>

    {/* PRINCIPAL INPUT */}
    {fixedPaymentMode ===
      "INTEREST_PRINCIPAL" && (
      <div>

        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Principal Payment
        </label>

        <div className="relative">

          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
            ₹
          </span>

          <input
            type="number"
            min="0"
            max={
              loan.outstandingAmount ??
              loan.loanAmount ??
              0
            }
            value={fixedPrincipalAmount}
            onChange={(e) =>
              setFixedPrincipalAmount(
                e.target.value
              )
            }
            placeholder="Enter principal amount"
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <p className="text-[11px] text-slate-400 mt-2">
          Maximum principal payment: ₹
          {formatCurrency(
            loan.outstandingAmount ??
              loan.loanAmount ??
              0
          )}
        </p>

      </div>
    )}

    {/* PAYMENT SUMMARY */}
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
        Collection Summary
      </p>

      <div className="space-y-3">

        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">
            Current Interest
          </span>

          <span className="font-bold text-slate-800">
            ₹
            {formatCurrency(
              (
                Number(
                  loan.outstandingAmount ??
                    loan.loanAmount ??
                    0
                ) *
                  Number(loan.interestRate || 0)
              ) / 100
            )}
          </span>
        </div>

        <div className="flex justify-between items-center">

          <span className="text-sm text-slate-500">
            Principal Payment
          </span>

          <span className="font-bold text-emerald-700">
            ₹
            {formatCurrency(
              fixedPaymentMode ===
                "INTEREST_PRINCIPAL"
                ? Number(
                    fixedPrincipalAmount || 0
                  )
                : 0
            )}
          </span>

        </div>

        <div className="border-t border-slate-200 pt-3 flex justify-between items-center">

          <span className="text-sm font-extrabold text-slate-700">
            Total Collection
          </span>

          <span className="text-xl font-black text-blue-700">

            ₹
            {formatCurrency(
              (
                (
                  Number(
                    loan.outstandingAmount ??
                      loan.loanAmount ??
                      0
                  ) *
                    Number(
                      loan.interestRate || 0
                    )
                ) / 100
              ) +
                (fixedPaymentMode ===
                "INTEREST_PRINCIPAL"
                  ? Number(
                      fixedPrincipalAmount || 0
                    )
                  : 0)
            )}

          </span>

        </div>

      </div>

    </div>

    {/* PAYMENT METHOD */}
    <PaymentMethod
      paymentMethod={paymentMethod}
      setPaymentMethod={setPaymentMethod}
    />

    {/* COLLECTION BUTTON */}
    <button
      type="button"
      onClick={collectFixedPayment}
      disabled={
        fixedCollecting ||
        loan.status === "CLOSED" ||
        (fixedPaymentMode ===
          "INTEREST_PRINCIPAL" &&
          (!fixedPrincipalAmount ||
            Number(fixedPrincipalAmount) <= 0))
      }
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm py-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
    >

      {fixedCollecting ? (
        <>
          <Spinner />
          Collecting FIXED Payment...
        </>
      ) : (
        <>
          <CheckCircle2 size={18} />
          {fixedPaymentMode ===
          "INTEREST_ONLY"
            ? "Collect Monthly Interest"
            : "Collect Interest + Principal"}
        </>
      )}

    </button>

    {/* NEXT MONTH INTEREST PREVIEW */}
    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">

      <div className="flex items-start gap-2">

        <CheckCircle2
          size={16}
          className="text-emerald-600 mt-0.5 shrink-0"
        />

        <p className="text-[11px] leading-5 text-emerald-700">

          {fixedPaymentMode ===
          "INTEREST_PRINCIPAL"
            ? (() => {
                const currentPrincipal =
                  Number(
                    loan.outstandingAmount ??
                      loan.loanAmount ??
                      0
                  );

                const principalPayment =
                  Number(
                    fixedPrincipalAmount || 0
                  );

                const nextPrincipal =
                  Math.max(
                    currentPrincipal -
                      principalPayment,
                    0
                  );

                const nextInterest =
                  (nextPrincipal *
                    Number(
                      loan.interestRate || 0
                    )) /
                  100;

                return (
                  <>
                    After this principal payment,
                    next month's estimated interest
                    will be{" "}
                    <strong>
                      ₹
                      {formatCurrency(
                        nextInterest
                      )}
                    </strong>
                    .
                  </>
                );
              })()
            : `Next month's interest will be calculated from the current outstanding principal of ₹${formatCurrency(
                loan.outstandingAmount ??
                  loan.loanAmount ??
                  0
              )}.`}

        </p>

      </div>

    </div>

  </div>
)}
              {/* =================================================
                  NORMAL EMI MODE
              ================================================== */}
             {loan.loanType == "FIXED" &&
  collectionMode === "NORMAL" && (
                <div className="space-y-5">

                  {/* PENDING INSTALLMENT */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Select Pending Installment
                    </label>

                    <div className="relative">
                      <select
                        className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3.5 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        value={
                          selectedInstallment?.installmentNo || ""
                        }
                        onChange={(e) => {
                          const value = Number(e.target.value);

                          const selected =
                            pendingInstallments.find(
                              (item) =>
                                Number(item.installmentNo) ===
                                value
                            );

                          setSelectedInstallment(
                            selected || null
                          );
                        }}
                      >
                        <option value="">
                          Select Installment
                        </option>

                        {pendingInstallments.map((item) => (
                          <option
                            key={item.installmentNo}
                            value={item.installmentNo}
                          >
                            EMI #{item.installmentNo} | Due{" "}
                            {formatDate(item.dueDate)} | ₹
                            {formatCurrency(item.totalAmount)}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={17}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                    </div>

                    {!pendingInstallments.length && (
                      <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-700 font-semibold flex items-center gap-2">
                        <CheckCircle2 size={17} />
                        No pending installments available.
                      </div>
                    )}
                  </div>

                  {/* NORMAL EMI DETAILS */}
                  {selectedInstallment && (
                    <div className="space-y-5">

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                        <MetricCard
                          label="EMI Amount"
                          value={`₹${formatCurrency(
                            selectedInstallment.emiAmount
                          )}`}
                          type="blue"
                        />

                        <MetricCard
                          label="Late Penalty"
                          value={`₹${formatCurrency(
                            selectedInstallment.penalty
                          )}`}
                          type="red"
                        />

                        <MetricCard
                          label="Total Payable"
                          value={`₹${formatCurrency(
                            selectedInstallment.totalAmount
                          )}`}
                          type="green"
                        />
                      </div>

                      {/* NORMAL PAYMENT METHOD */}
                      <PaymentMethod
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                      />

                      {/* NORMAL COLLECTION BUTTON */}
                      <button
                        type="button"
                        onClick={collectFixedPendingEmi}
                        disabled={
                          collecting ||
                          loan.status === "CLOSED" ||
                          !selectedInstallment
                        }
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm py-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                      >
                        {collecting ? (
                          <>
                            <Spinner />
                            Collecting EMI...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={18} />
                            Confirm & Collect Normal EMI
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* =================================================
    NORMAL EMI MODE - DAILY / MONTHLY LOAN
================================================== */}
{loan.loanType !== "FIXED" &&
  collectionMode === "NORMAL" && (
    <div className="space-y-5">

      {/* PENDING INSTALLMENTS */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Select Pending Installment
        </label>

        <div className="relative">
          <select
            className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3.5 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={selectedInstallment?.installmentNo || ""}
            disabled={collecting || loan.status === "CLOSED"}
            onChange={(e) => {
              const value = Number(e.target.value);

              const selected = pendingInstallments.find(
                (item) =>
                  Number(item.installmentNo) === value
              );

              setSelectedInstallment(selected || null);
            }}
          >
            <option value="">
              Select Installment
            </option>

            {pendingInstallments.map((item) => (
              <option
                key={item.installmentNo}
                value={item.installmentNo}
              >
                EMI #{item.installmentNo} | Due{" "}
                {formatDate(item.dueDate)} | ₹
                {formatCurrency(item.totalAmount)}
              </option>
            ))}
          </select>

          <ChevronDown
            size={17}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* NO PENDING EMI */}
        {!pendingInstallments.length && (
          <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-700 font-semibold flex items-center gap-2">
            <CheckCircle2 size={17} />
            No pending installments available.
          </div>
        )}
      </div>

      {/* SELECTED EMI DETAILS */}
      {selectedInstallment && (
        <div className="space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            <MetricCard
              label="EMI Amount"
              value={`₹${formatCurrency(
                selectedInstallment.emiAmount
              )}`}
              type="blue"
            />

            <MetricCard
              label="Late Penalty"
              value={`₹${formatCurrency(
                selectedInstallment.penalty
              )}`}
              type="red"
            />

            <MetricCard
              label="Total Payable"
              value={`₹${formatCurrency(
                selectedInstallment.totalAmount
              )}`}
              type="green"
            />

          </div>

          {/* PAYMENT METHOD */}
          <PaymentMethod
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />

          {/* COLLECT EMI */}
          <button
            type="button"
            onClick={collectNormalEmi}
            disabled={
              collecting ||
              loan.status === "CLOSED" ||
              !selectedInstallment
            }
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm py-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {collecting ? (
              <>
                <Spinner />
                Collecting EMI...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Confirm & Collect EMI
              </>
            )}
          </button>

        </div>
      )}

    </div>
  )}
  

              {/* =================================================
                  ADVANCE EMI MODE
              ================================================== */}
              {loan.loanType !== "FIXED" &&
  collectionMode === "ADVANCE" && (
                <div className="space-y-5">

                  {/* ADVANCE INFO BANNER */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Zap size={18} />
                      </div>

                      <div>
                        <p className="font-extrabold text-amber-900 text-sm">
                          Advance EMI Collection
                        </p>

                        <p className="text-xs text-amber-700 mt-1 leading-5">
                          Pay multiple future installments in
                          advance. Future installments are
                          collected at the normal EMI amount
                          without adding future penalties.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ADVANCE EMI COUNT */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Number of Advance EMI
                    </label>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <select
                          value={advanceCount}
                          onChange={(e) =>
                            handleAdvanceCountChange(
                              e.target.value
                            )
                          }
                          className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3.5 pr-10 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          {Array.from(
                            { length: 20 },
                            (_, index) => index + 1
                          ).map((number) => (
                            <option
                              key={number}
                              value={number}
                            >
                              {number} Advance EMI
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={17}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          loadAdvancePreview(advanceCount)
                        }
                        disabled={advanceLoading}
                        className="px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-sm disabled:opacity-50"
                      >
                        {advanceLoading ? (
                          <RefreshCw
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          <RefreshCw size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* EMI AMOUNT */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <MetricCard
                      label="EMI Amount"
                      value={`₹${formatCurrency(
                        loan.emiAmount
                      )}`}
                      type="blue"
                    />

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                        Advance Total
                      </p>

                      <h3 className="text-xl font-extrabold text-amber-700 mt-1">
                        ₹{formatCurrency(advanceTotal)}
                      </h3>

                      <p className="text-[10px] text-amber-600 mt-1">
                        {advancePreview.length} × ₹
                        {formatCurrency(loan.emiAmount)}
                      </p>
                    </div>
                  </div>

                  {/* ADVANCE PREVIEW */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">

                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="font-extrabold text-slate-800 text-sm">
                          Installment Preview
                        </p>

                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Future installments selected for
                          advance payment
                        </p>
                      </div>

                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                        {advancePreview.length} EMI
                      </span>
                    </div>

                    {advanceLoading ? (
                      <div className="p-8 flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />

                        <p className="text-sm text-slate-500 font-medium">
                          Generating preview...
                        </p>
                      </div>
                    ) : advancePreview.length > 0 ? (
                      <div className="divide-y divide-slate-100">

                        {advancePreview.map((item, index) => {
                          const installmentNo =
                            item?.installmentNo ||
                            item?.installment ||
                            index + 1;

                          const emiAmount =
                            Number(item?.emiAmount) ||
                            Number(item?.amount) ||
                            Number(loan.emiAmount) ||
                            0;

                          return (
                            <div
                              key={`${installmentNo}-${index}`}
                              className="px-4 py-3 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">

                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold text-xs">
                                  #{installmentNo}
                                </div>

                                <div>
                                  <p className="text-sm font-bold text-slate-800">
                                    Installment #
                                    {installmentNo}
                                  </p>

                                  <p className="text-[11px] text-slate-400">
                                    Due{" "}
                                    {formatDate(
                                      item?.dueDate
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-sm font-extrabold text-slate-900">
                                  ₹{formatCurrency(emiAmount)}
                                </p>

                                <p className="text-[10px] text-emerald-600 font-semibold">
                                  No future penalty
                                </p>
                              </div>
                            </div>
                          );
                        })}

                        {/* TOTAL */}
                        <div className="px-4 py-4 bg-slate-50 flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-600">
                            Advance Collection Total
                          </span>

                          <span className="text-xl font-black text-slate-900">
                            ₹{formatCurrency(advanceTotal)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                          <Receipt size={20} />
                        </div>

                        <p className="text-sm font-bold text-slate-700">
                          No advance preview available
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          Select the number of Advance EMI(s)
                          to generate the preview.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* PAYMENT METHOD */}
                  <PaymentMethod
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                  />

                  {/* ADVANCE COLLECTION BUTTON */}
                  <button
                    type="button"
                    onClick={collectAdvanceEmi}
                    disabled={
                      advanceCollecting ||
                      advanceLoading ||
                      !advancePreview.length ||
                      loan.status === "CLOSED"
                    }
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm py-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    {advanceCollecting ? (
                      <>
                        <Spinner />
                        Collecting Advance EMI...
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        Collect {advancePreview.length || 0}{" "}
                        Advance EMI
                      </>
                    )}
                  </button>

                  {/* SECURITY NOTE */}
                  <div className="flex items-start gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-600 mt-0.5 shrink-0"
                    />

                    <p className="text-[11px] leading-5 text-slate-500">
                      Advance collection uses the backend
                      installment preview. Already-paid
                      installments should not be selected again,
                      and future installments are collected
                      without future late penalties.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            LOAN INFORMATION
        ====================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
            <Landmark size={18} className="text-slate-400" />
            Loan Information
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 p-5">

            <Info
              label="Payment Frequency"
              value={loan.loanType}
            />

            <Info
              label="Duration Days"
              value={loan.durationDays}
            />

            <Info
              label="Duration Months"
              value={loan.durationMonths}
            />

            <Info
              label="Interest Rate"
              value={
                loan.interestRate !== undefined
                  ? `${loan.interestRate}%`
                  : "-"
              }
            />

            <Info
              label="Grace Period"
              value={loan.gracePeriod}
            />

            <Info
              label="Penalty Type"
              value={loan.penaltyType}
            />

            <Info
              label="Penalty Value"
              value={loan.penaltyValue}
            />

            <Info
              label="Total Interest"
              value={`₹${formatCurrency(
                loan.totalInterest
              )}`}
            />

            <Info
              label="Total Payable"
              value={`₹${formatCurrency(
                loan.totalPayable
              )}`}
            />

            <Info
              label="Outstanding Amount"
              value={`₹${formatCurrency(
                loan.outstandingAmount
              )}`}
            />

            <Info
              label="Paid Installments"
              value={loanData?.paidInstallments}
            />

            <Info
              label="Pending Installments"
              value={loanData?.pendingInstallments}
            />
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}
        <div className="text-center pb-4">
          <p className="text-[10px] text-slate-400">
            Agent Collection System • Loan ID: {loan._id}
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// INFO ITEM
// =============================================================
function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
          {label}
        </p>

        <p className="text-sm font-bold text-slate-800 truncate">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

// =============================================================
// SUMMARY CARD
// =============================================================
function SummaryCard({ label, value, icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <p className="text-lg font-black text-slate-900 mt-2 truncate">
        {value}
      </p>
    </div>
  );
}

// =============================================================
// METRIC CARD
// =============================================================
function MetricCard({ label, value, type = "blue" }) {
  const styles = {
    blue: {
      wrapper: "bg-blue-50 border-blue-100",
      label: "text-blue-500",
      value: "text-blue-700",
    },

    red: {
      wrapper: "bg-rose-50 border-rose-100",
      label: "text-rose-500",
      value: "text-rose-600",
    },

    green: {
      wrapper: "bg-emerald-50 border-emerald-100",
      label: "text-emerald-500",
      value: "text-emerald-700",
    },
  };

  const style = styles[type] || styles.blue;

  return (
    <div
      className={`${style.wrapper} border rounded-2xl p-4`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-wider ${style.label}`}
      >
        {label}
      </p>

      <h3
        className={`text-xl font-extrabold mt-1 ${style.value}`}
      >
        {value}
      </h3>
    </div>
  );
}

// =============================================================
// PAYMENT METHOD
// =============================================================
function PaymentMethod({
  paymentMethod,
  setPaymentMethod,
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
        Payment Method
      </label>

      <select
        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        value={paymentMethod}
        onChange={(e) =>
          setPaymentMethod(e.target.value)
        }
      >
        <option value="CASH">
          Cash
        </option>

        <option value="UPI">
          UPI
        </option>

        <option value="BANK">
          Bank Transfer
        </option>
      </select>
    </div>
  );
}

// =============================================================
// INFO
// =============================================================
function Info({ label, value }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
        {label}
      </p>

      <p className="text-sm font-semibold text-slate-800 break-all">
        {value !== undefined &&
        value !== null &&
        value !== ""
          ? value
          : "-"}
      </p>
    </div>
  );
}

// =============================================================
// SPINNER
// =============================================================
function Spinner() {
  return (
    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
  );
}

export default LoanDetails;