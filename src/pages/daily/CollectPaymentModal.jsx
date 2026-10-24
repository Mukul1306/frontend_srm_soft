
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://finance-project-0qqk.onrender.com/api/daily";

function CollectPaymentModal({ open, saving, onClose, refresh }) {
  const [pendingDays, setPendingDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [flexibleAmount, setFlexibleAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingDays, setFetchingDays] = useState(false);

  useEffect(() => {
    if (!open || !saving?._id) return;

    const fetchPendingDays = async () => {
      setFetchingDays(true);

      try {
        const res = await axios.get(
          `${API_URL}/pending-days/${saving._id}`
        );

        const days = Array.isArray(res.data.pendingDays)
          ? res.data.pendingDays
          : [];

        setPendingDays(days);
        setSelectedDay((current) =>
          days.find((day) => day.date === current?.date) || days[0] || null
        );
      } catch (error) {
        console.error("Failed to fetch pending days:", error);
        setPendingDays([]);
        setSelectedDay(null);
        alert(
          error.response?.data?.message ||
            "Failed to load pending days."
        );
      } finally {
        setFetchingDays(false);
      }
    };

    fetchPendingDays();
  }, [open, saving?._id]);

  useEffect(() => {
    setFlexibleAmount("");
  }, [selectedDay?.date, open]);

  const collectPayment = async () => {
    if (!saving?._id || !selectedDay?.date || loading) return;

    const amount =
      saving.collectionType === "FLEXIBLE"
        ? Number(flexibleAmount)
        : Number(selectedDay.total);

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    if (
      saving.collectionType === "FLEXIBLE" &&
      amount > Number(selectedDay.total)
    ) {
      alert("Amount cannot exceed the pending total.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API_URL}/collect-pending`, {
        savingId: saving._id,
        pendingDate: selectedDay.date,
        collectorType: "ADMIN",
        collectorId: null,
        paymentMethod,
        amount,
      });

      alert("Payment collected successfully.");

      await refresh?.();
      onClose();
    } catch (error) {
      console.error("Payment collection failed:", error);
      alert(
        error.response?.data?.message || "Collection failed."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open || !saving) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[650px] rounded-3xl bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-black">Collect Payment</h2>

        <p className="mt-2 text-slate-500">
          {saving.member?.memberName || "Member"}
        </p>

        <div className="mt-6">
          <label className="font-bold">Pending Days</label>

          <select
            value={selectedDay?.date || ""}
            disabled={fetchingDays || pendingDays.length === 0}
            onChange={(e) => {
              const day = pendingDays.find(
                (item) => item.date === e.target.value
              );
              setSelectedDay(day || null);
            }}
            className="mt-2 w-full rounded-xl border p-3"
          >
            {fetchingDays && <option value="">Loading...</option>}

            {!fetchingDays && pendingDays.length === 0 && (
              <option value="">No pending days</option>
            )}

            {pendingDays.map((day, index) => (
              <option key={`${day.date}-${index}`} value={day.date}>
                {new Date(day.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {selectedDay && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <p className="text-slate-500">Daily Amount</p>
              <h3 className="text-xl font-black">
                ₹{Number(selectedDay.dailyAmount || 0).toFixed(2)}
              </h3>
            </div>

            <div>
              <p className="text-slate-500">Penalty</p>
              <h3 className="text-xl font-black text-red-600">
                ₹{Number(selectedDay.penalty || 0).toFixed(2)}
              </h3>
            </div>

            <div>
              <p className="text-slate-500">Total</p>
              <h3 className="text-2xl font-black text-green-600">
                ₹{Number(selectedDay.total || 0).toFixed(2)}
              </h3>
            </div>
          </div>
        )}

        {saving.collectionType === "FLEXIBLE" && selectedDay && (
          <div className="mt-5">
            <label className="font-bold">Amount</label>
            <input
              type="number"
              min="0.01"
              max={Number(selectedDay.total || 0)}
              step="0.01"
              value={flexibleAmount}
              onChange={(e) => setFlexibleAmount(e.target.value)}
              placeholder="Enter payment amount"
              className="mt-2 w-full rounded-xl border p-3"
            />
          </div>
        )}

        <div className="mt-5">
          <label className="font-bold">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="mt-2 w-full rounded-xl border p-3"
          >
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="BANK">Bank</option>
          </select>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl bg-gray-200 px-5 py-3 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={collectPayment}
            disabled={
              !selectedDay ||
              loading ||
              fetchingDays ||
              pendingDays.length === 0
            }
            className="rounded-xl bg-green-600 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Collecting..." : "Collect Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CollectPaymentModal;