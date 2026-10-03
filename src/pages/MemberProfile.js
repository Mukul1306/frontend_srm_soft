import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiBriefcase,
  FiDollarSign,
  FiAward,
  FiShield,
  FiCreditCard,
  FiChevronLeft
} from "react-icons/fi";

function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate(); // Added for uniform back navigation if needed
  const [member, setMember] = useState(null);
const [payments, setPayments] = useState([]);
const [payingSettlement, setPayingSettlement] = useState(false);

useEffect(() => {
  fetchMember();
  // eslint-disable-next-line
}, []);

  const fetchMember = async () => {

  try {

    console.log("Member ID:", id);

    // Member Details
    const res = await axios.get(
      `https://finance-project-0qqk.onrender.com/api/member/${id}`
    );

    setMember(res.data.member);

    // Payment History
 const paymentRes = await axios.get(
  `https://finance-project-0qqk.onrender.com/api/member/${id}/history`
);

    setPayments(paymentRes.data.payments || []);

  } catch (error) {

    console.log("API Error:", error);

  }

};
  
const handlePaySettlement = async () => {
  if (!member?.settlementAmount || Number(member.settlementAmount) <= 0) {
    alert("Settlement amount is not available.");
    return;
  }

  if (
    Number(member.paidInstallments || 0) <
    Number(member.totalInstallments || 0)
  ) {
    alert("All installments must be completed before settlement.");
    return;
  }

  const confirmed = window.confirm(
    `Pay settlement of ₹${Number(member.settlementAmount).toLocaleString("en-IN")} to ${member.name}?`
  );

  if (!confirmed) return;

  try {
    setPayingSettlement(true);

    const res = await axios.post(
      `https://finance-project-0qqk.onrender.com/api/member/${id}/settle`,
      {
        paymentMethod: "Cash"
      }
    );

    alert(res.data.message || "Settlement paid successfully.");

    // Reload member so status/date are updated
    await fetchMember();

  } catch (error) {
    alert(
      error.response?.data?.message ||
      "Failed to pay settlement."
    );
  } finally {
    setPayingSettlement(false);
  }
};
  // Helper mapping to calculate custom ledger status pill style
  const getStatusBadgeStyle = (status) => {
    const s = (status || "PAID").toUpperCase();
    if (s === "OVERDUE" || s === "UNPAID") {
      return "bg-red-50 text-red-600 border border-red-200";
    }
    if (s === "LATE") {
      return "bg-amber-50 text-amber-600 border border-amber-200";
    }
    return "bg-emerald-50 text-emerald-600 border border-emerald-200";
  };

  // Extract initials for the profile card layout
  const getInitials = (name) => {
    if (!name) return "MB";
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-sm font-black text-[#64748b] uppercase tracking-wider">
            Loading Member Registry...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* Dynamic Navigation Action Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-xs font-bold text-[#64748b] hover:text-[#1e60ff] transition-all bg-white border border-[#e2e8f0] px-4 py-2 rounded-xl shadow-sm"
        >
          <FiChevronLeft className="text-sm stroke-[3]" /> Back to Members
        </button>
      </div>

      {/* Corporate Identity Profile Header Block */}
      <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#eff6ff] text-[#1e60ff] font-black text-xl flex items-center justify-center border border-[#d0e1ff] shadow-sm">
            {getInitials(member.name)}
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
              {member.name}
            </h1>
            <p className="text-xs text-[#94a3b8] font-semibold mt-1 uppercase tracking-wider">
              System ID: <span className="font-mono text-[#475569]">{id}</span>
            </p>
          </div>
        </div>

        <div>
          <span className={`text-xs font-black uppercase px-4 py-1.5 rounded-lg tracking-wider ${getStatusBadgeStyle(member.status)}`}>
            {member.status || "PAID"}
          </span>
        </div>
      </div>

      {/* Grid Allocation Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Section 1: Personal Details */}
        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 mb-5 border-b border-[#f1f5f9]">
            <div className="p-2 bg-blue-50 text-[#1e60ff] rounded-lg">
              <FiUser className="text-lg stroke-[2.5]" />
            </div>
            <h2 className="text-sm font-black text-[#0f172a] uppercase tracking-wide">
              Personal Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
<div>
  <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">
    Member ID
  </span>

  <span className="text-sm font-black text-blue-600">
    {member.memberId || "N/A"}
  </span>
</div>

            <div>
              <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">Full Name</span>
              <span className="text-sm font-bold text-[#334155]">{member.name}</span>
            </div>
            <div>
              <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">Father / Husband</span>
              <span className="text-sm font-bold text-[#334155]">{member.fatherOrHusbandName || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">Mobile Contact</span>
                <span className="text-sm font-bold text-[#334155] flex items-center gap-1">
                  <FiPhone className="text-[#94a3b8]" /> {member.mobile || "N/A"}
                </span>
              </div>

             
            </div>
            <div>
              <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">Gender Group</span>
              <span className="text-sm font-bold text-[#334155] uppercase tracking-wide">{member.gender || "N/A"}</span>
            </div>
            <div>
              <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">Date of Birth</span>
              <span className="text-sm font-bold text-[#334155] flex items-center gap-1">
                <FiCalendar className="text-[#94a3b8]" /> {member.dob ? new Date(member.dob).toLocaleDateString("en-IN"): "N/A"}
              </span>
            </div>

             <div>
  <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">
    Gmail ID
  </span>

  <span className="text-sm font-bold text-[#334155]">
    {member.email || "N/A"}
  </span>
</div>

<div>
  <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">
    Alternative Mobile
  </span>

  <span className="text-sm font-bold text-[#334155]">
    {member.alternateMobile || "N/A"}
  </span>
</div>

            <div>
              <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">Identity verification</span>
              <span className="text-sm font-bold text-[#334155] font-mono tracking-wide">
                {member.aadhaarNumber || "N/A"}
              </span>
            </div>
            <div className="sm:col-span-2">
  <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">
    Full Address
  </span>

  <span className="text-sm font-bold text-[#334155]">
    {member.address}
  </span>
</div>

<div>
  <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">
    PIN Code
  </span>

  <span className="text-sm font-bold text-[#334155]">
    {member.pinCode}
  </span>
</div>

<div>
  <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">
    City / Village
  </span>

  <span className="text-sm font-bold text-[#334155]">
    {member.city}
  </span>
</div>

<div>
  <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">
    District
  </span>

  <span className="text-sm font-bold text-[#334155]">
    {member.district}
  </span>
</div>

<div>
  <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">
    State
  </span>

  <span className="text-sm font-bold text-[#334155]">
    {member.state}
  </span>
</div>
          </div>
        </div>

        {/* Section 2: Nominee Particulars */}
        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 mb-5 border-b border-[#f1f5f9]">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <FiShield className="text-lg stroke-[2.5]" />
              </div>
              <h2 className="text-sm font-black text-[#0f172a] uppercase tracking-wide">
                Nominee Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">Nominee Name</span>
                <span className="text-sm font-bold text-[#334155]">{member.nomineeName || "N/A"}</span>
              </div>
              <div>
                <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">Nominee Mobile</span>
                <span className="text-sm font-bold text-[#334155] flex items-center gap-1">
                  <FiPhone className="text-[#94a3b8]" /> {member.nomineeMobile || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Graphical design layout filler matching high fidelity structure metrics */}
          <div className="bg-[#f8fafc] border border-[#f1f5f9] p-4 rounded-2xl mt-6 text-center text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">
            Nominee Assigned Asset Allocation Account Secured
          </div>
        </div>

        {/* Section 3: Society Profile Allocations */}
        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 mb-5 border-b border-[#f1f5f9]">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <FiBriefcase className="text-lg stroke-[2.5]" />
            </div>
            <h2 className="text-sm font-black text-[#0f172a] uppercase tracking-wide">
              Society Operations Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
            <div>
              <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">Assigned Society</span>
              <span className="text-sm font-black text-[#1e60ff] bg-[#eff6ff] border border-[#d0e1ff] px-2.5 py-1 rounded-md inline-block mt-0.5">
                {member.societyId?.societyName || "Not Assigned"}
              </span>
            </div>
            <div>
              <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">Pool Duration</span>
              <span className="text-sm font-bold text-[#334155]">
                {member.societyId?.durationMonths || 0} <span className="text-xs font-semibold text-[#94a3b8]">Months</span>
              </span>
            </div>
            <div>
              <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">Joining Date</span>
              <span className="text-sm font-bold text-[#334155] flex items-center gap-1">
                <FiCalendar className="text-[#94a3b8]" /> {member.joiningDate ? new Date(member.joiningDate).toLocaleDateString("en-IN"): "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">Operational End Date</span>
              <span className="text-sm font-bold text-[#334155] flex items-center gap-1">
                <FiCalendar className="text-[#94a3b8]" /> {member.memberEndDate ? new Date(member.memberEndDate).toLocaleDateString("en-IN") : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">Monthly Due Cycle Day</span>
              <span className="text-sm font-black text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded inline-block">
                Day {member.dueDay || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Advanced Finance Accounting Ledger */}
        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 mb-5 border-b border-[#f1f5f9]">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <FiDollarSign className="text-lg stroke-[2.5]" />
            </div>
            <h2 className="text-sm font-black text-[#0f172a] uppercase tracking-wide">
              Finance & Ledger Breakdown
            </h2>
          </div>

          {/* Top Line Sub Financial Items */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-[#f8fafc] border border-[#f1f5f9] rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-wider block mb-1">Monthly EMI</span>
              <span className="text-sm font-black text-[#1e293b]">₹{member.monthlyInstallment || 0}</span>
            </div>
            <div className="bg-[#f8fafc] border border-[#f1f5f9] rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block mb-1">Paid Terms</span>
              <span className="text-sm font-black text-emerald-600">{member.paidInstallments || 0}/{member.totalInstallments || 0}</span>
            </div>
            <div className="bg-[#f8fafc] border border-[#f1f5f9] rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-wider block mb-1">Pending Terms</span>
              <span className="text-sm font-black text-red-500">{member.pendingInstallments || 0}</span>
            </div>
          </div>

          {/* Core Balance Lists */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl border border-[#f1f5f9] bg-[#f8fafc]/50">
              <span className="text-[#64748b] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <FiCreditCard className="text-[#94a3b8]" /> Total Collected Capital
              </span>
              <span className="text-sm font-black text-emerald-600">
                ₹{member.totalPaid ? member.totalPaid.toLocaleString('en-IN') : "0"}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl border border-[#f1f5f9] bg-[#f8fafc]/50">
              <span className="text-[#64748b] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <FiDollarSign className="text-[#94a3b8]" /> Outstanding Balance
              </span>
              <span className={`text-sm font-black ${member.pendingAmount > 0 ? "text-red-500" : "text-[#475569]"}`}>
                ₹{member.pendingAmount ? member.pendingAmount.toLocaleString('en-IN') : "0"}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl border border-[#f1f5f9] bg-[#f8fafc]/50">
              <span className="text-[#64748b] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <FiAward className="text-[#94a3b8]" /> Accumulated Penalty
              </span>
              <span className={`text-sm font-black ${member.currentPenalty > 0 ? "text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded" : "text-[#475569]"}`}>
                ₹{member.currentPenalty || "0"}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl border border-[#f1f5f9] bg-[#f8fafc]/50">
  <span className="text-[#64748b] font-bold uppercase tracking-wider">
    Monthly Penalty
  </span>

  <span className="text-sm font-black text-orange-600">
    ₹{member.monthlyPenalty || 0}
  </span>
</div>


<div className="flex justify-between items-center p-2.5 rounded-xl border border-[#f1f5f9] bg-[#f8fafc]/50">
  <span className="text-[#64748b] font-bold uppercase tracking-wider">
    Settlement Amount
  </span>

  <span className="text-sm font-black text-blue-600">
    ₹{member.settlementAmount
      ? Number(member.settlementAmount).toLocaleString("en-IN")
      : "0"}
  </span>
</div>

{Number(member.paidInstallments || 0) >= Number(member.totalInstallments || 0) && (
  <div className="mt-4 p-4 rounded-xl border border-blue-100 bg-blue-50/50">

    <div className="flex items-center justify-between gap-4">

      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Settlement Status
        </p>

        <p
          className={`text-sm font-black mt-1 ${
            member.settlementStatus === "PAID"
              ? "text-emerald-600"
              : "text-amber-600"
          }`}
        >
          {member.settlementStatus === "PAID"
            ? "PAID"
            : "PENDING"}
        </p>

        {member.settlementDate && (
          <p className="text-xs text-slate-400 mt-1">
            Paid on{" "}
            {new Date(member.settlementDate).toLocaleDateString("en-IN")}
          </p>
        )}
      </div>

      {member.settlementStatus !== "PAID" && (
        <button
          type="button"
          onClick={handlePaySettlement}
          disabled={payingSettlement}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition disabled:opacity-50"
        >
          {payingSettlement
            ? "Processing..."
            : `Pay ₹${Number(member.settlementAmount || 0).toLocaleString("en-IN")}`}
        </button>
      )}

    </div>
  </div>
)}

          </div>
        </div>




      </div>



      <div className="bg-white rounded-3xl border p-6 mt-8">

  <h2 className="text-2xl font-black mb-6">
    Payment History
  </h2>

  {

    payments.length === 0 ?

    (

      <div className="text-center text-slate-500 py-10">

        No Payment History Found

      </div>

    )

    :

    <table className="w-full">

      <thead>

        <tr className="border-b">

          <th className="py-3 text-left">Installment</th>

          <th className="py-3 text-left">Date</th>

          <th className="py-3 text-left">EMI</th>

          <th className="py-3 text-left">Penalty</th>

          <th className="py-3 text-left">Total</th>

          <th className="py-3 text-left">Mode</th>

          <th className="py-3 text-left">Collected By</th>

        </tr>

      </thead>

      <tbody>

        {

          payments.map((item) => (

            <tr
              key={item._id}
              className="border-b"
            >

              <td className="py-3">

                #{item.installmentNo}

              </td>

              <td>

                {

                  new Date(item.paymentDate)
                  .toLocaleDateString("en-IN")

                }

              </td>

              <td>

                ₹{item.installmentAmount}

              </td>

              <td>

                ₹{item.penaltyAmount}

              </td>

              <td className="font-bold text-green-600">

                ₹{item.totalReceived}

              </td>

              <td>

                {item.paymentMode}

              </td>

              <td>

                {item.collectorId?.name || "Admin"}

              </td>

            </tr>

          ))

        }

      </tbody>

    </table>

  }

</div>


    </div>
  );
}

export default MemberProfile;