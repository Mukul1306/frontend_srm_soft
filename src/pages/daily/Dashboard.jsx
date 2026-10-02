import React, {
  useEffect,
  useState,
  useCallback
} from "react";

import axios from "axios";

import {
  Users,
  UserCheck,
  Wallet,
  Landmark,
  TrendingUp,
  TrendingDown,
  Award,
  History,
  AlertCircle,
  RefreshCw,
  Target,
  ShieldAlert,
  Banknote,
  Receipt,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  IndianRupee
} from "lucide-react";


// =====================================================
// HELPERS
// =====================================================

const formatCurrency = (amount = 0) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const formatNumber = (num = 0) =>
  Number(num || 0).toLocaleString("en-IN");

const formatDate = () =>
  new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

const API_ENDPOINT =
  "https://finance-project-0qqk.onrender.com/api/dashboard";


// =====================================================
// DASHBOARD
// =====================================================

export default function Dashboard() {

  const [data, setData] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  // ===================================================
  // LOAD DASHBOARD
  // ===================================================

  const loadDashboard =
    useCallback(async () => {

      setLoading(true);
      setError(null);

      try {

        const res =
          await axios.get(
            API_ENDPOINT
          );

        setData(
          res.data
        );

      } catch (err) {

        console.error(
          "Dashboard loading error:",
          err
        );

        setError(
          "Unable to load dashboard data."
        );

      } finally {

        setLoading(false);

      }

    }, []);


  useEffect(() => {

    loadDashboard();

  }, [loadDashboard]);


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (
      <DashboardLoadingSkeleton />
    );

  }


  // ===================================================
  // ERROR
  // ===================================================

  if (error || !data) {

    return (

      <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center px-4">

        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">

          <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">

            <AlertCircle size={28} />

          </div>

          <h2 className="mt-5 text-lg font-black text-slate-900">

            Dashboard Unavailable

          </h2>

          <p className="mt-2 text-sm text-slate-500 leading-relaxed">

            {error ||
              "An unexpected error occurred while loading operational metrics."}

          </p>

          <button

            onClick={loadDashboard}

            className="
              mt-6
              inline-flex
              items-center
              justify-center
              gap-2
              px-5
              py-3
              rounded-xl
              bg-slate-900
              text-white
              text-sm
              font-bold
              hover:bg-slate-800
              active:scale-[0.98]
              transition
            "

          >

            <RefreshCw size={16} />

            Retry Dashboard

          </button>

        </div>

      </div>

    );

  }


  // ===================================================
  // VALUES
  // ===================================================

  const totalTarget =
    Number(
      data.totalTarget || 0
    );

  const todayActual =
    Number(
      data.todayActualAgentCollection || 0
    );

  const targetRemaining =
    Math.max(
      0,
      totalTarget - todayActual
    );

  const targetCoverage =
    totalTarget > 0
      ? Math.round(
          (todayActual /
            totalTarget) *
            100
        )
      : 0;


  const isNetProfitPositive =
    Number(
      data.netProfit || 0
    ) >= 0;


  // ===================================================
  // RETURN
  // ===================================================

  return (

    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">

      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-7 py-5 sm:py-7 space-y-6">


        {/* =================================================
            HEADER
        ================================================= */}

        <section
          className="
            relative
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >

          <div
            className="
              absolute
              -top-20
              -right-20
              w-64
              h-64
              rounded-full
              bg-blue-100/50
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -bottom-28
              left-1/3
              w-72
              h-72
              rounded-full
              bg-indigo-100/30
              blur-3xl
            "
          />


          <div className="relative p-5 sm:p-7">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

              {/* LEFT */}

              <div className="flex items-start gap-4 min-w-0">

                <div
                  className="
                    w-12
                    h-12
                    sm:w-14
                    sm:h-14
                    rounded-2xl
                    bg-gradient-to-br
                    from-blue-600
                    via-indigo-600
                    to-violet-600
                    text-white
                    flex
                    items-center
                    justify-center
                    shadow-lg
                    shadow-blue-500/20
                    shrink-0
                  "
                >

                  <Activity
                    size={23}
                  />

                </div>


                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        px-2.5
                        py-1
                        rounded-lg
                        bg-blue-50
                        text-blue-700
                        border
                        border-blue-100
                        text-[10px]
                        font-black
                        uppercase
                        tracking-wider
                      "
                    >

                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

                      Live Operations

                    </span>

                    <span className="text-[11px] text-slate-400 font-semibold">

                      {formatDate()}

                    </span>

                  </div>


                  <h1
                    className="
                      mt-2
                      text-xl
                      sm:text-2xl
                      lg:text-3xl
                      font-black
                      tracking-tight
                      text-slate-950
                    "
                  >

                    SRM Finance Dashboard

                  </h1>


                  <p
                    className="
                      mt-1
                      text-xs
                      sm:text-sm
                      text-slate-500
                      max-w-2xl
                      leading-relaxed
                    "
                  >

                    Centralized overview of collections,
                    targets, penalties, expenses and
                    financial operations.

                  </p>

                </div>

              </div>


              {/* REFRESH */}

              <button
                onClick={loadDashboard}
                className="
                  self-start
                  lg:self-center
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  min-h-[42px]
                  px-4
                  rounded-xl
                  bg-slate-50
                  border
                  border-slate-200
                  text-xs
                  sm:text-sm
                  font-bold
                  text-slate-700
                  hover:bg-slate-100
                  hover:border-slate-300
                  active:scale-[0.98]
                  transition
                "
              >

                <RefreshCw size={15} />

                Refresh Data

              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            PRIMARY KPI GRID
        ================================================= */}

        <section>

          <div className="flex items-center justify-between mb-3">

            <div>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">

                Business Overview

              </p>

              <h2 className="mt-1 text-base sm:text-lg font-black text-slate-900">

                Operational Snapshot

              </h2>

            </div>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">


            <MetricCard

              title="Active Agents"

              subtitle="Field operators"

              value={formatNumber(data.totalAgents)}

              icon={
                <Users
                  size={18}
                />
              }

              iconColor="text-blue-600"

              iconBg="bg-blue-50"

              accent="border-blue-500"

            />


            <MetricCard

              title="Enrolled Members"

              subtitle="Registered accounts"

              value={formatNumber(data.totalMembers)}

              icon={
                <UserCheck
                  size={18}
                />
              }

              iconColor="text-indigo-600"

              iconBg="bg-indigo-50"

              accent="border-indigo-500"

            />


            <MetricCard

              title="Active Loans"

              subtitle="Currently running"

              value={formatNumber(data.activeLoans)}

              icon={
                <Landmark
                  size={18}
                />
              }

              iconColor="text-violet-600"

              iconBg="bg-violet-50"

              accent="border-violet-500"

            />


            <MetricCard

              title="Total Collection"

              subtitle="All-time agent inflow"

              value={formatCurrency(data.totalAgentCollection)}

              icon={
                <Wallet
                  size={18}
                />
              }

              iconColor="text-emerald-600"

              iconBg="bg-emerald-50"

              accent="border-emerald-500"

            />


            <MetricCard

              title="Net Profit"

              subtitle="Current financial result"

              value={formatCurrency(data.netProfit)}

              icon={
                isNetProfitPositive
                  ? <TrendingUp size={18} />
                  : <TrendingDown size={18} />
              }

              iconColor={
                isNetProfitPositive
                  ? "text-emerald-600"
                  : "text-rose-600"
              }

              iconBg={
                isNetProfitPositive
                  ? "bg-emerald-50"
                  : "bg-rose-50"
              }

              accent={
                isNetProfitPositive
                  ? "border-emerald-500"
                  : "border-rose-500"
              }

              valueColor={
                isNetProfitPositive
                  ? "text-emerald-600"
                  : "text-rose-600"
              }

            />

          </div>

        </section>


        {/* =================================================
            COLLECTION CONTROL CARDS
        ================================================= */}

        <section>

          <div className="flex items-center justify-between mb-3">

            <div>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">

                Collection Control

              </p>

              <h2 className="mt-1 text-base sm:text-lg font-black text-slate-900">

                Today's Target & Recovery

              </h2>

            </div>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">


            {/* DAILY SAVING TARGET */}

            <FinancialCard

              title="Daily Saving Target"

              subtitle="Due today"

              value={formatCurrency(
                data.dailySavingTarget
              )}

              icon={
                <Target
                  size={18}
                />
              }

              iconBg="bg-cyan-50"

              iconColor="text-cyan-600"

              valueColor="text-cyan-700"

            />


            {/* LOAN TARGET */}

            <FinancialCard

              title="Loan Target"

              subtitle="EMI due today"

              value={formatCurrency(
                data.loanTarget
              )}

              icon={
                <Banknote
                  size={18}
                />
              }

              iconBg="bg-violet-50"

              iconColor="text-violet-600"

              valueColor="text-violet-700"

            />


            {/* TOTAL TARGET */}

            <FinancialCard

              title="Total Target"

              subtitle="Saving + loan"

              value={formatCurrency(
                data.totalTarget
              )}

              icon={
                <Target
                  size={18}
                />
              }

              iconBg="bg-blue-50"

              iconColor="text-blue-600"

              valueColor="text-blue-700"

            />


            {/* ACTUAL COLLECTION */}

            <FinancialCard

              title="Actual Collection"

              subtitle="Physically received today"

              value={formatCurrency(
                data.todayActualAgentCollection
              )}

              icon={
                <Wallet
                  size={18}
                />
              }

              iconBg="bg-emerald-50"

              iconColor="text-emerald-600"

              valueColor="text-emerald-700"

            />


            {/* PENDING PENALTY */}

            <FinancialCard

              title="Pending Penalty"

              subtitle="Daily + loan"

              value={formatCurrency(
                data.totalPendingPenalty
              )}

              icon={
                <ShieldAlert
                  size={18}
                />
              }

              iconBg="bg-rose-50"

              iconColor="text-rose-600"

              valueColor="text-rose-700"

            />


            {/* MONTH EXPENSE */}

            <FinancialCard

              title="This Month Expense"

              subtitle="Current month only"

              value={formatCurrency(
                data.thisMonthExpense
              )}

              icon={
                <Receipt
                  size={18}
                />
              }

              iconBg="bg-orange-50"

              iconColor="text-orange-600"

              valueColor="text-orange-700"

            />

          </div>

        </section>


        {/* =================================================
            TARGET CONTROL PANEL
        ================================================= */}

        <section
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-sm
            overflow-hidden
          "
        >

          <div className="p-5 sm:p-6">

            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

              {/* LEFT */}

              <div className="flex items-start gap-4">

                <div
                  className="
                    w-11
                    h-11
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >

                  <Activity
                    size={19}
                  />

                </div>


                <div>

                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">

                    Today's Collection Monitor

                  </p>

                  <h3 className="mt-1 text-lg font-black text-slate-900">

                    {formatCurrency(todayActual)}

                    <span className="text-sm font-bold text-slate-400 ml-2">

                      collected

                    </span>

                  </h3>

                  <p className="text-xs text-slate-500 mt-1">

                    Target:

                    <span className="font-bold text-slate-700 ml-1">

                      {formatCurrency(totalTarget)}

                    </span>

                  </p>

                </div>

              </div>


              {/* RIGHT STATS */}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                <MiniStat

                  label="Target"

                  value={formatCurrency(
                    totalTarget
                  )}

                  icon={
                    <Target
                      size={14}
                    />
                  }

                  tone="blue"

                />


                <MiniStat

                  label="Collected"

                  value={formatCurrency(
                    todayActual
                  )}

                  icon={
                    <ArrowUpRight
                      size={14}
                    />
                  }

                  tone="emerald"

                />


                <MiniStat

                  label="Remaining"

                  value={formatCurrency(
                    targetRemaining
                  )}

                  icon={
                    <ArrowDownRight
                      size={14}
                    />
                  }

                  tone={
                    targetRemaining > 0
                      ? "orange"
                      : "emerald"
                  }

                />

              </div>

            </div>


            {/* PROGRESS */}

            <div className="mt-6">

              <div className="flex items-center justify-between mb-2">

                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">

                  Collection Progress

                </span>

                <span className="text-xs font-black text-slate-700">

                  {targetCoverage}%

                </span>

              </div>


              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">

                <div
                  className="
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    from-blue-600
                    via-indigo-600
                    to-violet-600
                    transition-all
                    duration-700
                  "
                  style={{
                    width: `${Math.min(
                      targetCoverage,
                      100
                    )}%`
                  }}
                />

              </div>

              <p className="mt-2 text-[10px] text-slate-400">

                Actual collection can include recovery of
                previous pending payments.

              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            SECONDARY FINANCIAL SUMMARY
        ================================================= */}

        <section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <SecondaryCard

              title="Daily Saving Collection"

              value={formatCurrency(
                data.totalDailyCollection
              )}

              label="Lifetime"

              icon={
                <Wallet
                  size={17}
                />
              }

              tone="blue"

            />


            <SecondaryCard

              title="Loan Collection"

              value={formatCurrency(
                data.totalLoanCollection
              )}

              label="Lifetime"

              icon={
                <IndianRupee
                  size={17}
                />
              }

              tone="violet"

            />


            <SecondaryCard

              title="Loan Capital Deployed"

              value={formatCurrency(
                data.totalLoanGiven
              )}

              label="Total loan amount"

              icon={
                <Banknote
                  size={17}
                />
              }

              tone="orange"

            />


            <SecondaryCard

              title="Total Expenses"

              value={formatCurrency(
                data.totalExpenses
              )}

              label="All-time operational expense"

              icon={
                <Receipt
                  size={17}
                />
              }

              tone="rose"

            />

          </div>

        </section>


        {/* =================================================
            DATA AREA
        ================================================= */}

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">


          {/* ===============================================
              RECENT COLLECTIONS
          =============================================== */}

          <div
            className="
              xl:col-span-2
              bg-white
              rounded-3xl
              border
              border-slate-200
              shadow-sm
              overflow-hidden
            "
          >

            <PanelHeader

              icon={
                <History
                  size={16}
                />
              }

              title="Recent Collections"

              subtitle="Latest inbound saving transactions"

            />


            {data.recentCollections &&
            data.recentCollections.length > 0 ? (

              <>

                {/* MOBILE */}

                <div className="md:hidden divide-y divide-slate-100">

                  {data.recentCollections.map(
                    (item) => (

                      <div
                        key={item._id}
                        className="
                          p-4
                          flex
                          items-center
                          justify-between
                          gap-4
                        "
                      >

                        <div className="min-w-0">

                          <p className="text-sm font-black text-slate-900 truncate">

                            {item.member?.memberName ||
                              "Anonymous Member"}

                          </p>

                          <p className="text-[11px] text-slate-400 mt-0.5">

                            {item.createdAt
                              ? new Date(
                                  item.createdAt
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "N/A"}

                          </p>

                        </div>


                        <span
                          className="
                            shrink-0
                            px-3
                            py-1.5
                            rounded-lg
                            bg-emerald-50
                            border
                            border-emerald-100
                            text-emerald-700
                            text-xs
                            font-black
                          "
                        >

                          {formatCurrency(
                            item.totalAmount
                          )}

                        </span>

                      </div>

                    )
                  )}

                </div>


                {/* DESKTOP */}

                <div className="hidden md:block overflow-x-auto">

                  <table className="w-full">

                    <thead>

                      <tr
                        className="
                          bg-slate-50
                          border-y
                          border-slate-100
                          text-[10px]
                          uppercase
                          tracking-wider
                          font-black
                          text-slate-400
                        "
                      >

                        <th className="text-left px-5 py-3.5">

                          Member

                        </th>

                        <th className="text-right px-5 py-3.5">

                          Amount

                        </th>

                        <th className="text-right px-5 py-3.5">

                          Date

                        </th>

                      </tr>

                    </thead>


                    <tbody className="divide-y divide-slate-100">

                      {data.recentCollections.map(
                        (item) => (

                          <tr
                            key={item._id}
                            className="hover:bg-slate-50 transition-colors"
                          >

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                <div
                                  className="
                                    w-9
                                    h-9
                                    rounded-xl
                                    bg-blue-50
                                    text-blue-600
                                    flex
                                    items-center
                                    justify-center
                                    font-black
                                    text-xs
                                  "
                                >

                                  {item.member?.memberName
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                    "M"}

                                </div>

                                <div>

                                  <p className="text-sm font-bold text-slate-900">

                                    {item.member?.memberName ||
                                      "Anonymous Member"}

                                  </p>

                                </div>

                              </div>

                            </td>


                            <td className="px-5 py-4 text-right">

                              <span className="text-sm font-black text-emerald-600">

                                {formatCurrency(
                                  item.totalAmount
                                )}

                              </span>

                            </td>


                            <td className="px-5 py-4 text-right">

                              <span className="text-xs font-semibold text-slate-400">

                                {item.createdAt
                                  ? new Date(
                                      item.createdAt
                                    ).toLocaleDateString(
                                      "en-IN"
                                    )
                                  : "N/A"}

                              </span>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </>

            ) : (

              <EmptyState

                icon={
                  <History size={24} />
                }

                title="No Recent Collections"

                text="Payment activity will appear here."

              />

            )}

          </div>


          {/* ===============================================
              TOP AGENTS
          =============================================== */}

          <div
            className="
              bg-white
              rounded-3xl
              border
              border-slate-200
              shadow-sm
              overflow-hidden
            "
          >

            <PanelHeader

              icon={
                <Award
                  size={16}
                />
              }

              title="Top Agents"

              subtitle="Highest lifetime saving collections"

            />


            {data.topAgents &&
            data.topAgents.length > 0 ? (

              <div className="p-4 space-y-2">

                {data.topAgents.map(
                  (agent, index) => (

                    <div
                      key={
                        agent._id ||
                        index
                      }
                      className="
                        group
                        flex
                        items-center
                        justify-between
                        gap-3
                        p-3
                        rounded-2xl
                        border
                        border-slate-100
                        hover:border-blue-100
                        hover:bg-blue-50/40
                        transition-all
                      "
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        <div
                          className="
                            w-9
                            h-9
                            rounded-xl
                            bg-slate-100
                            text-slate-700
                            flex
                            items-center
                            justify-center
                            text-xs
                            font-black
                            shrink-0
                          "
                        >

                          {index + 1}

                        </div>


                        <div className="min-w-0">

                          <p
                            className="
                              text-sm
                              font-black
                              text-slate-900
                              truncate
                            "
                          >

                            {agent.agent?.[0]?.name ||
                              "Unassigned Agent"}

                          </p>

                          <p className="text-[10px] text-slate-400 mt-0.5">

                            Collection Agent

                          </p>

                        </div>

                      </div>


                      <div className="text-right shrink-0">

                        <p className="text-sm font-black text-emerald-600">

                          {formatCurrency(
                            agent.totalCollection
                          )}

                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <EmptyState

                icon={
                  <Award size={24} />
                }

                title="No Agent Data"

                text="Agent collection rankings will appear here."

              />

            )}

          </div>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-2
            px-1
            pb-2
          "
        >

          <p className="text-[10px] text-slate-400">

            SRM Finance • Operational Management System

          </p>

          <p className="text-[10px] text-slate-400">

            Dashboard data is refreshed from live backend records.

          </p>

        </div>

      </div>

    </div>

  );
}


// =====================================================
// METRIC CARD
// =====================================================

function MetricCard({
  title,
  subtitle,
  value,
  icon,
  iconColor,
  iconBg,
  accent,
  valueColor = "text-slate-900"
}) {

  return (

    <div
      className={`
        bg-white
        border
        border-slate-200
        border-l-4
        ${accent}
        rounded-2xl
        p-4
        sm:p-5
        shadow-sm
        hover:shadow-md
        hover:-translate-y-[1px]
        transition-all
        duration-200
        min-w-0
      `}
    >

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate">

            {title}

          </p>

          <p className="mt-1 text-[10px] text-slate-400 truncate">

            {subtitle}

          </p>

        </div>


        <div
          className={`
            w-9
            h-9
            rounded-xl
            ${iconBg}
            ${iconColor}
            flex
            items-center
            justify-center
            shrink-0
          `}
        >

          {icon}

        </div>

      </div>


      <h3
        className={`
          mt-5
          text-xl
          sm:text-2xl
          font-black
          tracking-tight
          break-all
          ${valueColor}
        `}
      >

        {value}

      </h3>

    </div>

  );

}


// =====================================================
// FINANCIAL CARD
// =====================================================

function FinancialCard({
  title,
  subtitle,
  value,
  icon,
  iconBg,
  iconColor,
  valueColor
}) {

  return (

    <div
      className="
        bg-white
        border
        border-slate-200
        rounded-2xl
        p-4
        sm:p-5
        shadow-sm
        hover:shadow-md
        transition-all
        min-w-0
      "
    >

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate">

            {title}

          </p>

          <p className="mt-1 text-[10px] text-slate-400 truncate">

            {subtitle}

          </p>

        </div>


        <div
          className={`
            w-9
            h-9
            rounded-xl
            ${iconBg}
            ${iconColor}
            flex
            items-center
            justify-center
            shrink-0
          `}
        >

          {icon}

        </div>

      </div>


      <p
        className={`
          mt-5
          text-lg
          sm:text-xl
          font-black
          tracking-tight
          break-all
          ${valueColor}
        `}
      >

        {value}

      </p>

    </div>

  );

}


// =====================================================
// SECONDARY CARD
// =====================================================

function SecondaryCard({
  title,
  value,
  label,
  icon,
  tone
}) {

  const styles = {

    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      value: "text-slate-900"
    },

    violet: {
      bg: "bg-violet-50",
      text: "text-violet-600",
      value: "text-slate-900"
    },

    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      value: "text-slate-900"
    },

    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      value: "text-slate-900"
    }

  };

  const current =
    styles[tone] ||
    styles.blue;


  return (

    <div
      className="
        bg-white
        border
        border-slate-200
        rounded-2xl
        p-4
        flex
        items-center
        justify-between
        gap-4
        shadow-sm
      "
    >

      <div className="min-w-0">

        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate">

          {title}

        </p>

        <p
          className={`
            mt-1
            text-lg
            sm:text-xl
            font-black
            ${current.value}
            break-all
          `}
        >

          {value}

        </p>

        <p className="mt-1 text-[10px] text-slate-400 truncate">

          {label}

        </p>

      </div>


      <div
        className={`
          w-10
          h-10
          rounded-xl
          ${current.bg}
          ${current.text}
          flex
          items-center
          justify-center
          shrink-0
        `}
      >

        {icon}

      </div>

    </div>

  );

}


// =====================================================
// PANEL HEADER
// =====================================================

function PanelHeader({
  icon,
  title,
  subtitle
}) {

  return (

    <div
      className="
        px-5
        py-4
        border-b
        border-slate-100
        flex
        items-center
        gap-3
      "
    >

      <div
        className="
          w-9
          h-9
          rounded-xl
          bg-slate-50
          text-slate-600
          flex
          items-center
          justify-center
          shrink-0
        "
      >

        {icon}

      </div>


      <div className="min-w-0">

        <h3 className="text-sm font-black text-slate-900">

          {title}

        </h3>

        <p className="text-[10px] text-slate-400 mt-0.5 truncate">

          {subtitle}

        </p>

      </div>

    </div>

  );

}


// =====================================================
// MINI STAT
// =====================================================

function MiniStat({
  label,
  value,
  icon,
  tone
}) {

  const themes = {

    blue:
      "bg-blue-50 text-blue-700 border-blue-100",

    emerald:
      "bg-emerald-50 text-emerald-700 border-emerald-100",

    orange:
      "bg-orange-50 text-orange-700 border-orange-100"

  };

  return (

    <div
      className={`
        min-w-[120px]
        px-3
        py-2.5
        rounded-xl
        border
        ${themes[tone] || themes.blue}
      `}
    >

      <div className="flex items-center gap-1.5">

        {icon}

        <span className="text-[9px] font-black uppercase tracking-wider opacity-70">

          {label}

        </span>

      </div>


      <p className="mt-1 text-sm font-black truncate">

        {value}

      </p>

    </div>

  );

}


// =====================================================
// EMPTY STATE
// =====================================================

function EmptyState({
  icon,
  title,
  text
}) {

  return (

    <div className="py-14 px-6 text-center">

      <div
        className="
          mx-auto
          w-11
          h-11
          rounded-xl
          bg-slate-50
          text-slate-300
          flex
          items-center
          justify-center
        "
      >

        {icon}

      </div>

      <p className="mt-3 text-sm font-black text-slate-700">

        {title}

      </p>

      <p className="mt-1 text-xs text-slate-400">

        {text}

      </p>

    </div>

  );

}


// =====================================================
// LOADING SKELETON
// =====================================================

function DashboardLoadingSkeleton() {

  return (

    <div className="min-h-screen bg-[#f6f8fb] p-3 sm:p-5 lg:p-7">

      <div className="max-w-[1600px] mx-auto space-y-5 animate-pulse">


        {/* HEADER */}

        <div className="bg-white border border-slate-200 rounded-3xl p-6">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-slate-200" />

              <div className="space-y-2">

                <div className="h-3 w-28 bg-slate-200 rounded" />

                <div className="h-7 w-64 max-w-[65vw] bg-slate-200 rounded-lg" />

                <div className="h-3 w-80 max-w-[70vw] bg-slate-100 rounded" />

              </div>

            </div>

            <div className="hidden sm:block h-10 w-28 bg-slate-200 rounded-xl" />

          </div>

        </div>


        {/* PRIMARY CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

          {[1, 2, 3, 4, 5].map(
            (item) => (

              <div
                key={item}
                className="
                  h-32
                  bg-white
                  border
                  border-slate-200
                  rounded-2xl
                  p-5
                "
              >

                <div className="h-3 w-24 bg-slate-200 rounded" />

                <div className="mt-2 h-2 w-20 bg-slate-100 rounded" />

                <div className="mt-7 h-6 w-28 bg-slate-200 rounded" />

              </div>

            )
          )}

        </div>


        {/* FINANCIAL CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

          {[1, 2, 3, 4, 5, 6].map(
            (item) => (

              <div
                key={item}
                className="
                  h-32
                  bg-white
                  border
                  border-slate-200
                  rounded-2xl
                  p-5
                "
              >

                <div className="h-3 w-28 bg-slate-200 rounded" />

                <div className="mt-2 h-2 w-20 bg-slate-100 rounded" />

                <div className="mt-7 h-6 w-32 bg-slate-200 rounded" />

              </div>

            )
          )}

        </div>


        {/* CONTROL PANEL */}

        <div className="h-44 bg-white border border-slate-200 rounded-3xl" />


        {/* LOWER */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          <div className="h-80 xl:col-span-2 bg-white border border-slate-200 rounded-3xl" />

          <div className="h-80 bg-white border border-slate-200 rounded-3xl" />

        </div>

      </div>

    </div>

  );

}