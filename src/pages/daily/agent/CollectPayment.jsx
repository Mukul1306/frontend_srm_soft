import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Wallet,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_BASE = "https://finance-project-0qqk.onrender.com/api/daily";

function CollectPayment() {
  const { savingId } = useParams();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(null);
  const [pendingDays, setPendingDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // PENDING / ADVANCE
  const [collectionType, setCollectionType] = useState("PENDING");
  const [advanceDays, setAdvanceDays] = useState(1);

  // ============================================================
  // FORMAT MONEY
  // ============================================================
  const formatAmount = (value) => {
    const number = Number(value || 0);

    return number.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  };

  // ============================================================
  // FORMAT DATE FOR DISPLAY
  // ============================================================
  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN");
  };

  // ============================================================
  // NORMALIZE DATE TO YYYY-MM-DD
  // ============================================================
  const dateKey = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    // The backend sends the pending date as an IST date.
    // Convert using Asia/Kolkata so the selected installment
    // cannot move to the previous/next calendar day.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  // ============================================================
  // LOAD CURRENT PENDING INSTALLMENTS
  // ============================================================
  const loadSaving = useCallback(async () => {
    if (!savingId) {
      setErrorMessage("Saving account ID is missing.");
      setPageLoading(false);
      return;
    }

    try {
      setErrorMessage("");

      const response = await axios.get(
        `${API_BASE}/pending-days/${savingId}`,
        {
          timeout: 90000,
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          params: {
            _t: Date.now(),
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to load pending installments."
        );
      }

      const currentSaving = response.data.saving || null;
      const currentPendingDays = Array.isArray(response.data.pendingDays)
        ? response.data.pendingDays
        : [];

      setSaving(currentSaving);
      setPendingDays(currentPendingDays);

      // ========================================================
      // SELECT FIRST PENDING DAY
      // ========================================================
      if (currentPendingDays.length > 0) {
        const firstDay = currentPendingDays[0];

        setSelectedDay(firstDay);

        if (currentSaving?.collectionType === "FIXED") {
          setAmount(Number(currentSaving.fixedAmount || 0));
        } else {
          setAmount(Number(firstDay.dailyAmount || 0));
        }
      } else {
        // Nothing pending anymore.
        setSelectedDay(null);
        setAmount("");
      }
    } catch (error) {
      console.error("Error loading account details:", error);

      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to load account details."
      );
    } finally {
      setPageLoading(false);
    }
  }, [savingId]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================
  useEffect(() => {
    loadSaving();
  }, [loadSaving]);

  // ============================================================
  // CHANGE SELECTED INSTALLMENT
  // ============================================================
  const handleDayChange = (event) => {
    const selectedDate = event.target.value;

    const day = pendingDays.find(
      (item) => dateKey(item.date) === selectedDate
    );

    if (!day) {
      setSelectedDay(null);
      setAmount("");
      return;
    }

    setSelectedDay(day);

    if (saving?.collectionType === "FIXED") {
      setAmount(Number(saving.fixedAmount || 0));
    } else {
      setAmount(Number(day.dailyAmount || 0));
    }
  };

  // ============================================================
  // COLLECT PAYMENT
  // ============================================================
  const collectPayment = async () => {
    if (loading) return;

    if (!saving?._id) {
      alert("Saving account information is missing.");
      return;
    }

    // ========================================================
    // ADVANCE PAYMENT
    // ========================================================
    if (collectionType === "ADVANCE") {
      const days = Number(advanceDays);

      if (!Number.isInteger(days) || days <= 0 || days > 365) {
        alert("Enter a valid number of advance days (1-365).");
        return;
      }

      if (!paymentMethod) {
        alert("Please select payment method.");
        return;
      }

      const localAgent = localStorage.getItem("agent");

      if (!localAgent) {
        alert("Authentication Error: Collector agent session not found.");
        return;
      }

      let agent;

      try {
        agent = JSON.parse(localAgent);
      } catch (error) {
        console.error("Invalid agent session:", error);
        alert("Authentication Error: Invalid agent session.");
        return;
      }

      if (!agent?._id) {
        alert("Authentication Error: Agent ID not found.");
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const response = await axios.post(
          `${API_BASE}/collect-advance`,
          {
            savingId: saving._id,
            numberOfDays: days,
            collectorType: "AGENT",
            collectorId: agent._id,
            paymentMethod,
          },
          { timeout: 90000 }
        );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Advance payment failed."
          );
        }

        alert(
          `Advance Payment Collected Successfully!\n\nDays: ${
            response.data.numberOfDays || days
          }\nAmount: ₹${formatAmount(
            response.data.totalAmount || 0
          )}`
        );

        setAdvanceDays(1);
        await loadSaving();

      } catch (error) {
        console.error("Advance collection failed:", error);

        const message =
          error.response?.data?.message ||
          error.message ||
          "Advance collection failed to process.";

        setErrorMessage(message);
        alert(message);
      } finally {
        setLoading(false);
      }

      return;
    }

    // ========================================================
    // NORMAL PENDING PAYMENT
    // ========================================================
    if (!selectedDay?.date) {
      alert("Please select a pending installment.");
      return;
    }

    let paymentAmount = 0;

    if (saving.collectionType === "FIXED") {
      paymentAmount = Number(saving.fixedAmount || 0);
    } else {
      paymentAmount = Number(amount || 0);
    }

    if (!paymentAmount || paymentAmount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const localAgent = localStorage.getItem("agent");

    if (!localAgent) {
      alert("Authentication Error: Collector agent session not found.");
      return;
    }

    let agent;

    try {
      agent = JSON.parse(localAgent);
    } catch (error) {
      console.error("Invalid agent session:", error);
      alert("Authentication Error: Invalid agent session.");
      return;
    }

    if (!agent?._id) {
      alert("Authentication Error: Agent ID not found.");
      return;
    }

    const paymentForDate = selectedDay.date;

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.post(
        `${API_BASE}/collect-pending`,
        {
          savingId: saving._id,
          paymentForDate,
          pendingDate: paymentForDate,
          collectorType: "AGENT",
          collectorId: agent._id,
          paymentMethod,
          amount: paymentAmount,
        },
        { timeout: 90000 }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Payment collection failed."
        );
      }

      alert(
        `Payment Collected Successfully!\n\nAmount: ₹${formatAmount(
          response.data.totalAmount || paymentAmount
        )}`
      );

      await loadSaving();

      if (saving.collectionType === "FLEXIBLE") {
        setAmount("");
      }
    } catch (error) {
      console.error("Collection failed:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Collection failed to process.";

      setErrorMessage(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // Reset collection mode when account/page changes.
  useEffect(() => {
    setCollectionType("PENDING");
    setAdvanceDays(1);
  }, [savingId]);

  // ============================================================
  // LOADING SCREEN
  // ============================================================
  if (pageLoading && !saving) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />

          <span className="text-sm font-semibold text-slate-500">
            Loading Account Details...
          </span>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR + NO SAVING
  // ============================================================
  if (!saving) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 max-w-md w-full text-center">
          <AlertCircle
            size={40}
            className="mx-auto text-red-500 mb-3"
          />

          <h2 className="text-base font-black text-slate-800">
            Unable to Load Account
          </h2>

          <p className="text-xs text-slate-500 mt-2">
            {errorMessage || "Saving account could not be loaded."}
          </p>

          <button
            type="button"
            onClick={loadSaving}
            className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
          >
            Try Again
          </button>

          <button
            type="button"
            onClick={() => navigate("/agent/members")}
            className="mt-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
          >
            Return to Member List
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">

        {/* ======================================================
            NAVIGATION
        ====================================================== */}
        <button
          type="button"
          onClick={() => navigate("/agent/members")}
          className="group flex items-center gap-2 mb-5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />

          Return to Member List
        </button>

        {/* ======================================================
            MAIN CARD
        ====================================================== */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100">

          {/* TITLE */}
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Collect Daily Payment
          </h1>

          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Process active daily ledger collections and settle penalties.
          </p>

          {/* ====================================================
              ERROR MESSAGE
          ==================================================== */}
          {errorMessage && (
            <div className="mt-5 p-3 rounded-xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />

              <span>{errorMessage}</span>
            </div>
          )}

          {/* ====================================================
              MEMBER PROFILE
          ==================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-4 bg-slate-50/60 rounded-2xl border border-slate-100">

            {/* MEMBER */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100 text-slate-500">
                <User size={18} />
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Member Name
                </p>

                <h2 className="text-sm font-extrabold text-slate-700">
                  {saving.member?.memberName || "—"}
                </h2>
              </div>
            </div>

            {/* MOBILE */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100 text-slate-500">
                <Phone size={18} />
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mobile Number
                </p>

                <h2 className="text-sm font-semibold text-slate-700">
                  {saving.member?.mobile || "—"}
                </h2>
              </div>
            </div>

            {/* AREA */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100 text-slate-500">
                <MapPin size={18} />
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Operational Area
                </p>

                <h2 className="text-sm font-semibold text-slate-600">
                  {saving.areaGroup?.areaName || "—"}
                </h2>
              </div>
            </div>

            {/* AGENT */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100 text-slate-500">
                <Wallet size={18} />
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Assigned Agent
                </p>

                <h2 className="text-sm font-semibold text-slate-600">
                  {saving.assignedAgent?.name || "—"}
                </h2>
              </div>
            </div>
          </div>

          <hr className="my-6 border-slate-100" />

          {/* ====================================================
              COLLECTION TYPE
          ==================================================== */}
          <h2 className="text-sm font-black text-slate-800 tracking-tight mb-3 flex items-center gap-1.5">
            <Calendar size={16} className="text-blue-500" />
            Daily Collection
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => {
                setCollectionType("PENDING");
                setErrorMessage("");
              }}
              className={`rounded-xl border px-4 py-3 text-xs sm:text-sm font-bold transition ${
                collectionType === "PENDING"
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Pending EMI
            </button>

            <button
              type="button"
              onClick={() => {
                setCollectionType("ADVANCE");
                setErrorMessage("");
              }}
              className={`rounded-xl border px-4 py-3 text-xs sm:text-sm font-bold transition ${
                collectionType === "ADVANCE"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Advance EMI
            </button>
          </div>

          {/* ====================================================
              ADVANCE COLLECTION
          ==================================================== */}
          {collectionType === "ADVANCE" && (
            <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Number of Advance Days
                </label>

                <input
                  type="number"
                  min="1"
                  max="365"
                  value={advanceDays}
                  onChange={(e) => setAdvanceDays(e.target.value)}
                  disabled={loading}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  placeholder="Enter number of days"
                />

                <p className="text-[10px] text-slate-400 mt-1">
                  Future saving days will be marked as paid. Maximum 365 days.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Daily Amount
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-800">
                    ₹{formatAmount(saving.fixedAmount)}
                  </p>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Advance
                  </p>
                  <p className="mt-1 text-lg font-black text-blue-700">
                    ₹{formatAmount(Number(saving.fixedAmount || 0) * Number(advanceDays || 0))}
                  </p>
                </div>
              </div>

              {saving.collectionType !== "FIXED" && (
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs font-semibold text-amber-700">
                  Advance collection currently works only with FIXED savings because the future daily amount must be known.
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Payment Settle Mode
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={loading}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                >
                  <option value="CASH">Hard Currency (Cash)</option>
                  <option value="UPI">Instant UPI Transfer</option>
                  <option value="BANK">Direct Bank Transfer / Wire</option>
                </select>
              </div>
            </div>
          )}

          {/* ====================================================
              PENDING COLLECTION
          ==================================================== */}
          {collectionType === "PENDING" && (
            <>
              {pendingDays.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                  <CheckCircle2 className="mx-auto text-green-500 mb-2" size={32} />
                  <p className="text-sm text-slate-500 font-bold">
                    Ledger Completely Settled
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    No remaining due installments found for this account.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Select Pending Installment Target Date
                    </label>

                    <select
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-white cursor-pointer shadow-sm text-slate-700"
                      value={selectedDay ? dateKey(selectedDay.date) : ""}
                      onChange={handleDayChange}
                      disabled={loading}
                    >
                      {pendingDays.map((day) => (
                        <option
                          key={`${day.installmentNo}-${day.date}`}
                          value={dateKey(day.date)}
                        >
                          EMI #{day.installmentNo} | {formatDate(day.date)} | ₹{formatAmount(day.dailyAmount)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedDay && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Installment Base</p>
                        <h2 className="text-xl font-black text-blue-700 mt-0.5">
                          ₹{formatAmount(selectedDay.dailyAmount)}
                        </h2>
                      </div>

                      <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4">
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Late Penalty</p>
                        <h2 className="text-xl font-black text-red-600 mt-0.5">
                          ₹{formatAmount(selectedDay.penalty)}
                        </h2>
                      </div>

                      <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4">
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Gross Value</p>
                        <h2 className="text-xl font-black text-green-700 mt-0.5">
                          ₹{formatAmount(selectedDay.total)}
                        </h2>
                      </div>
                    </div>
                  )}

                  {selectedDay && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Payment Settle Mode
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          disabled={loading}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                        >
                          <option value="CASH">Hard Currency (Cash)</option>
                          <option value="UPI">Instant UPI Transfer</option>
                          <option value="BANK">Direct Bank Transfer / Wire</option>
                        </select>
                      </div>

                      {saving.collectionType === "FLEXIBLE" && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Custom Flexible Collection Amount (₹)
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={loading}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                            placeholder="Enter amount"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {saving.collectionType === "FIXED" && (
                    <div className="mt-5 p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                          Fixed Daily Amount
                        </span>
                        <span className="text-sm font-black text-blue-700">
                          ₹{formatAmount(saving.fixedAmount)}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ====================================================
              ERROR MESSAGE
          ==================================================== */}
          {errorMessage && (
            <div className="mt-5 p-3 rounded-xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ====================================================
              PAYMENT BUTTON
          ==================================================== */}
          <div className="flex justify-end mt-8 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={collectPayment}
              disabled={
                loading ||
                (collectionType === "PENDING" && !selectedDay) ||
                (collectionType === "ADVANCE" &&
                  (saving.collectionType !== "FIXED" ||
                    !advanceDays ||
                    Number(advanceDays) <= 0))
              }
              className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs tracking-wider uppercase rounded-xl shadow-md hover:shadow transition-all disabled:cursor-not-allowed cursor-pointer"
            >
              {loading
                ? "Processing Payment..."
                : collectionType === "ADVANCE"
                ? "Collect Advance Payment"
                : "Commit Transaction Settle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollectPayment;