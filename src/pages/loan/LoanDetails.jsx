import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiArrowLeft, 
  FiUser, 
  FiDollarSign, 
  FiActivity, 
  FiLock, 
  FiCalendar, 
  FiPrinter, 
  FiCheckCircle, 
  FiFileText
} from "react-icons/fi";

const LoanDetails = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();

  const [loan, setLoan] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLoan();
    fetchHistory();
  }, [loanId]);

  const fetchLoan = async () => {
    try {
      const res = await axios.get(`https://finance-project-0qqk.onrender.com/api/loans/${loanId}`);
      setLoan(res.data.loan);
    } catch (error) {
      console.error("Error retrieving loan parameters:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`https://finance-project-0qqk.onrender.com/api/loans/payment-history/${loanId}`);
      setHistory(res.data.payments || []);
    } catch (error) {
      console.error("Error retrieving payment history logs:", error);
    }
  };

  const closeLoan = async () => {
    const confirmClose = window.confirm("Are you sure you want to finalize and close this loan account?");
    if (!confirmClose) return;

    try {
      setIsSubmitting(true);
      await axios.put(`https://finance-project-0qqk.onrender.com/api/loans/close/${loanId}`);
      alert("Loan Closed Successfully");
      fetchLoan();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to close loan balance portfolio.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe helper to calculate Next Month Date without inline mutation
  const getFirstEmiDate = (givenDate) => {
    if (!givenDate) return "-";
    const date = new Date(givenDate);
    if (isNaN(date.getTime())) return "-";
    date.setMonth(date.getMonth() + 1);
    return date.toLocaleDateString("en-IN");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-slate-700">Loading Dashboard Metrics...</h2>
        </div>
      </div>
    );
  }

  const paid = loan?.paidEmis || 0;
  const total = loan?.totalEmis || 1;
  const progressPercentage = Math.min(Math.max((paid / total) * 100, 0), 100);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP CONTROLS NAVIGATION HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate("/loans")}
              className="text-blue-600 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 mb-2 group cursor-pointer"
            >
              <FiArrowLeft className="transition-transform group-hover:-translate-x-1" /> Back To Loans Matrix
            </button>
            <h1 className="text-2xl sm:text-[26px] font-black text-[#0f172a] uppercase tracking-wide">
              Portfolio Overview
            </h1>
            <p className="text-[#64748b] text-xs sm:text-sm font-medium mt-1">
              Deep dive summary of audit controls, statement lifecycles, and user ledgers.
            </p>
          </div>
          
          {loan?.status === "ACTIVE" && (
            <button
              onClick={closeLoan}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
            >
              {isSubmitting ? "Processing Settlement..." : "Terminate Position"}
            </button>
          )}
        </div>

        {/* TOP LEVEL SUMMARY METRIC HIGHLIGHT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-6 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Allocated Principal</p>
              <h2 className="text-2xl font-black text-slate-900 mt-1">₹{(loan?.principalAmount || 0).toLocaleString("en-IN")}</h2>
            </div>
            <div className="w-10 h-10 bg-slate-50 border rounded-xl text-slate-500 flex items-center justify-center text-lg"><FiDollarSign /></div>
          </div>

          <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-6 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Base monthly emi</p>
              <h2 className="text-2xl font-black text-blue-600 mt-1">₹{(loan?.monthlyInterest || 0).toLocaleString("en-IN")}</h2>
            </div>
            <div className="w-10 h-10 bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-lg"><FiActivity /></div>
          </div>

          <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-6 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Aggregated Collections</p>
              <h2 className="text-2xl font-black text-emerald-600 mt-1">₹{(loan?.totalAmountCollected || 0).toLocaleString("en-IN")}</h2>
            </div>
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-lg"><FiCheckCircle /></div>
          </div>

          <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-6 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Outstanding Arrears</p>
              <h2 className="text-2xl font-black text-rose-600 mt-1">{loan?.pendingEmis || 0} Waves</h2>
            </div>
            <div className="w-10 h-10 bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center text-lg"><FiLock /></div>
          </div>
        </div>

        {/* SYSTEM FLEX DUAL GRID LAYOUT STRUCTURE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT PANELS */}
          <div className="space-y-6">
            
            {/* BORROWER METADATA PROFILE SHEET */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg"><FiUser className="stroke-[2.5]" /></div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">Borrower Profile</h2>
              </div>
              
              <div className="space-y-3.5 text-xs text-slate-600 font-medium">
                <div className="flex justify-between"><span className="text-slate-400">Account Name</span> <strong className="text-slate-900 font-bold">{loan?.memberId?.name || "N/A"}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Guardian Name</span> <strong className="text-slate-900 font-semibold">{loan?.memberId?.fatherOrHusbandName || "N/A"}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Primary Mobile</span> <strong className="text-slate-900 font-semibold">{loan?.memberId?.mobile || "N/A"}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Gender Mapping</span> <strong className="text-slate-900 font-semibold">{loan?.memberId?.gender || "N/A"}</strong></div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date of Birth</span> 
                  <strong className="text-slate-900 font-semibold">{loan?.memberId?.dob ? new Date(loan.memberId.dob).toLocaleDateString("en-IN") : "-"}</strong>
                </div>
                <div className="pt-2 border-t border-slate-50">
                  <span className="text-slate-400 block mb-1">Declared Demographics</span>
                  <p className="bg-[#f8fafc] border rounded-lg p-2.5 text-slate-600 text-[11px] leading-relaxed font-semibold">{loan?.memberId?.address || "No address on file."}</p>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-50"><span className="text-slate-400 font-bold">Society Node</span> <strong className="text-[#1e60ff] font-extrabold">{loan?.societyId?.societyName || "N/A"}</strong></div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400 font-bold">State Validation</span> 
                  <span className={`px-2 py-0.5 border text-[10px] font-black rounded uppercase tracking-wider ${loan?.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {loan?.status || "UNKNOWN"}
                  </span>
                </div>
              </div>
            </div>

            {/* COLLECTION PERFORMANCE SUMMARY */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg"><FiCheckCircle className="stroke-[2.5]" /></div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">Collection Ledger</h2>
              </div>
              
              <div className="space-y-3.5 text-xs text-slate-600 font-medium">
                <div className="flex justify-between"><span>Aggregated Basic Interest</span> <strong className="text-slate-900">₹{(loan?.totalInterestCollected || 0).toLocaleString("en-IN")}</strong></div>
                <div className="flex justify-between"><span>Compounded Penalty Vault</span> <strong className="text-rose-600">₹{(loan?.totalPenaltyCollected || 0).toLocaleString("en-IN")}</strong></div>
                <div className="flex justify-between bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 font-bold items-center">
                  <span>Gross Funds Collected</span> <strong className="text-base font-black">₹{(loan?.totalAmountCollected || 0).toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-50"><span>Processed Instalments</span> <strong className="text-emerald-600 font-black">{loan?.paidEmis || 0} Cleared</strong></div>
                <div className="flex justify-between"><span>Outstanding Open Blocks</span> <strong className="text-rose-500 font-black">{loan?.pendingEmis || 0} Due</strong></div>
              </div>
            </div>
          </div>

          {/* RIGHT PANELS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* SYSTEM PARAMETER TERMS */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-6">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                <FiFileText /> System Parameter Terms
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-xs font-medium text-slate-600">
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-3">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Principal Value</span>
                  <strong className="text-slate-900 text-base font-black mt-1 block">₹{(loan?.principalAmount || 0).toLocaleString("en-IN")}</strong>
                </div>
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-3">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Monthly Base Yield</span>
                  <strong className="text-[#1e60ff] text-base font-black mt-1 block">₹{(loan?.monthlyInterest || 0).toLocaleString("en-IN")}</strong>
                </div>
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-3">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Interest Rate Frame</span>
                  <strong className="text-slate-900 text-sm font-extrabold mt-1.5 block">{loan?.interestPerHundred || 0}% / ₹100</strong>
                </div>
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-3">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Late Penalty Rule</span>
                  <strong className="text-rose-600 text-sm font-extrabold mt-1.5 block">{loan?.emiPenaltyPercentage || 0}% / Cycle</strong>
                </div>
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-3">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Target Monthly Due Day</span>
                  <strong className="text-amber-700 bg-amber-50 border border-amber-100 rounded font-black px-1.5 py-0.5 mt-1.5 inline-block">Day {loan?.emiDueDay || "-"}</strong>
                </div>
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-3">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Initiation Timestamp</span>
                  <strong className="text-slate-900 text-xs font-bold mt-1.5 block">{loan?.loanGivenDate ? new Date(loan.loanGivenDate).toLocaleDateString("en-IN") : "N/A"}</strong>
                </div>
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-3">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">First EMI Date</span>
                  <strong className="text-emerald-600 text-xs font-bold mt-1.5 block">{getFirstEmiDate(loan?.loanGivenDate)}</strong>
                </div>
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-3">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Maturity Deadline</span>
                  <strong className="text-rose-600 text-xs font-bold mt-1.5 block">{loan?.loanEndDate ? new Date(loan.loanEndDate).toLocaleDateString("en-IN") : "N/A"}</strong>
                </div>
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-3">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Last Clearing Transaction</span>
                  <strong className="text-slate-900 text-xs font-bold mt-1.5 block">{loan?.lastEmiDate ? new Date(loan.lastEmiDate).toLocaleDateString("en-IN") : "--"}</strong>
                </div>
              </div>
            </div>

            {/* PROGRESS VISUAL BAR */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-6">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide mb-5 flex items-center gap-2">
                <FiActivity /> Volumetric Amortization Progress
              </h2>
              
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-slate-500">Cleared Balance Cycle</span>
                  <span className="text-emerald-600 font-black">{loan?.paidEmis || 0} Open Loops Liquidated</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>{progressPercentage.toFixed(0)}% Closed</span>
                  <span className="text-rose-500">{loan?.pendingEmis || 0} Open Arrears Blocked</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3">
                  <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Capital Allocated</p>
                  <h3 className="font-black text-[#1e60ff] text-sm mt-0.5">₹{(loan?.principalAmount || 0).toLocaleString("en-IN")}</h3>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3">
                  <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Yield Captured</p>
                  <h3 className="font-black text-emerald-700 text-sm mt-0.5">₹{(loan?.totalInterestCollected || 0).toLocaleString("en-IN")}</h3>
                </div>
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-3">
                  <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Overdue Penalty</p>
                  <h3 className="font-black text-rose-600 text-sm mt-0.5">₹{(loan?.totalPenaltyCollected || 0).toLocaleString("en-IN")}</h3>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3">
                  <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Gross Aggregate</p>
                  <h3 className="font-black text-amber-800 text-sm mt-0.5">₹{(loan?.totalAmountCollected || 0).toLocaleString("en-IN")}</h3>
                </div>
              </div>
            </div>

            {/* OPERATIONS HUB TERMINAL */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-6">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide mb-4">Operations Hub Terminal</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => navigate(`/collect-interest/${loan?._id}`)}
                  className="bg-[#1e60ff] hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Collect Live EMI
                </button>
                <button
                  onClick={closeLoan}
                  disabled={loan?.status === "CLOSED" || isSubmitting}
                  className={`font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-xs ${
                    loan?.status === "ACTIVE" ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer" : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  }`}
                >
                  {loan?.status === "ACTIVE" ? "Terminate Position" : "Account Archived"}
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-white border border-[#e2e8f0] hover:bg-slate-50 text-slate-700 font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FiPrinter /> Print Audit Log
                </button>
              </div>
            </div>

            {/* TRANSACTION LOGS TABLE */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-6">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide mb-5 flex items-center gap-2">
                <FiCalendar /> Historical Settlement Records
              </h2>
              
              {history.length === 0 ? (
                <div className="text-center py-12 bg-[#f8fafc] rounded-2xl border border-dashed border-slate-200">
                  <div className="text-3xl mb-2 text-slate-300">📦</div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">No Transactions Recorded</h3>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">Incoming ledger updates will manifest on this grid interface instantly.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="p-3.5">Wave</th>
                        <th className="p-3.5">Statement Frame</th>
                        <th className="p-3.5">Yield Interest</th>
                        <th className="p-3.5">Late Fees</th>
                        <th className="p-3.5">Aggregated Net</th>
                        <th className="p-3.5">Route</th>
                        <th className="p-3.5">Auditor Remarks</th>
                        <th className="p-3.5">Executed On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                      {history.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5 font-bold text-blue-600">#{item.emiNo}</td>
                          <td className="p-3.5 text-slate-900 font-bold">{item.month} {item.year}</td>
                          <td className="p-3.5">₹{(item.interestAmount || 0).toLocaleString("en-IN")}</td>
                          <td className="p-3.5 text-rose-500 font-bold">₹{(item.penaltyAmount || 0).toLocaleString("en-IN")}</td>
                          <td className="p-3.5 text-emerald-600 font-extrabold text-sm">₹{(item.totalReceived || 0).toLocaleString("en-IN")}</td>
                          <td className="p-3.5">
                            <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
                              {item.paymentMode}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-400 max-w-[140px] truncate">{item.remarks || "--"}</td>
                          <td className="p-3.5 text-slate-400">
                            {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString("en-IN") : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default LoanDetails;