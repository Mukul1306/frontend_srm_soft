import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wallet,
  Landmark,
  Edit,
  Trash2,
  DollarSign,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

const API_BASE = "https://finance-project-0qqk.onrender.com/api/daily";

function DailyMemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [saving, setSaving] = useState(null);
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openCollectModal, setOpenCollectModal] = useState(false);

  // Fetch Member Details
  const fetchData = useCallback(async (signal) => {
    setLoading(true);
    try {
      const [memberRes, savingRes, loanRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/member/${id}`, { signal }),
        axios.get(`${API_BASE}/member-saving/${id}`, { signal }),
        axios.get(`${API_BASE}/member-loan/${id}`, { signal }),
      ]);

      if (memberRes.status === "fulfilled") {
        setMember(memberRes.value.data?.member || null);
      }
      if (savingRes.status === "fulfilled") {
        setSaving(savingRes.value.data?.saving || null);
      }
      if (loanRes.status === "fulfilled") {
        setLoan(loanRes.value.data?.loan || null);
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("Error fetching member profile:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchData]);

  // Handle Delete Member
  const deleteMember = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this member? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE}/member/${id}`);
      alert("Member successfully deleted.");
      navigate("/daily/members");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete member. Please try again.");
    }
  };

  // Safe Date Formatting
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  // Safe Currency Formatting
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "₹0";
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  // Loading Skeleton View
  if (loading) {
    return (
      <div className="p-4 sm:p-8 bg-slate-50 min-h-screen max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-3xl"></div>
          <div className="h-64 bg-slate-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md border border-slate-100">
          <p className="text-slate-600 font-bold mb-4">Member record not found.</p>
          <button
            onClick={() => navigate("/daily/members")}
            className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition"
          >
            Return to Member List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen max-w-7xl mx-auto text-slate-800 font-sans">
      
      {/* 1. PROFILE HEADER CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-2xl sm:text-3xl border border-blue-100">
            {member.memberName ? member.memberName.charAt(0).toUpperCase() : "M"}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {member.memberName}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  member.status === "Active"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {member.status || "Active"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 font-medium mt-2">
              <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                <ShieldCheck size={15} className="text-slate-400" /> ID: {member.memberId}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={15} className="text-slate-400" /> {member.mobile}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
          <button
            onClick={() => navigate(`/daily/edit-member/${id}`)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition"
          >
            <Edit size={16} /> Edit
          </button>

          <button
            onClick={deleteMember}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-xs sm:text-sm transition"
          >
            <Trash2 size={16} /> Delete
          </button>

          {saving ? (
            <button
              onClick={() => setOpenCollectModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition"
            >
              <DollarSign size={16} /> Collect Payment
            </button>
          ) : (
            <button
              onClick={() => navigate(`/daily/create-saving/${member._id}`)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition"
            >
              <PlusCircle size={16} /> Start Daily Saving
            </button>
          )}
        </div>
      </div>

      {/* 2. PERSONAL & ADDRESS DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        
        {/* Personal Details Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-slate-100">
            <User className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
            <InfoItem label="Member ID" value={member.memberId} />
            <InfoItem label="Full Name" value={member.memberName} />
            <InfoItem label="Father / Husband" value={member.fatherName} />
            <InfoItem label="Gender" value={member.gender} />
            <InfoItem label="Date of Birth" value={formatDate(member.dob)} />
            <InfoItem label="Account Status" value={member.status} />
          </div>
        </div>

        {/* Contact & Address Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-slate-100">
            <MapPin className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-slate-900">Contact & Address</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
         <InfoItem label="Mobile Number" value={member.mobile} />
<InfoItem label="Alt Mobile" value={member.alternateMobile || "-"} />

<InfoItem
  label="Area Name"
  value={member.areaGroup?.areaName || "-"}
 />

<InfoItem
  label="Assigned Agent"
  value={member.assignedAgent?.name || "-"}
 />

<InfoItem
  label="Email Address"
  value={member.email || "-"}
  colSpan="col-span-2"
/>
            <InfoItem label="Residential Address" value={member.residentialAddress} colSpan="col-span-2" />
            <InfoItem label="City" value={member.city} />
            <InfoItem label="District" value={member.district} />
            <InfoItem label="State" value={member.state} />
            <InfoItem label="Pincode" value={member.pincode} />
          </div>
        </div>

      </div>

      {/* 3. DAILY SAVINGS ACCOUNT SECTION */}
      {saving && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 mt-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Wallet className="text-emerald-600" size={22} />
              <h2 className="text-lg font-bold text-slate-900">Daily Saving Account</h2>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
              {saving.status || "Active"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 text-xs sm:text-sm">
            <InfoItem label="Area Group" value={saving.areaGroup?.areaName} />
            <InfoItem label="Assigned Agent" value={saving.assignedAgent?.name} />
            <InfoItem label="Collection Type" value={saving.collectionType} />
            <InfoItem
  label="Grace Period"
  value={`${saving.graceDays || 0} Day(s)`}
/>

<InfoItem
  label="Penalty Type"
  value={saving.penaltyType || "-"}
/>

<InfoItem
  label="Penalty Value"
  value={
    saving.penaltyType === "PERCENTAGE"
      ? `${saving.penaltyValue}%`
      : formatCurrency(saving.penaltyValue)
  }
/>
            <InfoItem label="Daily Deposit" value={formatCurrency(saving.fixedAmount)} highlight />
            <InfoItem label="Total Amount Saved" value={formatCurrency(saving.totalSaved)} color="text-emerald-600" />
            <InfoItem label="Total Penalty" value={formatCurrency(saving.totalPenalty)} color="text-rose-600" />
            <InfoItem label="Paid Days" value={saving.totalDaysPaid} />
            <InfoItem label="Pending Days" value={saving.pendingDays} />
            <InfoItem label="Nominee Name" value={saving.nomineeName || "-"} />
            <InfoItem label="Nominee Mobile" value={saving.nomineeMobile || "-"} />
          </div>
        </div>
      )}

      {/* 4. LOAN ACCOUNT SECTION */}
      {loan && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 mt-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Landmark className="text-blue-600" size={22} />
              <h2 className="text-lg font-bold text-slate-900">Loan Account Details</h2>
            </div>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
              {loan.status || "Active"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 text-xs sm:text-sm">
            <InfoItem label="Loan Number" value={loan.loanNumber} />
            <InfoItem label="Loan Amount" value={formatCurrency(loan.loanAmount)} color="text-blue-600" />
            <InfoItem label="Outstanding Amount" value={formatCurrency(loan.outstandingAmount)} color="text-rose-600" />
            <InfoItem label="Interest Rate" value={`${loan.interestRate}%`} />
            <InfoItem label="EMI Amount" value={formatCurrency(loan.emiAmount)} />
            <InfoItem label="Loan Type" value={loan.loanType} />
            <InfoItem label="Assigned Agent" value={loan.assignedAgent?.name || "-"} />
            <InfoItem label="Disbursal Date" value={formatDate(loan.loanDate)} />
            <InfoItem label="Paid Installments" value={loan.completedInstallments} color="text-emerald-600" />
            <InfoItem label="Pending Installments" value={loan.pendingInstallments} color="text-rose-600" />
            <InfoItem label="Total Paid" value={formatCurrency(loan.totalPaid)} color="text-emerald-600" />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => navigate(`/daily/loan/${loan._id}`)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm"
            >
              View Full Loan Statement <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper Reusable Field Item
function InfoItem({ label, value, color, colSpan = "col-span-1", highlight = false }) {
  return (
    <div className={`${colSpan}`}>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p
        className={`font-bold mt-0.5 ${
          color ? color : "text-slate-800"
        } ${highlight ? "text-base font-extrabold text-blue-700" : ""}`}
      >
        {value !== undefined && value !== null && value !== "" ? value : "-"}
      </p>
    </div>
  );
}

export default DailyMemberProfile;