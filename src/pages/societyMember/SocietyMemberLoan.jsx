import React, {
  useEffect,
  useState
} from "react";

import axios from "axios";

import {
  IndianRupee,
  Landmark,
  CircleCheck,
  AlertTriangle,
  CalendarDays,
  RefreshCw,
  WalletCards,
  Clock3,
  ChevronDown,
  ReceiptText
} from "lucide-react";


function SocietyMemberLoan() {

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [expandedLoan, setExpandedLoan] =
    useState(null);


  useEffect(() => {

    loadLoans();

  }, []);


  const loadLoans = async (
    isRefresh = false
  ) => {

    try {

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");


      const token =
        localStorage.getItem(
          "societyMemberToken"
        );


      if (!token) {

        setError(
          "Your login session has expired. Please login again."
        );

        return;

      }


      const response =
        await axios.get(
          "https://finance-project-0qqk.onrender.com/api/member-portal/loan",
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
          "Unable to load loan details."
        );

      }


      setData(
        response.data
      );


    } catch (err) {

      console.error(
        "SOCIETY LOAN ERROR:",
        err
      );


      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load loan details."
      );


    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  };


  // =====================================================
  // LOADING
  // =====================================================

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
            Loading loan details...
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // ERROR
  // =====================================================

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

          <div className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-red-50
            text-red-500
          ">
            <AlertTriangle
              size={24}
            />
          </div>


          <h2 className="
            mt-4
            text-base
            font-bold
            text-slate-900
          ">
            Unable to load loans
          </h2>


          <p className="
            mt-2
            text-sm
            leading-6
            text-slate-500
          ">
            {error}
          </p>


          <button
            type="button"
            onClick={() =>
              loadLoans()
            }
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

            <RefreshCw
              size={16}
            />

            Try Again

          </button>

        </div>

      </div>

    );

  }


  const summary =
    data?.summary || {};

  const loans =
    data?.loans || [];

  const activeLoan =
    data?.activeLoan || null;


  // =====================================================
  // HELPERS
  // =====================================================

  const formatMoney =
    (value) =>
      `₹${Number(
        value || 0
      ).toLocaleString(
        "en-IN"
      )}`;


  const formatDate =
    (value) => {

      if (!value) {
        return "--";
      }

      return new Date(
        value
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );

    };


  const getStatusStyle =
    (status) => {

      const normalized =
        String(
          status || ""
        ).toUpperCase();


      if (
        normalized === "ACTIVE"
      ) {

        return {
          bg:
            "bg-emerald-50",
          text:
            "text-emerald-700",
          border:
            "border-emerald-100"
        };

      }


      if (
        normalized === "CLOSED"
      ) {

        return {
          bg:
            "bg-slate-100",
          text:
            "text-slate-600",
          border:
            "border-slate-200"
        };

      }


      return {
        bg:
          "bg-amber-50",
        text:
          "text-amber-700",
        border:
          "border-amber-100"
      };

    };


  const activeStatus =
    getStatusStyle(
      activeLoan?.status
    );


  return (

    <div className="
      mx-auto
      w-full
      max-w-3xl
      space-y-5
      pb-6
    ">


      {/* =================================================
          HEADER
      ================================================= */}

      <section className="
        flex
        items-start
        justify-between
        gap-3
      ">

        <div>

          <p className="
            text-xs
            font-medium
            text-slate-400
          ">
            Loan Account
          </p>


          <h1 className="
            mt-1
            text-xl
            font-extrabold
            tracking-tight
            text-slate-950
            sm:text-2xl
          ">
            My Loans
          </h1>


          <p className="
            mt-1
            text-xs
            text-slate-500
          ">
            Complete loan and EMI information
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            loadLoans(true)
          }
          disabled={refreshing}
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            text-slate-500
          "
        >

          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

        </button>

      </section>


      {/* =================================================
          SUMMARY
      ================================================= */}

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
            Active Loans
          </p>


          <p className="
            mt-1
            text-2xl
            font-extrabold
            text-slate-900
          ">
            {
              summary.activeLoans ||
              0
            }
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
            Outstanding
          </p>


          <p className="
            mt-1
            text-xl
            font-extrabold
            text-blue-600
          ">
            {formatMoney(
              summary.totalOutstanding
            )}
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
            Total Paid
          </p>


          <p className="
            mt-1
            text-xl
            font-extrabold
            text-emerald-600
          ">
            {formatMoney(
              summary.totalPaid
            )}
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
            Loans
          </p>


          <p className="
            mt-1
            text-xl
            font-extrabold
            text-slate-900
          ">
            {summary.totalLoans || 0}
          </p>

        </div>

      </section>


      {/* =================================================
          ACTIVE LOAN
      ================================================= */}

      {activeLoan ? (

        <section className="
          overflow-hidden
          rounded-2xl
          bg-gradient-to-br
          from-blue-600
          to-blue-700
          p-5
          text-white
          shadow-[0_10px_30px_rgba(37,99,235,0.16)]
        ">

          <div className="
            flex
            items-start
            justify-between
            gap-4
          ">

            <div>

              <p className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-blue-100
              ">
                Outstanding Loan
              </p>


              <h2 className="
                mt-1
                text-3xl
                font-extrabold
              ">
                {formatMoney(
                  activeLoan.outstandingPrincipal
                )}
              </h2>

            </div>


            <span className={`
              rounded-full
              border
              px-3
              py-1
              text-[10px]
              font-bold
              uppercase
              ${activeStatus.bg}
              ${activeStatus.text}
              ${activeStatus.border}
            `}>
              {activeLoan.status}
            </span>

          </div>


          <div className="
            mt-5
            grid
            grid-cols-2
            gap-3
          ">

            <div className="
              rounded-xl
              bg-white/10
              p-3
            ">

              <p className="
                text-[10px]
                text-blue-100
              ">
                Principal
              </p>


              <p className="
                mt-1
                text-sm
                font-bold
              ">
                {formatMoney(
                  activeLoan.principalAmount
                )}
              </p>

            </div>


            <div className="
              rounded-xl
              bg-white/10
              p-3
            ">

              <p className="
                text-[10px]
                text-blue-100
              ">
                EMI
              </p>


              <p className="
                mt-1
                text-sm
                font-bold
              ">
                {formatMoney(
                  activeLoan.emiAmount
                )}
              </p>

            </div>


            <div className="
              rounded-xl
              bg-white/10
              p-3
            ">

              <p className="
                text-[10px]
                text-blue-100
              ">
                Paid EMIs
              </p>


              <p className="
                mt-1
                text-sm
                font-bold
              ">
                {
                  activeLoan.paidEmis ||
                  0
                }
                /
                {
                  activeLoan.totalEmis ||
                  0
                }
              </p>

            </div>


            <div className="
              rounded-xl
              bg-white/10
              p-3
            ">

              <p className="
                text-[10px]
                text-blue-100
              ">
                Pending EMIs
              </p>


              <p className="
                mt-1
                text-sm
                font-bold
              ">
                {
                  activeLoan.pendingEmis ||
                  0
                }
              </p>

            </div>

          </div>

        </section>

      ) : (

        <section className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-8
          text-center
        ">

          <div className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-blue-50
            text-blue-600
          ">

            <Landmark
              size={23}
            />

          </div>


          <h2 className="
            mt-4
            text-base
            font-bold
            text-slate-900
          ">
            No active loan
          </h2>


          <p className="
            mt-1
            text-sm
            text-slate-500
          ">
            You currently do not have an active society loan.
          </p>

        </section>

      )}


      {/* =================================================
          NEXT EMI
      ================================================= */}

      {activeLoan?.nextPayment && (

        <section className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
          sm:p-5
        ">

          <div className="
            flex
            items-start
            justify-between
            gap-3
          ">

            <div>

              <p className="
                text-[10px]
                font-bold
                uppercase
                tracking-wide
                text-slate-400
              ">
                Next EMI
              </p>


              <h3 className="
                mt-1
                text-2xl
                font-extrabold
                text-slate-900
              ">
                {formatMoney(
                  activeLoan.nextPayment.total
                )}
              </h3>

            </div>


            <div className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-amber-50
              text-amber-600
            ">

              <CalendarDays
                size={19}
              />

            </div>

          </div>


          <div className="
            mt-4
            grid
            grid-cols-3
            gap-2
          ">

            <div className="
              rounded-xl
              bg-slate-50
              p-3
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
                {formatMoney(
                  activeLoan.nextPayment.amount
                )}
              </p>

            </div>


            <div className="
              rounded-xl
              bg-slate-50
              p-3
            ">

              <p className="
                text-[9px]
                font-bold
                uppercase
                text-slate-400
              ">
                Interest
              </p>


              <p className="
                mt-1
                text-xs
                font-bold
                text-slate-700
              ">
                {formatMoney(
                  activeLoan.nextPayment.interest
                )}
              </p>

            </div>


            <div className="
              rounded-xl
              bg-slate-50
              p-3
            ">

              <p className="
                text-[9px]
                font-bold
                uppercase
                text-slate-400
              ">
                Due
              </p>


              <p className="
                mt-1
                text-xs
                font-bold
                text-slate-700
              ">
                {formatDate(
                  activeLoan.nextPayment.dueDate
                )}
              </p>

            </div>

          </div>

        </section>

      )}


      {/* =================================================
          LOAN HISTORY
      ================================================= */}

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
            Loan History
          </h2>


          <p className="
            mt-0.5
            text-[11px]
            text-slate-400
          ">
            All your society loan accounts
          </p>

        </div>


        {loans.length === 0 ? (

          <div className="
            p-10
            text-center
          ">

            <ReceiptText
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
              No loan records found.
            </p>

          </div>

        ) : (

          <div className="
            divide-y
            divide-slate-100
          ">

            {loans.map(
              (loan) => {

                const style =
                  getStatusStyle(
                    loan.status
                  );

                const expanded =
                  expandedLoan ===
                  loan._id;


                return (

                  <div
                    key={
                      loan._id
                    }
                  >

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedLoan(
                          expanded
                            ? null
                            : loan._id
                        )
                      }
                      className="
                        w-full
                        px-4
                        py-4
                        text-left
                        transition
                        hover:bg-slate-50
                      "
                    >

                      <div className="
                        flex
                        items-center
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
                            bg-blue-50
                            text-blue-600
                          ">

                            <Landmark
                              size={18}
                            />

                          </div>


                          <div className="
                            min-w-0
                          ">

                            <p className="
                              truncate
                              text-xs
                              font-bold
                              text-slate-800
                            ">
                              {loan.loanType}
                            </p>


                            <p className="
                              mt-1
                              text-[11px]
                              text-slate-400
                            ">
                              {formatDate(
                                loan.loanGivenDate
                              )}
                            </p>

                          </div>

                        </div>


                        <div className="
                          flex
                          items-center
                          gap-2
                        ">

                          <div className="
                            text-right
                          ">

                            <p className="
                              text-sm
                              font-extrabold
                              text-slate-900
                            ">
                              {formatMoney(
                                loan.principalAmount
                              )}
                            </p>


                            <span className={`
                              text-[9px]
                              font-bold
                              uppercase
                              ${style.text}
                            `}>
                              {loan.status}
                            </span>

                          </div>


                          <ChevronDown
                            size={16}
                            className={`
                              text-slate-400
                              transition-transform
                              ${
                                expanded
                                  ? "rotate-180"
                                  : ""
                              }
                            `}
                          />

                        </div>

                      </div>

                    </button>


                    {expanded && (

                      <div className="
                        border-t
                        border-slate-100
                        bg-slate-50
                        px-4
                        py-4
                      ">

                        <div className="
                          grid
                          grid-cols-2
                          gap-2
                          sm:grid-cols-4
                        ">

                          <div className="
                            rounded-xl
                            bg-white
                            p-3
                          ">

                            <p className="
                              text-[9px]
                              font-bold
                              uppercase
                              text-slate-400
                            ">
                              Outstanding
                            </p>


                            <p className="
                              mt-1
                              text-xs
                              font-bold
                              text-slate-700
                            ">
                              {formatMoney(
                                loan.outstandingPrincipal
                              )}
                            </p>

                          </div>


                          <div className="
                            rounded-xl
                            bg-white
                            p-3
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
                              {formatMoney(
                                loan.emiAmount
                              )}
                            </p>

                          </div>


                          <div className="
                            rounded-xl
                            bg-white
                            p-3
                          ">

                            <p className="
                              text-[9px]
                              font-bold
                              uppercase
                              text-slate-400
                            ">
                              Paid EMIs
                            </p>


                            <p className="
                              mt-1
                              text-xs
                              font-bold
                              text-slate-700
                            ">
                              {
                                loan.paidEmis ||
                                0
                              }/
                              {
                                loan.totalEmis ||
                                0
                              }
                            </p>

                          </div>


                          <div className="
                            rounded-xl
                            bg-white
                            p-3
                          ">

                            <p className="
                              text-[9px]
                              font-bold
                              uppercase
                              text-slate-400
                            ">
                              Pending
                            </p>


                            <p className="
                              mt-1
                              text-xs
                              font-bold
                              text-slate-700
                            ">
                              {
                                loan.pendingEmis ||
                                0
                              }
                            </p>

                          </div>

                        </div>


                        <div className="
                          mt-3
                          grid
                          grid-cols-2
                          gap-2
                        ">

                          <div className="
                            rounded-xl
                            bg-white
                            p-3
                          ">

                            <p className="
                              text-[9px]
                              font-bold
                              uppercase
                              text-slate-400
                            ">
                              Interest Paid
                            </p>


                            <p className="
                              mt-1
                              text-xs
                              font-bold
                              text-slate-700
                            ">
                              {formatMoney(
                                loan.totalInterestPaid
                              )}
                            </p>

                          </div>


                          <div className="
                            rounded-xl
                            bg-white
                            p-3
                          ">

                            <p className="
                              text-[9px]
                              font-bold
                              uppercase
                              text-slate-400
                            ">
                              Penalty Paid
                            </p>


                            <p className="
                              mt-1
                              text-xs
                              font-bold
                              text-slate-700
                            ">
                              {formatMoney(
                                loan.totalPenaltyPaid
                              )}
                            </p>

                          </div>

                        </div>


                        {/* PAYMENT HISTORY */}

                        {loan.paymentHistory?.length > 0 && (

                          <div className="
                            mt-4
                            overflow-hidden
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                          ">

                            <div className="
                              border-b
                              border-slate-100
                              px-3
                              py-3
                            ">

                              <p className="
                                text-xs
                                font-bold
                                text-slate-800
                              ">
                                EMI Payment History
                              </p>

                            </div>


                            <div className="
                              divide-y
                              divide-slate-100
                            ">

                              {loan.paymentHistory.map(
                                (payment) => (

                                  <div
                                    key={
                                      payment._id
                                    }
                                    className="
                                      flex
                                      items-center
                                      justify-between
                                      gap-3
                                      px-3
                                      py-3
                                    "
                                  >

                                    <div>

                                      <p className="
                                        text-[11px]
                                        font-bold
                                        text-slate-700
                                      ">
                                        EMI #
                                        {
                                          payment.emiNo ||
                                          "--"
                                        }
                                      </p>


                                      <p className="
                                        mt-0.5
                                        text-[10px]
                                        text-slate-400
                                      ">
                                        {formatDate(
                                          payment.paymentDate
                                        )}
                                      </p>

                                    </div>


                                    <div className="
                                      text-right
                                    ">

                                      <p className="
                                        text-xs
                                        font-extrabold
                                        text-slate-900
                                      ">
                                        {formatMoney(
                                          payment.totalReceived
                                        )}
                                      </p>


                                      <p className="
                                        mt-0.5
                                        text-[9px]
                                        font-bold
                                        text-emerald-600
                                      ">
                                        PAID
                                      </p>

                                    </div>

                                  </div>

                                )
                              )}

                            </div>

                          </div>

                        )}

                      </div>

                    )}

                  </div>

                );

              }
            )}

          </div>

        )}

      </section>

    </div>

  );
}

export default SocietyMemberLoan;