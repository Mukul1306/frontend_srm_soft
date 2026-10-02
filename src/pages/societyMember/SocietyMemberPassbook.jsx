import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import axios from "axios";

import {
  BookOpen,
  IndianRupee,
  AlertTriangle,
  CircleCheck,
  CalendarDays,
  Search,
  RefreshCw
} from "lucide-react";


function SocietyMemberPassbook() {

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");


  useEffect(() => {
    loadPassbook();
  }, []);


  const loadPassbook = async () => {

    try {

      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "societyMemberToken"
        );

      if (!token) {

        setError(
          "Your login session has expired."
        );

        return;
      }


      const response =
        await axios.get(
          "https://finance-project-0qqk.onrender.com/api/member-portal/passbook",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      if (
        !response.data?.success
      ) {

        throw new Error(
          response.data?.message ||
          "Unable to load passbook"
        );

      }


      setData(
        response.data
      );

    } catch (err) {

      console.error(
        "PASSBOOK ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load passbook."
      );

    } finally {

      setLoading(false);

    }
  };


  const transactions =
    data?.transactions || [];


  const filteredTransactions =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      return transactions.filter(
        (transaction) => {

          const matchesSearch =
            !query ||
            String(
              transaction.installmentNo || ""
            )
              .toLowerCase()
              .includes(query) ||
            String(
              transaction.paymentMode || ""
            )
              .toLowerCase()
              .includes(query) ||
            String(
              transaction.transactionId || ""
            )
              .toLowerCase()
              .includes(query);


          let matchesFilter =
            true;


          if (
            filter === "CASH"
          ) {

            matchesFilter =
              String(
                transaction.paymentMode || ""
              ).toUpperCase() ===
              "CASH";

          }


          if (
            filter === "ONLINE"
          ) {

            matchesFilter =
              [
                "UPI",
                "ONLINE",
                "BANK",
                "NEFT",
                "IMPS"
              ].includes(
                String(
                  transaction.paymentMode || ""
                ).toUpperCase()
              );

          }


          return (
            matchesSearch &&
            matchesFilter
          );

        }
      );

    }, [
      transactions,
      search,
      filter
    ]);


  if (loading) {

    return (
      <div className="
        min-h-[70vh]
        flex
        items-center
        justify-center
      ">

        <div className="
          text-center
        ">

          <div className="
            mx-auto
            h-9
            w-9
            animate-spin
            rounded-full
            border-[3px]
            border-slate-200
            border-t-blue-600
          " />

          <p className="
            mt-3
            text-sm
            text-slate-500
          ">
            Loading passbook...
          </p>

        </div>

      </div>
    );

  }


  if (error) {

    return (
      <div className="
        min-h-[70vh]
        flex
        items-center
        justify-center
        px-4
      ">

        <div className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-red-100
          bg-white
          p-6
          text-center
        ">

          <AlertTriangle
            size={26}
            className="
              mx-auto
              text-red-500
            "
          />

          <h2 className="
            mt-4
            text-base
            font-bold
            text-slate-900
          ">
            Unable to load passbook
          </h2>

          <p className="
            mt-1
            text-sm
            text-slate-500
          ">
            {error}
          </p>

          <button
            type="button"
            onClick={loadPassbook}
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-5
              py-3
              text-sm
              font-bold
              text-white
              hover:bg-blue-700
            "
          >
            <RefreshCw size={16} />
            Try Again
          </button>

        </div>

      </div>
    );

  }


  const summary =
    data?.summary || {};


  return (
    <div className="
      mx-auto
      w-full
      max-w-3xl
      space-y-5
      pb-5
    ">


      {/* PAGE HEADER */}

      <section>

        <p className="
          text-xs
          font-medium
          text-slate-400
        ">
          Financial Ledger
        </p>

        <div className="
          mt-1
          flex
          items-center
          justify-between
          gap-3
        ">

          <div>

            <h1 className="
              text-xl
              font-extrabold
              tracking-tight
              text-slate-950
              sm:text-2xl
            ">
              Passbook
            </h1>

            <p className="
              mt-1
              text-xs
              text-slate-500
            ">
              Complete payment history
            </p>

          </div>

          <div className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-blue-50
            text-blue-600
          ">
            <BookOpen size={19} />
          </div>

        </div>

      </section>


      {/* SUMMARY CARDS */}

      <section className="
        grid
        grid-cols-2
        gap-3
      ">

        <div className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
        ">

          <p className="
            text-[10px]
            font-bold
            uppercase
            tracking-wide
            text-slate-400
          ">
            Total Received
          </p>

          <p className="
            mt-1
            text-xl
            font-extrabold
            text-slate-900
          ">
            ₹{Number(
              summary.totalReceived || 0
            ).toLocaleString("en-IN")}
          </p>

        </div>


        <div className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
        ">

          <p className="
            text-[10px]
            font-bold
            uppercase
            tracking-wide
            text-slate-400
          ">
            Transactions
          </p>

          <p className="
            mt-1
            text-xl
            font-extrabold
            text-slate-900
          ">
            {summary.totalTransactions || 0}
          </p>

        </div>


        <div className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
        ">

          <p className="
            text-[10px]
            font-bold
            uppercase
            tracking-wide
            text-slate-400
          ">
            Penalty Paid
          </p>

          <p className="
            mt-1
            text-xl
            font-extrabold
            text-slate-900
          ">
            ₹{Number(
              summary.totalPenalty || 0
            ).toLocaleString("en-IN")}
          </p>

        </div>


        <div className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
        ">

          <p className="
            text-[10px]
            font-bold
            uppercase
            tracking-wide
            text-slate-400
          ">
            This Month
          </p>

          <p className="
            mt-1
            text-xl
            font-extrabold
            text-emerald-600
          ">
            ₹{Number(
              summary.currentMonthCollection || 0
            ).toLocaleString("en-IN")}
          </p>

        </div>

      </section>


      {/* SEARCH + FILTER */}

      <section className="
        space-y-3
      ">

        <div className="
          relative
        ">

          <Search
            size={17}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search installment, mode or transaction..."
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              py-3
              pl-11
              pr-4
              text-sm
              outline-none
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
            "
          />

        </div>


        <div className="
          flex
          gap-2
          overflow-x-auto
          pb-1
        ">

          {[
            "ALL",
            "CASH",
            "ONLINE"
          ].map((item) => (

            <button
              key={item}
              type="button"
              onClick={() =>
                setFilter(item)
              }
              className={`
                shrink-0
                rounded-xl
                border
                px-4
                py-2
                text-xs
                font-bold
                transition
                ${
                  filter === item
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-500"
                }
              `}
            >
              {item}
            </button>

          ))}

        </div>

      </section>


      {/* TRANSACTIONS */}

      <section className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
      ">

        <div className="
          border-b
          border-slate-100
          px-4
          py-4
        ">

          <h2 className="
            text-sm
            font-bold
            text-slate-900
          ">
            Transactions
          </h2>

          <p className="
            mt-0.5
            text-[11px]
            text-slate-400
          ">
            {filteredTransactions.length} records
          </p>

        </div>


        {filteredTransactions.length === 0 ? (

          <div className="
            p-10
            text-center
          ">

            <BookOpen
              size={28}
              className="
                mx-auto
                text-slate-300
              "
            />

            <p className="
              mt-3
              text-sm
              font-medium
              text-slate-500
            ">
              No transactions found.
            </p>

          </div>

        ) : (

          <div className="
            divide-y
            divide-slate-100
          ">

            {filteredTransactions.map(
              (transaction) => (

                <div
                  key={
                    transaction._id
                  }
                  className="
                    px-4
                    py-4
                  "
                >

                  <div className="
                    flex
                    items-start
                    justify-between
                    gap-3
                  ">

                    <div className="
                      flex
                      min-w-0
                      items-center
                      gap-3
                    ">

                      <div className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-emerald-50
                        text-emerald-600
                      ">

                        <CircleCheck
                          size={18}
                        />

                      </div>


                      <div className="
                        min-w-0
                      ">

                        <p className="
                          text-xs
                          font-bold
                          text-slate-800
                        ">
                          Installment #
                          {
                            transaction.installmentNo
                          }
                        </p>


                        <p className="
                          mt-1
                          text-[11px]
                          text-slate-400
                        ">

                          {transaction.paymentDate
                            ? new Date(
                                transaction.paymentDate
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric"
                                }
                              )
                            : "--"}

                        </p>

                      </div>

                    </div>


                    <div className="
                      shrink-0
                      text-right
                    ">

                      <p className="
                        text-sm
                        font-extrabold
                        text-slate-900
                      ">
                        ₹{Number(
                          transaction.totalReceived || 0
                        ).toLocaleString("en-IN")}
                      </p>


                      <p className="
                        mt-1
                        text-[10px]
                        font-bold
                        text-emerald-600
                      ">
                        PAID
                      </p>

                    </div>

                  </div>


                  <div className="
                    mt-3
                    grid
                    grid-cols-3
                    gap-2
                  ">

                    <div className="
                      rounded-xl
                      bg-slate-50
                      p-2.5
                    ">

                      <p className="
                        text-[9px]
                        font-bold
                        uppercase
                        text-slate-400
                      ">
                        EMI
                      </p>

                      <p className="
                        mt-1
                        text-xs
                        font-bold
                        text-slate-700
                      ">
                        ₹{Number(
                          transaction.installmentAmount || 0
                        ).toLocaleString("en-IN")}
                      </p>

                    </div>


                    <div className="
                      rounded-xl
                      bg-slate-50
                      p-2.5
                    ">

                      <p className="
                        text-[9px]
                        font-bold
                        uppercase
                        text-slate-400
                      ">
                        Penalty
                      </p>

                      <p className="
                        mt-1
                        text-xs
                        font-bold
                        text-slate-700
                      ">
                        ₹{Number(
                          transaction.penaltyAmount || 0
                        ).toLocaleString("en-IN")}
                      </p>

                    </div>


                    <div className="
                      rounded-xl
                      bg-slate-50
                      p-2.5
                    ">

                      <p className="
                        text-[9px]
                        font-bold
                        uppercase
                        text-slate-400
                      ">
                        Mode
                      </p>

                      <p className="
                        mt-1
                        truncate
                        text-xs
                        font-bold
                        text-slate-700
                      ">
                        {
                          transaction.paymentMode ||
                          "--"
                        }
                      </p>

                    </div>

                  </div>


                  {transaction.transactionId && (
                    <div className="
                      mt-3
                      flex
                      items-center
                      justify-between
                      gap-3
                      rounded-xl
                      bg-slate-50
                      px-3
                      py-2
                    ">

                      <span className="
                        text-[10px]
                        font-bold
                        uppercase
                        text-slate-400
                      ">
                        Transaction ID
                      </span>

                      <span className="
                        max-w-[60%]
                        truncate
                        text-[10px]
                        font-semibold
                        text-slate-600
                      ">
                        {
                          transaction.transactionId
                        }
                      </span>

                    </div>
                  )}

                </div>

              )
            )}

          </div>

        )}

      </section>

    </div>
  );
}

export default SocietyMemberPassbook;