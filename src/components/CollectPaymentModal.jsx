import React, { useState } from "react";
import axios from "axios";

function CollectPaymentModal({
  member,
  isOpen,
  onClose,
  refreshData
}) {

  const [amount, setAmount] =
    useState("");

  const [paymentMethod,
    setPaymentMethod] =
    useState("CASH");

  const [loading,
    setLoading] =
    useState(false);

  if (!isOpen || !member) {
    return null;
  }

  const handleSubmit =
    async () => {

      try {

        setLoading(true);

        await axios.post(

          "https://finance-project-0qqk.onrender.com/api/daily/collect-payment",

          {

            memberId:
              member._id,

            collectorType:
              "ADMIN",

            collectorId:
              "ADMIN",

            amount:
              Number(amount),

            paymentMethod

          }

        );

        alert(
          "Payment Collected Successfully"
        );

        setAmount("");

        refreshData();

        onClose();

      } catch (error) {

        alert(

          error.response?.data?.message ||

          "Collection Failed"

        );

      } finally {

        setLoading(false);

      }

    };

  return (

    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl w-full max-w-md p-6">

        <h2 className="text-2xl font-bold">

          Collect Payment

        </h2>

        <p className="text-slate-500 mt-1">

          {member.memberName}

        </p>

        <div className="mt-5">

          <label className="text-sm font-medium">

            Amount

          </label>

          <input

            type="number"

            value={amount}

            onChange={(e)=>
              setAmount(
                e.target.value
              )
            }

            className="w-full border rounded-xl px-4 py-3 mt-2"

            placeholder="Enter Amount"

          />

        </div>

        <div className="mt-4">

          <label className="text-sm font-medium">

            Payment Method

          </label>

          <select

            value={paymentMethod}

            onChange={(e)=>
              setPaymentMethod(
                e.target.value
              )
            }

            className="w-full border rounded-xl px-4 py-3 mt-2"

          >

            <option value="CASH">
              CASH
            </option>

            <option value="UPI">
              UPI
            </option>

          </select>

        </div>

        <div className="flex gap-3 mt-6">

          <button

            onClick={onClose}

            className="flex-1 border rounded-xl py-3"

          >

            Cancel

          </button>

          <button

            onClick={handleSubmit}

            disabled={loading}

            className="flex-1 bg-green-600 text-white rounded-xl py-3"

          >

            {

              loading

              ? "Saving..."

              : "Collect"

            }

          </button>

        </div>

      </div>

    </div>

  );

}

export default CollectPaymentModal;