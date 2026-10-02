import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  WalletCards,
  IndianRupee,
  AlertTriangle,
  ArrowUpRight,
  CircleCheck,
  Landmark,
  CalendarDays,
  RefreshCw
} from "lucide-react";

import SummaryCard from "./components/SummaryCard";
import StatusBadge from "./components/StatusBadge";

function SocietyMemberDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      // ================================================
      // TOKEN
      // ================================================

      const token = localStorage.getItem("societyMemberToken");

      console.log("SOCIETY MEMBER TOKEN:", token);

      if (!token) {
        setError("Your login session has expired. Please login again.");
        return;
      }

      // ================================================
      // API
      // ================================================

      const response = await axios.get(
        "https://finance-project-0qqk.onrender.com/api/member-portal/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("SOCIETY DASHBOARD DATA:", response.data);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to load dashboard"
        );
      }

      setData(response.data);

      // ================================================
      // KEEP LOCAL MEMBER DATA UPDATED
      // ================================================

      if (response.data.member) {
        localStorage.setItem(
          "societyMember",
          JSON.stringify(response.data.member)
        );
      }
    } catch (err) {
      console.error("SOCIETY DASHBOARD ERROR:", err);
      console.error("STATUS:", err.response?.status);
      console.error("SERVER RESPONSE:", err.response?.data);

      if (err.response?.status === 401) {
        localStorage.removeItem("societyMemberToken");
        localStorage.removeItem("societyMember");
        localStorage.removeItem("role");

        setError("Your login session has expired. Please login again.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load dashboard."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
          <p className="mt-3 text-sm text-slate-500">
            Loading your account...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertTriangle size={24} />
          </div>

          <h2 className="mt-4 text-base font-bold text-slate-900">
            Unable to load dashboard
          </h2>

          <p className="mt-1.5 text-sm leading-6 text-slate-500">{error}</p>

          <button
            type="button"
            onClick={() => loadDashboard()}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // DATA DESTRUCTURING & GREETING
  // =====================================================

  const member = data?.member || {};
  const saving = data?.saving || {};
  const society = data?.society || {};
  const currentInstallment = data?.currentInstallment || null;
  const recentPayments = data?.recentPayments || [];
  const loan = data?.loan || null;

  const hour = new Date().getHours();
  let greeting = "Good morning";

  if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  } else if (hour >= 17) {
    greeting = "Good evening";
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 pb-4 sm:space-y-6">
      {/* PAGE HEADER */}
      <section>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400 sm:text-sm">
              {greeting}
            </p>

            <h1 className="mt-1 truncate text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
              {member.name || "Member"}
            </h1>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Member ID · {member.memberId || "--"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={member.status} />

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </section>

      {/* ACCOUNT HERO */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow-[0_10px_30px_rgba(37,99,235,0.16)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-100">
              Total Paid
            </p>

            <h2 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              ₹{Number(saving.totalPaid || 0).toLocaleString("en-IN")}
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
              ₹{Number(saving.pendingAmount || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-blue-100">
              Pending Installments
            </p>

            <p className="mt-1 text-base font-bold">
              {saving.pendingInstallments || 0}
            </p>
          </div>
        </div>
      </section>

      {/* SUMMARY */}
      <section className="grid grid-cols-2 gap-3">
        <SummaryCard
          label="Monthly Installment"
          value={`₹${Number(saving.monthlyInstallment || 0).toLocaleString(
            "en-IN"
          )}`}
          icon={IndianRupee}
          tone="blue"
        />

        <SummaryCard
          label="Penalty"
          value={`₹${Number(saving.currentPenalty || 0).toLocaleString(
            "en-IN"
          )}`}
          icon={AlertTriangle}
          tone="amber"
        />

        <SummaryCard
          label="Paid Installments"
          value={`${saving.paidInstallments || 0}/${
            saving.totalInstallments || 0
          }`}
          icon={CircleCheck}
          tone="green"
        />

        <SummaryCard
          label="Society"
          value={society.societyName || "--"}
          icon={Landmark}
          tone="blue"
        />
      </section>

      {/* CURRENT INSTALLMENT */}
      {currentInstallment && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Current Installment
              </h3>

              <p className="mt-0.5 text-[11px] text-slate-400">
                Installment #{currentInstallment.installmentNo}
              </p>
            </div>

            <StatusBadge status={currentInstallment.status} />
          </div>

          <div className="p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Total Payable
                </p>

                <h4 className="mt-1 text-2xl font-extrabold text-slate-950">
                  ₹{Number(currentInstallment.total || 0).toLocaleString("en-IN")}
                </h4>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-[10px] font-bold uppercase text-slate-400">
                  <CalendarDays size={12} />
                  Due Date
                </div>

                <p className="mt-1 text-sm font-bold text-slate-700">
                  {currentInstallment.dueDate
                    ? new Date(
                        currentInstallment.dueDate
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })
                    : "--"}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Installment
                </p>

                <p className="mt-1 text-sm font-extrabold text-slate-800">
                  ₹{Number(currentInstallment.amount || 0).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Penalty
                </p>

                <p className="mt-1 text-sm font-extrabold text-slate-800">
                  ₹{Number(currentInstallment.penalty || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SOCIETY INFORMATION */}
      {society && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Society
              </p>

              <h3 className="mt-1 text-base font-extrabold text-slate-900">
                {society.societyName || "SRM Finance"}
              </h3>
            </div>

            <Landmark size={20} className="text-blue-600" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">
                Duration
              </p>

              <p className="mt-1 text-sm font-extrabold text-slate-800">
                {society.durationMonths || 0} Months
              </p>
            </div>

       <div className="rounded-xl bg-slate-50 p-3">
  <p className="text-[10px] font-bold uppercase text-slate-400">
    Member End Date
  </p>

  <p className="mt-1 text-sm font-extrabold text-slate-800">
    {member.memberEndDate
      ? new Date(member.memberEndDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })
      : "--"}
  </p>
</div>
          </div>
        </section>
      )}

      {/* RECENT PAYMENTS */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Payments
            </h3>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Your latest transactions
            </p>
          </div>

          <ArrowUpRight size={18} className="text-slate-300" />
        </div>

        <div className="divide-y divide-slate-100">
          {recentPayments.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No payment history available.
            </div>
          ) : (
            recentPayments.map((payment) => (
              <div
                key={payment._id}
                className="flex items-center justify-between gap-3 px-4 py-3.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CircleCheck size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800">
                      Installment #{payment.installmentNo}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {payment.paymentDate
                        ? new Date(payment.paymentDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            }
                          )
                        : "--"}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-extrabold text-slate-900">
                    ₹{Number(payment.totalReceived || 0).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold text-emerald-600">
                    PAID
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* LOAN */}
      {loan && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Loan Account
              </p>

              <h3 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">
                ₹
                {Number(loan.outstandingPrincipal || 0).toLocaleString(
                  "en-IN"
                )}
              </h3>

              <p className="mt-1 text-[11px] text-slate-400">
                Outstanding principal
              </p>
            </div>

            <StatusBadge status={loan.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">
                Paid EMIs
              </p>

              <p className="mt-1 text-sm font-extrabold text-slate-800">
                {loan.paidEmis || 0}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">
                Pending EMIs
              </p>

              <p className="mt-1 text-sm font-extrabold text-slate-800">
                {loan.pendingEmis || 0}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">
                Monthly Interest
              </p>

              <p className="mt-1 text-sm font-extrabold text-slate-800">
                ₹{Number(loan.monthlyInterest || 0).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">
                Total Collected
              </p>

              <p className="mt-1 text-sm font-extrabold text-slate-800">
                ₹
                {Number(loan.totalAmountCollected || 0).toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default SocietyMemberDashboard;