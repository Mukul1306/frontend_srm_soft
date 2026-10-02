import React, { useEffect, useState } from "react";

import axios from "axios";

import {
  UserRound,
  Phone,
  Mail,
  MapPin,
  Heart,
  CalendarDays,
  CreditCard,
  Landmark,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  BadgeIndianRupee
} from "lucide-react";

function SocietyMemberProfile() {

  const [data, setData] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {
    loadProfile();
  }, []);


  const loadProfile = async (
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
          "https://finance-project-0qqk.onrender.com/api/member-portal/profile",
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
          "Unable to load profile."
        );

      }


      setData(
        response.data
      );

    } catch (err) {

      console.error(
        "PROFILE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load profile."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  };


  const formatDate = (
    value
  ) => {

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


  const formatMoney = (
    value
  ) => {

    return `₹${Number(
      value || 0
    ).toLocaleString(
      "en-IN"
    )}`;

  };


  if (loading) {

    return (
      <div className="
        min-h-[70vh]
        flex
        items-center
        justify-center
      ">

        <div className="text-center">

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
            Loading profile...
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
            Unable to load profile
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
              loadProfile()
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


  const member =
    data?.member || {};

  const society =
    data?.society || {};


  const initials =
    member.name
      ? member.name
          .trim()
          .split(/\s+/)
          .map(
            (word) =>
              word[0]
          )
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "ME";


  return (
    <div className="
      mx-auto
      w-full
      max-w-3xl
      space-y-5
      pb-6
      sm:space-y-6
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
            Account
          </p>


          <h1 className="
            mt-1
            text-xl
            font-extrabold
            tracking-tight
            text-slate-950
            sm:text-2xl
          ">
            My Profile
          </h1>

        </div>


        <button
          type="button"
          onClick={() =>
            loadProfile(true)
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
          PROFILE HERO
      ================================================= */}

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
          items-center
          gap-4
        ">


          <div className="
            flex
            h-16
            w-16
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-white/15
            text-xl
            font-extrabold
            ring-1
            ring-white/20
          ">

            {initials}

          </div>


          <div className="
            min-w-0
          ">

            <h2 className="
              truncate
              text-xl
              font-extrabold
            ">
              {member.name ||
                "Member"}
            </h2>


            <p className="
              mt-1
              text-xs
              text-blue-100
            ">
              Member ID ·{" "}
              {member.memberId ||
                "--"}
            </p>


            <div className="
              mt-2
              flex
              items-center
              gap-2
            ">

              <span className="
                rounded-full
                border
                border-white/20
                bg-white/10
                px-2.5
                py-1
                text-[10px]
                font-bold
                uppercase
              ">
                {member.status ||
                  "ACTIVE"}
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          PERSONAL DETAILS
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

          <div className="
            flex
            items-center
            gap-2
          ">

            <UserRound
              size={17}
              className="text-blue-600"
            />

            <h2 className="
              text-sm
              font-bold
              text-slate-900
            ">
              Personal Details
            </h2>

          </div>

        </div>


        <div className="
          grid
          grid-cols-1
          gap-3
          p-4
          sm:grid-cols-2
        ">

          <ProfileField
            label="Full Name"
            value={
              member.name
            }
          />

          <ProfileField
            label="Father / Husband Name"
            value={
              member.fatherOrHusbandName
            }
          />

          <ProfileField
            label="Gender"
            value={
              member.gender
            }
          />

          <ProfileField
            label="Date of Birth"
            value={
              formatDate(
                member.dob
              )
            }
          />

        </div>

      </section>


      {/* =================================================
          CONTACT
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

          <div className="
            flex
            items-center
            gap-2
          ">

            <Phone
              size={17}
              className="text-blue-600"
            />

            <h2 className="
              text-sm
              font-bold
              text-slate-900
            ">
              Contact Information
            </h2>

          </div>

        </div>


        <div className="
          grid
          grid-cols-1
          gap-3
          p-4
          sm:grid-cols-2
        ">

          <ProfileField
            icon={Phone}
            label="Mobile"
            value={
              member.mobile
            }
          />

          <ProfileField
            icon={Phone}
            label="Alternate Mobile"
            value={
              member.alternateMobile ||
              "--"
            }
          />

          <ProfileField
            icon={Mail}
            label="Email"
            value={
              member.email ||
              "--"
            }
          />

        </div>

      </section>


      {/* =================================================
          ADDRESS
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

          <div className="
            flex
            items-center
            gap-2
          ">

            <MapPin
              size={17}
              className="text-blue-600"
            />

            <h2 className="
              text-sm
              font-bold
              text-slate-900
            ">
              Address
            </h2>

          </div>

        </div>


        <div className="
          grid
          grid-cols-1
          gap-3
          p-4
          sm:grid-cols-2
        ">

          <ProfileField
            label="Address"
            value={
              member.address ||
              "--"
            }
            full
          />

          <ProfileField
            label="City"
            value={
              member.city ||
              "--"
            }
          />

          <ProfileField
            label="District"
            value={
              member.district ||
              "--"
            }
          />

          <ProfileField
            label="State"
            value={
              member.state ||
              "--"
            }
          />

          <ProfileField
            label="PIN Code"
            value={
              member.pinCode ||
              "--"
            }
          />

        </div>

      </section>


      {/* =================================================
          NOMINEE
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

          <div className="
            flex
            items-center
            gap-2
          ">

            <Heart
              size={17}
              className="text-rose-500"
            />

            <h2 className="
              text-sm
              font-bold
              text-slate-900
            ">
              Nominee Details
            </h2>

          </div>

        </div>


        <div className="
          grid
          grid-cols-1
          gap-3
          p-4
          sm:grid-cols-2
        ">

          <ProfileField
            label="Nominee Name"
            value={
              member.nomineeName ||
              "--"
            }
          />

          <ProfileField
            icon={Phone}
            label="Nominee Mobile"
            value={
              member.nomineeMobile ||
              "--"
            }
          />

        </div>

      </section>


      {/* =================================================
          MEMBERSHIP
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

          <div className="
            flex
            items-center
            gap-2
          ">

            <CreditCard
              size={17}
              className="text-blue-600"
            />

            <h2 className="
              text-sm
              font-bold
              text-slate-900
            ">
              Membership Details
            </h2>

          </div>

        </div>


        <div className="
          grid
          grid-cols-2
          gap-3
          p-4
          sm:grid-cols-3
        ">

          <ProfileField
            label="Joining Date"
            value={
              formatDate(
                member.joiningDate
              )
            }
          />

          <ProfileField
            label="Member End Date"
            value={
              formatDate(
                member.memberEndDate
              )
            }
          />

          <ProfileField
            label="Due Day"
            value={
              member.dueDay
                ? `Day ${member.dueDay}`
                : "--"
            }
          />

          <ProfileField
            label="Monthly Installment"
            value={
              formatMoney(
                member.monthlyInstallment
              )
            }
          />

          <ProfileField
            label="Monthly Penalty"
            value={
              formatMoney(
                member.monthlyPenalty
              )
            }
          />

          <ProfileField
            label="Installments"
            value={
              `${member.paidInstallments || 0}/${member.totalInstallments || 0}`
            }
          />

        </div>

      </section>


      {/* =================================================
          FINANCIAL SUMMARY
      ================================================= */}

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
          items-center
          gap-2
        ">

          <BadgeIndianRupee
            size={18}
            className="text-blue-600"
          />

          <h2 className="
            text-sm
            font-bold
            text-slate-900
          ">
            Saving Summary
          </h2>

        </div>


        <div className="
          mt-4
          grid
          grid-cols-2
          gap-3
        ">

          <SummaryBox
            label="Total Paid"
            value={
              formatMoney(
                member.totalPaid
              )
            }
          />

          <SummaryBox
            label="Pending Amount"
            value={
              formatMoney(
                member.pendingAmount
              )
            }
          />

          <SummaryBox
            label="Pending Installments"
            value={
              member.pendingInstallments ||
              0
            }
          />

          <SummaryBox
            label="Penalty Paid"
            value={
              formatMoney(
                member.totalPenaltyPaid
              )
            }
          />

        </div>

      </section>


      {/* =================================================
          SOCIETY
      ================================================= */}

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
          items-center
          gap-2
        ">

          <Landmark
            size={18}
            className="text-blue-600"
          />

          <h2 className="
            text-sm
            font-bold
            text-slate-900
          ">
            Society Information
          </h2>

        </div>


        <div className="
          mt-4
          rounded-xl
          bg-slate-50
          p-4
        ">

          <p className="
            text-xs
            font-bold
            uppercase
            text-slate-400
          ">
            Society
          </p>


          <p className="
            mt-1
            text-base
            font-extrabold
            text-slate-900
          ">
            {
              society.societyName ||
              "--"
            }
          </p>


          <div className="
            mt-4
            grid
            grid-cols-2
            gap-3
          ">

            <SummaryBox
              label="Duration"
              value={
                society.durationMonths
                  ? `${society.durationMonths} Months`
                  : "--"
              }
            />

            <SummaryBox
              label="Members"
              value={
                society.currentMembers !==
                  undefined
                  ? `${society.currentMembers}/${society.maxMembers || 0}`
                  : "--"
              }
            />

          </div>

        </div>

      </section>


      {/* =================================================
          ACCOUNT SECURITY
      ================================================= */}

      <section className="
        flex
        items-start
        gap-3
        rounded-2xl
        border
        border-emerald-100
        bg-emerald-50
        p-4
      ">

        <div className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-emerald-100
          text-emerald-600
        ">

          <ShieldCheck
            size={18}
          />

        </div>


        <div>

          <p className="
            text-xs
            font-bold
            text-emerald-800
          ">
            Account Protected
          </p>


          <p className="
            mt-1
            text-[11px]
            leading-5
            text-emerald-700
          ">
            Your profile information is available only
            to your authenticated Society Member account.
          </p>

        </div>

      </section>

    </div>
  );
}


// =====================================================
// SMALL COMPONENTS
// =====================================================

function ProfileField({
  icon: Icon,
  label,
  value,
  full = false
}) {

  return (
    <div
      className={`
        rounded-xl
        bg-slate-50
        p-3
        ${full ? "sm:col-span-2" : ""}
      `}
    >

      <div className="
        flex
        items-center
        gap-1.5
      ">

        {Icon && (
          <Icon
            size={12}
            className="text-slate-400"
          />
        )}

        <p className="
          text-[10px]
          font-bold
          uppercase
          tracking-wide
          text-slate-400
        ">
          {label}
        </p>

      </div>


      <p className="
        mt-1.5
        break-words
        text-sm
        font-bold
        text-slate-700
      ">
        {value || "--"}
      </p>

    </div>
  );
}


function SummaryBox({
  label,
  value
}) {

  return (
    <div className="
      rounded-xl
      bg-slate-50
      p-3
    ">

      <p className="
        text-[10px]
        font-bold
        uppercase
        tracking-wide
        text-slate-400
      ">
        {label}
      </p>


      <p className="
        mt-1
        text-sm
        font-extrabold
        text-slate-800
      ">
        {value}
      </p>

    </div>
  );
}


export default SocietyMemberProfile;