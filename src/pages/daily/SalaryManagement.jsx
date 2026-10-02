import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  IndianRupee,
  Users,
  CheckCircle,
  Clock,
  X,
  Eye,
  Landmark,
  Pencil,
} from "lucide-react";

const API =
  "https://finance-project-0qqk.onrender.com/api/daily/salary";

const AGENTS_API =
  "https://finance-project-0qqk.onrender.com/api/daily/agents";

/* ----------------------------------------------------------------------
   Design tokens — "Payroll Ledger"
---------------------------------------------------------------------- */

const INK = "#101826";
const PAPER = "#EEF1F5";
const LINE = "#D6DAE2";

const GREEN = "#146C43";
const GREEN_BG = "#E7F1EC";

const RED = "#9F2B2B";
const RED_BG = "#F6E9E9";

const GOLD = "#A67C27";
const GOLD_BG = "#F3ECDD";

/* ----------------------------------------------------------------------
   Fonts
---------------------------------------------------------------------- */

function useLedgerFonts() {
  useEffect(() => {
    if (document.getElementById("ledger-fonts")) return;

    const link = document.createElement("link");

    link.id = "ledger-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&family=IBM+Plex+Mono:wght@500;600&family=Inter:wght@400;500;600;700&display=swap";

    document.head.appendChild(link);
  }, []);
}

/* ======================================================================
   MAIN COMPONENT
====================================================================== */

