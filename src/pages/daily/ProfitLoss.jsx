import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Loader2,
  Trash2,
  Wallet,
  ArrowUpRight,
  Coins,
  HandCoins,
  Receipt
} from "lucide-react";

function DailyProfitLoss() {

  // ==========================================
  // STATES
  // ==========================================

  const [report, setReport] = useState({});
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    amount: "",
    paymentMethod: "CASH",
    note: ""
  });

  const [fundForm, setFundForm] = useState({
    amount: "",
    paymentMethod: "CASH",
    remarks: ""
  });

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================
  // LOAD DATA
  // ==========================================

  const loadData = async () => {

    setLoading(true);

    try {

      const [profitRes, expenseRes] =
      await Promise.all([

        axios.get(
          "https://finance-project-0qqk.onrender.com/api/daily/profit-loss"
        ),

        axios.get(
          "https://finance-project-0qqk.onrender.com/api/daily/expenses"
        )

      ]);

      setReport(profitRes.data);

      setExpenses(
        profitRes.data?.expenses ||
        expenseRes.data?.expenses ||
        []
      );

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Unable to Load Financial Data"
      );

    } finally {

      setLoading(false);

    }

  };

  // ==========================================
  // ADD EXPENSE
  // ==========================================

  const addExpense = async (e) => {

    e.preventDefault();

    if (
      !form.title ||
      !form.category ||
      !form.amount
    ) {

      return alert(
        "Please fill all required fields."
      );

    }

    setSubmitting(true);

    try {

      await axios.post(
        "https://finance-project-0qqk.onrender.com/api/daily/expenses",
        form
      );

      setForm({
        title: "",
        category: "",
        amount: "",
        paymentMethod: "CASH",
        note: ""
      });

      setShowModal(false);

      await loadData();

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Failed to Add Expense"
      );

    } finally {

      setSubmitting(false);

    }

  };

  // ==========================================
  // DELETE EXPENSE
  // ==========================================

  const deleteExpense = async (id) => {

    if (
      !window.confirm(
        "Delete this expense?"
      )
    ) return;

    setDeletingId(id);

    try {

      await axios.delete(
        `https://finance-project-0qqk.onrender.com/api/daily/expenses/${id}`
      );

      await loadData();

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Failed to Delete Expense"
      );

    } finally {

      setDeletingId(null);

    }

  };

  // ==========================================
  // ADD BUSINESS FUND
  // ==========================================

  const addBusinessFund = async (e) => {

    e.preventDefault();

    if (!fundForm.amount) {

      return alert(
        "Please Enter Amount"
      );

    }

    setSubmitting(true);

    try {

      await axios.post(

        "https://finance-project-0qqk.onrender.com/api/daily/business-fund",

        fundForm

      );

      setFundForm({

        amount: "",
        paymentMethod: "CASH",
        remarks: ""

      });

      setShowFundModal(false);

      await loadData();

    } catch (error) {

      alert(

        error.response?.data?.message ||

        "Failed to Add Business Fund"

      );

    } finally {

      setSubmitting(false);

    }

  };

  // ==========================================
  // NET PROFIT COLOR
  // ==========================================

  const isNetProfitPositive =
    (report.netProfit || 0) >= 0;

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen text-slate-900 font-sans max-w-7xl mx-auto">

  {/* ==========================================
      HEADER
  ========================================== */}

  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">

    <div>

      <h1 className="text-3xl font-black">
        Daily Saving Profit & Loss
      </h1>

      <p className="text-slate-500 text-sm mt-1">
        Daily Collection, Loan Collection, Business Fund & Expenses Report
      </p>

    </div>

    <div className="flex gap-3">

      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
      >
        <Plus size={18}/>
        Add Expense
      </button>

      <button
        onClick={() => setShowFundModal(true)}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
      >
        <Wallet size={18}/>
        Add Fund
      </button>

    </div>

  </div>

  {/* ==========================================
      SUMMARY CARDS
  ========================================== */}

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-5 mb-10">

    {/* Daily Collection */}

    <div className="bg-white rounded-2xl shadow border p-5">

      <div className="flex justify-between mb-4">

        <p className="text-xs uppercase text-slate-400 font-bold">
          Daily Collection
        </p>

        <Wallet
          size={18}
          className="text-blue-600"
        />

      </div>

      <h2 className="text-2xl font-black">

        {loading
          ? "..."
          : `₹ ${(
              report.totalDailyCollection || 0
            ).toLocaleString("en-IN")}`}

      </h2>

    </div>

    {/* Loan Collection */}

    <div className="bg-white rounded-2xl shadow border p-5">

      <div className="flex justify-between mb-4">

        <p className="text-xs uppercase text-slate-400 font-bold">
          Loan Collection
        </p>

        <Coins
          size={18}
          className="text-purple-600"
        />

      </div>

      <h2 className="text-2xl font-black">

        {loading
          ? "..."
          : `₹ ${(
              report.totalLoanCollection || 0
            ).toLocaleString("en-IN")}`}

      </h2>

    </div>

    {/* Business Fund */}

    <div className="bg-white rounded-2xl shadow border p-5">

      <div className="flex justify-between mb-4">

        <p className="text-xs uppercase text-slate-400 font-bold">
          Business Fund
        </p>

        <TrendingUp
          size={18}
          className="text-green-600"
        />

      </div>

      <h2 className="text-2xl font-black text-green-600">

        {loading
          ? "..."
          : `₹ ${(
              report.remainingBusinessFund || 0
            ).toLocaleString("en-IN")}`}

      </h2>

    </div>

    {/* Total Income */}

    <div className="bg-white rounded-2xl shadow border p-5">

      <div className="flex justify-between mb-4">

        <p className="text-xs uppercase text-slate-400 font-bold">
          Total Income
        </p>

        <ArrowUpRight
          size={18}
          className="text-green-600"
        />

      </div>

      <h2 className="text-2xl font-black text-green-600">

        {loading
          ? "..."
          : `₹ ${(
              report.totalIncome || 0
            ).toLocaleString("en-IN")}`}

      </h2>

    </div>

    {/* Expenses */}

    <div className="bg-white rounded-2xl shadow border p-5">

      <div className="flex justify-between mb-4">

        <p className="text-xs uppercase text-slate-400 font-bold">
          Expenses
        </p>

        <TrendingDown
          size={18}
          className="text-red-600"
        />

      </div>

      <h2 className="text-2xl font-black text-red-600">

        {loading
          ? "..."
          : `₹ ${(
              report.totalExpenses || 0
            ).toLocaleString("en-IN")}`}

      </h2>

    </div>

    {/* Loan Given */}

    <div className="bg-white rounded-2xl shadow border p-5">

      <div className="flex justify-between mb-4">

        <p className="text-xs uppercase text-slate-400 font-bold">
          Loan Given
        </p>

        <HandCoins
          size={18}
          className="text-orange-600"
        />

      </div>

      <h2 className="text-2xl font-black text-orange-600">

        {loading
          ? "..."
          : `₹ ${(
              report.totalLoanGiven || 0
            ).toLocaleString("en-IN")}`}

      </h2>

    </div>

    {/* Net Profit */}

    <div className={`rounded-2xl shadow border p-5 ${
      isNetProfitPositive
        ? "bg-green-50 border-green-200"
        : "bg-red-50 border-red-200"
    }`}>

      <div className="flex justify-between mb-4">

        <p className="text-xs uppercase font-bold">
          Net Profit
        </p>

        {isNetProfitPositive
          ? <TrendingUp size={18}/>
          : <TrendingDown size={18}/>
        }

      </div>

      <h2 className={`text-2xl font-black ${
        isNetProfitPositive
          ? "text-green-700"
          : "text-red-700"
      }`}>

        {loading
          ? "..."
          : `₹ ${(
              report.netProfit || 0
            ).toLocaleString("en-IN")}`}

      </h2>

    </div>

  </div>
  {/* ==========================================
    EXPENSE HISTORY
========================================== */}

