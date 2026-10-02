import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Wallet,
  Users,
  Receipt,
} from "lucide-react";

function CollectionHistory() {

  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {

    try {

      const agent =
        JSON.parse(
          localStorage.getItem(
            "agent"
          )
        );

      const res =
        await axios.get(

          `https://aws.srmfinance.online/api/daily/agent-history/${agent._id}`

        );

      setTransactions(
        res.data.transactions || []
      );

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  const filteredData =
    transactions.filter((item) => {

     const text = search.toLowerCase();

const memberMatch =

  item.member?.memberName
    ?.toLowerCase()
    .includes(text)

  ||

  item.member?.memberId
    ?.toLowerCase()
    .includes(text)

  ||

  item.member?.mobile
    ?.includes(search);

      const trxDate =
        new Date(
          item.collectionDate
        );

      const from =
        fromDate
          ? new Date(fromDate)
          : null;

      const to =
        toDate
          ? new Date(toDate)
          : null;

      const dateMatch =

        (!from || trxDate >= from)

        &&

        (!to || trxDate <= to);

      return (
        memberMatch &&
        dateMatch
      );

    });

  const totalCollection =
    filteredData.reduce(

      (sum, item) =>

        sum +
        (item.totalAmount || 0),

      0

    );

  const totalPenalty =
    filteredData.reduce(

      (sum, item) =>

        sum +
        (item.penalty || 0),

      0

    );

  const uniqueMembers =
    new Set(

      filteredData.map(
        (item) =>
          item.member?._id
      )

    ).size;

  if (loading) {

    return (

      <div className="p-10 text-center">

        Loading Collection History...

      </div>

    );

  }

  return (

    <div className="p-6 bg-slate-50 min-h-screen">

      {/* Header */}

      <div className="mb-6">

        <h1 className="text-2xl font-bold">

          Collection History

        </h1>

        <p className="text-slate-500 text-sm">

          Track all member collections

        </p>

      </div>

      {/* Cards */}

      <div className="grid md:grid-cols-4 gap-5 mb-6">

        <div className="bg-white p-5 rounded-2xl border">

          <div className="flex justify-between">

            <div>

              <p className="text-xs text-slate-400 uppercase">

                Total Collection

              </p>

              <h2 className="text-2xl font-bold mt-2 text-green-600">

                ₹{totalCollection.toLocaleString("en-IN")}

              </h2>

            </div>

            <Wallet />

          </div>

        </div>

        <div className="bg-white p-5 rounded-2xl border">

          <div className="flex justify-between">

            <div>

              <p className="text-xs text-slate-400 uppercase">

                Total Penalty

              </p>

              <h2 className="text-2xl font-bold mt-2 text-red-500">

                ₹{totalPenalty.toLocaleString("en-IN")}

              </h2>

            </div>

            <Receipt />

          </div>

        </div>

        <div className="bg-white p-5 rounded-2xl border">

          <div>

            <p className="text-xs text-slate-400 uppercase">

              Transactions

            </p>

            <h2 className="text-2xl font-bold mt-2">

              {filteredData.length}

            </h2>

          </div>

        </div>

        <div className="bg-white p-5 rounded-2xl border">

          <div className="flex justify-between">

            <div>

              <p className="text-xs text-slate-400 uppercase">

                Members Paid

              </p>

              <h2 className="text-2xl font-bold mt-2">

                {uniqueMembers}

              </h2>

            </div>

            <Users />

          </div>

        </div>

      </div>

      {/* Filters */}

      <div className="bg-white p-5 rounded-2xl border mb-6">

        <div className="grid md:grid-cols-3 gap-4">

          <div className="flex items-center border rounded-xl px-3">

            <Search
              size={16}
              className="text-slate-400"
            />

            <input

              type="text"

             placeholder="Search by Member ID, Name or Mobile"

              value={search}

              onChange={(e)=>
                setSearch(
                  e.target.value
                )
              }

              className="w-full p-3 outline-none"

            />

          </div>

          <div>

            <input

              type="date"

              value={fromDate}

              onChange={(e)=>
                setFromDate(
                  e.target.value
                )
              }

              className="w-full border rounded-xl p-3"

            />

          </div>

          <div>

            <input

              type="date"

              value={toDate}

              onChange={(e)=>
                setToDate(
                  e.target.value
                )
              }

              className="w-full border rounded-xl p-3"

            />

          </div>

        </div>

      </div>

      {/* Table */}

      <div className="bg-white rounded-2xl border overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-slate-100 text-xs uppercase">

              <th className="p-4 text-left">
Collection Date
</th>

<th className="p-4 text-left">
Payment For
</th>

                <th className="p-4 text-left">
                  Member
                </th>

                <th className="p-4 text-left">
                  Daily Amount
                </th>

                <th className="p-4 text-left">
                  Penalty
                </th>

                <th className="p-4 text-left">
                  Total
                </th>

                <th className="p-4 text-left">
                  Method
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredData.map((item) => (

                <tr
                  key={item._id}
                  className="border-t"
                >

                <td className="p-4">

{new Date(
item.collectionDate
).toLocaleDateString("en-IN")}

</td>

<td className="p-4">

  <p>
    {new Date(item.collectionDate).toLocaleDateString("en-IN")}
  </p>



<p className="text-xs text-slate-500">

  {item.type === "LOAN EMI"
    ? item.paymentForDate
      ? `EMI Due : ${new Date(item.paymentForDate).toLocaleDateString("en-IN")}`
      : "--"
    : item.paymentForDate
      ? `Saving Date : ${new Date(item.paymentForDate).toLocaleDateString("en-IN")}`
      : "--"}

</p>

</td>

                  <td className="p-4 font-medium">

                    {
                      item.member
                        ?.memberName
                    }

                  </td>

                  <td className="p-4">

                    ₹
                    {
                      item.dailyAmount
                    }

                  </td>

                  <td className="p-4 text-red-500">

                    ₹
                    {
                      item.penalty || 0
                    }

                  </td>

                  <td className="p-4 font-bold text-green-600">

                    ₹
                    {
                      item.totalAmount
                    }

                  </td>

                  <td className="p-4">

                    {
                      item.paymentMethod
                    }

                  </td>

                  <td className="p-4">

                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold">

                      PAID

                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

export default CollectionHistory;