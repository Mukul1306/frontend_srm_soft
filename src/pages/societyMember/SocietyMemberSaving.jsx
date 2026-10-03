import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  IndianRupee,
  AlertTriangle,
  CalendarDays,
  CircleCheck,
  WalletCards,
  RefreshCw,
  Search,
  Calendar,
  ChevronDown,
  ReceiptText,
} from "lucide-react";

import SummaryCard from "./components/SummaryCard";
import StatusBadge from "./components/StatusBadge";

function SocietyMemberSaving() {


  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
    const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
const [showPendingInstallments, setShowPendingInstallments] = useState(false);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [expandedPayment, setExpandedPayment] = useState(null);

  useEffect(() => {
    loadSaving();
  }, []);

  const loadSaving = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("societyMemberToken");

      if (!token) {
        setError(
          "Your login session has expired. Please login again."
        );
        return;
      }

      const response = await axios.get(
        "https://finance-project-0qqk.onrender.com/api/member-portal/saving",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to load saving account."
        );
      }

      setData(response.data);
    } catch (err) {
      console.error("SOCIETY SAVING ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load saving account."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredPayments = useMemo(() => {
    const payments = data?.payments || [];
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const mode = String(
        payment.paymentMode || ""
      ).toUpperCase();

      const matchesSearch =
        !query ||
        String(payment.installmentNo || "")
          .toLowerCase()
          .includes(query) ||
        mode.toLowerCase().includes(query) ||
        String(payment.transactionId || "")
          .toLowerCase()
          .includes(query);

      let matchesFilter = true;

      if (paymentFilter === "CASH") {
        matchesFilter = mode === "CASH";
      }

      if (paymentFilter === "ONLINE") {
        matchesFilter = [
          "UPI",
          "ONLINE",
          "BANK",
          "NEFT",
          "IMPS",
        ].includes(mode);
      }

      return matchesSearch && matchesFilter;
    });
  }, [data, search, paymentFilter]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading saving account...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertTriangle size={24} />
          </div>

          <h2 className="mt-4 text-base font-bold text-slate-900">
            Unable to load saving
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => loadSaving()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const member = data?.member || {};
  const society = data?.society || {};
  const summary = data?.summary || {};
  const pendingInstallments =
    data?.pendingInstallments || [];
  const payments = data?.payments || [];

  const progress =
    summary.totalInstallments > 0
      ? Math.min(
          100,
          Math.round(
            (Number(summary.paidInstallments || 0) /
              Number(summary.totalInstallments)) *
              100
          )
        )
      : 0;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 pb-6 sm:space-y-6">

      {/* HEADER */}
      <section className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">
            Saving Account
          </p>

          <h1 className="mt-1 truncate text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
            {member.name || "Member"}
          </h1>

          <p className="mt-1 truncate text-xs text-slate-500">
            {society.societyName || "SRM Finance"} ·{" "}
            {member.memberId || "--"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadSaving(true)}
          disabled={refreshing}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
          aria-label="Refresh saving"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />
        </button>
      </section>

      {/* ACCOUNT HERO */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow-[0_10px_30px_rgba(37,99,235,0.16)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-100">
              Total Saved
            </p>

            <h2 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              ₹
              {Number(
                summary.totalPaid || 0
              ).toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
            <WalletCards size={20} strokeWidth={2} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/15 pt-4">
          <div>
            <p className="text-[10px] font-semibold text-blue-100">
              Pending Amount
            </p>

            <p className="mt-1 text-base font-bold">
              ₹
              {Number(
                summary.pendingAmount || 0
              ).toLocaleString("en-IN")}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-blue-100">
              Pending Installments
            </p>

            <p className="mt-1 text-base font-bold">
              {summary.pendingInstallments || 0}
            </p>
          </div>
        </div>
      </section>

      {/* PROGRESS */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-900">
              Saving Progress
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              {summary.paidInstallments || 0} of{" "}
              {summary.totalInstallments || 0} installments completed
            </p>
          </div>

          <span className="text-sm font-extrabold text-blue-600">
            {progress}%
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      {/* SUMMARY CARDS */}
      <section className="grid grid-cols-2 gap-3">
        <SummaryCard
          label="Monthly EMI"
          value={`₹${Number(
            summary.monthlyInstallment || 0
          ).toLocaleString("en-IN")}`}
          icon={IndianRupee}
          tone="blue"
        />

        <SummaryCard
          label="Penalty Paid"
          value={`₹${Number(
            summary.totalPenaltyPaid || 0
          ).toLocaleString("en-IN")}`}
          icon={AlertTriangle}
          tone="amber"
        />

        <SummaryCard
          label="Installments"
          value={`${summary.paidInstallments || 0}/${
            summary.totalInstallments || 0
          }`}
          icon={CircleCheck}
          tone="green"
        />
     <SummaryCard
  label="Final Settlement"
  value={`₹${Number(
    member.settlementAmount || 0
  ).toLocaleString("en-IN")}`}
  icon={IndianRupee}
  tone="green"
/>
   
      </section>

 {/* Pending Installments */}
<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

  {/* Header */}
  <button
    type="button"
    onClick={() =>
      setShowPendingInstallments((prev) => !prev)
    }
    className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-slate-50"
  >
    <div>
      <h3 className="text-sm font-extrabold text-slate-900">
        Pending Installments
      </h3>

      <p className="mt-1 text-xs text-slate-400">
        Unpaid installments and applicable penalties
      </p>
    </div>

    <div className="flex items-center gap-3">

      {/* Count */}
      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
        {pendingInstallments.length}
      </span>

      {/* Arrow */}
      <ChevronDown
        size={18}
        className={`text-slate-400 transition-transform duration-200 ${
          showPendingInstallments ? "rotate-180" : ""
        }`}
      />

    </div>
  </button>


  {/* Installments */}
  {showPendingInstallments && (
    <div className="border-t border-slate-100">

      {pendingInstallments.map((item, index) => (
        <div
          key={item._id || item.installmentNo || index}
          className="flex items-center justify-between border-b border-slate-100 px-4 py-4 last:border-b-0"
        >

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Calendar size={17} />
            </div>

            <div>
              <p className="text-sm font-extrabold text-slate-900">
                Installment #{item.installmentNo || index + 1}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Due {formatDate(item.dueDate)}
              </p>
            </div>

          </div>


          <div className="text-right">

            <p className="text-sm font-extrabold text-slate-900">
              ₹{Number(item.total || item.amount || 0).toLocaleString("en-IN")}
            </p>

            <span className="mt-1 inline-block rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-600">
              DUE
            </span>

          </div>

        </div>
      ))}

    </div>
  )}

</div>

      {/* PAYMENT HISTORY */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-4">
          <h2 className="text-sm font-bold text-slate-900">
            Payment History
          </h2>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Search and review your savings collections
          </p>
        </div>

        {/* SEARCH */}
        <div className="space-y-3 border-b border-slate-100 p-4">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search installment, payment mode..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {["ALL", "CASH", "ONLINE"].map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setPaymentFilter(item)
                  }
                  className={`
                    shrink-0
                    rounded-xl
                    border
                    px-4
                    py-2
                    text-xs
                    font-bold
                    transition
                    ${
                      paymentFilter === item
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-500"
                    }
                  `}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-10 text-center">
            <ReceiptText
              size={28}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-medium text-slate-500">
              No payments found.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPayments.map((payment) => {
              const isExpanded =
                expandedPayment ===
                payment._id;

              return (
                <div
                  key={payment._id}
                  className="bg-white"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedPayment(
                        isExpanded
                          ? null
                          : payment._id
                      )
                    }
                    className="w-full px-4 py-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <CircleCheck size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-800">
                            Installment #
                            {payment.installmentNo}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {payment.paymentDate
                              ? new Date(
                                  payment.paymentDate
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "--"}{" "}
                            ·{" "}
                            {payment.paymentMode ||
                              "Payment"}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-slate-900">
                            ₹
                            {Number(
                              payment.totalReceived || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          <p className="mt-0.5 text-[10px] font-bold text-emerald-600">
                            PAID
                          </p>
                        </div>

                        <ChevronDown
                          size={16}
                          className={`
                            text-slate-400
                            transition-transform
                            ${
                              isExpanded
                                ? "rotate-180"
                                : ""
                            }
                          `}
                        />
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[9px] font-bold uppercase text-slate-400">
                            EMI
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-700">
                            ₹
                            {Number(
                              payment.installmentAmount ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[9px] font-bold uppercase text-slate-400">
                            Penalty
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-700">
                            ₹
                            {Number(
                              payment.penaltyAmount ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[9px] font-bold uppercase text-slate-400">
                            Mode
                          </p>
                          <p className="mt-1 truncate text-xs font-bold text-slate-700">
                            {payment.paymentMode ||
                              "--"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[9px] font-bold uppercase text-slate-400">
                            Month
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-700">
                            {payment.paymentForMonth ||
                              "--"}
                          </p>
                        </div>
                      </div>

                      {payment.transactionId && (
                        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Transaction ID
                          </span>

                          <span className="max-w-[65%] truncate text-[10px] font-semibold text-slate-600">
                            {payment.transactionId}
                          </span>
                        </div>
                      )}

                      {payment.remarks && (
                        <div className="mt-3 rounded-xl bg-white px-3 py-2.5">
                          <p className="text-[10px] font-bold uppercase text-slate-400">
                            Remarks
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {payment.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default SocietyMemberSaving;