function SalaryManagement() {
  useLedgerFonts();

  const now = new Date();

  /* --------------------------------------------------------------------
     FILTERS
  -------------------------------------------------------------------- */

  const [month, setMonth] = useState(
    now.getMonth() + 1
  );

  const [year, setYear] = useState(
    now.getFullYear()
  );

  const [search, setSearch] = useState("");

  /* --------------------------------------------------------------------
     DATA
  -------------------------------------------------------------------- */

  const [data, setData] = useState(null);
  const [agents, setAgents] = useState([]);

  /* --------------------------------------------------------------------
     MODALS
  -------------------------------------------------------------------- */

  const [showAdd, setShowAdd] = useState(false);

  const [showView, setShowView] = useState(null);

  const [showPay, setShowPay] = useState(null);

  const [showEdit, setShowEdit] = useState(null);

  /* --------------------------------------------------------------------
     ADD SALARY FORM
  -------------------------------------------------------------------- */

  const [selectedAgent, setSelectedAgent] =
    useState("");

  const [salaryType, setSalaryType] =
    useState("COMMISSION");

  const [commissionRate, setCommissionRate] =
    useState("2");

  const [fixedSalary, setFixedSalary] =
    useState("");

  /* --------------------------------------------------------------------
     EDIT SALARY FORM
  -------------------------------------------------------------------- */

  const [editSalaryType, setEditSalaryType] =
    useState("COMMISSION");

  const [editCommissionRate, setEditCommissionRate] =
    useState("2");

  const [editFixedSalary, setEditFixedSalary] =
    useState("");

  /* --------------------------------------------------------------------
     PAY FORM
  -------------------------------------------------------------------- */

  const [paidAmount, setPaidAmount] =
    useState("");

  const [paymentMode, setPaymentMode] =
    useState("BANK");

  const [paymentReference, setPaymentReference] =
    useState("");

  /* --------------------------------------------------------------------
     LOADING
  -------------------------------------------------------------------- */

  const [loading, setLoading] =
    useState(false);

  /* ====================================================================
     LOAD MONTHLY SALARY
  ==================================================================== */

  const loadSalary = useCallback(
    async (signal) => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${API}/monthly`,
          {
            params: {
              month,
              year,
            },
            signal,
          }
        );

        setData(res.data);

      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error(
            "Failed to load salary data:",
            error
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [month, year]
  );

  useEffect(() => {
    const controller =
      new AbortController();

    loadSalary(controller.signal);

    return () =>
      controller.abort();
  }, [loadSalary]);

  /* ====================================================================
     LOAD AGENTS
  ==================================================================== */

  const loadAgents = useCallback(
    async (signal) => {
      try {
        const res = await axios.get(
          AGENTS_API,
          {
            signal,
          }
        );

        setAgents(
          res.data?.agents || []
        );

      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error(
            "Failed to load agents:",
            error
          );
        }
      }
    },
    []
  );

  useEffect(() => {
    const controller =
      new AbortController();

    loadAgents(controller.signal);

    return () =>
      controller.abort();
  }, [loadAgents]);

  /* ====================================================================
     ADD AGENT TO SALARY
  ==================================================================== */

  const addAgent = async (e) => {
    e.preventDefault();

    if (!selectedAgent) {
      alert("Please select an agent");
      return;
    }

    if (
      salaryType === "COMMISSION" &&
      Number(commissionRate) < 0
    ) {
      alert(
        "Commission rate cannot be negative."
      );
      return;
    }

    if (
      salaryType === "FIXED" &&
      Number(fixedSalary) < 0
    ) {
      alert(
        "Fixed salary cannot be negative."
      );
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API}/add-agent`,
        {
          agentId: selectedAgent,

          salaryType,

          commissionRate:
            salaryType === "COMMISSION"
              ? Number(commissionRate || 0)
              : 0,

          fixedSalary:
            salaryType === "FIXED"
              ? Number(fixedSalary || 0)
              : 0,
        }
      );

      alert(
        "Agent added to salary management."
      );

      setShowAdd(false);

      setSelectedAgent("");

      setSalaryType("COMMISSION");

      setCommissionRate("2");

      setFixedSalary("");

      await loadAgents();

      await loadSalary();

    } catch (error) {
      console.error(
        "ADD SALARY AGENT ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to add agent."
      );

    } finally {
      setLoading(false);
    }
  };

  /* ====================================================================
     OPEN EDIT SALARY
  ==================================================================== */

  const openEditSalary = (item) => {
    const salary =
      item?.salary || {};

    setShowEdit(item);

    setEditSalaryType(
      salary.salaryType ||
      "COMMISSION"
    );

    setEditCommissionRate(
      String(
        salary.commissionRate ?? 2
      )
    );

    setEditFixedSalary(
      String(
        salary.fixedSalary ?? ""
      )
    );
  };

  /* ====================================================================
     UPDATE SALARY
  ==================================================================== */

  const updateSalaryProfile =
    async (e) => {
      e.preventDefault();

      if (!showEdit?.salary?._id) {
        alert(
          "Salary record not found."
        );
        return;
      }

      if (
        !["COMMISSION", "FIXED"].includes(
          editSalaryType
        )
      ) {
        alert(
          "Please select a valid salary type."
        );
        return;
      }

      if (
        editSalaryType === "COMMISSION" &&
        Number(editCommissionRate) < 0
      ) {
        alert(
          "Commission rate cannot be negative."
        );
        return;
      }

      if (
        editSalaryType === "FIXED" &&
        Number(editFixedSalary) < 0
      ) {
        alert(
          "Fixed salary cannot be negative."
        );
        return;
      }

      try {
        setLoading(true);

        await axios.put(
          `${API}/update-agent/${showEdit.salary._id}`,
          {
            salaryType:
              editSalaryType,

            commissionRate:
              editSalaryType ===
              "COMMISSION"
                ? Number(
                    editCommissionRate || 0
                  )
                : 0,

            fixedSalary:
              editSalaryType === "FIXED"
                ? Number(
                    editFixedSalary || 0
                  )
                : 0,
          }
        );

        alert(
          "Employee salary details updated successfully."
        );

        setShowEdit(null);

        await loadSalary();

      } catch (error) {
        console.error(
          "UPDATE SALARY PROFILE ERROR:",
          error
        );

        alert(
          error.response?.data?.message ||
          "Failed to update employee salary details."
        );

      } finally {
        setLoading(false);
      }
    };

  /* ====================================================================
     PAY SALARY
  ==================================================================== */

  const paySalary = async (e) => {
    e.preventDefault();

    if (
      !paidAmount ||
      Number(paidAmount) <= 0
    ) {
      alert(
        "Please enter a valid amount."
      );
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API}/pay`,
        {
          salaryId:
            showPay.salary._id,

          paidAmount:
            Number(paidAmount),

          paymentMode,

          paymentReference,
        }
      );

      alert(
        "Salary payment recorded successfully."
      );

      setShowPay(null);

      setPaidAmount("");

      setPaymentReference("");

      await loadSalary();

    } catch (error) {
      console.error(
        "PAY SALARY ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Payment processing failed."
      );

    } finally {
      setLoading(false);
    }
  };

  /* ====================================================================
     SEARCH
  ==================================================================== */

  const filtered =
    (
      data?.salaries || []
    ).filter((item) => {
      const name =
        item.agent?.name
          ?.toLowerCase() || "";

      const mobile =
        item.agent?.mobile
          ?.toLowerCase() || "";

      const query =
        search.toLowerCase();

      return (
        name.includes(query) ||
        mobile.includes(query)
      );
    });

  /* ====================================================================
     RUPEE FORMAT
  ==================================================================== */

  const rupee = (n) =>
    `₹${Number(
      n || 0
    ).toLocaleString("en-IN")}`;

  /* ====================================================================
     UI
  ==================================================================== */

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        background: PAPER,
        color: INK,
        fontFamily:
          "'Inter', sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-8 lg:py-10">

        {/* ==========================================================
            HEADER
        ========================================================== */}

        <div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-4 sm:pb-5 mb-5 sm:mb-6 border-b-2"
          style={{
            borderColor: INK,
          }}
        >
          <div>

            <div
              className="text-[10px] font-semibold tracking-[0.2em] sm:tracking-[0.28em] uppercase mb-1"
              style={{
                color: GOLD,
                fontFamily:
                  "'IBM Plex Mono', monospace",
              }}
            >
              Ledger No.{" "}
              {String(month).padStart(
                2,
                "0"
              )}
              -{year} · Field Staff
            </div>

            <h1
              className="text-2xl sm:text-3xl lg:text-4xl tracking-tight"
              style={{
                fontFamily:
                  "'Source Serif 4', serif",
                fontWeight: 600,
              }}
            >
              Salary &amp; Commission Ledger
            </h1>

            <p
              className="text-xs sm:text-sm mt-1"
              style={{
                color: "#5B6472",
              }}
            >
              Monthly commission calculation
              and payment record for field agents
            </p>

          </div>

          <button
            onClick={() =>
              setShowAdd(true)
            }
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold tracking-wide uppercase transition hover:opacity-90"
            style={{
              background: INK,
              color: PAPER,
            }}
          >
            <Plus size={16} />
            Add Staff Entry
          </button>

        </div>

        {/* ==========================================================
            FILTERS
        ========================================================== */}

        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 py-3 sm:py-4 mb-6 sm:mb-8 border-b"
          style={{
            borderColor: LINE,
          }}
        >

          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">

            <span
              className="text-[10px] font-semibold tracking-[0.2em] uppercase shrink-0"
              style={{
                color: "#8892A0",
              }}
            >
              Period
            </span>

            <div className="flex items-center gap-2">

              <select
                value={month}
                onChange={(e) =>
                  setMonth(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="bg-transparent border-0 border-b-2 py-1 pr-1 text-xs sm:text-sm font-semibold outline-none focus:border-current cursor-pointer"
                style={{
                  borderColor: LINE,
                  fontFamily:
                    "'IBM Plex Mono', monospace",
                }}
              >
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map(
                  (name, index) => (
                    <option
                      key={name}
                      value={index + 1}
                    >
                      {name}
                    </option>
                  )
                )}
              </select>

              <select
                value={year}
                onChange={(e) =>
                  setYear(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="bg-transparent border-0 border-b-2 py-1 pr-1 text-xs sm:text-sm font-semibold outline-none focus:border-current cursor-pointer"
                style={{
                  borderColor: LINE,
                  fontFamily:
                    "'IBM Plex Mono', monospace",
                }}
              >
                {[
                  2024,
                  2025,
                  2026,
                  2027,
                  2028,
                  2029,
                  2030,
                ].map((y) => (
                  <option
                    key={y}
                    value={y}
                  >
                    {y}
                  </option>
                ))}
              </select>

            </div>
          </div>

          <div className="relative w-full sm:max-w-xs md:max-w-sm">

            <Search
              size={15}
              className="absolute left-0 top-2.5"
              style={{
                color: "#8892A0",
              }}
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search by name or mobile"
              className="w-full bg-transparent border-0 border-b-2 pl-6 pr-2 py-1.5 text-xs sm:text-sm outline-none focus:border-current placeholder:text-slate-400"
              style={{
                borderColor: LINE,
              }}
            />

          </div>

        </div>

        {/* ==========================================================
            TOTALS
        ========================================================== */}

        <div
          className="grid grid-cols-2 sm:grid-cols-4 mb-6 sm:mb-8 border divide-x-0 sm:divide-x divide-y sm:divide-y-0"
          style={{
            borderColor: LINE,
            background: "#fff",
          }}
        >

          <LedgerTotal
            label="Total Staff"
            value={
              data?.summary
                ?.totalStaff || 0
            }
            icon={Users}
            tone={INK}
          />

          <LedgerTotal
            label="Salary Generated"
            value={rupee(
              data?.summary
                ?.totalSalary
            )}
            icon={IndianRupee}
            tone={INK}
          />

          <LedgerTotal
            label="Salary Paid"
            value={rupee(
              data?.summary
                ?.totalPaid
            )}
            icon={CheckCircle}
            tone={GREEN}
          />

          <LedgerTotal
            label="Salary Pending"
            value={rupee(
              data?.summary
                ?.totalPending
            )}
            icon={Clock}
            tone={RED}
          />

        </div>

        {/* ==========================================================
            DESKTOP TABLE
        ========================================================== */}

        <div
          className="hidden lg:block border overflow-x-auto"
          style={{
            borderColor: LINE,
            background: "#fff",
          }}
        >
          <table className="w-full text-left text-sm min-w-[800px]">

            <thead>
              <tr
                className="text-[10px] font-semibold tracking-[0.14em] uppercase"
                style={{
                  color: "#8892A0",
                  borderBottom:
                    `2px solid ${INK}`,
                }}
              >
                <th className="p-3 sm:p-4">
                  Agent
                </th>

                <th className="p-3 sm:p-4 text-right">
                  Eligible Collection
                </th>

                <th className="p-3 sm:p-4 text-center">
                  Salary Type
                </th>

                <th className="p-3 sm:p-4 text-right">
                  Calculated Salary
                </th>

                <th className="p-3 sm:p-4 text-right">
                  Paid
                </th>

                <th className="p-3 sm:p-4 text-right">
                  Pending
                </th>

                <th className="p-3 sm:p-4 text-center">
                  Status
                </th>

                <th className="p-3 sm:p-4 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {filtered.map(
                (item, index) => {
                  const salary =
                    item.salary;

                  return (
                    <tr
                      key={
                        salary._id
                      }
                      className="hover:bg-[#F7F8FA] transition"
                      style={{
                        borderBottom:
                          index ===
                          filtered.length -
                            1
                            ? "none"
                            : `1px solid ${LINE}`,
                      }}
                    >

                      {/* AGENT */}

                      <td className="p-3 sm:p-4">

                        <div
                          className="font-semibold"
                          style={{
                            fontFamily:
                              "'Source Serif 4', serif",
                          }}
                        >
                          {item.agent?.name ||
                            "—"}
                        </div>

                        <div
                          className="text-xs mt-0.5"
                          style={{
                            color: "#8892A0",
                            fontFamily:
                              "'IBM Plex Mono', monospace",
                          }}
                        >
                          {item.agent?.mobile ||
                            "—"}
                        </div>

                      </td>

                      {/* ELIGIBLE */}

                      <td
                        className="p-3 sm:p-4 text-right tabular-nums"
                        style={{
                          fontFamily:
                            "'IBM Plex Mono', monospace",
                        }}
                      >
                        {rupee(
                          salary.eligibleCollection
                        )}
                      </td>

                      {/* TYPE */}

                      <td className="p-3 sm:p-4 text-center">

                        {salary.salaryType ===
                        "FIXED" ? (
                          <span
                            className="px-2 py-0.5 text-xs font-semibold border whitespace-nowrap"
                            style={{
                              borderColor:
                                GREEN,
                              color:
                                GREEN,
                              fontFamily:
                                "'IBM Plex Mono', monospace",
                            }}
                          >
                            FIXED{" "}
                            {rupee(
                              salary.fixedSalary
                            )}
                          </span>
                        ) : (
                          <span
                            className="px-2 py-0.5 text-xs font-semibold border whitespace-nowrap"
                            style={{
                              borderColor:
                                GOLD,
                              color:
                                GOLD,
                              fontFamily:
                                "'IBM Plex Mono', monospace",
                            }}
                          >
                            {
                              salary.commissionRate
                            }
                            %
                          </span>
                        )}

                      </td>

                      {/* CALCULATED */}

                      <td
                        className="p-3 sm:p-4 text-right font-bold tabular-nums"
                        style={{
                          fontFamily:
                            "'IBM Plex Mono', monospace",
                        }}
                      >
                        {rupee(
                          salary.calculatedSalary
                        )}
                      </td>

                      {/* PAID */}

                      <td
                        className="p-3 sm:p-4 text-right tabular-nums"
                        style={{
                          color: GREEN,
                          fontFamily:
                            "'IBM Plex Mono', monospace",
                        }}
                      >
                        {rupee(
                          salary.paidAmount
                        )}
                      </td>

                      {/* PENDING */}

                      <td
                        className="p-3 sm:p-4 text-right tabular-nums"
                        style={{
                          color: RED,
                          fontFamily:
                            "'IBM Plex Mono', monospace",
                        }}
                      >
                        {rupee(
                          salary.pendingAmount
                        )}
                      </td>

                      {/* STATUS */}

                      <td className="p-3 sm:p-4 text-center">
                        <StampBadge
                          status={
                            salary.status
                          }
                        />
                      </td>

                      {/* ACTION */}

                      <td className="p-3 sm:p-4 text-center">

                        <div className="flex items-center justify-center gap-2">

                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              openEditSalary(
                                item
                              )
                            }
                            className="p-1.5 sm:p-2 border transition hover:bg-[#F7F8FA]"
                            style={{
                              borderColor:
                                LINE,
                              color: INK,
                            }}
                            title="Edit Salary Details"
                          >
                            <Pencil
                              size={15}
                            />
                          </button>

                          {/* VIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              setShowView(
                                item
                              )
                            }
                            className="p-1.5 sm:p-2 border transition hover:bg-[#F7F8FA]"
                            style={{
                              borderColor:
                                LINE,
                            }}
                            title="View Details"
                          >
                            <Eye
                              size={15}
                            />
                          </button>

                          {/* PAY */}

                          {salary.pendingAmount >
                            0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setShowPay(
                                  item
                                )
                              }
                              className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold uppercase tracking-wide transition hover:opacity-90"
                              style={{
                                background:
                                  GREEN,
                                color:
                                  "#fff",
                              }}
                            >
                              Pay
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  );
                }
              )}

              {!loading &&
                filtered.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-10 sm:p-14 text-center"
                      style={{
                        color:
                          "#8892A0",
                      }}
                    >
                      No salary records
                      found for this
                      period.
                    </td>
                  </tr>
                )}

            </tbody>

          </table>
        </div>

        {/* ==========================================================
            MOBILE / TABLET
        ========================================================== */}

        <div className="block lg:hidden">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

            {filtered.map(
              (item) => {
                const salary =
                  item.salary;

                return (
                  <div
                    key={salary._id}
                    className="bg-white border relative"
                    style={{
                      borderColor: LINE,
                      borderTop:
                        `1px dashed ${LINE}`,
                    }}
                  >

                    {/* HEADER */}

                    <div
                      className="flex justify-between items-start p-3.5 pb-2.5 border-b"
                      style={{
                        borderColor:
                          LINE,
                      }}
                    >

                      <div>

                        <h2
                          className="font-semibold text-base"
                          style={{
                            fontFamily:
                              "'Source Serif 4', serif",
                          }}
                        >
                          {item.agent?.name ||
                            "—"}
                        </h2>

                        <p
                          className="text-xs mt-0.5"
                          style={{
                            color:
                              "#8892A0",
                            fontFamily:
                              "'IBM Plex Mono', monospace",
                          }}
                        >
                          {item.agent?.mobile ||
                            "—"}
                        </p>

                      </div>

                      <StampBadge
                        status={
                          salary.status
                        }
                        small
                      />

                    </div>

                    {/* DATA */}

                    <div
                      className="grid grid-cols-2 gap-2.5 text-xs p-3.5"
                      style={{
                        fontFamily:
                          "'IBM Plex Mono', monospace",
                      }}
                    >

                      <div>
                        <span
                          className="block uppercase tracking-wide text-[10px] mb-0.5"
                          style={{
                            color:
                              "#8892A0",
                          }}
                        >
                          Eligible
                        </span>

                        <span className="font-semibold text-xs">
                          {rupee(
                            salary.eligibleCollection
                          )}
                        </span>
                      </div>

                      <div>
                        <span
                          className="block uppercase tracking-wide text-[10px] mb-0.5"
                          style={{
                            color:
                              "#8892A0",
                          }}
                        >
                          Salary Type
                        </span>

                        <span className="font-semibold text-xs">

                          {salary.salaryType ===
                          "FIXED"
                            ? `Fixed ${rupee(
                                salary.fixedSalary
                              )}`
                            : `Commission ${salary.commissionRate}%`}

                        </span>
                      </div>

                      <div>
                        <span
                          className="block uppercase tracking-wide text-[10px] mb-0.5"
                          style={{
                            color:
                              "#8892A0",
                          }}
                        >
                          Calculated
                        </span>

                        <span className="font-bold text-xs">
                          {rupee(
                            salary.calculatedSalary
                          )}
                        </span>
                      </div>

                      <div>
                        <span
                          className="block uppercase tracking-wide text-[10px] mb-0.5"
                          style={{
                            color:
                              "#8892A0",
                          }}
                        >
                          Pending
                        </span>

                        <span
                          className="font-bold text-xs"
                          style={{
                            color: RED,
                          }}
                        >
                          {rupee(
                            salary.pendingAmount
                          )}
                        </span>
                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div
                      className={`grid gap-2 p-3.5 pt-0 ${
                        salary.pendingAmount >
                        0
                          ? "grid-cols-3"
                          : "grid-cols-2"
                      }`}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          openEditSalary(
                            item
                          )
                        }
                        className="flex items-center justify-center gap-1.5 py-2 border text-xs font-semibold uppercase tracking-wide"
                        style={{
                          borderColor:
                            LINE,
                        }}
                      >
                        <Pencil
                          size={14}
                        />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowView(
                            item
                          )
                        }
                        className="flex items-center justify-center gap-1.5 py-2 border text-xs font-semibold uppercase tracking-wide"
                        style={{
                          borderColor:
                            LINE,
                        }}
                      >
                        <Eye
                          size={14}
                        />
                        Details
                      </button>

                      {salary.pendingAmount >
                        0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowPay(
                              item
                            )
                          }
                          className="flex items-center justify-center py-2 text-xs font-semibold uppercase tracking-wide text-white"
                          style={{
                            background:
                              GREEN,
                          }}
                        >
                          Pay Salary
                        </button>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>

          {!loading &&
            filtered.length ===
              0 && (
              <div
                className="bg-white border p-8 sm:p-10 text-center text-xs sm:text-sm mt-3"
                style={{
                  borderColor: LINE,
                  color: "#8892A0",
                }}
              >
                No salary records
                found for this
                period.
              </div>
            )}

        </div>

        {/* ==========================================================
            ADD AGENT MODAL
        ========================================================== */}

        {showAdd && (
          <Modal
            title="Add Staff Entry"
            close={() =>
              setShowAdd(false)
            }
          >

            <form
              onSubmit={addAgent}
              className="space-y-4 sm:space-y-5"
            >

              <Field label="Select Agent">

                <select
                  value={selectedAgent}
                  onChange={(e) =>
                    setSelectedAgent(
                      e.target.value
                    )
                  }
                  className="w-full bg-transparent border-0 border-b-2 py-2 text-sm font-medium outline-none focus:border-current cursor-pointer"
                  style={{
                    borderColor: LINE,
                  }}
                  required
                >

                  <option value="">
                    Choose an agent
                  </option>

                  {agents.map(
                    (agent) => (
                      <option
                        key={
                          agent._id
                        }
                        value={
                          agent._id
                        }
                      >
                        {agent.name} —{" "}
                        {agent.mobile}
                      </option>
                    )
                  )}

                </select>

              </Field>

              <Field label="Salary Type">

                <select
                  value={salaryType}
                  onChange={(e) =>
                    setSalaryType(
                      e.target.value
                    )
                  }
                  className="w-full bg-transparent border-0 border-b-2 py-2 text-sm font-medium outline-none focus:border-current cursor-pointer"
                  style={{
                    borderColor: LINE,
                  }}
                >
                  <option value="COMMISSION">
                    Commission Based
                  </option>

                  <option value="FIXED">
                    Fixed Monthly Salary
                  </option>
                </select>

              </Field>

              {salaryType ===
              "COMMISSION" ? (
                <Field label="Commission Rate (%)">

                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={
                      commissionRate
                    }
                    onChange={(e) =>
                      setCommissionRate(
                        e.target.value
                      )
                    }
                    className="w-full bg-transparent border-0 border-b-2 py-2 text-sm font-medium outline-none focus:border-current"
                    style={{
                      borderColor: LINE,
                      fontFamily:
                        "'IBM Plex Mono', monospace",
                    }}
                    required
                  />

                </Field>
              ) : (
                <Field label="Fixed Monthly Salary (₹)">

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={
                      fixedSalary
                    }
                    onChange={(e) =>
                      setFixedSalary(
                        e.target.value
                      )
                    }
                    placeholder="20000"
                    className="w-full bg-transparent border-0 border-b-2 py-2 text-sm font-medium outline-none focus:border-current"
                    style={{
                      borderColor: LINE,
                      fontFamily:
                        "'IBM Plex Mono', monospace",
                    }}
                    required
                  />

                </Field>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:opacity-90 disabled:opacity-50"
                style={{
                  background: INK,
                }}
              >
                {loading
                  ? "Saving..."
                  : "Add Agent to Ledger"}
              </button>

            </form>

          </Modal>
        )}

        {/* ==========================================================
            EDIT SALARY MODAL
        ========================================================== */}

        {showEdit && (
          <Modal
            title={`${
              showEdit.agent?.name ||
              "Employee"
            } — Edit Salary`}
            close={() =>
              setShowEdit(null)
            }
          >

            <form
              onSubmit={
                updateSalaryProfile
              }
              className="space-y-4 sm:space-y-5"
            >

              {/* EMPLOYEE */}

              <div
                className="p-3.5 sm:p-4 border"
                style={{
                  borderColor: LINE,
                  background:
                    "#F7F8FA",
                }}
              >

                <div
                  className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                  style={{
                    color:
                      "#8892A0",
                  }}
                >
                  Employee
                </div>

                <div
                  className="mt-1 text-base sm:text-lg font-semibold"
                  style={{
                    fontFamily:
                      "'Source Serif 4', serif",
                  }}
                >
                  {showEdit.agent?.name ||
                    "—"}
                </div>

                <div
                  className="mt-0.5 text-xs"
                  style={{
                    color:
                      "#8892A0",
                    fontFamily:
                      "'IBM Plex Mono', monospace",
                  }}
                >
                  {showEdit.agent?.mobile ||
                    "—"}
                </div>

              </div>

              {/* SALARY TYPE */}

              <Field label="Salary Type">

                <select
                  value={
                    editSalaryType
                  }
                  onChange={(e) =>
                    setEditSalaryType(
                      e.target.value
                    )
                  }
                  className="w-full bg-transparent border-0 border-b-2 py-2 text-sm font-medium outline-none focus:border-current cursor-pointer"
                  style={{
                    borderColor: LINE,
                  }}
                >

                  <option value="COMMISSION">
                    Commission Based
                  </option>

                  <option value="FIXED">
                    Fixed Monthly Salary
                  </option>

                </select>

              </Field>

              {/* COMMISSION */}

              {editSalaryType ===
              "COMMISSION" ? (
                <Field label="Commission Rate (%)">

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={
                      editCommissionRate
                    }
                    onChange={(e) =>
                      setEditCommissionRate(
                        e.target.value
                      )
                    }
                    className="w-full bg-transparent border-0 border-b-2 py-2 text-sm font-medium outline-none focus:border-current"
                    style={{
                      borderColor:
                        LINE,
                      fontFamily:
                        "'IBM Plex Mono', monospace",
                    }}
                    required
                  />

                </Field>
              ) : (
                <Field label="Fixed Monthly Salary (₹)">

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      editFixedSalary
                    }
                    onChange={(e) =>
                      setEditFixedSalary(
                        e.target.value
                      )
                    }
                    placeholder="20000"
                    className="w-full bg-transparent border-0 border-b-2 py-2 text-sm font-medium outline-none focus:border-current"
                    style={{
                      borderColor:
                        LINE,
                      fontFamily:
                        "'IBM Plex Mono', monospace",
                    }}
                    required
                  />

                </Field>
              )}

              {/* BUTTONS */}

              <div className="flex gap-2 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowEdit(null)
                  }
                  className="flex-1 py-3 text-xs font-semibold uppercase tracking-wide border transition hover:bg-[#F7F8FA]"
                  style={{
                    borderColor:
                      LINE,
                    color: INK,
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{
                    background: INK,
                  }}
                >
                  {loading
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </Modal>
        )}

        {/* ==========================================================
            VIEW DETAILS MODAL
        ========================================================== */}

        {showView && (
          <Modal
            title={`${showView.agent?.name || "Employee"} — Salary Detail`}
            close={() =>
              setShowView(null)
            }
          >
            <SalaryDetails
              item={showView}
              rupee={rupee}
            />
          </Modal>
        )}

        {/* ==========================================================
            PAY SALARY MODAL
        ========================================================== */}

        {showPay && (
          <Modal
            title="Record Salary Payment"
            close={() =>
              setShowPay(null)
            }
          >

            <form
              onSubmit={paySalary}
              className="space-y-4 sm:space-y-5"
            >

              <div
                className="p-3.5 sm:p-4 text-center border"
                style={{
                  borderColor: RED,
                  background:
                    RED_BG,
                }}
              >

                <span
                  className="text-[10px] font-semibold tracking-[0.18em] uppercase block"
                  style={{
                    color: RED,
                  }}
                >
                  Pending Outstanding
                </span>

                <span
                  className="text-2xl sm:text-3xl font-bold block mt-1 tabular-nums"
                  style={{
                    color: RED,
                    fontFamily:
                      "'IBM Plex Mono', monospace",
                  }}
                >
                  {rupee(
                    showPay.salary
                      ?.pendingAmount
                  )}
                </span>

              </div>

              <Field label="Paid Amount (₹)">

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0"
                  value={paidAmount}
                  onChange={(e) =>
                    setPaidAmount(
                      e.target.value
                    )
                  }
                  className="w-full bg-transparent border-0 border-b-2 py-2 text-sm font-medium outline-none focus:border-current"
                  style={{
                    borderColor: LINE,
                    fontFamily:
                      "'IBM Plex Mono', monospace",
                  }}
                  required
                />

              </Field>

              <Field label="Payment Mode">

                <select
                  value={paymentMode}
                  onChange={(e) =>
                    setPaymentMode(
                      e.target.value
                    )
                  }
                  className="w-full bg-transparent border-0 border-b-2 py-2 text-sm font-medium outline-none focus:border-current cursor-pointer"
                  style={{
                    borderColor: LINE,
                  }}
                >

                  <option value="BANK">
                    Bank Transfer
                  </option>

                  <option value="CASH">
                    Cash
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="OTHER">
                    Other
                  </option>

                </select>

              </Field>

              <Field label="Transaction Reference / Notes">

                <input
                  type="text"
                  placeholder="UTR / Txn ID / reference"
                  value={
                    paymentReference
                  }
                  onChange={(e) =>
                    setPaymentReference(
                      e.target.value
                    )
                  }
                  className="w-full bg-transparent border-0 border-b-2 py-2 text-sm font-medium outline-none focus:border-current"
                  style={{
                    borderColor: LINE,
                  }}
                />

              </Field>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:opacity-90 disabled:opacity-50"
                style={{
                  background: GREEN,
                }}
              >
                <Landmark
                  size={14}
                />

                {loading
                  ? "Processing..."
                  : "Record Payment"}
              </button>

            </form>

          </Modal>
        )}

      </div>
    </div>
  );
}

/* ======================================================================
   LEDGER TOTAL
====================================================================== */

function LedgerTotal({
  label,
  value,
  icon: Icon,
  tone,
}) {
  return (
    <div className="p-3.5 sm:p-4 lg:p-5 flex items-start justify-between">

      <div>

        <div
          className="text-[9px] sm:text-[10px] font-semibold tracking-[0.16em] uppercase mb-1"
          style={{
            color: "#8892A0",
          }}
        >
          {label}
        </div>

        <div
          className="text-lg sm:text-xl lg:text-2xl font-bold tabular-nums"
          style={{
            color: tone,
            fontFamily:
              "'IBM Plex Mono', monospace",
          }}
        >
          {value}
        </div>

      </div>

      <Icon
        size={16}
        className="shrink-0"
        style={{
          color: tone,
          opacity: 0.5,
          marginTop: 3,
        }}
      />

    </div>
  );
}

/* ======================================================================
   STATUS BADGE
====================================================================== */

function StampBadge({
  status,
  small,
}) {
  const map = {
    PAID: {
      color: GREEN,
      label: "Paid",
    },

    PARTIAL: {
      color: GOLD,
      label: "Partial",
    },

    PENDING: {
      color: RED,
      label: "Pending",
    },
  };

  const s =
    map[status] ||
    map.PENDING;

  return (
    <span
      className={`inline-block font-semibold uppercase tracking-[0.14em] border-2 shrink-0 ${
        small
          ? "text-[9px] px-1.5 py-0.5"
          : "text-[10px] px-2.5 py-1"
      }`}
      style={{
        color: s.color,
        borderColor: s.color,
        transform:
          "rotate(-2deg)",
        fontFamily:
          "'IBM Plex Mono', monospace",
      }}
    >
      {s.label}
    </span>
  );
}

/* ======================================================================
   SALARY DETAILS
====================================================================== */

function SalaryDetails({
  item,
  rupee,
}) {
  const salary =
    item.salary || {};

  return (
    <div className="space-y-4 sm:space-y-5">

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-px"
        style={{
          background: LINE,
        }}
      >

        <Detail
          title="Daily Saving Base"
          value={rupee(
            salary.dailySavingCollection
          )}
        />

        <Detail
          title="Daily Loan EMI"
          value={rupee(
            salary.dailyLoanCollection
          )}
        />

        <Detail
          title="Weekly Loan EMI"
          value={rupee(
            salary.weeklyLoanCollection
          )}
        />

        <Detail
          title="Penalty Excluded"
          value={rupee(
            salary.penaltyCollection
          )}
          red
        />

        <Detail
          title="Monthly EMI Excluded"
          value={rupee(
            salary.monthlyLoanCollection
          )}
          red
        />

        <Detail
          title="Fixed EMI Excluded"
          value={rupee(
            salary.fixedLoanCollection
          )}
          red
        />

      </div>

      <div
        className="p-3.5 sm:p-4 border"
        style={{
          borderColor: GOLD,
          background: GOLD_BG,
        }}
      >

        <div
          className="text-[10px] font-semibold tracking-[0.18em] uppercase"
          style={{
            color: GOLD,
          }}
        >
          Eligible Collection Base
        </div>

        <div
          className="text-xl sm:text-2xl font-bold mt-0.5 tabular-nums"
          style={{
            color: GOLD,
            fontFamily:
              "'IBM Plex Mono', monospace",
          }}
        >
          {rupee(
            salary.eligibleCollection
          )}
        </div>

      </div>

      <div
        className="p-4 sm:p-5"
        style={{
          background: INK,
          color: "#fff",
        }}
      >

        <div
          className="text-[10px] font-semibold tracking-[0.18em] uppercase"
          style={{
            color: "#8892A0",
          }}
        >
          Total Net Salary
        </div>

        <div
          className="text-2xl sm:text-3xl font-bold mt-1 tabular-nums"
          style={{
            fontFamily:
              "'IBM Plex Mono', monospace",
          }}
        >
          {rupee(
            salary.calculatedSalary
          )}
        </div>

        <div
          className="text-xs mt-1.5"
          style={{
            color: "#9BA4B2",
          }}
        >

          {salary.salaryType ===
          "FIXED" ? (
            <>
              Fixed monthly salary:

              <span
                className="font-semibold ml-1"
                style={{
                  color: GOLD,
                }}
              >
                {rupee(
                  salary.fixedSalary
                )}
              </span>
            </>
          ) : (
            <>
              Applied commission rate:

              <span
                className="font-semibold ml-1"
                style={{
                  color: GOLD,
                }}
              >
                {salary.commissionRate}%
              </span>
            </>
          )}

        </div>

      </div>

    </div>
  );
}

/* ======================================================================
   DETAIL
====================================================================== */

function Detail({
  title,
  value,
  red,
}) {
  return (
    <div className="bg-white p-3 sm:p-3.5">

      <div
        className="text-[9px] uppercase font-semibold tracking-[0.12em]"
        style={{
          color: "#8892A0",
        }}
      >
        {title}
      </div>

      <div
        className="font-bold mt-1 text-xs sm:text-sm tabular-nums"
        style={{
          color:
            red ? RED : INK,
          fontFamily:
            "'IBM Plex Mono', monospace",
        }}
      >
        {value}
      </div>

    </div>
  );
}

/* ======================================================================
   FIELD
====================================================================== */

function Field({
  label,
  children,
}) {
  return (
    <div>

      <label
        className="text-[10px] font-semibold tracking-[0.16em] uppercase block mb-1.5"
        style={{
          color: "#8892A0",
        }}
      >
        {label}
      </label>

      {children}

    </div>
  );
}

/* ======================================================================
   MODAL
====================================================================== */

function Modal({
  title,
  close,
  children,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{
        background:
          "rgba(16,24,38,0.55)",
      }}
    >

      <div
        className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          borderTop:
            `4px solid ${GOLD}`,
        }}
      >

        <div
          className="flex justify-between items-center p-4 sm:p-5 border-b"
          style={{
            borderColor: LINE,
          }}
        >

          <h2
            className="text-base sm:text-lg pr-2"
            style={{
              fontFamily:
                "'Source Serif 4', serif",
              fontWeight: 600,
            }}
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={close}
            className="p-1.5 transition hover:opacity-60 shrink-0"
            style={{
              color: "#8892A0",
            }}
          >
            <X size={18} />
          </button>

        </div>

        <div className="p-4 sm:p-5">
          {children}
        </div>

      </div>
    </div>
  );
}

export default SalaryManagement;