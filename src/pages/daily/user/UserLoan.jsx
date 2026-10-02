import React, { useEffect, useState } from "react";
import axios from "axios";

const API =
  "https://finance-project-0qqk.onrender.com/api/daily/user";

function Loan() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const member = JSON.parse(
        localStorage.getItem("member")
      );

      if (!member?._id) {
        throw new Error("Member not found");
      }

      const res = await axios.get(
        `${API}/loan/${member._id}`
      );

      setData(res.data);
    } catch (error) {
      console.log(error);
      alert("Unable to load Loan");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-indigo-600 font-semibold">
          Loading Loan Details...
        </p>
      </div>
    );
  }

  /*
  ==================================================
  ALL LOAN ACCOUNTS
  ==================================================
  */

  const accounts = data?.accounts || [];

  if (!data || accounts.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center px-5">
          <h2 className="text-2xl font-bold">
            No Loan Account
          </h2>

          <p className="text-gray-500 mt-2">
            This member has no active loan.
          </p>
        </div>
      </div>
    );
  }

  /*
  ==================================================
  TOTALS
  ==================================================
  */

  const totalLoanAmount = accounts.reduce(
    (sum, account) =>
      sum + Number(account.loan?.loanAmount || 0),
    0
  );

  const totalOutstanding = accounts.reduce(
    (sum, account) =>
      sum +
      Number(
        account.loan?.outstandingAmount || 0
      ),
    0
  );

  const totalPaid = accounts.reduce(
    (sum, account) =>
      sum +
      Number(account.summary?.totalPaid || 0),
    0
  );

  const totalPenalty = accounts.reduce(
    (sum, account) =>
      sum +
      Number(account.summary?.totalPenalty || 0),
    0
  );

  /*
  ==================================================
  SELECTED ACCOUNT
  ==================================================
  */

  const currentAccount = accounts[selectedAccountIndex] || accounts[0];
  const loan = currentAccount.loan || {};
  const summary = currentAccount.summary || {};
  const collections = currentAccount.collections || [];

  return (
    <div className="max-w-md mx-auto p-4 pb-24">

      {/* ==========================================
          PAGE HEADER
          ========================================== */}

      <div className="mb-5">

        <h1 className="text-2xl font-bold text-slate-800">
          My Loan Accounts
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Total Loan Accounts: {accounts.length}
        </p>

      </div>


      {/* ==========================================
          OVERALL SUMMARY
          ========================================== */}

      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-6 text-white shadow-lg">

        <p className="text-indigo-200 text-sm">
          Total Outstanding
        </p>

        <h1 className="text-3xl font-bold mt-2">
          ₹
          {totalOutstanding.toLocaleString(
            "en-IN"
          )}
        </h1>

        <p className="text-indigo-200 mt-1">
          Across {accounts.length} loan
          {accounts.length > 1 ? "s" : ""}
        </p>

      </div>


      {/* ==========================================
          TOTAL SUMMARY CARDS
          ========================================== */}

      <div className="grid grid-cols-2 gap-4 mt-5">

        <Card
          title="Total Loan Amount"
          value={`₹${totalLoanAmount.toLocaleString(
            "en-IN"
          )}`}
        />

        <Card
          title="Total Paid"
          value={`₹${totalPaid.toLocaleString(
            "en-IN"
          )}`}
        />

        <Card
          title="Penalty Paid"
          value={`₹${totalPenalty.toLocaleString(
            "en-IN"
          )}`}
        />

        <Card
          title="Loan Accounts"
          value={accounts.length}
        />

      </div>


      {/* ==========================================
          ACCOUNT SELECTOR TABS
          ========================================== */}

      {accounts.length > 1 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-gray-600 mb-2">
            Select Loan Account
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {accounts.map((acc, idx) => (
              <button
                key={acc.loan?._id || idx}
                onClick={() => setSelectedAccountIndex(idx)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  selectedAccountIndex === idx
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-white text-gray-700 shadow-sm"
                }`}
              >
                Loan #{idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}


      {/* ==========================================
          SELECTED LOAN DETAILS
          ========================================== */}

      <div className="mt-6">

        {/* ====================================
            LOAN HEADER
            ==================================== */}

        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-6 text-white shadow-lg">

          <div className="flex justify-between items-start gap-3">

            <div>

              <p className="text-indigo-100 text-xs uppercase tracking-wider">
                Loan Account
              </p>

              <h2 className="text-xl font-bold mt-1">
                Loan #{selectedAccountIndex + 1}
              </h2>

            </div>

            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
              {loan.status}
            </span>

          </div>


          <p className="text-indigo-100 mt-5">
            Outstanding Amount
          </p>

          <h1 className="text-3xl font-bold mt-1">
            ₹
            {Number(
              loan.outstandingAmount || 0
            ).toLocaleString("en-IN")}
          </h1>

        </div>


        {/* ====================================
            LOAN SUMMARY
            ==================================== */}

        <div className="grid grid-cols-2 gap-4 mt-5">

          <Card
            title="Loan Amount"
            value={`₹${Number(
              loan.loanAmount || 0
            ).toLocaleString("en-IN")}`}
          />

          <Card
            title="Total Paid"
            value={`₹${Number(
              summary.totalPaid || 0
            ).toLocaleString("en-IN")}`}
          />

          <Card
            title="Penalty Paid"
            value={`₹${Number(
              summary.totalPenalty || 0
            ).toLocaleString("en-IN")}`}
          />

          <Card
            title="Status"
            value={loan.status || "-"}
          />

        </div>


        {/* ====================================
            LOAN INFORMATION
            ==================================== */}

        <div className="bg-white rounded-3xl shadow mt-5 p-5">

          <h2 className="font-bold text-lg mb-4">
            Loan Information
          </h2>

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
            label="Interest"
            value={`${loan.interestRate || 0}%`}
          />

          <Row
            label="Total Interest"
            value={`₹${Number(
              loan.totalInterest || 0
            ).toLocaleString("en-IN")}`}
          />

          <Row
            label="Total Payable"
            value={`₹${Number(
              loan.totalPayable || 0
            ).toLocaleString("en-IN")}`}
          />

          <Row
            label="EMI Amount"
            value={`₹${Number(
              loan.emiAmount || 0
            ).toLocaleString("en-IN")}`}
          />

          <Row
            label="Outstanding"
            value={`₹${Number(
              loan.outstandingAmount || 0
            ).toLocaleString("en-IN")}`}
          />

          <Row
            label="Installments Paid"
            value={
              summary.totalInstallments || 0
            }
          />

          <Row
            label="Pending Installments"
            value={
              loan.pendingInstallments || 0
            }
          />

          <Row
            label="Loan Date"
            value={
              loan.loanDate
                ? new Date(
                    loan.loanDate
                  ).toLocaleDateString()
                : "-"
            }
          />

          <Row
            label="End Date"
            value={
              loan.endDate
                ? new Date(
                    loan.endDate
                  ).toLocaleDateString()
                : "-"
            }
          />

        </div>


        {/* ====================================
            EMI HISTORY
            ==================================== */}

        <div className="bg-white rounded-3xl shadow mt-5 p-5">

          <div className="flex justify-between items-center mb-4">

            <h2 className="font-bold text-lg">
              EMI History
            </h2>

            <span className="text-xs text-gray-500">
              {collections.length} payments
            </span>

          </div>


          {collections.length === 0 ? (

            <p className="text-gray-500">
              No EMI Paid
            </p>

          ) : (

            collections.map((item) => (

              <div
                key={item._id}
                className="border-b last:border-b-0 py-3"
              >

                <div className="flex justify-between items-center">

                  <div>

                    <p className="font-semibold">
                      EMI #
                      {item.installmentNo}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {item.paymentDate
                        ? new Date(
                            item.paymentDate
                          ).toLocaleDateString()
                        : "-"}
                    </p>

                  </div>


                  <div className="text-right">

                    <p className="font-bold text-green-600">
                      ₹
                      {Number(
                        item.totalAmount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    {Number(
                      item.penalty || 0
                    ) > 0 && (

                      <p className="text-xs text-amber-600">
                        Penalty ₹
                        {Number(
                          item.penalty
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    )}

                  </div>

                </div>

              </div>

            ))

          )}

        </div>

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
  value
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <h2 className="font-bold text-lg mt-2">
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
    <div className="flex justify-between border-b last:border-b-0 py-3 gap-4">

      <span className="text-gray-500 text-sm">
        {label}
      </span>

      <span className="font-semibold text-right text-sm">
        {value}
      </span>

    </div>
  );
}


export default Loan;