<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

  <div className="flex items-center justify-between p-5 border-b">

    <h2 className="text-lg font-bold flex items-center gap-2">

      <Receipt
        size={18}
        className="text-blue-600"
      />

      Expense History

    </h2>

    <span className="text-sm text-slate-500">

      Total Records :
      {" "}
      {expenses.length}

    </span>

  </div>

  <div className="overflow-x-auto">

    <table className="w-full">

      <thead className="bg-slate-100">

        <tr>

          <th className="text-left px-6 py-4">
            Title
          </th>

          <th className="text-left px-6 py-4">
            Category
          </th>

          <th className="text-right px-6 py-4">
            Amount
          </th>

          <th className="text-center px-6 py-4">
            Payment
          </th>

          <th className="text-center px-6 py-4">
            Date
          </th>

          <th className="text-center px-6 py-4">
            Action
          </th>

        </tr>

      </thead>

      <tbody>

        {loading ? (

          <tr>

            <td
              colSpan={6}
              className="text-center py-12"
            >

              <Loader2
                size={26}
                className="animate-spin mx-auto text-blue-600"
              />

            </td>

          </tr>

        ) : expenses.length === 0 ? (

          <tr>

            <td
              colSpan={6}
              className="text-center py-10 text-slate-500"
            >

              No Expense Found

            </td>

          </tr>

        ) : (

          expenses.map((expense) => (

            <tr
              key={expense._id}
              className="border-b hover:bg-slate-50"
            >

              <td className="px-6 py-4 font-semibold">

                {expense.title}

              </td>

              <td className="px-6 py-4">

                {expense.category}

              </td>

              <td className="px-6 py-4 text-right font-bold text-red-600">

                ₹{" "}

                {(expense.amount || 0).toLocaleString("en-IN")}

              </td>

              <td className="px-6 py-4 text-center">

                {expense.paymentMethod}

              </td>

              <td className="px-6 py-4 text-center">

                {new Date(
                  expense.expenseDate
                ).toLocaleDateString("en-IN")}

              </td>

              <td className="px-6 py-4 text-center">

                <button

                  onClick={() =>
                    deleteExpense(expense._id)
                  }

                  disabled={
                    deletingId === expense._id
                  }

                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2"

                >

                  {deletingId === expense._id ? (

                    <Loader2
                      size={15}
                      className="animate-spin"
                    />

                  ) : (

                    <Trash2 size={15} />

                  )}

                </button>

              </td>

            </tr>

          ))

        )}

      </tbody>

    </table>

  </div>

