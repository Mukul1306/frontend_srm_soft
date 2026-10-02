import React, { useEffect, useState } from "react";
import axios from "axios";

const API =
  "https://finance-project-0qqk.onrender.com/api/daily/user";

function Saving() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);

  useEffect(() => {
    fetchSaving();
  }, []);

  const fetchSaving = async () => {
    try {
      setLoading(true);
      setError("");

      const member = JSON.parse(
        localStorage.getItem("member")
      );

      if (!member?._id) {
        throw new Error("Member not found");
      }

      const res = await axios.get(
        `${API}/saving/${member._id}`
      );

      if (!res.data?.success) {
        throw new Error(
          res.data?.message || "Unable to load saving details"
        );
      }

      setData(res.data);
    } catch (error) {
      console.error("SAVING PAGE ERROR:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load Saving Details"
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

          <p className="text-blue-600 font-semibold mt-4">
            Loading Saving Details...
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center px-5">
        <div className="bg-white rounded-3xl shadow p-6 text-center max-w-sm w-full">
          <h2 className="text-xl font-bold text-red-600">
            Unable to Load Saving
          </h2>

          <p className="text-gray-500 mt-2">
            {error}
          </p>

          <button
            onClick={fetchSaving}
            className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // ALL SAVING ACCOUNTS
  // ====================================================

  const accounts = Array.isArray(data?.accounts)
    ? data.accounts
    : [];

  // ====================================================
  // NO ACCOUNT
  // ====================================================

  if (accounts.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center px-5">
        <div className="bg-white rounded-3xl shadow p-6 text-center max-w-sm w-full">
          <h2 className="text-2xl font-bold">
            No Saving Account
          </h2>

          <p className="text-gray-500 mt-2">
            This member does not have any saving account.
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // TOTALS OF ALL ACCOUNTS
  // ====================================================

  const overall = accounts.reduce(
    (result, account) => {
      const summary = account?.summary || {};

      result.totalSaved += Number(
        summary.totalSaved || 0
      );

      result.totalPenalty += Number(
        summary.totalPenalty || 0
      );

      result.totalCollection += Number(
        summary.totalCollection || 0
      );

      result.transactions += Number(
        summary.transactionCount || 0
      );

      return result;
    },
    {
      totalSaved: 0,
      totalPenalty: 0,
      totalCollection: 0,
      transactions: 0
    }
  );

  // ====================================================
  // ACTIVE SELECTED ACCOUNT
  // ====================================================

  const account = accounts[selectedAccountIndex] || accounts[0];
  const saving = account?.saving || {};
  const summary = account?.summary || {};
  const transactions = Array.isArray(account?.transactions) ? account.transactions : [];

  const totalSaved = Number(summary.totalSaved || 0);
  const totalPenalty = Number(summary.totalPenalty || 0);
  const totalCollection = Number(summary.totalCollection || 0);
  const transactionCount = Number(
    summary.transactionCount ?? transactions.length ?? 0
  );
  const completedDays = Number(
    summary.completedDays ?? saving.completedDays ?? 0
  );
  const pendingDays = Number(
    summary.pendingDays ?? saving.pendingDays ?? 0
  );
  const durationDays = Number(saving.durationDays || 0);
  const progress = Number(summary.progress || 0);
  const safeProgress = Math.min(100, Math.max(0, progress));

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-md mx-auto p-4 pb-24">

        {/* ==========================================
            PAGE HEADER
        ========================================== */}

        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-800">
            My Saving Accounts
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Total Accounts: {accounts.length}
          </p>
        </div>


        {/* ==========================================
            OVERALL SUMMARY
        ========================================== */}

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg">

          <p className="text-blue-100 text-sm">
            Total Collection
          </p>

          <h1 className="text-3xl font-bold mt-2">
            ₹
            {overall.totalCollection.toLocaleString(
              "en-IN"
            )}
          </h1>

          <div className="grid grid-cols-3 gap-2 mt-5">

            <MiniCard
              title="Saved"
              value={`₹${overall.totalSaved.toLocaleString(
                "en-IN"
              )}`}
            />

            <MiniCard
              title="Penalty"
              value={`₹${overall.totalPenalty.toLocaleString(
                "en-IN"
              )}`}
            />

            <MiniCard
              title="Payments"
              value={overall.transactions}
            />

          </div>
        </div>

        {/* ==========================================
            ACCOUNT SELECTOR TABS (FOR MULTIPLE ACCOUNTS)
        ========================================== */}

        {accounts.length > 1 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Select Account
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {accounts.map((acc, index) => (
                <button
                  key={acc?.saving?._id || index}
                  onClick={() => setSelectedAccountIndex(index)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    selectedAccountIndex === index
                      ? "bg-blue-600 text-white shadow"
                      : "bg-white text-gray-700 shadow-sm"
                  }`}
                >
                  Account #{index + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            SELECTED ACCOUNT DETAILS
        ========================================== */}

        <div className="mt-6 mb-8">

          {/* ACCOUNT HEADER */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start gap-3">
              <div>
                <p className="text-blue-200 text-xs uppercase tracking-wider">
                  Daily Saving Account
                </p>
                <h2 className="text-xl font-bold mt-1">
                  Account #{selectedAccountIndex + 1}
                </h2>
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                {saving.status || "ACTIVE"}
              </span>
            </div>

            <h1 className="text-3xl font-bold mt-5">
              ₹{totalSaved.toLocaleString("en-IN")}
            </h1>
            <p className="text-blue-100">
              Total Saved
            </p>
          </div>

          {/* PROGRESS */}
          <div className="bg-white rounded-3xl shadow p-5 mt-5">
            <div className="flex justify-between">
              <span className="font-semibold">
                Saving Progress
              </span>
              <span className="font-bold text-blue-600">
                {safeProgress}%
              </span>
            </div>

            <div className="w-full bg-gray-200 h-3 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{
                  width: `${safeProgress}%`
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>
                {completedDays} completed
              </span>
              <span>
                {durationDays} days
              </span>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="grid grid-cols-2 gap-4 mt-5">
            <Card
              title="Completed Days"
              value={completedDays}
              color="text-green-600"
            />
            <Card
              title="Pending Days"
              value={pendingDays}
              color="text-red-600"
            />
            <Card
              title="Penalty"
              value={`₹${totalPenalty.toLocaleString("en-IN")}`}
              color="text-orange-600"
            />
            <Card
              title="Pending Amount"
              value={`₹${Number(summary.pendingAmount || 0).toLocaleString("en-IN")}`}
              color="text-blue-600"
            />
          </div>

          {/* ACCOUNT SUMMARY */}
          <div className="bg-white rounded-3xl shadow p-5 mt-5">
            <h2 className="font-bold text-lg mb-4">
              Account Summary
            </h2>
            <Row
              label="Total Saved"
              value={`₹${totalSaved.toLocaleString("en-IN")}`}
            />
            <Row
              label="Penalty"
              value={`₹${totalPenalty.toLocaleString("en-IN")}`}
            />
            <Row
              label="Total Collection"
              value={`₹${totalCollection.toLocaleString("en-IN")}`}
            />
            <Row
              label="Total Payments"
              value={transactionCount}
            />
          </div>

          {/* SAVING INFORMATION */}
          <div className="bg-white rounded-3xl shadow p-5 mt-5">
            <h2 className="font-bold text-lg mb-4">
              Saving Information
            </h2>
            <Row
              label="Collection Type"
              value={saving.collectionType || "-"}
            />
            <Row
              label="Saving Amount"
              value={`₹${Number(saving.fixedAmount || 0).toLocaleString("en-IN")}`}
            />
            <Row
              label="Duration"
              value={`${durationDays} Days`}
            />
            <Row
              label="Start Date"
              value={saving.startDate ? formatDate(saving.startDate) : "-"}
            />
            <Row
              label="Next Collection"
              value={saving.nextCollectionDate ? formatDate(saving.nextCollectionDate) : "-"}
            />
            <Row
              label="End Date"
              value={saving.endDate ? formatDate(saving.endDate) : "-"}
            />
            <Row
              label="Status"
              value={saving.status || "-"}
            />
          </div>

          {/* TRANSACTIONS */}
          <div className="bg-white rounded-3xl shadow mt-5 p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">
                Payment History
              </h2>
              <span className="text-xs text-gray-500">
                {transactions.length} payments
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-gray-500">
                  No Collection Yet
                </p>
              </div>
            ) : (
              <div>
                {transactions.map((item, transactionIndex) => (
                  <div
                    key={item._id || transactionIndex}
                    className="border-b last:border-b-0 py-4"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-semibold text-slate-800">
                          Saving
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.collectionDate ? formatDate(item.collectionDate) : "-"}
                        </p>
                        {item.paymentForDate && (
                          <p className="text-xs text-gray-400 mt-1">
                            For: {formatDate(item.paymentForDate)}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-green-600 font-bold">
                          ₹{Number(item.totalAmount || 0).toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-gray-500">
                          Total Paid
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <TransactionBox
                        title="Saving"
                        value={`₹${Number(item.dailyAmount || 0).toLocaleString("en-IN")}`}
                      />
                      <TransactionBox
                        title="Penalty"
                        value={`₹${Number(item.penalty || 0).toLocaleString("en-IN")}`}
                      />
                      <TransactionBox
                        title="Method"
                        value={item.paymentMethod || "-"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

// ====================================================
// MINI CARD
// ====================================================

function MiniCard({ title, value }) {
  return (
    <div className="bg-white/15 rounded-xl p-3 text-center">
      <p className="text-blue-100 text-xs">{title}</p>
      <p className="font-bold text-sm mt-1">{value}</p>
    </div>
  );
}

// ====================================================
// CARD
// ====================================================

function Card({ title, value, color }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className={`text-xl font-bold mt-2 ${color}`}>{value}</h2>
    </div>
  );
}

// ====================================================
// ROW
// ====================================================

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center border-b last:border-b-0 py-3 gap-4">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-semibold text-right text-sm">{value}</span>
    </div>
  );
}

// ====================================================
// TRANSACTION BOX
// ====================================================

function TransactionBox({ title, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 text-center">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="font-semibold text-sm mt-1">{value}</p>
    </div>
  );
}

// ====================================================
// DATE FORMAT
// ====================================================

function formatDate(date) {
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch {
    return "-";
  }
}

export default Saving;