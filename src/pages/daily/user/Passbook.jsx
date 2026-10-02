import React, { useEffect, useState } from "react";
import axios from "axios";

const API =
  "https://finance-project-0qqk.onrender.com/api/daily/user";

function Passbook() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPassbook();
  }, []);

  const fetchPassbook = async () => {
    try {
      const member = JSON.parse(
        localStorage.getItem("member")
      );

      if (!member?._id) {
        throw new Error("Member not found");
      }

      const res = await axios.get(
        `${API}/passbook/${member._id}`
      );

      setData(res.data);
    } catch (error) {
      console.log(error);
      alert("Unable to load Passbook");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-green-600 font-semibold">
          Loading Passbook...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold">
            Unable to Load Passbook
          </h2>

          <p className="text-gray-500 mt-2">
            Please try again later.
          </p>
        </div>
      </div>
    );
  }

  /*
  ==================================================
  OVERALL SUMMARY
  ==================================================
  */

  const summary = data.summary || {};

  const transactions = data.transactions || [];

  /*
  ==================================================
  SAVING ACCOUNT SUMMARIES
  ==================================================
  */

  const accounts = data.accounts || [];

  return (
    <div className="max-w-md mx-auto p-4 pb-24">

      {/* ==========================================
          HEADER
          ========================================== */}

      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-6 text-white shadow">

        <p className="text-green-100 text-sm">
          Saving Passbook
        </p>

        <h1 className="text-3xl font-bold mt-3">
          ₹
          {Number(
            summary.totalCollection || 0
          ).toLocaleString("en-IN")}
        </h1>

        <p className="text-green-100 mt-1">
          Total Collection
        </p>

      </div>


      {/* ==========================================
          OVERALL SUMMARY
          ========================================== */}

      <div className="grid grid-cols-3 gap-3 mt-5">

        <SummaryCard
          title="Saved"
          value={`₹${Number(
            summary.totalSaved || 0
          ).toLocaleString("en-IN")}`}
          color="text-green-600"
        />

        <SummaryCard
          title="Penalty"
          value={`₹${Number(
            summary.totalPenalty || 0
          ).toLocaleString("en-IN")}`}
          color="text-red-600"
        />

        <SummaryCard
          title="Total"
          value={`₹${Number(
            summary.totalCollection || 0
          ).toLocaleString("en-IN")}`}
          color="text-blue-600"
        />

      </div>


      {/* ==========================================
          SAVING ACCOUNT LIST
          ========================================== */}

      {accounts.length > 0 && (

        <div className="mt-6">

          <h2 className="font-bold text-lg mb-3">
            Saving Accounts
          </h2>

          <div className="space-y-3">

            {accounts.map((account, index) => {

              const saving = account.saving || {};
              const accountSummary =
                account.summary || {};

              return (
                <div
                  key={saving._id || index}
                  className="bg-white rounded-2xl shadow p-4"
                >

                  <div className="flex justify-between items-center">

                    <div>

                      <p className="text-xs text-gray-500">
                        Saving Account
                      </p>

                      <h3 className="font-bold">
                        Account #{index + 1}
                      </h3>

                    </div>

                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      {saving.status || "ACTIVE"}
                    </span>

                  </div>


                  <div className="grid grid-cols-2 gap-3 mt-4">

                    <Box
                      title="Total Saved"
                      value={`₹${Number(
                        accountSummary.totalSaved || 0
                      ).toLocaleString("en-IN")}`}
                    />

                    <Box
                      title="Penalty"
                      value={`₹${Number(
                        accountSummary.totalPenalty || 0
                      ).toLocaleString("en-IN")}`}
                    />

                    <Box
                      title="Collection"
                      value={`₹${Number(
                        accountSummary.totalCollection || 0
                      ).toLocaleString("en-IN")}`}
                    />

                    <Box
                      title="Transactions"
                      value={
                        accountSummary.transactionCount ||
                        0
                      }
                    />

                  </div>

                </div>
              );
            })}

          </div>

        </div>

      )}


      {/* ==========================================
          TRANSACTIONS
          ========================================== */}

      <div className="mt-6">

        <div className="flex justify-between items-center mb-4">

          <h2 className="font-bold text-lg">
            Transaction History
          </h2>

          <span className="text-xs text-gray-500">
            {transactions.length} transactions
          </span>

        </div>


        {transactions.length === 0 ? (

          <div className="bg-white rounded-2xl p-6 text-center shadow">

            <p className="text-gray-500">
              No Transactions Found
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {transactions.map((item) => {

              const savingAccount =
                item.savingAccount || {};

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl shadow p-5"
                >

                  {/* ==============================
                      TRANSACTION HEADER
                      ============================== */}

                  <div className="flex justify-between gap-3">

                    <div>

                      <h3 className="font-semibold">
                        Daily Saving
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        {item.collectionDate
                          ? new Date(
                              item.collectionDate
                            ).toLocaleDateString()
                          : "-"}
                      </p>

                    </div>


                    <div className="text-right">

                      <h2 className="text-green-600 font-bold">
                        ₹
                        {Number(
                          item.totalAmount || 0
                        ).toLocaleString("en-IN")}
                      </h2>

                      <p className="text-xs text-gray-400 mt-1">
                        {item.status || "PAID"}
                      </p>

                    </div>

                  </div>


                  {/* ==============================
                      ACCOUNT
                      ============================== */}

                  {savingAccount._id && (

                    <div className="bg-green-50 rounded-xl px-3 py-2 mt-4">

                      <p className="text-xs text-gray-500">
                        Saving Account
                      </p>

                      <p className="text-sm font-semibold text-green-700">
                        Account #
                        {accounts.findIndex(
                          (acc) =>
                            acc.saving?._id ===
                            savingAccount._id
                        ) + 1 || "-"}
                      </p>

                    </div>

                  )}


                  {/* ==============================
                      TRANSACTION DETAILS
                      ============================== */}

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">

                    <Box
                      title="Saving"
                      value={`₹${Number(
                        item.dailyAmount || 0
                      ).toLocaleString("en-IN")}`}
                    />

                    <Box
                      title="Penalty"
                      value={`₹${Number(
                        item.penalty || 0
                      ).toLocaleString("en-IN")}`}
                    />

                    <Box
                      title="Method"
                      value={
                        item.paymentMethod || "-"
                      }
                    />

                  </div>


                  {/* ==============================
                      PAYMENT DATE
                      ============================== */}

                  {item.paymentForDate && (

                    <div className="mt-4 pt-3 border-t">

                      <div className="flex justify-between text-sm">

                        <span className="text-gray-500">
                          Payment For
                        </span>

                        <span className="font-semibold">
                          {new Date(
                            item.paymentForDate
                          ).toLocaleDateString()}
                        </span>

                      </div>

                    </div>

                  )}

                </div>
              );
            })}

          </div>

        )}

      </div>

    </div>
  );
}


/*
====================================================
SUMMARY CARD
====================================================
*/

function SummaryCard({
  title,
  value,
  color
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-3 text-center">

      <p className="text-xs text-gray-500">
        {title}
      </p>

      <h2
        className={`font-bold mt-2 ${color}`}
      >
        {value}
      </h2>

    </div>
  );
}


/*
====================================================
BOX
====================================================
*/

function Box({
  title,
  value
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">

      <p className="text-xs text-gray-500">
        {title}
      </p>

      <h2 className="font-semibold mt-1 text-sm">
        {value}
      </h2>

    </div>
  );
}

export default Passbook;