</div>
{/* ==========================================
    ADD EXPENSE MODAL
========================================== */}

{showModal && (

<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">

<div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

{/* Header */}

<div className="flex items-center justify-between px-6 py-5 border-b">

<h2 className="text-xl font-bold">
Add New Expense
</h2>

<button
type="button"
onClick={() => setShowModal(false)}
className="text-gray-500 hover:text-red-600"
>

<X size={22} />

</button>

</div>

{/* Form */}

<form
onSubmit={addExpense}
className="p-6 space-y-5"
>

{/* Title */}

<div>

<label className="block text-sm font-semibold mb-2">
Expense Title
</label>

<input
type="text"
required
disabled={submitting}
value={form.title}
onChange={(e)=>
setForm({
...form,
title:e.target.value
})
}
className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
/>

</div>

{/* Category */}

<div>

<label className="block text-sm font-semibold mb-2">
Category
</label>

<input
type="text"
required
disabled={submitting}
value={form.category}
onChange={(e)=>
setForm({
...form,
category:e.target.value
})
}
className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
/>

</div>

{/* Amount */}

<div>

<label className="block text-sm font-semibold mb-2">
Amount
</label>

<input
type="number"
required
disabled={submitting}
value={form.amount}
onChange={(e)=>
setForm({
...form,
amount:e.target.value
})
}
className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
/>

</div>

{/* Payment */}

<div>

<label className="block text-sm font-semibold mb-2">
Payment Method
</label>

<select
value={form.paymentMethod}
onChange={(e)=>
setForm({
...form,
paymentMethod:e.target.value
})
}
className="w-full border rounded-xl px-4 py-3"
>

<option value="CASH">
Cash
</option>

<option value="BANK">
Bank
</option>

<option value="UPI">
UPI
</option>

</select>

</div>

{/* Note */}

<div>

<label className="block text-sm font-semibold mb-2">
Note
</label>

<textarea
rows={3}
value={form.note}
onChange={(e)=>
setForm({
...form,
note:e.target.value
})
}
className="w-full border rounded-xl px-4 py-3"
/>

</div>

{/* Footer */}

<div className="flex justify-end gap-3 pt-3">

<button
type="button"
onClick={() => setShowModal(false)}
className="px-5 py-2 border rounded-xl"
>

Cancel

</button>

<button
type="submit"
disabled={submitting}
className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 disabled:opacity-50"
>

{submitting && (
<Loader2
size={18}
className="animate-spin"
/>
)}

Save Expense

</button>

</div>

</form>

</div>

</div>

)}
{/* ==========================================
    ADD BUSINESS FUND MODAL
========================================== */}

