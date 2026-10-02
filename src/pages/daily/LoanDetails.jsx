import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Landmark,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  CreditCard,
  Clock,
  BadgeIndianRupee,
  AlertTriangle,
  Receipt,
  Percent,
  Wallet
} from "lucide-react";

const API = "https://finance-project-0qqk.onrender.com/api/daily";

function LoanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loanData, setLoanData] = useState(null);
  const [pendingInstallments, setPendingInstallments] = useState([]);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectionMode, setCollectionMode] = useState("NORMAL");
  const [advanceCount, setAdvanceCount] = useState(2);
  const [advancePreview, setAdvancePreview] = useState(null);
  const [advancePreviewLoading, setAdvancePreviewLoading] = useState(false);
  const [normalCollectLoading, setNormalCollectLoading] = useState(false);
  const [advanceCollectLoading, setAdvanceCollectLoading] = useState(false);

  // ================= FIXED LOAN =================
  const [fixedPaymentMode, setFixedPaymentMode] = useState("INTEREST_ONLY");
  const [fixedPrincipalAmount, setFixedPrincipalAmount] = useState("");
  const [fixedCollecting, setFixedCollecting] = useState(false);
  const [fixedAdvanceCount, setFixedAdvanceCount] = useState(2);
  const [fixedAdvancePreview, setFixedAdvancePreview] = useState(null);
  const [fixedAdvancePreviewLoading, setFixedAdvancePreviewLoading] = useState(false);
  const [fixedAdvanceCollecting, setFixedAdvanceCollecting] = useState(false);

  // ================= GIVE MORE LOAN =================
  const [showMoreLoanModal, setShowMoreLoanModal] = useState(false);
  const [additionalLoanAmount, setAdditionalLoanAmount] = useState("");
  const [additionalLoanLoading, setAdditionalLoanLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  const loan = loanData?.loan;

  useEffect(() => {
    loadLoan();
  }, [id]);

  const loadLoan = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/loan/${id}`);
      setLoanData(res.data);
    } catch (error) {
      console.error("Error loading loan:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingInstallments = async () => {
    if (!loan?._id) return;

    try {
      const res = await axios.get(`${API}/pending-installments/${loan._id}`);
      const installments = res.data.installments || [];
      setPendingInstallments(installments);

      if (installments.length > 0) {
        setSelectedInstallment(installments[0]);
      }
    } catch (error) {
      console.error("Error loading installments:", error);
    }
  };

  const openCollectModal = () => {
    setCollectionMode("NORMAL");
    setAdvanceCount(2);
    setAdvancePreview(null);
    setSelectedInstallment(null);

    setFixedPaymentMode("INTEREST_ONLY");
    setFixedPrincipalAmount("");
    setFixedAdvanceCount(2);
    setFixedAdvancePreview(null);
    setPaymentMethod("CASH");

    setShowCollectModal(true);
    loadPendingInstallments();
  };

  const closeModal = (force = false) => {
    if (
      !force &&
      (normalCollectLoading ||
        advanceCollectLoading ||
        fixedCollecting ||
        fixedAdvanceCollecting)
    )
      return;
    setShowCollectModal(false);
    setSelectedInstallment(null);
    setCollectionMode("NORMAL");
    setAdvanceCount(2);
    setAdvancePreview(null);
    setFixedPaymentMode("INTEREST_ONLY");
    setFixedPrincipalAmount("");
    setFixedAdvanceCount(2);
    setFixedAdvancePreview(null);
    setPaymentMethod("CASH");
  };

  const loadAdvancePreview = async (count = advanceCount) => {
    if (!loan?._id) return;

    const safeCount = Number(count);
    if (!Number.isInteger(safeCount) || safeCount < 1) {
      setAdvancePreview(null);
      return;
    }

    try {
      setAdvancePreviewLoading(true);

      const res = await axios.get(`${API}/loan/${loan._id}/advance-preview`, {
        params: { count: safeCount }
      });

      const data = res.data || {};
      const installments = Array.isArray(data.installments)
        ? data.installments
        : [];

      setAdvancePreview({
        ...data,
        installments,
        totalAmount:
          Number(data.totalAmount) ||
          installments.reduce(
            (sum, item) => sum + Number(item.totalAmount || item.emiAmount || 0),
            0
          ),
        emiAmount:
          Number(data.emiAmount) ||
          Number(loan.emiAmount) ||
          Number(installments[0]?.emiAmount) ||
          0
      });
    } catch (error) {
      setAdvancePreview(null);
      alert(error.response?.data?.message || "Unable to load advance EMI preview");
    } finally {
      setAdvancePreviewLoading(false);
    }
  };

  const switchCollectionMode = async (mode) => {
    setCollectionMode(mode);

    if (mode === "NORMAL") {
      setAdvancePreview(null);
      return;
    }

    await loadAdvancePreview(advanceCount);
  };

  const handleAdvanceCountChange = async (value) => {
    const count = Math.max(1, Math.min(100, Number(value) || 1));
    setAdvanceCount(count);
    await loadAdvancePreview(count);
  };

  // =====================================================
  // FIXED LOAN - ADVANCE INTEREST PREVIEW
  // =====================================================
  const loadFixedAdvancePreview = async (count = fixedAdvanceCount) => {
    if (!loan?._id || loan.loanType !== "FIXED") return;

    const safeCount = Math.max(1, Math.min(100, Number(count) || 1));

    try {
      setFixedAdvancePreviewLoading(true);

      const res = await axios.get(
        `${API}/loan/${loan._id}/fixed-advance-preview`,
        { params: { count: safeCount } }
      );

      const data = res.data || {};
      const installments = Array.isArray(data.installments)
        ? data.installments
        : [];

      const totalAmount = installments.reduce(
        (sum, item) =>
          sum +
          Number(
            item.interestAmount ?? item.totalAmount ?? item.emiAmount ?? 0
          ),
        0
      );

      setFixedAdvancePreview({
        ...data,
        installments,
        totalAmount: Number(data.totalAmount) || totalAmount,
        monthlyInterest:
          Number(data.monthlyInterest) ||
          Math.round(
            (Number(loan.outstandingAmount ?? loan.loanAmount ?? 0) *
              Number(loan.interestRate || 0)) /
              100
          )
      });
    } catch (error) {
      setFixedAdvancePreview(null);
      alert(
        error.response?.data?.message ||
          "Unable to load FIXED loan advance interest preview"
      );
    } finally {
      setFixedAdvancePreviewLoading(false);
    }
  };

  const handleFixedAdvanceCountChange = async (value) => {
    const count = Math.max(1, Math.min(100, Number(value) || 1));
    setFixedAdvanceCount(count);
    await loadFixedAdvancePreview(count);
  };

  // =====================================================
  // FIXED LOAN - COLLECT ADVANCE MONTHLY INTEREST
  // =====================================================
  const collectFixedAdvanceInterest = async () => {
    if (!loan?._id) return;

    const count = Number(fixedAdvanceCount);

    if (!Number.isInteger(count) || count < 1 || count > 100) {
      alert("Please enter a valid Advance EMI count between 1 and 100.");
      return;
    }

    try {
      setFixedAdvanceCollecting(true);

      const previewRes = await axios.get(
        `${API}/loan/${loan._id}/fixed-advance-preview`,
        { params: { count } }
      );

      const preview = previewRes.data || {};
      const installments = Array.isArray(preview.installments)
        ? preview.installments
        : [];

      if (installments.length === 0) {
        alert("No unpaid future FIXED installments are available.");
        return;
      }

      const res = await axios.post(`${API}/collect-fixed-advance-interest`, {
        loanId: loan._id,
        advanceCount: count,
        collectorType: "ADMIN",
        collectorId: loan.member?._id || loan.member,
        paymentMethod
      });

      alert(
        res.data.message ||
          "FIXED loan advance interest collected successfully"
      );

      setFixedAdvancePreview(null);
      setFixedAdvanceCount(2);
      setPaymentMethod("CASH");
      closeModal(true);

      await loadLoan();
      await loadPendingInstallments();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "FIXED loan advance interest collection failed"
      );
    } finally {
      setFixedAdvanceCollecting(false);
    }
  };

  const collectEmi = async () => {
    if (!selectedInstallment) {
      alert("Please select an installment");
      return;
    }

    try {
      setNormalCollectLoading(true);

      const res = await axios.post(`${API}/collect-emi`, {
        loanId: loan._id,
        installmentNo: selectedInstallment.installmentNo,
        collectorType: "ADMIN",
        collectorId: loan.member?._id || loan.member,
        paymentMethod
      });

      alert(res.data.message || "EMI Collected Successfully");
      closeModal(true);
      await loadLoan();
      await loadPendingInstallments();
    } catch (error) {
      alert(error.response?.data?.message || "Collection Failed");
    } finally {
      setNormalCollectLoading(false);
    }
  };

  const collectAdvanceEmi = async () => {
    const count = Number(advanceCount);

    if (!Number.isInteger(count) || count < 1) {
      alert("Please enter a valid Advance EMI count");
      return;
    }

    if (count > 100) {
      alert("Maximum 100 Advance EMIs can be collected at once");
      return;
    }

    try {
      setAdvanceCollectLoading(true);

      const previewRes = await axios.get(
        `${API}/loan/${loan._id}/advance-preview`,
        { params: { count } }
      );

      const preview = previewRes.data || {};
      const installments = Array.isArray(preview.installments)
        ? preview.installments
        : [];

      if (installments.length === 0) {
        alert("No unpaid installments are available for advance collection.");
        return;
      }

      const res = await axios.post(`${API}/collect-advance-loan`, {
        loanId: loan._id,
        advanceCount: count,
        collectorType: "ADMIN",
        collectorId: loan.member?._id || loan.member,
        paymentMethod
      });

      alert(res.data.message || "Advance EMI Collected Successfully");

      closeModal(true);
      await loadLoan();
      await loadPendingInstallments();
    } catch (error) {
      alert(error.response?.data?.message || "Advance EMI Collection Failed");
    } finally {
      setAdvanceCollectLoading(false);
    }
  };

  // =====================================================
  // FIXED LOAN - COLLECT INTEREST / INTEREST + PRINCIPAL
  // =====================================================
  const collectFixedPayment = async () => {
    if (!loan?._id) return;

    const principalAmount =
      fixedPaymentMode === "INTEREST_ONLY"
        ? 0
        : Number(fixedPrincipalAmount || 0);

    const currentPrincipal = Number(
      loan.outstandingAmount ?? loan.loanAmount ?? 0
    );

    if (currentPrincipal <= 0) {
      alert("No outstanding principal available.");
      return;
    }

    if (
      fixedPaymentMode === "INTEREST_PLUS_PRINCIPAL" &&
      (!Number.isFinite(principalAmount) || principalAmount <= 0)
    ) {
      alert("Please enter a valid principal amount.");
      return;
    }

    if (principalAmount > currentPrincipal) {
      alert(
        `Principal payment cannot exceed outstanding principal of ₹${currentPrincipal.toLocaleString(
          "en-IN"
        )}.`
      );
      return;
    }

    try {
      setFixedCollecting(true);

      const res = await axios.post(`${API}/collect-fixed-interest-principal`, {
        loanId: loan._id,
        collectorType: "ADMIN",
        collectorId: loan.member?._id || loan.member,
        paymentMethod,
        principalAmount
      });

      alert(res.data.message || "Fixed Loan Payment Collected Successfully");

      setFixedPrincipalAmount("");
      setFixedPaymentMode("INTEREST_ONLY");

      closeModal(true);

      await loadLoan();
      await loadPendingInstallments();
    } catch (error) {
      alert(
        error.response?.data?.message || "Fixed Loan Payment Collection Failed"
      );
    } finally {
      setFixedCollecting(false);
    }
  };

  // =====================================================
  // FIXED LOAN - GIVE MORE LOAN
  // =====================================================
  const giveMoreLoan = async () => {
    if (!loan?._id) return;

    const amount = Number(additionalLoanAmount || 0);

    const currentPrincipal = Number(
      loan.outstandingAmount ?? loan.loanAmount ?? 0
    );

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a valid additional loan amount.");
      return;
    }

    const newPrincipal = currentPrincipal + amount;

    if (
      !window.confirm(
        `Give additional loan of ₹${amount.toLocaleString(
          "en-IN"
        )}?\n\nCurrent Principal: ₹${currentPrincipal.toLocaleString(
          "en-IN"
        )}\nNew Principal: ₹${newPrincipal.toLocaleString("en-IN")}`
      )
    ) {
      return;
    }

    try {
      setAdditionalLoanLoading(true);

      const res = await axios.post(`${API}/give-more-loan`, {
        loanId: loan._id,
        additionalAmount: amount,
        collectorType: "ADMIN",
        collectorId: loan.member?._id || loan.member
      });

      alert(res.data.message || "Additional Loan Given Successfully");

      setAdditionalLoanAmount("");
      setShowMoreLoanModal(false);

      await loadLoan();
      await loadPendingInstallments();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to give additional loan");
    } finally {
      setAdditionalLoanLoading(false);
    }
  };

  const closeLoan = async () => {
    if (!window.confirm("Are you sure you want to close this loan?")) return;
    try {
      const res = await axios.put(`${API}/close-loan/${loan._id}`);
      alert(res.data.message || "Loan Closed Successfully");
      loadLoan();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to close loan");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-slate-600 font-medium">Loading Loan Details...</div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          Loan Record Not Found
        </h2>
        <p className="text-slate-500 mt-1 max-w-sm">
          The requested loan ID details do not exist or may have been deleted.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ========================= HEADER ========================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase text-blue-600 hover:text-blue-700 mb-2 transition"
              >
                <ArrowLeft size={14} /> Back to Directory
              </button>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                  Loan Account View
                </h1>
                <StatusBadge status={loan.status} />
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">
                UID: {loan._id}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={openCollectModal}
                disabled={loan.status === "CLOSED"}
                className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Collect EMI
              </button>

              {loan.loanType === "FIXED" && loan.status !== "CLOSED" && (
                <button
                  onClick={() => {
                    setAdditionalLoanAmount("");
                    setShowMoreLoanModal(true);
                  }}
                  className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-sm transition"
                >
                  + Give More Loan
                </button>
              )}

              <button
                onClick={closeLoan}
                disabled={loan.status === "CLOSED"}
                className="flex-1 sm:flex-initial bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-5 py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Close Account
              </button>
            </div>
          </div>
        </div>

        {/* ================= DASHBOARD PERFORMANCE METRICS ================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card
            title="Principal Amount"
            value={`₹${loan.loanAmount?.toLocaleString("en-IN")}`}
            icon={<BadgeIndianRupee size={20} />}
            variant="blue"
          />
          <Card
            title="Total Recovered"
            value={`₹${loan.totalPaid?.toLocaleString("en-IN")}`}
            icon={<Wallet size={20} />}
            variant="emerald"
          />
          <Card
            title="Outstanding Ball."
            value={`₹${loan.outstandingAmount?.toLocaleString("en-IN")}`}
            icon={<AlertTriangle size={20} />}
            variant="amber"
          />
          <Card
            title="EMI Amount"
            value={`₹${loan.emiAmount?.toLocaleString("en-IN")}`}
            icon={<CreditCard size={20} />}
            variant="purple"
          />
          <Card
            title="Interest Rate"
            value={`${loan.interestRate}%`}
            icon={<Percent size={20} />}
            variant="indigo"
          />
          <Card
            title="Account Stage"
            value={loan.status}
            icon={<Clock size={20} />}
            variant="slate"
          />
        </div>

        {/* ================= MAIN CONFIGURATION GRID ================= */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT: Core Operational Blocks */}
          <div className="lg:col-span-2 space-y-6">
            {/* BORROWER PROFILE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                <User size={18} className="text-slate-400" />
                Primary Borrower Details
              </div>
              <div className="grid sm:grid-cols-2 gap-5 p-5">
                <Info label="Full Name" value={loan.borrowerName} />
                <Info label="Father / Husband Name" value={loan.fatherName} />
                <Info label="Registered Mobile" value={loan.mobile} />
                <Info label="Member ID" value={loan.member?.memberId} />
                <Info label="Area" value={loan.areaName} />
                <Info label="Assigned Agent" value={loan.assignedAgent?.name} />
                <Info label="Agent Mobile" value={loan.assignedAgent?.mobile} />
                <Info label="Assigned Area Node" value={loan.areaName} />
                <Info
                  label="Residential Address"
                  value={loan.address}
                  className="sm:col-span-2"
                />
                <Info
                  label="Disbursement Date"
                  value={
                    loan.loanDate
                      ? new Date(loan.loanDate).toLocaleDateString("en-IN", {
                          dateStyle: "long"
                        })
                      : "-"
                  }
                />
              </div>
            </div>

            {/* LOAN ARCHITECTURE TERMS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                <Landmark size={18} className="text-slate-400" />
                Loan Matrix & Capital Information
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 p-5">
                <Info label="Payment Frequency" value={loan.loanType} />
                <Info label="Duration (Days)" value={loan.durationDays} />
                <Info label="Duration (Months)" value={loan.durationMonths} />
                <Info label="Interest Rate" value={`${loan.interestRate}%`} />
                <Info label="Grace Period Days" value={loan.gracePeriod} />
                <Info label="Penalty Strategy" value={loan.penaltyType} />
                <Info label="Penalty Value" value={loan.penaltyValue} />
                <Info label="Calculated EMI" value={`₹${loan.emiAmount}`} />
                <Info
                  label="Total Gross Interest"
                  value={`₹${loan.totalInterest}`}
                />
                <Info
                  label="Total Gross Payable"
                  value={`₹${loan.totalPayable}`}
                />
                <Info
                  label="Net Outstanding"
                  value={`₹${loan.outstandingAmount}`}
                />
                <Info
                  label="Last Activity Timestamp"
                  value={
                    loan.lastPaymentDate
                      ? new Date(loan.lastPaymentDate).toLocaleDateString(
                          "en-IN"
                        )
                      : "No Activity"
                  }
                />
              </div>
            </div>

            {/* LEGAL VERIFICATION DOCS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-slate-400" />
                KYC Dossier & Escrow Audit
              </div>
              <div className="p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Info label="Income Tax PAN" value={loan.panNumber} />
                  <Info
                    label="National ID (Aadhaar)"
                    value={
                      loan.aadhaarNumber
                        ? `XXXX-XXXX-${loan.aadhaarNumber.slice(-4)}`
                        : "-"
                    }
                  />
                </div>
                <hr className="border-slate-100" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <CheckItem
                    label="Passport Photo Validated"
                    checked={loan.passportPhotoSubmitted}
                  />
                  <CheckItem
                    label="Escrow Cheque Leaf 01"
                    checked={loan.cheque1Submitted}
                  />
                  <CheckItem
                    label="Escrow Cheque Leaf 02"
                    checked={loan.cheque2Submitted}
                  />
                  <CheckItem
                    label="Guarantor 1 Indemnity Bond"
                    checked={loan.guarantor1StampPaperSubmitted}
                  />
                  <CheckItem
                    label="Guarantor 2 Indemnity Bond"
                    checked={loan.guarantor2StampPaperSubmitted}
                  />
                </div>
              </div>
            </div>

            {/* GUARANTOR CO-SIGNERS */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 font-bold text-slate-900">
                  Guarantor 1 Details
                </div>

                <div className="grid grid-cols-2 gap-4 p-5">
                  <Info label="Full Name" value={loan.guarantor1Name} />
                  <Info label="Father Name" value={loan.guarantor1FatherName} />
                  <Info label="Gender" value={loan.guarantor1Gender} />
                  <Info
                    label="Date of Birth"
                    value={
                      loan.guarantor1Dob
                        ? new Date(loan.guarantor1Dob).toLocaleDateString(
                            "en-IN"
                          )
                        : "-"
                    }
                  />
                  <Info label="Mobile" value={loan.guarantor1Mobile} />
                  <Info
                    label="Alternate Mobile"
                    value={loan.guarantor1AlternateMobile}
                  />
                  <Info label="Email" value={loan.guarantor1Email} />
                  <Info label="City" value={loan.guarantor1City} />
                  <Info label="District" value={loan.guarantor1District} />
                  <Info label="State" value={loan.guarantor1State} />
                  <Info label="Pincode" value={loan.guarantor1Pincode} />
                  <Info
                    label="Address"
                    value={loan.guarantor1Address}
                    className="col-span-2"
                  />
                  <Info
                    label="Aadhaar Number"
                    value={loan.guarantor1AadhaarNumber}
                  />
                  <Info label="PAN Number" value={loan.guarantor1PanNumber} />
                  <Info label="Cheque 1" value={loan.guarantor1Cheque1Number} />
                  <Info label="Cheque 2" value={loan.guarantor1Cheque2Number} />
                  <Info
                    label="Security Type"
                    value={loan.guarantor1SecurityType}
                  />
                  <Info
                    label="Security Details"
                    value={loan.guarantor1SecurityDetails}
                  />
                </div>

                <div className="border-t border-slate-100 p-5 grid grid-cols-2 gap-3">
                  <CheckItem
                    label="Photo Submitted"
                    checked={loan.guarantor1PhotoSubmitted}
                  />
                  <CheckItem
                    label="Aadhaar Submitted"
                    checked={loan.guarantor1AadhaarSubmitted}
                  />
                  <CheckItem
                    label="PAN Submitted"
                    checked={loan.guarantor1PanSubmitted}
                  />
                  <CheckItem
                    label="Cheque 1 Submitted"
                    checked={loan.guarantor1Cheque1Submitted}
                  />
                  <CheckItem
                    label="Cheque 2 Submitted"
                    checked={loan.guarantor1Cheque2Submitted}
                  />
                  <CheckItem
                    label="Stamp Paper Submitted"
                    checked={loan.guarantor1StampPaperSubmitted}
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 font-bold text-slate-900">
                  Guarantor 02 Details
                </div>

                <div className="grid grid-cols-2 gap-4 p-5">
                  <Info label="Full Name" value={loan.guarantor2Name} />
                  <Info label="Father Name" value={loan.guarantor2FatherName} />
                  <Info label="Gender" value={loan.guarantor2Gender} />
                  <Info
                    label="Date of Birth"
                    value={
                      loan.guarantor2Dob
                        ? new Date(loan.guarantor2Dob).toLocaleDateString(
                            "en-IN"
                          )
                        : "-"
                    }
                  />
                  <Info label="Mobile Number" value={loan.guarantor2Mobile} />
                  <Info
                    label="Alternate Mobile"
                    value={loan.guarantor2AlternateMobile}
                  />
                  <Info label="Email" value={loan.guarantor2Email} />
                  <Info label="City" value={loan.guarantor2City} />
                  <Info label="District" value={loan.guarantor2District} />
                  <Info label="State" value={loan.guarantor2State} />
                  <Info label="Pincode" value={loan.guarantor2Pincode} />
                  <Info
                    label="Address"
                    value={loan.guarantor2Address}
                    className="col-span-2"
                  />
                  <Info
                    label="Aadhaar Number"
                    value={loan.guarantor2AadhaarNumber}
                  />
                  <Info label="PAN Number" value={loan.guarantor2PanNumber} />
                  <Info
                    label="Cheque 1 Number"
                    value={loan.guarantor2Cheque1Number}
                  />
                  <Info
                    label="Cheque 2 Number"
                    value={loan.guarantor2Cheque2Number}
                  />
                  <Info
                    label="Security Type"
                    value={loan.guarantor2SecurityType}
                  />
                  <Info
                    label="Security Details"
                    value={loan.guarantor2SecurityDetails}
                  />
                </div>

                <div className="border-t border-slate-100 p-5 grid grid-cols-2 gap-3">
                  <CheckItem
                    label="Photo Submitted"
                    checked={loan.guarantor2PhotoSubmitted}
                  />
                  <CheckItem
                    label="Aadhaar Submitted"
                    checked={loan.guarantor2AadhaarSubmitted}
                  />
                  <CheckItem
                    label="PAN Submitted"
                    checked={loan.guarantor2PanSubmitted}
                  />
                  <CheckItem
                    label="Cheque 1 Submitted"
                    checked={loan.guarantor2Cheque1Submitted}
                  />
                  <CheckItem
                    label="Cheque 2 Submitted"
                    checked={loan.guarantor2Cheque2Submitted}
                  />
                  <CheckItem
                    label="Stamp Paper Submitted"
                    checked={loan.guarantor2StampPaperSubmitted}
                  />
                </div>
              </div>
            </div>

            {/* AUDIT LOG REMARKS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 font-bold text-slate-900 text-sm">
                Underwriting & Administrative Remarks
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-4 italic">
                  "{loan.remarks || "No administrative remarks logged against this account frame."}"
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Accounts Receivable & Collection Trackers */}
          <div className="space-y-6">
            {/* AMORTIZATION SUMMARY */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 font-bold text-slate-900">
                Amortization Lifecycle Ledger
              </div>
              <div className="p-5 space-y-3.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Scheduled Increments</span>
                  <span className="font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                    {loanData.totalInstallments}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Settled Erasures</span>
                  <span className="font-semibold px-2 py-0.5 bg-emerald-50 rounded text-emerald-700">
                    {loanData.paidInstallments}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">
                    Unsettled Blocks Remaining
                  </span>
                  <span className="font-semibold px-2 py-0.5 bg-amber-50 rounded text-amber-700">
                    {loanData.pendingInstallments}
                  </span>
                </div>
                <hr className="border-slate-100 my-2" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">
                    Net Liquidation Disbursed
                  </span>
                  <span className="font-bold text-slate-900">
                    ₹{loan.totalPaid?.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">
                    Aggregate Exposure Remaining
                  </span>
                  <span className="font-bold text-rose-600">
                    ₹{loan.outstandingAmount?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* HISTORICAL RECEIPT RECOVERY */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                <Receipt size={18} className="text-slate-400" />
                Collection Transaction Log
              </div>
              <div className="overflow-x-auto">
                {loanData.collections && loanData.collections.length > 0 ? (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="p-3 font-semibold">Receipt Hash</th>
                        <th className="p-3 font-semibold text-center">
                          Instalment
                        </th>
                        <th className="p-3 font-semibold text-right">
                          Aggregate
                        </th>
                        <th className="p-3 font-semibold text-right">
                          Date Logged
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {loanData.collections.map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-slate-50/50 transition"
                        >
                          <td className="p-3 font-mono text-slate-400 font-medium">
                            {item.receiptNo || "N/A"}
                          </td>
                          <td className="p-3 font-semibold text-slate-800 text-center">
                            #{item.installmentNo}
                          </td>
                          <td className="p-3 font-bold text-emerald-600 text-right">
                            ₹{item.totalAmount?.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 text-slate-400 text-right">
                            {new Date(item.paymentDate).toLocaleDateString(
                              "en-IN"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    No payment history tracked in this loan segment yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= MODAL: ACCOUNTS RECEIVABLE COLLECTOR ================= */}
        {showCollectModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
              {/* MODAL HEADER */}
              <div className="border-b border-slate-100 p-5 flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    EMI Collection
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Admin collection settlement for this loan
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  disabled={normalCollectLoading || advanceCollectLoading}
                  className="text-slate-400 hover:text-slate-600 disabled:opacity-40 transition bg-white w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* ================= COLLECTION MODE ================= */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                    Collection Mode
                  </label>
                  {loan.loanType === "FIXED" ? (
                    <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setCollectionMode("NORMAL");
                          setFixedPaymentMode("INTEREST_ONLY");
                          setFixedPrincipalAmount("");
                          setFixedAdvancePreview(null);
                        }}
                        disabled={fixedCollecting || fixedAdvanceCollecting}
                        className={`py-3 rounded-lg text-xs sm:text-sm font-bold transition ${
                          collectionMode === "NORMAL"
                            ? "bg-white text-emerald-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Normal EMI
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCollectionMode("ADVANCE");
                          loadFixedAdvancePreview(fixedAdvanceCount);
                        }}
                        disabled={fixedCollecting || fixedAdvanceCollecting}
                        className={`py-3 rounded-lg text-xs sm:text-sm font-bold transition ${
                          collectionMode === "ADVANCE"
                            ? "bg-white text-blue-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Advance EMI
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCollectionMode("FIXED_PAYMENT");
                          setFixedPaymentMode("INTEREST_PLUS_PRINCIPAL");
                          setFixedAdvancePreview(null);
                        }}
                        disabled={fixedCollecting || fixedAdvanceCollecting}
                        className={`py-3 rounded-lg text-xs sm:text-sm font-bold transition ${
                          collectionMode === "FIXED_PAYMENT"
                            ? "bg-white text-indigo-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Interest + Principal
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl">
                      <button
                        type="button"
                        onClick={() => switchCollectionMode("NORMAL")}
                        disabled={normalCollectLoading || advanceCollectLoading}
                        className={`py-3 rounded-lg text-sm font-bold transition ${
                          collectionMode === "NORMAL"
                            ? "bg-white text-emerald-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Normal EMI
                      </button>
                      <button
                        type="button"
                        onClick={() => switchCollectionMode("ADVANCE")}
                        disabled={normalCollectLoading || advanceCollectLoading}
                        className={`py-3 rounded-lg text-sm font-bold transition ${
                          collectionMode === "ADVANCE"
                            ? "bg-white text-blue-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Advance EMI
                      </button>
                    </div>
                  )}
                </div>

                {/* ================= NORMAL EMI ================= */}
                {collectionMode === "NORMAL" && loan.loanType !== "FIXED" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                        Target Outstanding Installment
                      </label>

                      <select
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        value={selectedInstallment?.installmentNo || ""}
                        disabled={normalCollectLoading}
                        onChange={(e) => {
                          const selected = pendingInstallments.find(
                            (item) =>
                              item.installmentNo === Number(e.target.value)
                          );
                          setSelectedInstallment(selected || null);
                        }}
                      >
                        <option value="">Choose Installment</option>

                        {pendingInstallments.map((item) => (
                          <option
                            key={item.installmentNo}
                            value={item.installmentNo}
                          >
                            EMI #{item.installmentNo} | {item.dueDateString} | ₹
                            {Number(item.totalAmount || 0).toLocaleString("en-IN")}
                          </option>
                        ))}
                      </select>

                      {pendingInstallments.length === 0 && (
                        <p className="text-xs text-amber-600 mt-2">
                          No pending installments available.
                        </p>
                      )}
                    </div>

                    {selectedInstallment && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                              Due Date
                            </p>
                            <h3 className="font-bold text-slate-800 text-sm mt-1">
                              {selectedInstallment.dueDate
                                ? new Date(
                                    selectedInstallment.dueDate
                                  ).toLocaleDateString("en-IN", {
                                    dateStyle: "medium"
                                  })
                                : selectedInstallment.dueDateString || "-"}
                            </h3>
                          </div>

                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                            <p className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">
                              Delay
                            </p>
                            <h3 className="font-bold text-amber-700 text-sm mt-1">
                              {selectedInstallment.delay || 0} Days
                            </h3>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              EMI
                            </p>
                            <h2 className="text-base font-black text-slate-800 mt-1">
                              ₹
                              {Number(
                                selectedInstallment.emiAmount || 0
                              ).toLocaleString("en-IN")}
                            </h2>
                          </div>

                          <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-rose-500 uppercase">
                              Penalty
                            </p>
                            <h2 className="text-base font-black text-rose-600 mt-1">
                              ₹
                              {Number(
                                selectedInstallment.penalty || 0
                              ).toLocaleString("en-IN")}
                            </h2>
                          </div>

                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-blue-500 uppercase">
                              Total
                            </p>
                            <h2 className="text-base font-black text-blue-700 mt-1">
                              ₹
                              {Number(
                                selectedInstallment.totalAmount || 0
                              ).toLocaleString("en-IN")}
                            </h2>
                          </div>
                        </div>

                        <PaymentMethodSelect
                          paymentMethod={paymentMethod}
                          setPaymentMethod={setPaymentMethod}
                          disabled={normalCollectLoading}
                        />

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                          <div className="space-y-2 text-xs text-amber-900">
                            <div className="flex justify-between">
                              <span>Installment</span>
                              <span className="font-bold">
                                #{selectedInstallment.installmentNo}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span>EMI Amount</span>
                              <span>
                                ₹
                                {Number(
                                  selectedInstallment.emiAmount || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span>Penalty</span>
                              <span className="text-rose-600 font-semibold">
                                + ₹
                                {Number(
                                  selectedInstallment.penalty || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>

                            <div className="flex justify-between border-t border-amber-200 pt-2 text-sm font-black">
                              <span>Total Collection</span>
                              <span className="text-emerald-700">
                                ₹
                                {Number(
                                  selectedInstallment.totalAmount || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-1">
                          <button
                            onClick={collectEmi}
                            disabled={normalCollectLoading}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-3 font-bold text-sm shadow-md transition"
                          >
                            {normalCollectLoading
                              ? "Collecting..."
                              : "Collect Normal EMI"}
                          </button>

                          <button
                            onClick={closeModal}
                            disabled={normalCollectLoading}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 rounded-xl py-3 font-semibold text-sm transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ================= ADVANCE EMI (NON-FIXED) ================= */}
                {loan.loanType !== "FIXED" && collectionMode === "ADVANCE" && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-700 rounded-lg p-2">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <h3 className="font-bold text-blue-900 text-sm">
                            Advance EMI Collection
                          </h3>
                          <p className="text-xs text-blue-700 mt-1 leading-5">
                            Future installments will be collected individually.
                            Advance installments receive <b>₹0 penalty</b>.
                            Already-paid installments are automatically skipped.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* COUNT */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                        Number of Advance EMIs
                      </label>

                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {[2, 3, 5, 10].map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => handleAdvanceCountChange(count)}
                            disabled={
                              advancePreviewLoading || advanceCollectLoading
                            }
                            className={`py-2.5 rounded-xl border text-sm font-bold transition ${
                              advanceCount === count
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                            }`}
                          >
                            {count}
                          </button>
                        ))}
                      </div>

                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={advanceCount}
                        disabled={
                          advancePreviewLoading || advanceCollectLoading
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setAdvanceCount(value === "" ? "" : Number(value));
                        }}
                        onBlur={() => {
                          const count = Math.max(
                            1,
                            Math.min(100, Number(advanceCount) || 1)
                          );
                          handleAdvanceCountChange(count);
                        }}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Custom number of EMIs"
                      />
                    </div>

                    {/* SUMMARY */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                          EMI Amount
                        </p>
                        <h3 className="text-xl font-black text-slate-900 mt-1">
                          ₹
                          {Number(
                            advancePreview?.emiAmount || loan.emiAmount || 0
                          ).toLocaleString("en-IN")}
                        </h3>
                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="text-[10px] font-bold uppercase text-blue-500 tracking-wider">
                          Advance Total
                        </p>
                        <h3 className="text-xl font-black text-blue-700 mt-1">
                          ₹
                          {Number(
                            advancePreview?.totalAmount ||
                              Number(loan.emiAmount || 0) *
                                Number(advanceCount || 0)
                          ).toLocaleString("en-IN")}
                        </h3>
                      </div>
                    </div>

                    {/* PREVIEW */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-black text-slate-800">
                            Installment Preview
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Each installment is stored separately
                          </p>
                        </div>

                        {advancePreviewLoading && (
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>

                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {!advancePreviewLoading &&
                        advancePreview?.installments?.length > 0 ? (
                          advancePreview.installments.map((item) => (
                            <div
                              key={item.installmentNo}
                              className="px-4 py-3 flex items-center justify-between gap-3"
                            >
                              <div>
                                <p className="text-sm font-bold text-slate-800">
                                  EMI #{item.installmentNo}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {item.dueDate
                                    ? new Date(
                                        item.dueDate
                                      ).toLocaleDateString("en-IN", {
                                        dateStyle: "medium"
                                      })
                                    : item.dueDateString ||
                                      "Future installment"}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-sm font-black text-emerald-700">
                                  ₹
                                  {Number(
                                    item.emiAmount || item.totalAmount || 0
                                  ).toLocaleString("en-IN")}
                                </p>
                                <p className="text-[10px] font-semibold text-emerald-600">
                                  Penalty ₹0
                                </p>
                              </div>
                            </div>
                          ))
                        ) : !advancePreviewLoading ? (
                          <div className="p-5 text-center text-sm text-slate-400">
                            No unpaid future installments available.
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* FINAL SUMMARY */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Requested Advance EMIs</span>
                          <span className="font-bold">
                            {Number(advanceCount || 0)}
                          </span>
                        </div>

                        <div className="flex justify-between text-slate-600">
                          <span>Installments to be created</span>
                          <span className="font-bold">
                            {advancePreview?.installments?.length || 0}
                          </span>
                        </div>

                        <div className="flex justify-between text-slate-600">
                          <span>Penalty</span>
                          <span className="font-bold text-emerald-700">₹0</span>
                        </div>

                        <div className="flex justify-between border-t border-emerald-200 pt-2 text-base font-black text-slate-900">
                          <span>Total Collection</span>
                          <span className="text-emerald-700">
                            ₹
                            {Number(
                              advancePreview?.totalAmount ||
                                Number(loan.emiAmount || 0) *
                                  Number(
                                    advancePreview?.installments?.length || 0
                                  )
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <PaymentMethodSelect
                      paymentMethod={paymentMethod}
                      setPaymentMethod={setPaymentMethod}
                      disabled={advanceCollectLoading}
                    />

                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={collectAdvanceEmi}
                        disabled={
                          advanceCollectLoading ||
                          advancePreviewLoading ||
                          !advancePreview?.installments?.length
                        }
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-3 font-bold text-sm shadow-md transition"
                      >
                        {advanceCollectLoading
                          ? "Collecting Advance..."
                          : "Collect Advance EMI"}
                      </button>

                      <button
                        onClick={closeModal}
                        disabled={advanceCollectLoading}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 rounded-xl py-3 font-semibold text-sm transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* ================= FIXED LOAN - ADVANCE EMI ================= */}
                {loan.loanType === "FIXED" && collectionMode === "ADVANCE" && (
                  <div className="space-y-5">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <h3 className="font-black text-blue-900 text-sm">
                        FIXED Advance EMI
                      </h3>
                      <p className="text-xs text-blue-700 mt-1 leading-5">
                        Collect future monthly interest in advance. Principal is
                        not reduced. Each future month is recorded separately.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                          Current Principal
                        </p>
                        <p className="text-lg font-black mt-1">
                          ₹
                          {Number(
                            loan.outstandingAmount ?? loan.loanAmount ?? 0
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                        <p className="text-[10px] font-bold uppercase text-indigo-500">
                          Interest Rate
                        </p>
                        <p className="text-lg font-black text-indigo-700 mt-1">
                          {Number(loan.interestRate || 0)}%
                        </p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                        <p className="text-[10px] font-bold uppercase text-emerald-600">
                          Monthly Interest
                        </p>
                        <p className="text-lg font-black text-emerald-700 mt-1">
                          ₹
                          {Math.round(
                            (Number(
                              loan.outstandingAmount ?? loan.loanAmount ?? 0
                            ) *
                              Number(loan.interestRate || 0)) /
                              100
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                        Number of Advance EMIs
                      </label>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {[2, 3, 5, 10].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleFixedAdvanceCountChange(c)}
                            disabled={
                              fixedAdvancePreviewLoading ||
                              fixedAdvanceCollecting
                            }
                            className={`py-2.5 rounded-xl border text-sm font-bold ${
                              fixedAdvanceCount === c
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-white border-slate-200 text-slate-600"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={fixedAdvanceCount}
                        disabled={
                          fixedAdvancePreviewLoading || fixedAdvanceCollecting
                        }
                        onChange={(e) =>
                          setFixedAdvanceCount(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        onBlur={() =>
                          handleFixedAdvanceCountChange(fixedAdvanceCount)
                        }
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Custom number of EMIs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                          Installments
                        </p>
                        <p className="text-xl font-black mt-1">
                          {fixedAdvancePreview?.installments?.length || 0}
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="text-[10px] font-bold uppercase text-blue-500">
                          Advance Total
                        </p>
                        <p className="text-xl font-black text-blue-700 mt-1">
                          ₹
                          {Number(
                            fixedAdvancePreview?.totalAmount || 0
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <h3 className="text-sm font-black">
                          Future Interest Preview
                        </h3>
                      </div>
                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {!fixedAdvancePreviewLoading &&
                        fixedAdvancePreview?.installments?.length ? (
                          fixedAdvancePreview.installments.map((item) => (
                            <div
                              key={item.installmentNo}
                              className="px-4 py-3 flex justify-between"
                            >
                              <div>
                                <p className="text-sm font-bold">
                                  EMI #{item.installmentNo}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {item.dueDate
                                    ? new Date(
                                        item.dueDate
                                      ).toLocaleDateString("en-IN", {
                                        dateStyle: "medium"
                                      })
                                    : item.dueDateString || "Future month"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-emerald-700">
                                  ₹
                                  {Number(
                                    item.interestAmount ??
                                      item.totalAmount ??
                                      item.emiAmount ??
                                      0
                                  ).toLocaleString("en-IN")}
                                </p>
                                <p className="text-[10px] text-emerald-600">
                                  Interest only • Penalty ₹0
                                </p>
                              </div>
                            </div>
                          ))
                        ) : !fixedAdvancePreviewLoading ? (
                          <div className="p-5 text-center text-sm text-slate-400">
                            No unpaid future FIXED installments available.
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <div className="flex justify-between text-sm">
                        <span>Total Interest Collection</span>
                        <span className="font-black text-emerald-700">
                          ₹
                          {Number(
                            fixedAdvancePreview?.totalAmount || 0
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs mt-2">
                        <span>Principal Reduction</span>
                        <span className="font-bold">₹0</span>
                      </div>
                    </div>

                    <PaymentMethodSelect
                      paymentMethod={paymentMethod}
                      setPaymentMethod={setPaymentMethod}
                      disabled={fixedAdvanceCollecting}
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={collectFixedAdvanceInterest}
                        disabled={
                          fixedAdvanceCollecting ||
                          fixedAdvancePreviewLoading ||
                          !fixedAdvancePreview?.installments?.length
                        }
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl py-3 font-bold text-sm"
                      >
                        {fixedAdvanceCollecting
                          ? "Collecting Advance..."
                          : "Collect Advance EMI"}
                      </button>
                      <button
                        onClick={closeModal}
                        disabled={fixedAdvanceCollecting}
                        className="flex-1 bg-slate-100 text-slate-600 rounded-xl py-3 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* ================= FIXED LOAN PAYMENT (NORMAL/FIXED_PAYMENT) ================= */}
                {loan.loanType === "FIXED" &&
                  (collectionMode === "NORMAL" ||
                    collectionMode === "FIXED_PAYMENT") && (
                    <div className="space-y-5">
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                        <h3 className="font-black text-indigo-900 text-sm">
                          Fixed Loan Payment
                        </h3>

                        <p className="text-xs text-indigo-700 mt-1">
                          Collect monthly interest only, or collect interest
                          together with principal.
                        </p>
                      </div>

                      {/* CURRENT LOAN SUMMARY */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                          <p className="text-[10px] font-bold uppercase text-slate-400">
                            Current Principal
                          </p>

                          <p className="text-lg font-black text-slate-900 mt-1">
                            ₹
                            {Number(
                              loan.outstandingAmount ?? loan.loanAmount ?? 0
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                          <p className="text-[10px] font-bold uppercase text-indigo-500">
                            Interest Rate
                          </p>

                          <p className="text-lg font-black text-indigo-700 mt-1">
                            {Number(loan.interestRate || 0)}%
                          </p>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                          <p className="text-[10px] font-bold uppercase text-emerald-600">
                            Monthly Interest
                          </p>

                          <p className="text-lg font-black text-emerald-700 mt-1">
                            ₹
                            {Math.round(
                              (Number(
                                loan.outstandingAmount ?? loan.loanAmount ?? 0
                              ) *
                                Number(loan.interestRate || 0)) /
                                100
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      {/* PAYMENT TYPE */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                          Payment Type
                        </label>

                        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl">
                          <button
                            type="button"
                            onClick={() => {
                              setFixedPaymentMode("INTEREST_ONLY");
                              setFixedPrincipalAmount("");
                            }}
                            disabled={fixedCollecting}
                            className={`py-3 rounded-lg text-sm font-bold transition ${
                              fixedPaymentMode === "INTEREST_ONLY"
                                ? "bg-white text-emerald-700 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            Interest Only
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setFixedPaymentMode("INTEREST_PLUS_PRINCIPAL")
                            }
                            disabled={fixedCollecting}
                            className={`py-3 rounded-lg text-sm font-bold transition ${
                              fixedPaymentMode === "INTEREST_PLUS_PRINCIPAL"
                                ? "bg-white text-blue-700 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            Interest + Principal
                          </button>
                        </div>
                      </div>

                      {/* PRINCIPAL INPUT */}
                      {fixedPaymentMode === "INTEREST_PLUS_PRINCIPAL" && (
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                            Principal Amount
                          </label>

                          <input
                            type="number"
                            min="0"
                            max={Number(
                              loan.outstandingAmount ?? loan.loanAmount ?? 0
                            )}
                            value={fixedPrincipalAmount}
                            onChange={(e) =>
                              setFixedPrincipalAmount(e.target.value)
                            }
                            disabled={fixedCollecting}
                            placeholder="Enter principal amount"
                            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />

                          <p className="text-[11px] text-slate-400 mt-1">
                            Maximum: ₹
                            {Number(
                              loan.outstandingAmount ?? loan.loanAmount ?? 0
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      )}

                      {/* COLLECTION SUMMARY */}
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Interest</span>

                            <span className="font-bold">
                              ₹
                              {Math.round(
                                (Number(
                                  loan.outstandingAmount ?? loan.loanAmount ?? 0
                                ) *
                                  Number(loan.interestRate || 0)) /
                                  100
                              ).toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-600">Principal</span>

                            <span className="font-bold">
                              ₹
                              {Number(fixedPrincipalAmount || 0).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between border-t border-emerald-200 pt-2 text-base font-black">
                            <span>Total Collection</span>

                            <span className="text-emerald-700">
                              ₹
                              {(
                                Math.round(
                                  (Number(
                                    loan.outstandingAmount ??
                                      loan.loanAmount ??
                                      0
                                  ) *
                                    Number(loan.interestRate || 0)) /
                                    100
                                ) + Number(fixedPrincipalAmount || 0)
                              ).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* NEXT MONTH PREVIEW */}
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="text-[10px] font-bold uppercase text-blue-500 tracking-wide">
                          Next Month Preview
                        </p>

                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-800">Next Principal</span>

                            <span className="font-black text-blue-900">
                              ₹
                              {Math.max(
                                0,
                                Number(
                                  loan.outstandingAmount ?? loan.loanAmount ?? 0
                                ) - Number(fixedPrincipalAmount || 0)
                              ).toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-blue-800">
                              Next Month Interest
                            </span>

                            <span className="font-black text-blue-900">
                              ₹
                              {Math.round(
                                (Math.max(
                                  0,
                                  Number(
                                    loan.outstandingAmount ??
                                      loan.loanAmount ??
                                      0
                                  ) - Number(fixedPrincipalAmount || 0)
                                ) *
                                  Number(loan.interestRate || 0)) /
                                  100
                              ).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <PaymentMethodSelect
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        disabled={fixedCollecting}
                      />

                      <div className="flex gap-3">
                        <button
                          onClick={collectFixedPayment}
                          disabled={
                            fixedCollecting ||
                            (fixedPaymentMode === "INTEREST_PLUS_PRINCIPAL" &&
                              Number(fixedPrincipalAmount || 0) <= 0)
                          }
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-3 font-bold text-sm shadow-md transition"
                        >
                          {fixedCollecting
                            ? "Collecting..."
                            : "Collect Fixed Payment"}
                        </button>

                        <button
                          onClick={closeModal}
                          disabled={fixedCollecting}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 rounded-xl py-3 font-semibold text-sm transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* ================= GIVE MORE LOAN MODAL ================= */}
        {showMoreLoanModal && loan.loanType === "FIXED" && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              {/* HEADER */}
              <div className="border-b border-slate-100 p-5 flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Give More Loan
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Add additional principal to this FIXED loan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMoreLoanModal(false)}
                  disabled={additionalLoanLoading}
                  className="text-slate-400 hover:text-slate-600 bg-white w-8 h-8 rounded-full border border-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* CURRENT PRINCIPAL */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Current Principal
                    </p>

                    <p className="text-xl font-black text-slate-900 mt-1">
                      ₹
                      {Number(
                        loan.outstandingAmount ?? loan.loanAmount ?? 0
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase text-indigo-500">
                      Interest Rate
                    </p>

                    <p className="text-xl font-black text-indigo-700 mt-1">
                      {Number(loan.interestRate || 0)}%
                    </p>
                  </div>
                </div>

                {/* AMOUNT */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                    Additional Loan Amount
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={additionalLoanAmount}
                    onChange={(e) => setAdditionalLoanAmount(e.target.value)}
                    disabled={additionalLoanLoading}
                    placeholder="Enter amount"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* PREVIEW */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase text-blue-500 tracking-wide">
                    Loan Preview
                  </p>

                  <div className="space-y-2 mt-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Current Principal</span>

                      <span className="font-bold">
                        ₹
                        {Number(
                          loan.outstandingAmount ?? loan.loanAmount ?? 0
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600">Additional Loan</span>

                      <span className="font-bold text-blue-700">
                        + ₹
                        {Number(additionalLoanAmount || 0).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between border-t border-blue-200 pt-2 font-black">
                      <span>New Principal</span>

                      <span className="text-blue-700">
                        ₹
                        {(
                          Number(
                            loan.outstandingAmount ?? loan.loanAmount ?? 0
                          ) + Number(additionalLoanAmount || 0)
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        Next Month Interest
                      </span>

                      <span className="font-black text-indigo-700">
                        ₹
                        {Math.round(
                          ((Number(
                            loan.outstandingAmount ?? loan.loanAmount ?? 0
                          ) +
                            Number(additionalLoanAmount || 0)) *
                            Number(loan.interestRate || 0)) /
                            100
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* WARNING */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800">
                  Additional loan is treated as new principal. It will not be
                  added to the member's total paid/collection.
                </div>

                {/* ACTIONS */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={giveMoreLoan}
                    disabled={
                      additionalLoanLoading ||
                      Number(additionalLoanAmount || 0) <= 0
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-3 font-bold text-sm"
                  >
                    {additionalLoanLoading
                      ? "Processing..."
                      : "Give More Loan"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMoreLoanModal(false)}
                    disabled={additionalLoanLoading}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl py-3 font-semibold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentMethodSelect({
  paymentMethod,
  setPaymentMethod,
  disabled = false
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
        Payment Method
      </label>

      <select
        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-slate-50"
        value={paymentMethod}
        disabled={disabled}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option value="CASH">Cash</option>
        <option value="UPI">UPI</option>
        <option value="BANK">Bank Transfer</option>
      </select>
    </div>
  );
}

// ================= LAYOUT HELPER COMPONENTS =================

function Card({ title, value, icon, variant = "blue" }) {
  const schemes = {
    blue: "bg-blue-50/70 border-blue-100 text-blue-600",
    emerald: "bg-emerald-50/70 border-emerald-100 text-emerald-600",
    amber: "bg-amber-50/70 border-amber-100 text-amber-600",
    purple: "bg-purple-50/70 border-purple-100 text-purple-600",
    indigo: "bg-indigo-50/70 border-indigo-100 text-indigo-600",
    slate: "bg-slate-50/70 border-slate-100 text-slate-600"
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between min-h-[100px]">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {title}
      </p>
      <div className="flex justify-between items-end mt-2">
        <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight truncate max-w-[80%]">
          {value || "-"}
        </h2>
        <div
          className={`p-2 rounded-xl border ${
            schemes[variant] || schemes.blue
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, className = "" }) {
  return (
    <div className={`space-y-0.5 ${className}`}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-800 break-all">
        {value || "-"}
      </p>
    </div>
  );
}

function CheckItem({ label, checked }) {
  return (
    <div className="flex items-center gap-2.5 bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
      {checked ? (
        <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
      ) : (
        <XCircle size={18} className="text-rose-500 flex-shrink-0" />
      )}
      <span
        className={`text-xs font-bold ${
          checked ? "text-emerald-800" : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  let style = "bg-amber-50 border-amber-200 text-amber-700";
  if (status === "ACTIVE")
    style = "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (status === "CLOSED") style = "bg-rose-50 border-rose-200 text-rose-700";

  return (
    <span
      className={`px-2.5 py-1 border rounded-full text-[10px] font-black tracking-wider uppercase shadow-xs ${style}`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

export default LoanDetails;