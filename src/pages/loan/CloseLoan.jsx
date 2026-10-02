import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CloseLoan = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loan, setLoan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLoan();
    fetchSummary();
  }, [loanId]);

  const fetchLoan = async () => {
    try {
      const res = await axios.get(`https://finance-project-0qqk.onrender.com/api/loans/${loanId}`);
      setLoan(res.data.loan);
    } catch (error) {
      console.error("Error pulling loan node data structures:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`https://finance-project-0qqk.onrender.com/api/interest/pending/${loanId}`);
      setSummary(res.data);
    } catch (error) {
      console.error("Error compiling ledger indices summary streams:", error);
    }
  };

  const handleClose = async () => {
    const confirmClose = window.confirm("Are you sure you want to initialize complete settlement closure for this loan record?");
    if (!confirmClose) return;

    setIsSubmitting(true);
    try {
      const res = await axios.put(`https://finance-project-0qqk.onrender.com/api/loans/close/${loanId}`);
      
      alert(`Loan Closed Successfully\n\nFinal Closure Settled Amount:\n₹${res.data.closureAmount?.toLocaleString("en-IN")}`);
      
      navigate("/loans");
    } catch (error) {
      alert(error.response?.data?.message || "Operational transactional database execution error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!loan || !summary) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-slate-400 font-medium text-xs">
        <svg className="animate-spin h-6 w-6 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Compiling Balance Settlement Metrics...
      </div>
    );
  }

  // Pure reactive calculation layout 
  const closureAmount = summary.principalAmount + Math.max(summary.pendingInterest, 0);

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans flex flex-col items-center justify-center">
      
      {/* Centralized Card Layout Core Container */}
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Card Branding Alert Strip */}
        <div className="bg-rose-50 border-b border-rose-100/60 p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            ⚠️
          </div>
          <div>
            <h3 className="text-rose-900 font-black text-xs uppercase tracking-tight">Account Settlement Request</h3>
            <p className="text-[10px] text-rose-600 font-medium mt-0.5">This utility performs definitive irreversible asset clearance operations.</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Member Meta Information Block */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-50">
            <div className="w-9 h-9 bg-slate-100 text-slate-700 font-black text-[11px] flex items-center justify-center rounded-full">
              {(loan.memberId?.name || "N A").split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Borrower Account Profile</p>
              <h2 className="font-bold text-slate-800 text-sm mt-0.5">{loan.memberId?.name}</h2>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Ref Key ID: {loan._id?.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          {/* Financial Breakdown Grid Columns */}
          <div className="space-y-3.5 text-xs">
            
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Principal Outstanding Liability:</span>
              <span className="font-black text-slate-800">₹{summary.principalAmount?.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Accumulated Uncollected Arrears:</span>
              <span className="font-bold text-amber-600">₹{summary.pendingInterest?.toLocaleString("en-IN")}</span>
            </div>

            <div className="border-t border-dashed border-slate-100 pt-4 mt-2">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Net Settlement Cap</span>
                  <span className="text-[9px] text-slate-400 font-medium block mt-0.5">(Principal + Pending Interest Dues)</span>
                </div>
                <span className="text-lg font-black text-slate-900 tracking-tight">
                  ₹{closureAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

          </div>

          {/* User Confirmation Interface Options Buttons */}
          <div className="pt-2 flex gap-3 text-[11px]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => navigate("/loans")}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition"
            >
              Abort Dismissal
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleClose}
              className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold py-3 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Settling Ledger...
                </>
              ) : "Terminate & Close Asset"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CloseLoan;