import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  MapPin,
  Phone,
  Wallet,
  IndianRupee,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Ban,
  Pencil,
  Loader2,
  Inbox,
  ShieldCheck,
  UserRound,
  Eye,
  FileText,
  X,
} from "lucide-react";

const API_BASE = "https://aws.srmfinance.online/api/daily";

const AVATAR_STYLES = [
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-sky-100", text: "text-sky-700" },
];

function initialsFor(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function avatarStyleFor(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_STYLES[hash % AVATAR_STYLES.length];
}

function formatINR(amount = 0) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

/* ── Small building blocks ────────────────────────────────────────────── */

function KpiCard({ icon: Icon, label, value, accent, big }) {
  const accents = {
    emerald: { border: "border-emerald-500", iconBg: "bg-emerald-50", iconText: "text-emerald-600", valueText: "text-emerald-700" },
    amber: { border: "border-amber-500", iconBg: "bg-amber-50", iconText: "text-amber-600", valueText: "text-amber-700" },
    rose: { border: "border-rose-500", iconBg: "bg-rose-50", iconText: "text-rose-600", valueText: "text-rose-700" },
    teal: { border: "border-teal-500", iconBg: "bg-teal-50", iconText: "text-teal-600", valueText: "text-teal-700" },
    indigo: { border: "border-indigo-500", iconBg: "bg-indigo-50", iconText: "text-indigo-600", valueText: "text-indigo-700" },
    stone: { border: "border-stone-400", iconBg: "bg-stone-100", iconText: "text-stone-600", valueText: "text-stone-800" },
  }[accent];

  return (
    <div
      className={`bg-white rounded-2xl border border-stone-200 border-l-4 ${accents.border} shadow-sm hover:shadow-md transition-shadow p-3 sm:p-4 ${
        big ? "sm:p-5" : ""
      } flex items-center gap-2.5 sm:gap-3.5 min-w-0`}
    >
      <div className={`shrink-0 rounded-xl ${accents.iconBg} ${accents.iconText} p-2 sm:p-2.5`}>
        <Icon size={big ? 20 : 16} className="sm:hidden" strokeWidth={2.25} />
        <Icon size={big ? 22 : 18} className="hidden sm:block" strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400 truncate">{label}</p>
        <p
          className={`font-extrabold ${accents.valueText} ${
            big ? "text-base xs:text-lg sm:text-2xl" : "text-sm xs:text-base sm:text-lg"
          } truncate`}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    ACTIVE: { icon: ShieldCheck, cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    TERMINATED: { icon: XCircle, cls: "bg-rose-50 text-rose-700 ring-rose-200" },
    SETTLED: { icon: CheckCircle2, cls: "bg-stone-100 text-stone-500 ring-stone-200" },
  };
  const cfg = map[status] || map.SETTLED;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] xs:text-[11px] font-bold ring-1 ${cfg.cls} whitespace-nowrap`}>
      <Icon size={12} />
      {status === "ACTIVE" ? "Active" : status === "TERMINATED" ? "Terminated" : "Settled"}
    </span>
  );
}

/* ── Inline Collect Payment Modal ───────────────────────────────────────── */

/* ── Inline Collect Payment Modal ───────────────────────────────────────── */

function CollectPaymentModal({ saving, open, onClose, refresh }) {
  const [pendingDays, setPendingDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const [paymentMethod, setPaymentMethod] =
    useState("CASH");

  const [amount, setAmount] =
    useState("");

  // PENDING / ADVANCE
  const [collectionType, setCollectionType] =
    useState("PENDING");

  // Number of future days for advance payment
  const [advanceDays, setAdvanceDays] =
    useState(1);

  const [loading, setLoading] =
    useState(false);

  const [loadingPending, setLoadingPending] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =========================================================
     LOAD PENDING DAYS
  ========================================================= */

  useEffect(() => {
    if (open && saving?._id) {
      loadPendingDays();
    }
  }, [open, saving?._id]);

  const loadPendingDays = async () => {
    try {
      setLoadingPending(true);
      setError("");

      const response = await axios.get(
        `${API_BASE}/pending-days/${saving._id}`
      );

      const days =
        response.data?.pendingDays || [];

      setPendingDays(days);

      if (days.length > 0) {
        setSelectedDay(days[0]);

        setAmount(
          Number(
            days[0].total ||
            days[0].dailyAmount ||
            0
          )
        );
      } else {
        setSelectedDay(null);
        setAmount("");
      }

    } catch (error) {
      console.error(
        "ADMIN PENDING DAYS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to load pending installments."
      );

    } finally {
      setLoadingPending(false);
    }
  };

  /* =========================================================
     CHANGE PENDING EMI
  ========================================================= */

  const handleDayChange = (date) => {
    const day = pendingDays.find(
      (item) =>
        String(item.date) === String(date)
    );

    setSelectedDay(day || null);

    if (day) {
      setAmount(
        Number(
          day.total ||
          day.dailyAmount ||
          0
        )
      );
    }
  };

  /* =========================================================
     ADVANCE PAYMENT
  ========================================================= */

  const handleAdvancePayment = async () => {
    const days = Number(advanceDays);

    if (!saving?._id) {
      setError(
        "Saving account information is missing."
      );
      return;
    }

    if (
      !Number.isInteger(days) ||
      days <= 0
    ) {
      setError(
        "Enter a valid number of advance days."
      );
      return;
    }

    if (days > 365) {
      setError(
        "Maximum 365 advance days are allowed."
      );
      return;
    }

    if (!paymentMethod) {
      setError(
        "Please select payment method."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      let adminId = null;

      const adminData =
        localStorage.getItem("admin");

      if (adminData) {
        try {
          const admin =
            JSON.parse(adminData);

          adminId =
            admin?._id || null;

        } catch (e) {
          console.error(
            "ADMIN DATA PARSE ERROR:",
            e
          );
        }
      }

      const response = await axios.post(
        `${API_BASE}/collect-advance`,
        {
          savingId: saving._id,

          numberOfDays: days,

          collectorType: "ADMIN",

          collectorId: adminId,

          paymentMethod
        },
        {
          timeout: 90000
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
          "Advance payment failed."
        );
      }

      alert(
        response.data?.message ||
        `Advance payment collected for ${days} day(s).`
      );

      setAdvanceDays(1);

      await loadPendingDays();

      refresh();

    } catch (error) {
      console.error(
        "ADMIN ADVANCE COLLECTION ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
        error.message ||
        "Advance collection failed."
      );

    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     NORMAL PENDING PAYMENT
  ========================================================= */

  const handlePendingPayment = async () => {
    if (!selectedDay) {
      setError(
        "Please select a pending installment."
      );
      return;
    }

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      setError(
        "Enter a valid collection amount."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      let adminId = null;

      const adminData =
        localStorage.getItem("admin");

      if (adminData) {
        try {
          const admin =
            JSON.parse(adminData);

          adminId =
            admin?._id || null;

        } catch (e) {
          console.error(
            "ADMIN DATA PARSE ERROR:",
            e
          );
        }
      }

      await axios.post(
        `${API_BASE}/collect-pending`,
        {
          savingId: saving._id,

          pendingDate:
            selectedDay.date,

          collectorType:
            "ADMIN",

          collectorId:
            adminId,

          paymentMethod,

          amount:
            Number(amount)
        }
      );

      alert(
        "Pending payment collected successfully."
      );

      await loadPendingDays();

      refresh();

    } catch (error) {
      console.error(
        "ADMIN COLLECTION ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Collection failed."
      );

    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     MAIN SUBMIT
  ========================================================= */

  const handleSubmit = async () => {
    setError("");

    if (
      collectionType === "ADVANCE"
    ) {
      await handleAdvancePayment();
      return;
    }

    await handlePendingPayment();
  };

  /* =========================================================
     RESET WHEN MODAL CLOSES
  ========================================================= */

  useEffect(() => {
    if (!open) {
      setCollectionType("PENDING");
      setAdvanceDays(1);
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const dailyAmount =
    Number(
      saving?.fixedAmount || 0
    );

  const advanceTotal =
    dailyAmount *
    Number(advanceDays || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4">

      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-stone-200 flex flex-col">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex items-center justify-between gap-3 bg-gradient-to-br from-emerald-900 to-emerald-700 px-4 py-4 sm:px-5 shrink-0">

          <div className="min-w-0">

            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              Admin Collection
            </p>

            <h3 className="mt-0.5 truncate text-base sm:text-lg font-bold text-white">
              {saving?.member?.memberName ||
                "Member"}
            </h3>

            <p className="mt-0.5 text-[11px] text-emerald-100">
              Member ID:{" "}
              {saving?.member?.memberId ||
                "--"}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-white hover:bg-white/10"
          >
            <X size={20} />
          </button>

        </div>

        <div className="space-y-4 sm:space-y-5 p-4 sm:p-5 flex-1 overflow-y-auto">

          {/* ===================================================
              MEMBER INFORMATION
          =================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3.5 sm:p-4">

            <div>
              <p className="text-[10px] font-bold uppercase text-stone-400">
                Area
              </p>

              <p className="mt-0.5 text-xs sm:text-sm font-bold text-stone-800">
                {saving?.areaGroup?.areaName ||
                  "--"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase text-stone-400">
                Assigned Agent
              </p>

              <p className="mt-0.5 text-xs sm:text-sm font-bold text-stone-800">
                {saving?.assignedAgent?.name ||
                  "--"}
              </p>
            </div>

          </div>

          {/* ===================================================
              COLLECTION TYPE
          =================================================== */}

          <div>

            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Collection Type
            </label>

            <div className="grid grid-cols-2 gap-3">

              {/* PENDING */}

              <button
                type="button"
                onClick={() => {
                  setCollectionType(
                    "PENDING"
                  );
                  setError("");
                }}
                className={`
                  rounded-xl
                  border
                  px-4
                  py-3
                  text-xs sm:text-sm
                  font-bold
                  transition
                  ${
                    collectionType ===
                    "PENDING"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                  }
                `}
              >
                Pending EMI
              </button>

              {/* ADVANCE */}

              <button
                type="button"
                onClick={() => {
                  setCollectionType(
                    "ADVANCE"
                  );
                  setError("");
                }}
                className={`
                  rounded-xl
                  border
                  px-4
                  py-3
                  text-xs sm:text-sm
                  font-bold
                  transition
                  ${
                    collectionType ===
                    "ADVANCE"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                  }
                `}
              >
                Advance EMI
              </button>

            </div>

          </div>

          {/* ===================================================
              ADVANCE PAYMENT
          =================================================== */}

          {collectionType === "ADVANCE" && (

            <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">

              <div>

                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Number of Advance Days
                </label>

                <input
                  type="number"
                  min="1"
                  max="365"
                  value={advanceDays}
                  onChange={(e) =>
                    setAdvanceDays(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-800 outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-[10px] text-stone-400">
                  Enter how many future saving days you want to collect.
                </p>

              </div>

              {/* AMOUNT SUMMARY */}

              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-xl border border-stone-200 bg-white p-3">

                  <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">
                    Daily Amount
                  </p>

                  <p className="mt-1 text-lg font-black text-stone-800">
                    ₹
                    {dailyAmount.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">

                  <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">
                    Total Advance
                  </p>

                  <p className="mt-1 text-lg font-black text-blue-700">
                    ₹
                    {advanceTotal.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>

              </div>

              {/* PAYMENT METHOD */}

              <div>

                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 outline-none focus:border-blue-500"
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

            </div>
          )}

          {/* ===================================================
              PENDING EMI
          =================================================== */}

          {collectionType === "PENDING" && (

            <div>

              <div className="flex items-center justify-between gap-3 mb-2">

                <div>

                  <h4 className="text-xs sm:text-sm font-bold text-stone-800">
                    Past Pending EMIs
                  </h4>

                  <p className="mt-0.5 text-[10px] sm:text-[11px] text-stone-400">
                    Select the installment you want to settle
                  </p>

                </div>

                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600 shrink-0">
                  {pendingDays.length}{" "}
                  Pending
                </span>

              </div>

              {loadingPending ? (

                <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center">

                  <Loader2
                    size={24}
                    className="mx-auto animate-spin text-emerald-600"
                  />

                  <p className="mt-2 text-xs font-semibold text-stone-500">
                    Loading pending EMIs...
                  </p>

                </div>

              ) : pendingDays.length === 0 ? (

                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6 text-center">

                  <CheckCircle2
                    size={28}
                    className="mx-auto text-emerald-600"
                  />

                  <p className="mt-2 text-xs sm:text-sm font-bold text-emerald-700">
                    No pending EMIs
                  </p>

                  <p className="mt-1 text-[11px] text-emerald-600">
                    This account is currently settled.
                  </p>

                </div>

              ) : (

                <select
                  value={
                    selectedDay?.date
                      ? new Date(
                          selectedDay.date
                        ).toISOString()
                      : ""
                  }
                  onChange={(e) =>
                    handleDayChange(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-stone-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                >

                  {pendingDays.map(
                    (day) => (
                      <option
                        key={new Date(
                          day.date
                        ).toISOString()}
                        value={new Date(
                          day.date
                        ).toISOString()}
                      >
                        EMI #
                        {
                          day.installmentNo
                        }{" "}
                        |{" "}
                        {new Date(
                          day.date
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          }
                        )}{" "}
                        | ₹
                        {Number(
                          day.total || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </option>
                    )
                  )}

                </select>
              )}

            </div>
          )}

          {/* ===================================================
              SELECTED EMI BREAKDOWN
          =================================================== */}

          {collectionType === "PENDING" &&
            selectedDay && (

              <div className="grid grid-cols-3 gap-2">

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-2.5 sm:p-3 min-w-0">

                  <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400 truncate">
                    Installment
                  </p>

                  <p className="mt-0.5 text-sm sm:text-lg font-black text-blue-700 truncate">
                    ₹
                    {Number(
                      selectedDay.dailyAmount ||
                      0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>

                <div className="rounded-xl border border-rose-100 bg-rose-50 p-2.5 sm:p-3 min-w-0">

                  <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400 truncate">
                    Penalty
                  </p>

                  <p className="mt-0.5 text-sm sm:text-lg font-black text-rose-600 truncate">
                    ₹
                    {Number(
                      selectedDay.penalty ||
                      0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-2.5 sm:p-3 min-w-0">

                  <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400 truncate">
                    Total
                  </p>

                  <p className="mt-0.5 text-sm sm:text-lg font-black text-emerald-700 truncate">
                    ₹
                    {Number(
                      selectedDay.total ||
                      0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>

              </div>
          )}

          {/* ===================================================
              PENDING PAYMENT METHOD
          =================================================== */}

          {collectionType === "PENDING" &&
            selectedDay && (

              <div>

                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-stone-700 outline-none focus:border-emerald-500"
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
          )}

          {/* ===================================================
              PENDING AMOUNT
          =================================================== */}

          {collectionType === "PENDING" &&
            selectedDay && (

              <div>

                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Collection Amount
                </label>

                <input
                  type="number"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-stone-200 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-stone-800 outline-none focus:border-emerald-500"
                />

                <p className="mt-1 text-[10px] text-stone-400">
                  Default amount includes the calculated penalty.
                </p>

              </div>
          )}

          {/* ===================================================
              ERROR
          =================================================== */}

          {error && (

            <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">

              <AlertTriangle
                size={15}
                className="mt-0.5 shrink-0"
              />

              {error}

            </div>
          )}

        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="flex gap-2.5 sm:gap-3 border-t border-stone-100 bg-stone-50 p-3.5 sm:p-4 shrink-0">

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-stone-200 bg-white py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-stone-600"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              loading ||
              loadingPending ||
              (
                collectionType ===
                  "PENDING" &&
                !selectedDay
              ) ||
              (
                collectionType ===
                  "ADVANCE" &&
                (
                  !advanceDays ||
                  Number(advanceDays) <= 0
                )
              )
            }
            className={`
              flex-1
              rounded-xl
              py-2.5
              sm:py-3
              text-xs
              sm:text-sm
              font-bold
              text-white
              transition
              disabled:cursor-not-allowed
              disabled:opacity-50
              ${
                collectionType ===
                "ADVANCE"
                  ? "bg-blue-700 hover:bg-blue-800"
                  : "bg-emerald-700 hover:bg-emerald-800"
              }
            `}
          >

            {loading ? (

              <span className="inline-flex items-center justify-center gap-2">

                <Loader2
                  size={15}
                  className="animate-spin"
                />

                Collecting...

              </span>

            ) : (

              collectionType ===
              "ADVANCE"
                ? "Collect Advance Payment"
                : "Collect Selected EMI"

            )}

          </button>

        </div>

      </div>

    </div>
  );
}

/* ── Member row actions (shared between table row + mobile card) ───────── */

function MemberActions({ item, onCollect, onEdit, onTerminate, onViewDetails, fullWidth }) {
  return (
    <div className={`flex items-center gap-1.5 xs:gap-2 flex-wrap ${fullWidth ? "w-full" : "justify-center"}`}>
      <button
        type="button"
        onClick={() => onViewDetails(item)}
        className={`inline-flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
          fullWidth ? "flex-1" : ""
        }`}
      >
        <Eye size={12} />
        View
      </button>

      {item.pendingDays > 0 && item.status === "ACTIVE" ? (
        <button
          type="button"
          onClick={() => onCollect(item)}
          className={`inline-flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
            fullWidth ? "flex-1" : ""
          }`}
        >
          <IndianRupee size={12} />
          Collect
        </button>
      ) : item.status === "ACTIVE" ? (
        <span
          className={`inline-flex items-center justify-center gap-1 bg-stone-100 text-stone-400 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold ${
            fullWidth ? "flex-1" : ""
          }`}
        >
          <CheckCircle2 size={12} /> Settled
        </span>
      ) : null}

      {item.status === "ACTIVE" && (
        <button
          type="button"
          onClick={() => onEdit(item)}
          className={`inline-flex items-center justify-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-700 ring-1 ring-sky-200 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
            fullWidth ? "flex-1" : ""
          }`}
        >
          <Pencil size={12} />
          Edit
        </button>
      )}

      {item.status === "ACTIVE" && (
        <button
          type="button"
          onClick={() => onTerminate(item)}
          className={`inline-flex items-center justify-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 ring-1 ring-rose-200 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
            fullWidth ? "flex-1" : ""
          }`}
        >
          <Ban size={12} />
          Terminate
        </button>
      )}
    </div>
  );
}

/* ── Mobile ledger card ─────────────────────────────────────────── */

function MemberCard({ item, onCollect, onEdit, onTerminate, onViewDetails }) {
  const style = avatarStyleFor(item.member?.memberName || item._id);
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-3.5 sm:p-4 space-y-3">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${style.bg} ${style.text} flex items-center justify-center font-bold text-xs shrink-0`}>
            {initialsFor(item.member?.memberName)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-stone-800 text-sm truncate">{item.member?.memberName || "—"}</p>
            <p className="text-[11px] sm:text-xs text-stone-400 font-medium truncate">{item.member?.memberId || "—"}</p>
          </div>
        </div>
        <StatusPill status={item.status} />
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-stone-500 min-w-0">
          <MapPin size={12} className="shrink-0 text-stone-400" />
          <span className="truncate">{item.areaGroup?.areaName || "—"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-500 min-w-0">
          <UserRound size={12} className="shrink-0 text-stone-400" />
          <span className="truncate">{item.assignedAgent?.name || "—"}</span>
        </div>
        {item.member?.mobile && (
          <div className="flex items-center gap-1.5 text-stone-500 col-span-2">
            <Phone size={12} className="shrink-0 text-stone-400" />
            <span>{item.member.mobile}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-stone-50 border border-stone-200 p-2.5 sm:p-3">
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400 truncate">Daily</p>
          <p className="font-bold text-stone-700 text-xs sm:text-sm truncate" style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatINR(item.collectionType === "FIXED" ? item.fixedAmount : 0)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400 truncate">Collected</p>
          <p className="font-extrabold text-emerald-600 text-xs sm:text-sm truncate" style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatINR(item.totalSaved)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400 truncate">Due</p>
          <p className="font-black text-stone-800 text-xs sm:text-sm truncate" style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatINR(item.pendingAmount)}
          </p>
        </div>
      </div>

      {item.pendingDays > 0 && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
          <AlertTriangle size={12} />
          {item.pendingDays} day{item.pendingDays === 1 ? "" : "s"} pending
        </div>
      )}

      <MemberActions item={item} onCollect={onCollect} onEdit={onEdit} onTerminate={onTerminate} onViewDetails={onViewDetails} fullWidth />
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────── */

function AdminCollections() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSaving, setSelectedSaving] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [areaFilter, setAreaFilter] = useState("ALL");
  const [pageError, setPageError] = useState("");
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsMember, setDetailsMember] = useState(null);
  const [detailsSaving, setDetailsSaving] = useState(null);
  const [detailsTransactions, setDetailsTransactions] = useState([]);

  // ==========================================
  // DAILY SAVING REQUESTS
  // ==========================================
  const [savingRequests, setSavingRequests] = useState([]);
  const [showSavingRequests, setShowSavingRequests] = useState(false);
  const [loadingSavingRequests, setLoadingSavingRequests] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);

  // Pending request details
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
  const [selectedSavingRequest, setSelectedSavingRequest] = useState(null);

  const [summary, setSummary] = useState({
    todayTarget: 0,
    todayCollected: 0,
    pendingAmount: 0,
    pendingMembers: 0,
    agentCollection: 0,
    selfCollection: 0,
  });

  const firstLoadRef = useRef(true);

  useEffect(() => {
    (async () => {
      await Promise.all([fetchMembers(), fetchSummary()]);
      firstLoadRef.current = false;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (firstLoadRef.current) return;
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setPageError("");

      const res = await axios.get(`${API_BASE}/collection-members`, { params: { filter } });

      setMembers(res.data?.members || []);
    } catch (error) {
      console.error("GET COLLECTION MEMBERS ERROR:", error);
      setMembers([]);
      setPageError(error.response?.data?.message || "Unable to load collection data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE}/collection-summary`);
      setSummary(res.data || {});
    } catch (error) {
      console.error("GET COLLECTION SUMMARY ERROR:", error);
      setPageError(error.response?.data?.message || "Unable to load collection summary.");
    }
  };

  // ==========================================
  // LOAD PENDING SAVING REQUESTS
  // ==========================================
  const fetchSavingRequests = async () => {
    try {
      setLoadingSavingRequests(true);

      const res = await axios.get(`${API_BASE}/saving-requests`);

      setSavingRequests(res.data?.requests || []);
    } catch (error) {
      console.error("GET SAVING REQUESTS ERROR:", error);

      alert(error.response?.data?.message || "Unable to load saving requests.");
    } finally {
      setLoadingSavingRequests(false);
    }
  };

  const handleOpenSavingRequests = async () => {
    setShowSavingRequests(true);
    await fetchSavingRequests();
  };

  const handleViewSavingRequest = (request) => {
    setSelectedSavingRequest(request);
    setShowRequestDetailsModal(true);
  };

  const closeSavingRequestDetails = () => {
    setShowRequestDetailsModal(false);
    setSelectedSavingRequest(null);
  };

  const handleViewDetails = async (item) => {
    try {
      setShowDetailsModal(true);
      setDetailsLoading(true);

      setDetailsMember(null);
      setDetailsSaving(null);
      setDetailsTransactions([]);

      const response = await axios.get(`${API_BASE}/saving-details/${item._id}`);

      setDetailsMember(response.data?.member || null);
      setDetailsSaving(response.data?.saving || null);
      setDetailsTransactions(response.data?.transactions || []);
    } catch (error) {
      console.error("MEMBER DETAILS ERROR:", error);

      alert(error.response?.data?.message || "Unable to load member details.");

      setShowDetailsModal(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  // ==========================================
  // APPROVE SAVING REQUEST
  // ==========================================
 const handleApproveSavingRequest = async (request) => {
  const memberName =
    request?.member?.memberName ||
    "this member";

  const isTermination =
    request?.requestType === "TERMINATION";

  const message = isTermination
    ? `Approve termination of ${memberName}'s Daily Saving Account?`
    : `Approve Daily Saving request for ${memberName}?`;

  const confirmed =
    window.confirm(message);

  if (!confirmed) return;

  try {
    setProcessingRequestId(request._id);

    await axios.put(
      `${API_BASE}/saving-request/${request._id}/approve`
    );

    alert(
      isTermination
        ? "Daily Saving Termination Approved Successfully."
        : "Daily Saving Request Approved Successfully."
    );

    await fetchSavingRequests();
    await fetchMembers();
    await fetchSummary();

  } catch (error) {
    console.error(
      "APPROVE SAVING REQUEST ERROR:",
      error
    );

    alert(
      error.response?.data?.message ||
      "Unable to approve saving request."
    );

  } finally {
    setProcessingRequestId(null);
  }
};

  // ==========================================
  // REJECT SAVING REQUEST
  // ==========================================
const handleRejectSavingRequest = async (request) => {
  const memberName =
    request?.member?.memberName ||
    "this member";

  const isTermination =
    request?.requestType === "TERMINATION";

  const requestLabel = isTermination
    ? "termination request"
    : "Daily Saving request";

  const rejectionReason =
    window.prompt(
      `Enter rejection reason for ${memberName}:`
    );

  if (rejectionReason === null) {
    return;
  }

  const reason =
    rejectionReason.trim() ||
    "Rejected by Admin";

  const confirmed =
    window.confirm(
      `Reject ${requestLabel} for ${memberName}?`
    );

  if (!confirmed) {
    return;
  }

  try {
    setProcessingRequestId(request._id);

    await axios.put(
      `${API_BASE}/saving-request/${request._id}/reject`,
      {
        rejectionReason: reason,
      }
    );

    alert(
      isTermination
        ? "Termination Request Rejected Successfully."
        : "Daily Saving Request Rejected Successfully."
    );

    await fetchSavingRequests();

  } catch (error) {
    console.error(
      "REJECT SAVING REQUEST ERROR:",
      error
    );

    alert(
      error.response?.data?.message ||
      "Unable to reject saving request."
    );

  } finally {
    setProcessingRequestId(null);
  }
};

  const handleTerminate = async (saving) => {
    const reason = window.prompt(`Enter termination reason for ${saving.member?.memberName}:`);
    if (!reason) return;

    const confirmTerminate = window.confirm(
      `Are you sure you want to terminate ${saving.member?.memberName}'s Daily Saving Account?`
    );
    if (!confirmTerminate) return;

    try {
      await axios.put(`${API_BASE}/saving/${saving._id}/terminate`, {
        reason,
        terminatedBy: "ADMIN",
      });
      alert("Saving Account Terminated Successfully");
      fetchMembers();
      fetchSummary();
    } catch (error) {
      console.error(error);
      setMembers((prev) =>
        prev.map((m) => (m._id === saving._id ? { ...m, status: "TERMINATED" } : m))
      );
    }
  };

  const handleCollect = (item) => {
    setSelectedSaving(item);
    setOpenModal(true);
  };

  const handleEdit = (item) => {
    navigate(`/daily/edit-saving/${item._id}`);
  };

  const areaOptions = useMemo(
    () => ["ALL", ...new Set(members.map((item) => item.areaGroup?.areaName).filter(Boolean))],
    [members]
  );

  let filteredMembers = members.filter((item) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      item.member?.memberName?.toLowerCase().includes(searchTerm) ||
      item.member?.memberId?.toLowerCase().includes(searchTerm) ||
      item.member?.mobile?.includes(searchTerm);

    const memberArea = item.areaGroup?.areaName || "";
    const matchesArea = areaFilter === "ALL" || memberArea === areaFilter;

    return matchesSearch && matchesArea;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (filter === "PENDING") {
    filteredMembers = filteredMembers.filter((item) => item.pendingDays > 0);
  }
  if (filter === "COMPLETED") {
    filteredMembers = filteredMembers.filter((item) => item.pendingDays === 0);
  }
  if (["7DAYS", "15DAYS", "30DAYS"].includes(filter)) {
    const window_ = filter === "7DAYS" ? 7 : filter === "15DAYS" ? 15 : 30;
    filteredMembers = filteredMembers.filter((item) => {
      const end = new Date(item.endDate);
      const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= window_;
    });
  }
  if (filter === "MONTH") {
    filteredMembers = filteredMembers.filter((item) => {
      const end = new Date(item.endDate);
      return end.getMonth() === today.getMonth() && end.getFullYear() === today.getFullYear();
    });
  }

  const totalCollection = members.reduce((sum, item) => sum + (item.totalSaved || 0), 0);
  const totalPending = members.reduce((sum, item) => sum + (item.pendingAmount || 0), 0);
  const activeMembers = members.length;
  const completedMembers = members.filter((item) => item.pendingDays === 0).length;

  const goTo = (path) => navigate(path);

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 rounded-b-2xl sm:rounded-b-3xl shadow-lg">
        <Wallet size={120} strokeWidth={1} className="absolute -right-4 -top-4 text-emerald-500/10 rotate-12 sm:hidden" />
        <Wallet size={180} strokeWidth={1} className="absolute -right-6 -top-6 text-emerald-500/10 rotate-12 hidden sm:block" />
        
        <div className="relative max-w-7xl mx-auto px-3.5 sm:px-6 md:px-8 py-5 sm:py-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-emerald-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] mb-1 sm:mb-2">
              Daily Savings Ledger
            </p>
            <h1 className="font-serif text-xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Collection Overview
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 sm:mt-2 max-w-xl">
              Track today's field collections, settle open installments, and keep every member's passbook up to date.
            </p>
          </div>

          <div className="flex flex-col xs:flex-row gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={handleOpenSavingRequests}
              className="relative w-full xs:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all duration-200"
            >
              <Inbox size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
              <span>Pending Requests</span>
              {savingRequests.length > 0 && (
                <span className="min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black">
                  {savingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => goTo("/daily/create-saving")}
              className="w-full xs:w-auto inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <Plus size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
              <span>New Saving Account</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {pageError && (
          <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{pageError}</span>
          </div>
        )}

        {/* Primary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <KpiCard icon={TrendingUp} label="Today's Target" value={formatINR(summary.todayTarget)} accent="emerald" big />
          <KpiCard icon={IndianRupee} label="Collected Today" value={formatINR(summary.todayCollected)} accent="amber" big />
          <KpiCard icon={AlertTriangle} label="Pending Today" value={formatINR(summary.pendingAmount)} accent="rose" big />
          <KpiCard icon={Users} label="Pending Members" value={summary.pendingMembers} accent="indigo" big />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          <KpiCard icon={UserRound} label="Agent Collection" value={formatINR(summary.agentCollection)} accent="teal" />
          <KpiCard icon={ShieldCheck} label="Active Accounts" value={activeMembers} accent="stone" />
          <KpiCard icon={Wallet} label="Total Collection" value={formatINR(totalCollection)} accent="emerald" />
          <KpiCard icon={AlertTriangle} label="Outstanding" value={formatINR(totalPending)} accent="rose" />
          <KpiCard icon={CheckCircle2} label="Completed" value={completedMembers} accent="teal" />
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-3 sm:p-4 flex flex-col md:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search name, ID, mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-stone-700 placeholder-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex gap-2.5 sm:gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full md:w-56 bg-stone-50 border border-stone-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-stone-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer truncate"
            >
              <option value="ALL">All Accounts</option>
              <option value="PENDING">Pending Collection</option>
              <option value="COMPLETED">Completed Accounts</option>
              <option value="7DAYS">Maturing in Next 7 Days</option>
              <option value="15DAYS">Maturing in Next 15 Days</option>
              <option value="30DAYS">Maturing in Next 30 Days</option>
              <option value="MONTH">Maturing This Month</option>
            </select>

            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full md:w-48 bg-stone-50 border border-stone-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-stone-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer truncate"
            >
              <option value="ALL">All Areas</option>
              {areaOptions
                .filter((area) => area !== "ALL")
                .map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Ledger View */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm py-12 sm:py-16 text-center text-stone-400 text-xs sm:text-sm font-semibold">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={22} className="animate-spin text-emerald-600" />
              Loading collection ledgers...
            </div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm py-12 sm:py-16 text-center text-stone-400 text-xs sm:text-sm font-medium">
            <div className="flex flex-col items-center gap-2">
              <Inbox size={26} className="text-stone-300" />
              No matching records found for these filters.
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Cards (Below lg) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3">
              {filteredMembers.map((item) => (
                <MemberCard
                  key={item._id}
                  item={item}
                  onCollect={handleCollect}
                  onEdit={handleEdit}
                  onTerminate={handleTerminate}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {/* Desktop Table (lg and up) */}
            <div className="hidden lg:block bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-stone-900 text-[10px] sm:text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                      <th className="p-3.5 sm:p-4">Member</th>
                      <th className="p-3.5 sm:p-4">Area</th>
                      <th className="p-3.5 sm:p-4">Agent</th>
                      <th className="p-3.5 sm:p-4 text-right">Daily Commitment</th>
                      <th className="p-3.5 sm:p-4 text-right">Collected</th>
                      <th className="p-3.5 sm:p-4 text-center">Pending Days</th>
                      <th className="p-3.5 sm:p-4 text-right">Due Balance</th>
                      <th className="p-3.5 sm:p-4 text-center">Status</th>
                      <th className="p-3.5 sm:p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs sm:text-sm text-stone-600 divide-y divide-stone-100">
                    {filteredMembers.map((item, idx) => {
                      const style = avatarStyleFor(item.member?.memberName || item._id);
                      return (
                        <tr
                          key={item._id}
                          className={`transition-colors hover:bg-emerald-50/50 ${idx % 2 === 1 ? "bg-stone-50/60" : "bg-white"}`}
                        >
                          <td className="p-3.5 sm:p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${style.bg} ${style.text} flex items-center justify-center font-bold text-xs shrink-0`}>
                                {initialsFor(item.member?.memberName)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-stone-800 truncate">{item.member?.memberName || "—"}</p>
                                <p className="text-[11px] sm:text-xs text-stone-400 font-medium flex items-center gap-1 truncate">
                                  {item.member?.memberId || "—"}
                                  {item.member?.mobile && (
                                    <span className="flex items-center gap-0.5 ml-1.5">
                                      <Phone size={10} /> {item.member.mobile}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 sm:p-4 text-stone-600">
                            <span className="inline-flex items-center gap-1.5 truncate">
                              <MapPin size={13} className="text-stone-400 shrink-0" />
                              {item.areaGroup?.areaName || "—"}
                            </span>
                          </td>
                          <td className="p-3.5 sm:p-4 text-stone-600 font-medium truncate">{item.assignedAgent?.name || "—"}</td>
                          <td className="p-3.5 sm:p-4 text-right font-bold text-stone-700 whitespace-nowrap" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {formatINR(item.collectionType === "FIXED" ? item.fixedAmount : 0)}
                          </td>
                          <td className="p-3.5 sm:p-4 text-right font-extrabold text-emerald-600 whitespace-nowrap" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {formatINR(item.totalSaved)}
                          </td>
                          <td className="p-3.5 sm:p-4 text-center">
                            {item.pendingDays > 0 ? (
                              <span className="inline-flex items-center justify-center min-w-[1.75rem] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 ring-1 ring-rose-200 font-extrabold text-xs">
                                {item.pendingDays}
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center min-w-[1.75rem] px-2 py-0.5 rounded-full bg-stone-100 text-stone-400 font-bold text-xs">
                                0
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 sm:p-4 text-right font-black text-stone-800 whitespace-nowrap" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {formatINR(item.pendingAmount)}
                          </td>
                          <td className="p-3.5 sm:p-4 text-center">
                            <StatusPill status={item.status} />
                          </td>
                          <td className="p-3.5 sm:p-4">
                            <MemberActions
                              item={item}
                              onCollect={handleCollect}
                              onEdit={handleEdit}
                              onTerminate={handleTerminate}
                              onViewDetails={handleViewDetails}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ==========================================
          COMPLETE MEMBER DETAILS MODAL
      ========================================== */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
          <div className="w-full max-w-7xl max-h-[92vh] sm:max-h-[95vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-stone-200 flex flex-col">
            <div className="flex items-center justify-between gap-3 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-3.5 sm:px-6 py-3.5 sm:py-4 shrink-0">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                  Complete Member Ledger
                </p>
                <h3 className="mt-0.5 sm:mt-1 text-base sm:text-xl font-black text-white truncate">
                  {detailsMember?.memberName || "Member Details"}
                </h3>
                <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-300 truncate">
                  Member ID: {detailsMember?.memberId || "—"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  setDetailsMember(null);
                  setDetailsSaving(null);
                  setDetailsTransactions([]);
                }}
                className="shrink-0 rounded-lg p-1.5 text-white hover:bg-white/10 transition"
                aria-label="Close member details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 sm:space-y-5">
              {detailsLoading ? (
                <div className="min-h-[50vh] flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 size={30} className="mx-auto animate-spin text-emerald-600" />
                    <p className="mt-3 text-xs sm:text-sm font-semibold text-stone-500">Loading member ledger...</p>
                  </div>
                </div>
              ) : (
                <>
                  <section className="rounded-2xl border border-stone-200 bg-stone-50 p-3.5 sm:p-5">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <UserRound size={16} className="text-indigo-600 sm:w-[18px] sm:h-[18px]" />
                      <h4 className="text-xs sm:text-sm font-black text-stone-800">Member Information</h4>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {[
                        ["Full Name", detailsMember?.memberName],
                        ["Member ID", detailsMember?.memberId],
                        ["Mobile", detailsMember?.mobile],
                        ["Alternate Mobile", detailsMember?.alternateMobile],
                        ["Father / Husband", detailsMember?.fatherName || detailsMember?.fatherOrHusbandName],
                        ["Gender", detailsMember?.gender],
                        ["Date of Birth", detailsMember?.dob ? new Date(detailsMember.dob).toLocaleDateString("en-IN") : "—"],
                        ["Email", detailsMember?.email],
                        ["City", detailsMember?.city],
                        ["District", detailsMember?.district],
                        ["State", detailsMember?.state],
                        ["PIN Code", detailsMember?.pincode || detailsMember?.pinCode],
                        ["Nominee", detailsMember?.nomineeName],
                        ["Nominee Mobile", detailsMember?.nomineeMobile],
                        ["Aadhaar", detailsMember?.aadhaarNumber],
                      ].map(([label, value]) => (
                        <div key={label} className="min-w-0">
                          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400 truncate">{label}</p>
                          <p className="mt-0.5 text-xs sm:text-sm font-bold text-stone-800 break-words">{value || "—"}</p>
                        </div>
                      ))}

                      <div className="col-span-2 lg:col-span-4">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400 truncate">Address</p>
                        <p className="mt-0.5 text-xs sm:text-sm font-semibold text-stone-800 break-words">
                          {detailsMember?.residentialAddress || detailsMember?.address || "—"}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 sm:p-5">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <Wallet size={16} className="text-emerald-600 sm:w-[18px] sm:h-[18px]" />
                      <h4 className="text-xs sm:text-sm font-black text-stone-800">Saving Account</h4>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 truncate">Daily Amount</p>
                        <p className="mt-0.5 text-xs sm:text-sm font-black text-stone-800 truncate">{formatINR(detailsSaving?.fixedAmount)}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 truncate">Total Saved</p>
                        <p className="mt-0.5 text-xs sm:text-sm font-black text-emerald-700 truncate">{formatINR(detailsSaving?.totalSaved)}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 truncate">Paid Days</p>
                        <p className="mt-0.5 text-xs sm:text-sm font-black text-stone-800 truncate">{detailsSaving?.totalDaysPaid || 0}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 truncate">Pending Days</p>
                        <p className="mt-0.5 text-xs sm:text-sm font-black text-rose-600 truncate">{detailsSaving?.pendingDays || 0}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 truncate">Pending Amount</p>
                        <p className="mt-0.5 text-xs sm:text-sm font-black text-rose-600 truncate">{formatINR(detailsSaving?.pendingAmount)}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 truncate">Penalty Paid</p>
                        <p className="mt-0.5 text-xs sm:text-sm font-black text-amber-700 truncate">{formatINR(detailsSaving?.totalPenalty)}</p>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                      <div>
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 truncate">Start Date</p>
                        <p className="mt-0.5 text-xs sm:text-sm font-bold text-stone-800 truncate">
                          {detailsSaving?.startDate ? new Date(detailsSaving.startDate).toLocaleDateString("en-IN") : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 truncate">End Date</p>
                        <p className="mt-0.5 text-xs sm:text-sm font-bold text-stone-800 truncate">
                          {detailsSaving?.endDate ? new Date(detailsSaving.endDate).toLocaleDateString("en-IN") : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 truncate">Assigned Agent</p>
                        <p className="mt-0.5 text-xs sm:text-sm font-bold text-stone-800 truncate">
                          {detailsSaving?.assignedAgent?.name || selectedSaving?.assignedAgent?.name || "—"}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-100 px-3.5 sm:px-5 py-3 sm:py-4">
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-stone-800">Complete Transaction History</h4>
                        <p className="mt-0.5 text-[10px] sm:text-[11px] text-stone-400">
                          Every payment recorded against this saving account
                        </p>
                      </div>
                      <span className="self-start sm:self-auto rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black text-indigo-700">
                        {detailsTransactions.length} Records
                      </span>
                    </div>

                    {detailsTransactions.length === 0 ? (
                      <div className="p-8 sm:p-10 text-center text-stone-400">
                        <FileText size={26} className="mx-auto text-stone-300" />
                        <p className="mt-2 text-xs sm:text-sm font-bold">No transaction history found</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] sm:min-w-[1000px] text-left">
                          <thead className="bg-stone-50">
                            <tr className="text-[9px] sm:text-[10px] uppercase tracking-wider text-stone-400">
                              <th className="px-3 sm:px-4 py-2.5 sm:py-3">Collection Date / Time</th>
                              <th className="px-3 sm:px-4 py-2.5 sm:py-3">Payment For</th>
                              <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">Amount</th>
                              <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">Penalty</th>
                              <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">Total</th>
                              <th className="px-3 sm:px-4 py-2.5 sm:py-3">Method</th>
                              <th className="px-3 sm:px-4 py-2.5 sm:py-3">Collector</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {detailsTransactions.map((tx) => (
                              <tr key={tx._id} className="text-xs text-stone-700 hover:bg-stone-50">
                                <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold whitespace-nowrap">
                                  {tx.collectionDate
                                    ? new Date(tx.collectionDate).toLocaleString("en-IN", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      })
                                    : "—"}
                                </td>
                                <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium whitespace-nowrap">
                                  {tx.paymentForDate ? new Date(tx.paymentForDate).toLocaleDateString("en-IN") : "—"}
                                </td>
                                <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right font-bold whitespace-nowrap">{formatINR(tx.dailyAmount)}</td>
                                <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right font-bold text-rose-600 whitespace-nowrap">
                                  {formatINR(tx.penalty)}
                                </td>
                                <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right font-black text-emerald-700 whitespace-nowrap">
                                  {formatINR(tx.totalAmount)}
                                </td>
                                <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">
                                  <span className="inline-flex rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-bold text-stone-600">
                                    {tx.paymentMethod || "—"}
                                  </span>
                                </td>
                                <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-bold whitespace-nowrap">
                                  {tx.collectorType === "ADMIN" ? "Admin" : "Agent"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          PENDING SAVING REQUESTS MODAL
      ========================================== */}
      {showSavingRequests && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-5">
          <div className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-stone-200 flex flex-col">
            <div className="flex items-center justify-between gap-3 bg-gradient-to-br from-emerald-900 to-emerald-700 px-4 sm:px-6 py-3.5 sm:py-4 shrink-0">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Admin Approval</p>
            <h3 className="text-base sm:text-xl font-bold text-white truncate">
  Pending Daily Saving Requests
</h3>

<p className="text-[10px] sm:text-[11px] text-emerald-100 mt-0.5 truncate">
  Review account creation and termination requests submitted by agents.
</p>
              </div>

              <button type="button" onClick={() => setShowSavingRequests(false)} className="shrink-0 rounded-lg p-1.5 text-white hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-5">
              {loadingSavingRequests ? (
                <div className="py-12 sm:py-16 text-center">
                  <Loader2 size={26} className="mx-auto animate-spin text-emerald-600" />
                  <p className="mt-2 text-xs sm:text-sm font-semibold text-stone-500">Loading pending requests...</p>
                </div>
              ) : savingRequests.length === 0 ? (
                <div className="py-12 sm:py-16 text-center rounded-xl border border-emerald-100 bg-emerald-50">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                  <p className="mt-2 text-xs sm:text-sm font-bold text-emerald-700">No Pending Requests</p>
                  <p className="mt-1 text-[11px] text-emerald-600">All Daily Saving requests have been processed.</p>
                </div>
              ) : (
                <>
                  {/* Desktop view */}
                  <div className="hidden lg:block overflow-x-auto rounded-xl border border-stone-200">
                    <table className="w-full min-w-[900px] text-left">
                      <thead>
                        <tr className="bg-stone-900 text-[10px] font-bold uppercase tracking-wider text-stone-300">
                          <th className="p-3">Request Type</th>

                          <th className="p-3">Member</th>
                          <th className="p-3">Agent</th>
                          <th className="p-3">Area</th>
                          <th className="p-3">Collection</th>
                          <th className="p-3">Duration</th>
                          <th className="p-3">Start Date</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-stone-100 text-sm">
                        {savingRequests.map((request) => {
                          const amount = request.collectionType === "FIXED" ? Number(request.fixedAmount || 0) : 0;
                          const processing = processingRequestId === request._id;

                          return (
                            <tr key={request._id} className="hover:bg-emerald-50/40">
                              <td className="p-3">
  {request.requestType === "TERMINATION" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200 whitespace-nowrap">
      <XCircle size={12} />
      Termination Request
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200 whitespace-nowrap">
      <Plus size={12} />
      Account Creation
    </span>
  )}
</td>

                              <td className="p-3">
                                <p className="font-bold text-stone-800">{request.member?.memberName || "—"}</p>
                                <p className="text-[11px] text-stone-400">ID: {request.member?.memberId || "—"}</p>
                                <p className="text-[11px] text-stone-400">{request.member?.mobile || "—"}</p>
                              </td>

                              <td className="p-3">
                                <p className="font-semibold text-stone-700">{request.requestedBy?.name || "—"}</p>
                                <p className="text-[11px] text-stone-400">{request.requestedBy?.mobile || "—"}</p>
                              </td>

                              <td className="p-3 font-medium text-stone-600">{request.areaGroup?.areaName || "—"}</td>

                              <td className="p-3">
                                <span className="font-bold text-stone-700">{request.collectionType || "—"}</span>
                                {request.collectionType === "FIXED" && <p className="text-emerald-700 font-black">{formatINR(amount)}</p>}
                              </td>

                              <td className="p-3 font-semibold text-stone-600">{request.durationDays || 0} Days</td>

                              <td className="p-3 font-medium text-stone-600 whitespace-nowrap">
                                {request.startDate ? new Date(request.startDate).toLocaleDateString("en-IN") : "—"}
                              </td>

                              <td className="p-3">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleViewSavingRequest(request)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 px-3 py-2 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200"
                                  >
                                    <Eye size={13} />
                                    View
                                  </button>

                                  <button
                                    type="button"
                                    disabled={processing}
                                    onClick={() => handleApproveSavingRequest(request)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-3 py-2 text-xs font-bold text-white"
                                  >
                                    {processing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                    Approve
                                  </button>

                                  <button
                                    type="button"
                                    disabled={processing}
                                    onClick={() => handleRejectSavingRequest(request)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 disabled:opacity-50 px-3 py-2 text-xs font-bold text-rose-700 ring-1 ring-rose-200"
                                  >
                                    <XCircle size={13} />
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile view */}
                  <div className="lg:hidden space-y-3">
                    {savingRequests.map((request) => {
                      const amount = request.collectionType === "FIXED" ? Number(request.fixedAmount || 0) : 0;
                      const processing = processingRequestId === request._id;

                      return (
                        <div key={request._id} className="rounded-xl border border-stone-200 bg-white p-3.5 sm:p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-bold text-stone-800 text-sm truncate">{request.member?.memberName || "—"}</p>
                              <p className="text-[11px] text-stone-400">ID: {request.member?.memberId || "—"}</p>
                              <p className="text-[11px] text-stone-400">{request.member?.mobile || "—"}</p>
                            </div>

                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200 shrink-0">
                              Pending
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-stone-50 border border-stone-200 p-2.5 sm:p-3 text-xs">
                            <div className="min-w-0">
                              <p className="text-[9px] uppercase font-bold text-stone-400 truncate">Agent</p>
                              <p className="mt-0.5 font-bold text-stone-700 truncate">{request.requestedBy?.name || "—"}</p>
                            </div>

                            <div className="min-w-0">
                              <p className="text-[9px] uppercase font-bold text-stone-400 truncate">Area</p>
                              <p className="mt-0.5 font-bold text-stone-700 truncate">{request.areaGroup?.areaName || "—"}</p>
                            </div>

                            <div className="min-w-0">
                              <p className="text-[9px] uppercase font-bold text-stone-400 truncate">Daily Amount</p>
                              <p className="mt-0.5 font-black text-emerald-700 truncate">
                                {request.collectionType === "FIXED" ? formatINR(amount) : "Flexible"}
                              </p>
                            </div>

                            <div className="min-w-0">
                              <p className="text-[9px] uppercase font-bold text-stone-400 truncate">Duration</p>
                              <p className="mt-0.5 font-bold text-stone-700 truncate">{request.durationDays || 0} Days</p>
                            </div>

                            <div className="min-w-0">
                              <p className="text-[9px] uppercase font-bold text-stone-400 truncate">Start Date</p>
                              <p className="mt-0.5 font-bold text-stone-700 truncate">
                                {request.startDate ? new Date(request.startDate).toLocaleDateString("en-IN") : "—"}
                              </p>
                            </div>

                            <div className="min-w-0">
                              <p className="text-[9px] uppercase font-bold text-stone-400 truncate">Collection</p>
                              <p className="mt-0.5 font-bold text-stone-700 truncate">{request.collectionType || "—"}</p>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewSavingRequest(request)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 px-3 py-2 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200"
                            >
                              <Eye size={13} />
                              View
                            </button>

                            <button
                              type="button"
                              disabled={processing}
                              onClick={() => handleApproveSavingRequest(request)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-3 py-2 text-xs font-bold text-white"
                            >
                              {processing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                              Approve
                            </button>

                            <button
                              type="button"
                              disabled={processing}
                              onClick={() => handleRejectSavingRequest(request)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 disabled:opacity-50 px-3 py-2 text-xs font-bold text-rose-700 ring-1 ring-rose-200"
                            >
                              <XCircle size={13} />
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-stone-100 bg-stone-50 p-3 sm:p-4 shrink-0">
              <button
                type="button"
                onClick={() => setShowSavingRequests(false)}
                className="w-full rounded-xl border border-stone-200 bg-white py-2.5 text-xs sm:text-sm font-bold text-stone-600 hover:bg-stone-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          PENDING REQUEST COMPLETE DETAILS MODAL
      ========================================== */}
      {showRequestDetailsModal && selectedSavingRequest && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
          <div className="w-full max-w-4xl max-h-[94vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-stone-200 flex flex-col">
            <div className="flex items-center justify-between gap-3 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 px-4 sm:px-6 py-4 shrink-0">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                  Pending Saving Request
                </p>
                <h3 className="mt-0.5 text-base sm:text-xl font-black text-white truncate">
                  {selectedSavingRequest.member?.memberName || "Saving Request"}
                </h3>
                <p className="mt-0.5 text-[10px] sm:text-[11px] text-indigo-200 truncate">
                  Request ID: {selectedSavingRequest._id || "—"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeSavingRequestDetails}
                className="shrink-0 rounded-lg p-1.5 text-white hover:bg-white/10 transition"
                aria-label="Close request details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
              <section className="rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <UserRound size={18} className="text-indigo-600" />
                  <h4 className="text-sm font-black text-stone-800">Member Information</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {[
                    ["Member Name", selectedSavingRequest.member?.memberName],
                    ["Member ID", selectedSavingRequest.member?.memberId],
                    ["Mobile", selectedSavingRequest.member?.mobile],
                    ["Alternate Mobile", selectedSavingRequest.member?.alternateMobile],
                    ["Father / Husband", selectedSavingRequest.member?.fatherName || selectedSavingRequest.member?.fatherOrHusbandName],
                    ["Gender", selectedSavingRequest.member?.gender],
                    ["Date of Birth", selectedSavingRequest.member?.dob ? new Date(selectedSavingRequest.member.dob).toLocaleDateString("en-IN") : "—"],
                    ["Email", selectedSavingRequest.member?.email],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400 truncate">{label}</p>
                      <p className="mt-0.5 text-xs sm:text-sm font-bold text-stone-800 break-words">{value || "—"}</p>
                    </div>
                  ))}

                  <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400">Address</p>
                    <p className="mt-0.5 text-xs sm:text-sm font-semibold text-stone-800 break-words">
                      {selectedSavingRequest.member?.residentialAddress || selectedSavingRequest.member?.address || "—"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <UserRound size={18} className="text-blue-600" />
                  <h4 className="text-sm font-black text-stone-800">Agent / Request Information</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {[
                    ["Agent Name", selectedSavingRequest.requestedBy?.name],
                    ["Agent Mobile", selectedSavingRequest.requestedBy?.mobile],
                    ["Agent ID", selectedSavingRequest.requestedBy?._id],
                    ["Area Group", selectedSavingRequest.areaGroup?.areaName],
                    ["Request Status", selectedSavingRequest.status || "PENDING"],
                    ["Requested At", selectedSavingRequest.createdAt ? new Date(selectedSavingRequest.createdAt).toLocaleString("en-IN") : "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400 truncate">{label}</p>
                      <p className="mt-0.5 text-xs sm:text-sm font-bold text-stone-800 break-words">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet size={18} className="text-emerald-600" />
                  <h4 className="text-sm font-black text-stone-800">Daily Saving Plan Details</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {[
                    ["Collection Type", selectedSavingRequest.collectionType],
                    ["Daily Fixed Amount", selectedSavingRequest.collectionType === "FIXED" ? formatINR(selectedSavingRequest.fixedAmount) : "Flexible"],
                    ["Duration", `${selectedSavingRequest.durationDays || 0} Days`],
                    ["Start Date", selectedSavingRequest.startDate ? new Date(selectedSavingRequest.startDate).toLocaleDateString("en-IN") : "—"],
                    ["End Date", selectedSavingRequest.endDate ? new Date(selectedSavingRequest.endDate).toLocaleDateString("en-IN") : "—"],
                    ["Grace Period", `${selectedSavingRequest.graceDays ?? 0} Days`],
                    ["Penalty Type", selectedSavingRequest.penaltyType],
                    ["Penalty Value", selectedSavingRequest.penaltyValue ?? 0],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400 truncate">{label}</p>
                      <p className="mt-0.5 text-xs sm:text-sm font-black text-stone-800 break-words">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={18} className="text-amber-600" />
                  <h4 className="text-sm font-black text-stone-800">Nominee Information</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400">Nominee Name</p>
                    <p className="mt-0.5 text-xs sm:text-sm font-bold text-stone-800">{selectedSavingRequest.nomineeName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400">Nominee Mobile</p>
                    <p className="mt-0.5 text-xs sm:text-sm font-bold text-stone-800">{selectedSavingRequest.nomineeMobile || "—"}</p>
                  </div>
                </div>
              </section>

              {(selectedSavingRequest.rejectionReason || selectedSavingRequest.notes) && (
                <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
                  <h4 className="text-sm font-black text-stone-800 mb-3">Additional Information</h4>

                  {selectedSavingRequest.notes && (
                    <div className="mb-3">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Notes</p>
                      <p className="mt-1 text-xs sm:text-sm font-semibold text-stone-700 whitespace-pre-wrap">
                        {selectedSavingRequest.notes}
                      </p>
                    </div>
                  )}

                  {selectedSavingRequest.rejectionReason && (
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Rejection Reason</p>
                      <p className="mt-1 text-xs sm:text-sm font-semibold text-rose-700 whitespace-pre-wrap">
                        {selectedSavingRequest.rejectionReason}
                      </p>
                    </div>
                  )}
                </section>
              )}
            </div>

            <div className="border-t border-stone-100 bg-stone-50 p-3 sm:p-4 shrink-0">
              <button
                type="button"
                onClick={closeSavingRequestDetails}
                className="w-full rounded-xl border border-stone-200 bg-white py-2.5 text-xs sm:text-sm font-bold text-stone-600 hover:bg-stone-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {openModal && selectedSaving && (
        <CollectPaymentModal
          saving={selectedSaving}
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setSelectedSaving(null);
          }}
          refresh={async () => {
            await Promise.all([fetchMembers(), fetchSummary()]);
          }}
        />
      )}
    </div>
  );
}

export default AdminCollections;