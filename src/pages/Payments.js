import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { 
  FiSearch, 
  FiCreditCard, 
  FiDollarSign, 
  FiAlertTriangle, 
  FiBriefcase, 
  FiX, 
  FiCheckCircle, 
  FiFileText, 
  FiCalendar,
  FiClock,
  FiFilter
} from "react-icons/fi";

const API_BASE = "https://finance-project-0qqk.onrender.com/api";

function Payment() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [pendingInstallments, setPendingInstallments] = useState([]);
  const [pendingInstallment, setPendingInstallment] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentMode: "Cash",
    transactionId: "",
    remarks: ""
  });

  const [penaltySummary, setPenaltySummary] = useState({ totalPenalty: 0 });
  const [societyFilter, setSocietyFilter] = useState("all");
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const [joiningMonth, setJoiningMonth] = useState("all");

  const [summary, setSummary] = useState({
    monthlyTarget: 0,
    thisMonthCollection: 0,
    thisMonthPenalty: 0,
    oldDuesCollectedThisMonth: 0,
    totalCollection: 0,
    pendingThisMonth: 0,
    pendingTillToday: 0,
    pendingPenaltyTillToday: 0
  });

  // Load Initial Data
  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/member/all`);
      setMembers(res.data.members || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/payment/summary`,
        {
          params: {
            year,
            month
          }
        }
      );

      setSummary(res.data || {});
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const fetchPenaltySummary = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/payment/penalty-collection`, {
        params: { year, month }
      });
      setPenaltySummary(res.data || { totalPenalty: 0 });
    } catch (error) {
      console.error("Error fetching penalty summary:", error);
    }
  }, [year, month]);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [year, month]);

  useEffect(() => {
    fetchPenaltySummary();
  }, [fetchPenaltySummary]);

  const fetchPendingInstallment = async (memberId) => {
    if (!memberId) return;
    try {
      const res = await axios.get(`${API_BASE}/payment/pending/${memberId}`);
      const list = res.data.pendingInstallments || [];
      setPendingInstallments(list);
      setPendingInstallment(list.length > 0 ? list[0] : null);
    } catch (error) {
      console.error("Error fetching pending installments:", error);
      setPendingInstallments([]);
      setPendingInstallment(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
    setPendingInstallments([]);
    setPendingInstallment(null);
    setPaymentData({ paymentMode: "Cash", transactionId: "", remarks: "" });
  };

  const handleCollectPayment = async () => {
    if (!selectedMember || !pendingInstallment) {
      alert("No pending installment selected");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/payment/collect`,
        {
          memberId: selectedMember._id,
          installmentNo: pendingInstallment.installmentNo,
          paymentMode: paymentData.paymentMode,
          transactionId: paymentData.transactionId,
          remarks: paymentData.remarks
        }
      );

      alert(res.data.message || "Payment collected successfully!");

      await Promise.all([
        fetchMembers(),
        fetchSummary(),
        fetchPenaltySummary()
      ]);

      const targetId = selectedMember.memberId || selectedMember._id;
      await fetchPendingInstallment(targetId);

      setPaymentData({
        paymentMode: "Cash",
        transactionId: "",
        remarks: ""
      });

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Payment collection failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const societies = [
    ...new Map(
      members
        .filter(
          (member) =>
            member.societyId &&
            member.societyId.societyName
        )
        .map((member) => [
          member.societyId._id,
          {
            _id: member.societyId._id,
            societyName:
              member.societyId.societyName
          }
        ])
    ).values()
  ];

  const filteredMembers = members.filter((member) => {
    const keyword = search.toLowerCase().trim();

    const searchMatch =
      !keyword ||
      member.name?.toLowerCase().includes(keyword) ||
      member.memberId?.toString().includes(keyword);

    if (!searchMatch) {
      return false;
    }

    if (
      societyFilter !== "all" &&
      String(member.societyId?._id) !== String(societyFilter)
    ) {
      return false;
    }

    if (joiningMonth !== "all") {
      const memberMonth = new Date(member.joiningDate).getMonth() + 1;
      if (memberMonth !== Number(joiningMonth)) {
        return false;
      }
    }

    if (paymentStatus === "pending" && !member.canCollect) {
      return false;
    }

    if (paymentStatus === "paid" && member.canCollect) {
      return false;
    }

    return true;
  });

  return (
    <div className="p-3 sm:p-6 lg:p-8 bg-slate-50 min-h-screen font-sans text-slate-800 antialiased space-y-4 sm:space-y-6">
      
      {/* TOP HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            Payment Collection Dashboard
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
            Real-time ledger & transaction processing center
          </p>
        </div>

        {/* Global Date Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 sm:bg-white border border-slate-200 p-2 rounded-2xl w-full lg:w-auto">
          <div className="flex items-center gap-2 pl-1 text-slate-400 text-xs font-bold uppercase tracking-wider shrink-0">
            <FiCalendar className="text-slate-500" /> Filter:
          </div>
          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full">
            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setMonth("all");
              }}
              className="w-full sm:w-auto bg-white sm:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Years</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>

            <select
              value={month}
              disabled={year === "all"}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full sm:w-auto bg-white sm:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer"
            >
              <option value="all">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 sm:gap-4">
        
        {/* Monthly Target */}
        <div className="bg-white border border-blue-100 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Monthly Target</span>
          <div className="flex items-center justify-between mt-2 gap-1">
            <h2 className="text-sm sm:text-lg lg:text-xl font-black text-blue-600 truncate">₹{(summary.monthlyTarget || 0).toLocaleString("en-IN")}</h2>
            <div className="p-1 sm:p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0"><FiDollarSign className="text-xs sm:text-sm" /></div>
          </div>
        </div>

        {/* This Month Collection */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Collected (Month)</span>
          <div className="flex items-center justify-between mt-2 gap-1">
            <h2 className="text-sm sm:text-lg lg:text-xl font-black text-emerald-600 truncate">₹{(summary.thisMonthCollection || 0).toLocaleString("en-IN")}</h2>
            <div className="p-1 sm:p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0"><FiDollarSign className="text-xs sm:text-sm" /></div>
          </div>
        </div>

        {/* Old Dues Collected This Month */}
        <div className="bg-white border border-violet-100 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
            Old Dues Collected
          </span>
          <div className="flex items-center justify-between mt-2 gap-1">
            <h2 className="text-sm sm:text-lg lg:text-xl font-black text-violet-600 truncate">
              ₹{(summary.oldDuesCollectedThisMonth || 0).toLocaleString("en-IN")}
            </h2>
            <div className="p-1 sm:p-1.5 rounded-lg bg-violet-50 text-violet-600 shrink-0">
              <FiClock className="text-xs sm:text-sm" />
            </div>
          </div>
          <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold mt-1">
            Previous-month dues paid this month
          </span>
        </div>

        {/* Penalty Collected */}
        <div className="bg-white border border-yellow-100 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Penalty Collected</span>
          <div className="flex items-center justify-between mt-2 gap-1">
            <h2 className="text-sm sm:text-lg lg:text-xl font-black text-yellow-600 truncate">₹{(penaltySummary.totalPenalty || 0).toLocaleString("en-IN")}</h2>
            <div className="p-1 sm:p-1.5 rounded-lg bg-yellow-50 text-yellow-600 shrink-0"><FiClock className="text-xs sm:text-sm" /></div>
          </div>
        </div>

        {/* Pending This Month */}
        <div className="bg-white border border-rose-100 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Pending (Month)</span>
          <div className="flex items-center justify-between mt-2 gap-1">
            <h2 className="text-sm sm:text-lg lg:text-xl font-black text-rose-600 truncate">₹{(summary.pendingThisMonth || 0).toLocaleString("en-IN")}</h2>
            <div className="p-1 sm:p-1.5 rounded-lg bg-rose-50 text-rose-600 shrink-0"><FiAlertTriangle className="text-xs sm:text-sm" /></div>
          </div>
        </div>

        {/* Pending Till Today */}
        <div className="bg-white border border-orange-100 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Pending (Overall)</span>
          <div className="flex items-center justify-between mt-2 gap-1">
            <h2 className="text-sm sm:text-lg lg:text-xl font-black text-orange-600 truncate">₹{(summary.pendingTillToday || 0).toLocaleString("en-IN")}</h2>
            <div className="p-1 sm:p-1.5 rounded-lg bg-orange-50 text-orange-600 shrink-0"><FiAlertTriangle className="text-xs sm:text-sm" /></div>
          </div>
        </div>

        {/* Pending Penalty Till Today */}
        <div className="bg-white border border-amber-100 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Pending Penalty</span>
          <div className="flex items-center justify-between mt-2 gap-1">
            <h2 className="text-sm sm:text-lg lg:text-xl font-black text-amber-600 truncate">₹{(summary.pendingPenaltyTillToday || 0).toLocaleString("en-IN")}</h2>
            <div className="p-1 sm:p-1.5 rounded-lg bg-amber-50 text-amber-600 shrink-0"><FiAlertTriangle className="text-xs sm:text-sm" /></div>
          </div>
        </div>

      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search by Member ID or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full lg:w-auto">
          {/* Society Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <FiFilter className="text-slate-400 text-xs shrink-0" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Society:</span>
            <select
              value={societyFilter}
              onChange={(e) => setSocietyFilter(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer truncate"
            >
              <option value="all">All Societies</option>
              {societies.map((society) => (
                <option key={society._id} value={society._id}>
                  {society.societyName}
                </option>
              ))}
            </select>
          </div>

          {/* Joining Month Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <FiFilter className="text-slate-400 text-xs shrink-0" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Joining:</span>
            <select
              value={joiningMonth}
              onChange={(e) => setJoiningMonth(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer truncate"
            >
              <option value="all">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <FiFilter className="text-slate-400 text-xs shrink-0" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Status:</span>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer truncate"
            >
              <option value="all">All Members</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid / Clear</option>
            </select>
          </div>
        </div>

      </div>

      {/* COLLECTION STATUS SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">

        {/* TOTAL MEMBERS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">Total</p>
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <h3 className="text-base sm:text-2xl font-black text-slate-900">{members.length}</h3>
            <FiCreditCard className="text-slate-400 text-sm sm:text-lg shrink-0 hidden sm:block" />
          </div>
        </div>

        {/* PENDING COLLECTION */}
        <div className="bg-white border border-rose-100 rounded-2xl p-3 sm:p-4 shadow-xs">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">Pending</p>
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <h3 className="text-base sm:text-2xl font-black text-rose-600">
              {members.filter(member => member.canCollect).length}
            </h3>
            <FiAlertTriangle className="text-rose-500 text-sm sm:text-lg shrink-0 hidden sm:block" />
          </div>
        </div>

        {/* PAID */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-3 sm:p-4 shadow-xs">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">Paid / Clear</p>
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <h3 className="text-base sm:text-2xl font-black text-emerald-600">
              {members.filter(member => !member.canCollect).length}
            </h3>
            <FiCheckCircle className="text-emerald-500 text-sm sm:text-lg shrink-0 hidden sm:block" />
          </div>
        </div>

      </div>

      {/* MEMBERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member._id}
            className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <h2 className="font-black text-base sm:text-lg text-slate-900 truncate">{member.name}</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    ID: <span className="text-slate-700">{member.memberId}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    S/O: <span className="font-semibold text-slate-600">{member.fatherOrHusbandName || "-"}</span>
                  </p>
                </div>

                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg flex items-center gap-1 shrink-0">
                  <FiBriefcase size={10} />
                  <span className="truncate max-w-[80px] sm:max-w-[120px]">{member.societyId?.societyName || "No Society"}</span>
                </span>
              </div>

              {/* Data Items Ledger Fields */}
              <div className="space-y-1.5 sm:space-y-2 border-t border-slate-100 pt-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Base EMI Due</span>
                  <span className="font-bold text-slate-600">₹{member.currentMonthEmi || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Accrued Penalty</span>
                  <span className={`font-bold ${member.currentPenalty > 0 ? "text-amber-600 font-black" : "text-slate-400"}`}>
                    ₹{member.currentPenalty || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl mt-2">
                  <span className="text-slate-600 font-black uppercase tracking-wider text-[10px]">Net Payable</span>
                  <span className="text-xs sm:text-sm font-black text-blue-600">₹{member.totalPayable || 0}</span>
                </div>
              </div>
            </div>

            {/* Collect Action */}
            <button
              disabled={!member.canCollect}
              onClick={() => {
                setSelectedMember(member);
                fetchPendingInstallment(member.memberId || member._id);
              }}
              className={`w-full py-2.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                member.canCollect
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xs shadow-blue-200"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {member.canCollect ? "Collect Payment" : "No Payment Due"}
            </button>
          </div>
        ))}
      </div>

      {/* COLLECT PAYMENT MODAL / BOTTOM DRAWER FOR MOBILE */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 transition-all">
          <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-t-3xl sm:rounded-3xl w-full max-w-[480px] shadow-2xl relative max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              <FiX className="text-lg stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <FiCreditCard className="text-base stroke-[2.5]" />
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight uppercase">
                Process Collection
              </h2>
            </div>

            {/* Selected User Info Panel */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Account Holder</span>
                <span className="font-black text-slate-800">{selectedMember.name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Member ID</span>
                <span className="font-black text-blue-600">{selectedMember.memberId || selectedMember._id}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Paid / Pending</span>
                <span className="font-bold">
                  <span className="text-emerald-600">{selectedMember.paidInstallments || 0} Paid</span>
                  {" / "}
                  <span className="text-rose-600">{selectedMember.pendingInstallments || 0} Pending</span>
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-200/60 pt-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Collecting Month</span>
                <select
                  value={pendingInstallment ? pendingInstallment.installmentNo : ""}
                  onChange={(e) => {
                    const selected = pendingInstallments.find(
                      item => item.installmentNo === Number(e.target.value)
                    );
                    setPendingInstallment(selected);
                  }}
                  className="border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-emerald-600 bg-white outline-none focus:border-blue-500 cursor-pointer"
                >
                  {pendingInstallments.map((item) => (
                    <option key={item.installmentNo} value={item.installmentNo}>
                      {item.month} {item.installmentYear}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Base EMI</span>
                <span className="font-bold text-slate-700">₹{pendingInstallment?.installmentAmount || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Penalty</span>
                <span className="font-bold text-amber-600">₹{pendingInstallment?.penaltyAmount || 0}</span>
              </div>
              
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                <span className="font-black text-slate-900 uppercase tracking-wider text-[10px]">Total Settled Due</span>
                <span className="text-sm sm:text-base font-black text-blue-600">₹{pendingInstallment?.total || 0}</span>
              </div>
            </div>

            {/* Input Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Gateway / Route Mode</label>
                <select
                  value={paymentData.paymentMode}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Cash">Cash Ledger</option>
                  <option value="UPI">UPI Transfer Network</option>
                  <option value="Bank Transfer">Direct Bank Transfer</option>
                  <option value="Cheque">Cheque Deposit</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Transaction ID / Ref</label>
                <div className="relative">
                  <FiCheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="e.g. TXN987654321"
                    value={paymentData.transactionId}
                    onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-700 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Accounting Remarks</label>
                <div className="relative">
                  <FiFileText className="absolute left-3 top-3 text-slate-400 text-xs" />
                  <textarea
                    placeholder="Enter audit remarks or details..."
                    value={paymentData.remarks}
                    onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 min-h-[60px] text-xs font-semibold text-slate-700 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleCollectPayment}
                disabled={loading}
                className={`w-full mt-2 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer ${
                  loading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-xs shadow-emerald-200"
                }`}
              >
                {loading ? "Collecting Payment..." : "Confirm Payment Receipt"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Payment;