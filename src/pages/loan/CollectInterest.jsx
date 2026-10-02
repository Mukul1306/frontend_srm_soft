import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiUser, 
  FiDollarSign, 
  FiCheckCircle, 
  FiAlertCircle,
  FiCalendar,
  FiClock,
  FiFileText
} from "react-icons/fi";

const CollectLoanEmi = () => {
  const navigate = useNavigate();
  const { loanId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loan, setLoan] = useState(null);
  const [member, setMember] = useState(null);
  const [pendingEmis, setPendingEmis] = useState([]);
  const [selectedEmi, setSelectedEmi] = useState(null);
  const [history, setHistory] = useState([]);
  
  const [formData, setFormData] = useState({
    paymentMode: "Cash",
    principalPaid: 0,
    remarks: ""
  });

  useEffect(() => {
    if (loanId) {
      loadAllData();
    }
  }, [loanId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchLoan(), fetchPendingEmis(), fetchHistory()]);
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoan = async () => {
    try {
      const res = await axios.get(`https://finance-project-0qqk.onrender.com/api/loans/${loanId}`);
      setLoan(res.data.loan);
      setMember(res.data.loan?.memberId || null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Unable to load loan configuration details.");
    }
  };

  const fetchPendingEmis = async () => {
    try {
      const res = await axios.get(`https://finance-project-0qqk.onrender.com/api/loans/pending-emis/${loanId}`);
      setPendingEmis(res.data.pendingEmis || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`https://finance-project-0qqk.onrender.com/api/loans/payment-history/${loanId}`);
      setHistory(res.data.payments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "principalPaid" ? (value === "" ? "" : Number(value)) : value
    }));
  };

  const handleSelectEmi = (e) => {
    const val = e.target.value;
    if (!val) {
      setSelectedEmi(null);
      return;
    }
    const emi = pendingEmis.find((item) => item.emiNo === Number(val));
    setSelectedEmi(emi || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEmi) {
      return alert("Please select a pending EMI.");
    }

    try {
      setIsSubmitting(true);
      await axios.post(
        "https://finance-project-0qqk.onrender.com/api/loans/collect-emi",
        {
          loanId,
          emiNo: selectedEmi.emiNo,
          month: selectedEmi.month,
          year: selectedEmi.year,
          dueDate: selectedEmi.dueDate,
          interestAmount: selectedEmi.interestAmount,
          penaltyAmount: selectedEmi.penaltyAmount,
          principalPaid: Number(formData.principalPaid) || 0,
          paymentMode: formData.paymentMode,
          remarks: formData.remarks
        }
      );

      alert("EMI Collected Successfully");

      // Reset form and selected state cleanly
      setSelectedEmi(null);
      setFormData({
        paymentMode: "Cash",
        principalPaid: 0,
        remarks: ""
      });

      // Refetch fresh backend values
      await Promise.all([fetchLoan(), fetchPendingEmis(), fetchHistory()]);
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Collection Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-slate-700">Loading Configuration Data...</h1>
        </div>
      </div>
    );
  }

  const principalPaidNum = Number(formData.principalPaid) || 0;
  const totalReceivable = (selectedEmi?.total || 0) + principalPaidNum;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Navigation Row Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-[26px] font-black text-[#0f172a] uppercase tracking-wide">
              Loan EMI Collection
            </h1>
            <p className="text-[#64748b] text-[14px] font-medium mt-1">
              Process monthly incoming member ledger payments with real-time interest computations.
            </p>
          </div>
          <button
            onClick={() => navigate("/loans")}
            className="bg-white border border-[#e2e8f0] hover:bg-slate-50 text-slate-700 font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <FiArrowLeft className="stroke-[2.5]" /> Back to Loans List
          </button>
        </div>

        {/* Master Execution Flex Grid Layout Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT CONTAINER PANELS */}
          <div className="space-y-6">
            
            {/* MEMBER PROFILE METADATA DETAILS */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                  <FiUser className="stroke-[2.5]" />
                </div>
                <h2 className="text-base font-black text-[#0f172a] uppercase tracking-wide">
                  Member Profile
                </h2>
              </div>
              
              <div className="space-y-3 text-sm text-[#475569]">
                <div className="flex justify-between"><span className="text-[#94a3b8] font-medium">Name:</span> <strong className="text-slate-800">{member?.name || "N/A"}</strong></div>
                <div className="flex justify-between"><span className="text-[#94a3b8] font-medium">Member ID:</span> <strong className="text-blue-600 font-bold">{member?.memberId || "N/A"}</strong></div>
                <div className="flex justify-between"><span className="text-[#94a3b8] font-medium">Mobile:</span> <strong className="text-slate-800">{member?.mobile || "N/A"}</strong></div>
                <div className="flex justify-between"><span className="text-[#94a3b8] font-medium">Guardian Relationship:</span> <strong className="text-slate-800">{member?.fatherOrHusbandName || "N/A"}</strong></div>
                <div className="flex justify-between"><span className="text-[#94a3b8] font-medium">Gender:</span> <strong className="text-slate-800">{member?.gender || "N/A"}</strong></div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8] font-medium">Date of Birth:</span> 
                  <strong className="text-slate-800">{member?.dob ? new Date(member.dob).toLocaleDateString("en-IN") : "-"}</strong>
                </div>
                <div className="pt-2 border-t border-slate-50">
                  <span className="text-[#94a3b8] font-medium block mb-1">Registered Address:</span>
                  <p className="text-xs bg-[#f8fafc] border rounded-lg p-2.5 text-slate-600 leading-relaxed">{member?.address || "No address declared."}</p>
                </div>
              </div>
            </div>

            {/* FINANCIAL SUMMARY SPEC SHEET */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                  <FiDollarSign className="stroke-[2.5]" />
                </div>
                <h2 className="text-base font-black text-[#0f172a] uppercase tracking-wide">
                  Loan Matrix Specifications
                </h2>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Principal Allocation</span>
                  <strong className="text-slate-800 font-extrabold text-base">₹{(loan?.principalAmount || 0).toLocaleString('en-IN')}</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Outstanding Principal</span>
                  <strong className="text-red-600 text-base font-black">
                    ₹{(loan?.outstandingPrincipal ?? loan?.principalAmount ?? 0).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Standard EMI Frame</span>
                  <strong className="text-slate-800 font-extrabold">₹{(loan?.monthlyInterest || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Interest Percentage</span>
                  <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-xs">{loan?.interestPerHundred || 0}% / hundred</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Late Penalty Frame</span>
                  <span className="bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded text-xs border border-red-200">{loan?.emiPenaltyPercentage || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Expected Target Due Day</span>
                  <span className="font-extrabold text-slate-700 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded text-xs">Day {loan?.emiDueDay || "-"}</span>
                </div>
                
                <hr className="border-slate-100" />
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5"><FiCheckCircle className="text-emerald-500" /> Cleared Installments</span>
                  <strong className="text-emerald-600 font-black">{loan?.paidEmis || 0} Paid</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5"><FiAlertCircle className="text-red-500" /> Pending Registry Blocks</span>
                  <strong className="text-red-500 font-black">{loan?.pendingEmis || 0} Due</strong>
                </div>
                
                <hr className="border-slate-100" />
                
                <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                  <span>Cumulative Interest Captured</span>
                  <span className="font-bold text-slate-600">₹{(loan?.totalInterestCollected || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                  <span>Penalty Volumes Liquidated</span>
                  <span className="font-bold text-slate-600">₹{(loan?.totalPenaltyCollected || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center bg-blue-50 border border-blue-100 rounded-xl p-3 mt-2">
                  <span className="text-blue-700 font-bold text-xs">Total Collection Aggregated</span>
                  <strong className="text-blue-700 text-base font-black">₹{(loan?.totalAmountCollected || 0).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTAINER PANELS (ACTIONS + HISTORY LISTS) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* INCOMING COLLECTION CAPTURE PORT */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                  <FiClock className="stroke-[2.5]" />
                </div>
                <h2 className="text-base font-black text-[#0f172a] uppercase tracking-wide">
                  Collect Outstanding Balance Block
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase text-[#94a3b8] tracking-wider mb-2">
                    Select Target Installment Wave
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold outline-none focus:border-blue-400 transition-colors appearance-none cursor-pointer"
                      onChange={handleSelectEmi}
                      value={selectedEmi?.emiNo || ""}
                    >
                      <option value="">-- Choose Outstanding Installment Wave --</option>
                      {pendingEmis.map((emi) => (
                        <option key={emi.emiNo} value={emi.emiNo}>
                          Installment Wave #{emi.emiNo} ({emi.month} {emi.year})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* VISUAL BREAKOUT METRICS PACK FROM SELECTED INTERACTION ARRAYS */}
                {selectedEmi && (
                  <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-black text-blue-800 uppercase tracking-wide flex items-center gap-1.5">
                      <FiFileText /> Installment Parameter Profile Details
                    </h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div className="bg-white border rounded-xl p-3">
                        <span className="text-[#94a3b8] font-bold uppercase block text-[10px] tracking-wider">Installment Frame</span>
                        <span className="text-slate-800 font-black text-sm mt-0.5 block">Wave #{selectedEmi.emiNo}</span>
                      </div>
                      <div className="bg-white border rounded-xl p-3">
                        <span className="text-[#94a3b8] font-bold uppercase block text-[10px] tracking-wider">Statement Window</span>
                        <span className="text-slate-800 font-black text-sm mt-0.5 block">{selectedEmi.month} {selectedEmi.year}</span>
                      </div>
                      <div className="bg-white border rounded-xl p-3">
                        <span className="text-[#94a3b8] font-bold uppercase block text-[10px] tracking-wider">Target Statement Bound</span>
                        <span className="text-slate-800 font-bold text-sm mt-0.5 block">
                          {selectedEmi.dueDate ? new Date(selectedEmi.dueDate).toLocaleDateString("en-IN") : "N/A"}
                        </span>
                      </div>
                      <div className="bg-white border rounded-xl p-3">
                        <span className="text-[#94a3b8] font-bold uppercase block text-[10px] tracking-wider">Delay Outlier Span</span>
                        <span className="text-red-500 font-black text-sm mt-0.5 block">{selectedEmi.delayMonths || 0} Month(s)</span>
                      </div>
                      <div className="bg-white border rounded-xl p-3">
                        <span className="text-[#94a3b8] font-bold uppercase block text-[10px] tracking-wider">Interest Base Split</span>
                        <span className="text-emerald-600 font-black text-sm mt-0.5 block">₹{(selectedEmi.interestAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-white border rounded-xl p-3">
                        <span className="text-[#94a3b8] font-bold uppercase block text-[10px] tracking-wider">Penalty Offset Addon</span>
                        <span className="text-red-600 font-black text-sm mt-0.5 block">₹{(selectedEmi.penaltyAmount || 0).toLocaleString('en-IN')}</span>
                      </div>

                      <div className="bg-white border rounded-xl p-3">
                        <span className="text-[#94a3b8] font-bold uppercase block text-[10px] tracking-wider">
                          Principal Payment
                        </span>
                        <span className="text-green-600 font-black text-sm mt-0.5 block">
                          ₹{principalPaidNum.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="bg-emerald-600 rounded-xl p-4 text-white flex justify-between items-center shadow-sm">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider opacity-80 block">Aggregated Collection Liability</span>
                        <h1 className="text-3xl font-black mt-0.5">
                          ₹{totalReceivable.toLocaleString("en-IN")}
                        </h1>
                      </div>
                      <span className="bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase">Gross Receivable</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                    Principal Amount (Optional)
                  </label>
                  <input
                    type="number"
                    name="principalPaid"
                    min="0"
                    max={loan?.outstandingPrincipal || loan?.principalAmount || 0}
                    value={formData.principalPaid}
                    onChange={handleChange}
                    placeholder="Enter Principal Amount"
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400 transition-colors"
                  />
                </div>

                {/* INSTRUMENT TRANSACTION ROUTE PAYMENT MODE */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-black uppercase text-[#94a3b8] tracking-wider mb-2">
                      Transaction Channel Route
                    </label>
                    <select
                      name="paymentMode"
                      value={formData.paymentMode}
                      onChange={handleChange}
                      className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold outline-none focus:border-blue-400 transition-colors cursor-pointer"
                    >
                      <option value="Cash">Cash Liquidity</option>
                      <option value="UPI">UPI Digital Payment</option>
                      <option value="Bank">Bank IMPS/NEFT Route</option>
                      <option value="Cheque">Physical Cheque Instrument</option>
                    </select>
                  </div>

                  {/* FORM REMARKS METADATA FIELD CONTAINER */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase text-[#94a3b8] tracking-wider mb-2">
                      Auditor Ledger Remarks
                    </label>
                    <input
                      type="text"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      placeholder="Add specific notes, payment reference codes, receipts tokens..."
                      className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>

                {/* FORM EXECUTION BUTTON FOOTER TRACK BAR BLOCK */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => navigate("/loans")}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedEmi || isSubmitting}
                    className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-sm text-white ${
                      selectedEmi && !isSubmitting
                        ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        : "bg-slate-300 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? "Committing..." : "Commit EMI Collection"}
                  </button>
                </div>
              </form>
            </div>

            {/* TRANSACTION RECORD LEDGER COLLECTION HISTORY */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center text-lg">
                  <FiCalendar className="stroke-[2.5]" />
                </div>
                <h2 className="text-base font-black text-[#0f172a] uppercase tracking-wide">
                  Historical Cleared Statements
                </h2>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12 bg-[#f8fafc] rounded-2xl border border-dashed border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">No Cleared Ledger Logs Found</h3>
                  <p className="text-xs text-[#94a3b8] mt-1">Incoming settlement records for this member will show up here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-slate-100 text-[#94a3b8] font-bold uppercase tracking-wider">
                        <th className="p-3.5">Wave</th>
                        <th className="p-3.5">Period Window</th>
                        <th className="p-3.5">Interest Split</th>
                        <th className="p-3.5">Penalty Addons</th>
                        <th className="p-3.5">Settled Amount</th>
                        <th className="p-3.5">Route</th>
                        <th className="p-3.5">Processed Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                      {history.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-blue-600">#{item.emiNo}</td>
                          <td className="p-3.5 text-slate-900 font-semibold">{item.month} {item.year}</td>
                          <td className="p-3.5">₹{(item.interestAmount || 0).toLocaleString('en-IN')}</td>
                          <td className="p-3.5 text-red-500 font-semibold">₹{(item.penaltyAmount || 0).toLocaleString('en-IN')}</td>
                          <td className="p-3.5 text-emerald-600 font-extrabold text-sm">₹{(item.totalReceived || 0).toLocaleString('en-IN')}</td>
                          <td className="p-3.5">
                            <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                              {item.paymentMode}
                            </span>
                          </td>
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

export default CollectLoanEmi;