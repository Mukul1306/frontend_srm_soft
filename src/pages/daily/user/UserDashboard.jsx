import React, { useEffect, useState } from "react";
import axios from "axios";

const API =
  "https://finance-project-0qqk.onrender.com/api/daily/user";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const member = JSON.parse(
        localStorage.getItem("member")
      );

      if (!member?._id) {
        throw new Error("Member not found");
      }

      const res = await axios.get(
        `${API}/dashboard/${member._id}`
      );

      setData(res.data);
    } catch (error) {
      console.log(error);
      alert("Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-blue-600 text-lg font-semibold">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">
          Unable to load dashboard.
        </p>
      </div>
    );
  }

  /*
  ==================================================
  MULTIPLE SAVING ACCOUNTS
  ==================================================
  */

  const savings = data.savings || [];

  /*
  ==================================================
  MULTIPLE LOAN ACCOUNTS
  ==================================================
  */

  const loans = data.loans || [];

  /*
  ==================================================
  SAFE DASHBOARD TOTALS
  ==================================================
  */

  const dashboard = data.dashboard || {};

  /*
  ==================================================
  TOTAL PENDING DAYS
  ==================================================
  */

  const totalPendingDays = savings.reduce(
    (total, saving) =>
      total + Number(saving.pendingDays || 0),
    0
  );

  /*
  ==================================================
  TOTAL SAVING ACCOUNTS
  ==================================================
  */

  const totalSaved = Number(
    dashboard.totalSaved || 0
  );

  /*
  ==================================================
  TOTAL LOAN OUTSTANDING
  ==================================================
  */

  const totalLoanOutstanding = loans.reduce(
    (total, loan) =>
      total +
      Number(loan.outstandingAmount || 0),
    0
  );

  return (
    <div className="max-w-md mx-auto p-4 pb-24">

      {/* ==========================================
          HEADER
          ========================================== */}

      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl text-white p-6 shadow-xl">

        <p className="text-xs uppercase tracking-widest text-blue-200">
          SRM FINANCE
        </p>

        <h1 className="text-3xl font-bold mt-2">
          Welcome,
        </h1>

        <h2 className="text-xl font-semibold">
          {data.member?.memberName || "-"}
        </h2>

        <div className="mt-5 border-t border-blue-400/30 pt-4 space-y-2">

          <div className="flex justify-between">

            <span className="text-blue-200">
              Member ID
            </span>

            <span className="font-semibold">
              {data.member?.memberId || "-"}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-blue-200">
              Company
            </span>

            <span className="font-semibold">
              SRM Finance
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-blue-200">
              Status
            </span>

            <span className="text-green-300 font-bold">
              ACTIVE
            </span>

          </div>

        </div>

      </div>


      {/* ==========================================
          MAIN SUMMARY CARDS
          ========================================== */}

      <div className="grid grid-cols-2 gap-4 mt-5">

        <Card
          title="Total Saved"
          value={`₹${totalSaved.toLocaleString(
            "en-IN"
          )}`}
          color="text-green-600"
        />

        <Card
          title="Today's Collection"
          value={`₹${Number(
            dashboard.todayCollection || 0
          ).toLocaleString("en-IN")}`}
          color="text-blue-600"
        />

        <Card
          title="Penalty"
          value={`₹${Number(
            dashboard.totalPenalty || 0
          ).toLocaleString("en-IN")}`}
          color="text-red-600"
        />

        <Card
          title="Pending Days"
          value={totalPendingDays}
          color="text-orange-600"
        />

      </div>


      {/* ==========================================
          ACCOUNT COUNTS
          ========================================== */}

      <div className="grid grid-cols-2 gap-4 mt-5">

        <div className="bg-blue-50 rounded-2xl p-4">

          <p className="text-sm text-gray-500">
            Saving Accounts
          </p>

          <h2 className="text-2xl font-bold text-blue-600 mt-1">
            {savings.length}
          </h2>

        </div>

        <div className="bg-red-50 rounded-2xl p-4">

          <p className="text-sm text-gray-500">
            Loan Accounts
          </p>

          <h2 className="text-2xl font-bold text-red-600 mt-1">
            {loans.length}
          </h2>

        </div>

      </div>


      {/* ==========================================
          TOTAL LOAN OUTSTANDING
          ========================================== */}

      {loans.length > 0 && (

        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl p-5 mt-5 text-white shadow">

          <p className="text-red-100 text-sm">
            Total Loan Outstanding
          </p>

          <h2 className="text-3xl font-bold mt-2">
            ₹
            {totalLoanOutstanding.toLocaleString(
              "en-IN"
            )}
          </h2>

          <p className="text-red-100 text-sm mt-1">
            Across {loans.length} loan
            {loans.length > 1 ? "s" : ""}
          </p>

        </div>

      )}


      {/* ==========================================
          SAVING ACCOUNTS
          ========================================== */}

      {savings.length > 0 && (

        <div className="mt-6">

          <h2 className="font-bold text-xl mb-3">
            Saving Accounts
          </h2>

          <div className="space-y-4">

            {savings.map((saving, index) => (

              <div
                key={saving._id}
                className="bg-white rounded-3xl shadow p-5"
              >

                <div className="flex justify-between items-center">

                  <div>

                    <p className="text-xs text-gray-500 uppercase">
                      Saving Account
                    </p>

                    <h2 className="font-bold text-lg">
                      Account #{index + 1}
                    </h2>

                  </div>

                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {saving.status || "ACTIVE"}
                  </span>

                </div>


                <div className="mt-4 space-y-3">

                  <Row
                    label="Collection Type"
                    value={
                      saving.collectionType || "-"
                    }
                  />

                  <Row
                    label="Amount"
                    value={`₹${Number(
                      saving.fixedAmount || 0
                    ).toLocaleString("en-IN")}`}
                  />

                  <Row
                    label="Completed Days"
                    value={
                      saving.completedDays || 0
                    }
                  />

                  <Row
                    label="Pending Days"
                    value={
                      saving.pendingDays || 0
                    }
                  />

                  <Row
                    label="Pending Amount"
                    value={`₹${Number(
                      saving.pendingAmount || 0
                    ).toLocaleString("en-IN")}`}
                  />

                  <Row
                    label="Total Saved"
                    value={`₹${Number(
                      saving.totalSaved || 0
                    ).toLocaleString("en-IN")}`}
                  />

                  <Row
                    label="Status"
                    value={
                      saving.status || "-"
                    }
                  />

                </div>

              </div>

            ))}

          </div>

        </div>

      )}


      {/* ==========================================
          NO SAVING ACCOUNT
          ========================================== */}

      {savings.length === 0 && (

        <div className="bg-white rounded-3xl shadow mt-5 p-5">

          <h2 className="font-bold text-lg">
            Saving Accounts
          </h2>

          <p className="text-gray-500 mt-2">
            No saving account found.
          </p>

        </div>

      )}


      {/* ==========================================
          LOAN ACCOUNTS
          ========================================== */}

      {loans.length > 0 && (

        <div className="mt-6">

          <h2 className="font-bold text-xl mb-3">
            Loan Accounts
          </h2>

          <div className="space-y-4">

            {loans.map((loan, index) => (

              <div
                key={loan._id}
                className="bg-white rounded-3xl shadow p-5"
              >

                <div className="flex justify-between items-center">

                  <div>

                    <p className="text-xs text-gray-500 uppercase">
                      Loan Account
                    </p>

                    <h2 className="font-bold text-lg">
                      Loan #{index + 1}
                    </h2>

                  </div>

                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {loan.status || "-"}
                  </span>

                </div>


                <div className="mt-4 space-y-3">

                  <Row
                    label="Loan Number"
                    value={
                      loan.loanNumber || "-"
                    }
                  />

                  <Row
                    label="Loan Type"
                    value={
                      loan.loanType || "-"
                    }
                  />

                  <Row
                    label="Loan Amount"
                    value={`₹${Number(
                      loan.loanAmount || 0
                    ).toLocaleString("en-IN")}`}
                  />

                  <Row
                    label="Total Payable"
                    value={`₹${Number(
                      loan.totalPayable || 0
                    ).toLocaleString("en-IN")}`}
                  />

                  <Row
                    label="Total Paid"
                    value={`₹${Number(
                      loan.totalPaid || 0
                    ).toLocaleString("en-IN")}`}
                  />

                  <Row
                    label="Outstanding"
                    value={`₹${Number(
                      loan.outstandingAmount || 0
                    ).toLocaleString("en-IN")}`}
                  />

                  <Row
                    label="Status"
                    value={
                      loan.status || "-"
                    }
                  />

                </div>

              </div>

            ))}

          </div>

        </div>

      )}


      {/* ==========================================
          NO LOAN ACCOUNT
          ========================================== */}

      {loans.length === 0 && (

        <div className="bg-white rounded-3xl shadow mt-5 p-5">

          <h2 className="font-bold text-lg">
            Loan Accounts
          </h2>

          <p className="text-gray-500 mt-2">
            No loan account found.
          </p>

        </div>

      )}


      {/* ==========================================
          RECENT TRANSACTIONS
          ========================================== */}

      <div className="bg-white rounded-3xl shadow mt-6 p-5">

        <div className="flex justify-between items-center mb-4">

          <h2 className="font-bold text-lg">
            Recent Transactions
          </h2>

          <span className="text-xs text-gray-500">
            {(data.recentTransactions || []).length}
          </span>

        </div>


        {!data.recentTransactions ||
        data.recentTransactions.length === 0 ? (

          <p className="text-gray-500">
            No Transactions
          </p>

        ) : (

          <div>

            {data.recentTransactions.map((item) => (

              <div
                key={item._id}
                className="border-b last:border-b-0 py-3"
              >

                <div className="flex justify-between">

                  <span className="font-semibold">
                    ₹
                    {Number(
                      item.totalAmount || 0
                    ).toLocaleString("en-IN")}
                  </span>

                  <span className="text-green-600">
                    {item.status || "PAID"}
                  </span>

                </div>

                <div className="text-xs text-gray-500 mt-1">

                  {item.collectionDate
                    ? new Date(
                        item.collectionDate
                      ).toLocaleDateString()
                    : "-"}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}


/*
====================================================
CARD
====================================================
*/

function Card({
  title,
  value,
  color
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <h2
        className={`text-xl font-bold mt-2 ${color}`}
      >
        {value}
      </h2>

    </div>
  );
}


/*
====================================================
ROW
====================================================
*/

function Row({
  label,
  value
}) {
  return (
    <div className="flex justify-between items-center border-b last:border-b-0 py-2 gap-4">

      <span className="text-gray-500 text-sm">
        {label}
      </span>

      <span className="font-semibold text-right text-sm">
        {value}
      </span>

    </div>
  );
}


export default Dashboard;