{showFundModal && (

<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">

<div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

{/* Header */}

<div className="flex items-center justify-between px-6 py-5 border-b">

<h2 className="text-xl font-bold text-green-700">
Add Business Fund
</h2>

<button
type="button"
onClick={() => setShowFundModal(false)}
className="text-gray-500 hover:text-red-600 transition"
>

<X size={22}/>

</button>

</div>

{/* Form */}

<form
onSubmit={addBusinessFund}
className="p-6 space-y-5"
>

{/* Amount */}

<div>

<label className="block text-sm font-semibold mb-2">
Fund Amount
</label>

<input
type="number"
required
min="1"
disabled={submitting}
value={fundForm.amount}
onChange={(e)=>
setFundForm({
...fundForm,
amount:e.target.value
})
}
className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
/>

</div>

{/* Payment */}

<div>

<label className="block text-sm font-semibold mb-2">
Payment Method
</label>

<select
disabled={submitting}
value={fundForm.paymentMethod}
onChange={(e)=>
setFundForm({
...fundForm,
paymentMethod:e.target.value
})
}
className="w-full border rounded-xl px-4 py-3"
>

<option value="CASH">
Cash
</option>

<option value="BANK">
Bank
</option>

<option value="UPI">
UPI
</option>

</select>

</div>

{/* Remarks */}

<div>

<label className="block text-sm font-semibold mb-2">
Remarks
</label>

<textarea
rows={3}
disabled={submitting}
placeholder="Example : Owner Investment"
value={fundForm.remarks}
onChange={(e)=>
setFundForm({
...fundForm,
remarks:e.target.value
})
}
className="w-full border rounded-xl px-4 py-3 resize-none"
/>

</div>

{/* Buttons */}

<div className="flex justify-end gap-3 pt-3 border-t">

<button
type="button"
disabled={submitting}
onClick={() => setShowFundModal(false)}
className="px-5 py-2 border rounded-xl hover:bg-gray-100"
>

Cancel

</button>

<button
type="submit"
disabled={submitting}
className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 disabled:opacity-50"
>

{submitting ? (

<>
<Loader2
size={18}
className="animate-spin"
/>

Saving...

</>

) : (

<>
<Wallet size={18}/>
Save Fund
</>

)}

</button>

</div>

</form>

</div>

</div>

)}
    </div>
  );
}

export default DailyProfitLoss;
