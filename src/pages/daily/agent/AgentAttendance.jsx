import React, {
  useEffect,
  useState
} from "react";

import axios from "axios";

import {
  MapPin,
  Clock,
  CheckCircle,
  LogOut,
  Loader2,
  AlertCircle
} from "lucide-react";


const API =
  "https://finance-project-0qqk.onrender.com/api/daily/attendance";


function AgentAttendance() {

  const [agent, setAgent] =
    useState(null);

  const [attendance, setAttendance] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [marking, setMarking] =
    useState(false);

  const [checkingOut, setCheckingOut] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");
const [monthlyAttendance, setMonthlyAttendance] =
  useState([]);

const [monthlyLoading, setMonthlyLoading] =
  useState(false);

const [selectedMonth, setSelectedMonth] =
  useState(new Date().getMonth() + 1);

const [selectedYear, setSelectedYear] =
  useState(new Date().getFullYear());

  // =================================================
  // LOAD AGENT
  // =================================================

useEffect(() => {

  const storedAgent =
    localStorage.getItem("agent");

  if (!storedAgent) {

    setLoading(false);

    return;

  }

  try {

    const parsed =
      JSON.parse(storedAgent);

    setAgent(parsed);

    loadTodayAttendance(
      parsed._id
    );

    loadMonthlyAttendance(
      parsed._id,
      selectedMonth,
      selectedYear
    );

  } catch (error) {

    console.error(
      "Agent session error:",
      error
    );

    setLoading(false);

  }

}, []);


  // =================================================
  // LOAD TODAY
  // =================================================

  const loadTodayAttendance = async (
    agentId
  ) => {

    try {

      const res =
        await axios.get(
          `${API}/today/${agentId}`
        );


      setAttendance(
        res.data.attendance
      );

    } catch (error) {

      console.error(
        "Attendance loading error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };
// =================================================
// LOAD MONTHLY ATTENDANCE
// =================================================

const loadMonthlyAttendance = async (
  agentId,
  month = selectedMonth,
  year = selectedYear
) => {

  try {

    setMonthlyLoading(true);

    const res = await axios.get(
      `${API}/monthly`,
      {
        params: {
          agentId,
          month,
          year
        }
      }
    );

    setMonthlyAttendance(
      res.data.report || []
    );

  } catch (error) {

    console.error(
      "Monthly attendance loading error:",
      error
    );

    setMonthlyAttendance([]);

  } finally {

    setMonthlyLoading(false);

  }

};

  // =================================================
  // GET LOCATION
  // =================================================

  const getCurrentLocation = () => {

    return new Promise(
      (resolve, reject) => {

        if (
          !navigator.geolocation
        ) {

          reject(
            new Error(
              "Location is not supported by this browser"
            )
          );

          return;

        }


        navigator.geolocation.getCurrentPosition(

          position => {

            resolve({

              latitude:
                position.coords.latitude,

              longitude:
                position.coords.longitude,

              accuracy:
                position.coords.accuracy

            });

          },

          error => {

            let message =
              "Unable to get your location";


            switch (
              error.code
            ) {

              case 1:

                message =
                  "Location permission denied. Please allow location access.";

                break;


              case 2:

                message =
                  "Location unavailable. Please try again.";

                break;


              case 3:

                message =
                  "Location request timed out. Please try again.";

                break;


              default:

                message =
                  "Unable to get your location.";

            }


            reject(
              new Error(message)
            );

          },

          {
            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0

          }

        );

      }
    );

  };


  // =================================================
  // MARK ATTENDANCE
  // =================================================

  const markAttendance = async () => {

    if (!agent?._id) {

      alert(
        "Agent session not found"
      );

      return;

    }


    try {

      setMarking(true);

      setLocationError("");


      // =============================================
      // GET GPS
      // =============================================

      const location =
        await getCurrentLocation();


      // =============================================
      // SEND TO BACKEND
      // =============================================

      const res =
        await axios.post(
          `${API}/mark`,
          {

            agentId:
              agent._id,

            latitude:
              location.latitude,

            longitude:
              location.longitude,

            accuracy:
              location.accuracy

          }
        );


      setAttendance(
        res.data.attendance
      );


      alert(
        "Attendance marked successfully"
      );

    } catch (error) {

      console.error(
        "Attendance error:",
        error
      );


      setLocationError(
        error.response?.data?.message ||
        error.message ||
        "Unable to mark attendance"
      );

    } finally {

      setMarking(false);

    }

  };


  // =================================================
  // CHECK OUT
  // =================================================

  const handleCheckOut = async () => {

    if (!agent?._id) {
      return;
    }


    try {

      setCheckingOut(true);


      const res =
        await axios.post(
          `${API}/check-out`,
          {
            agentId:
              agent._id
          }
        );


      setAttendance(
        res.data.attendance
      );


      alert(
        "Checked out successfully"
      );

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Checkout failed"
      );

    } finally {

      setCheckingOut(false);

    }

  };


  // =================================================
  // FORMAT TIME
  // =================================================

  const formatTime = (
    date
  ) => {

    if (!date) {
      return "--";
    }


    return new Date(
      date
    ).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }
    );

  };


  // =================================================
  // WORKING TIME
  // =================================================

  const formatWorkingTime = (
    minutes
  ) => {

    if (!minutes) {
      return "0m";
    }


    const hours =
      Math.floor(
        minutes / 60
      );

    const mins =
      minutes % 60;


    if (hours === 0) {

      return `${mins}m`;

    }


    return `${hours}h ${mins}m`;

  };

// =================================================
// MONTH NAVIGATION
// =================================================

const changeMonth = async (direction) => {

  let month = selectedMonth;
  let year = selectedYear;

  month += direction;

  if (month > 12) {

    month = 1;
    year++;

  }

  if (month < 1) {

    month = 12;
    year--;

  }

  setSelectedMonth(month);
  setSelectedYear(year);

  if (agent?._id) {

    await loadMonthlyAttendance(
      agent._id,
      month,
      year
    );

  }

};
const monthName =
  new Date(
    selectedYear,
    selectedMonth - 1,
    1
  ).toLocaleString(
    "en-IN",
    {
      month: "long",
      year: "numeric"
    }
  );
  const monthlyReport =
  monthlyAttendance[0] || {};

const present =
  monthlyReport.present || 0;

const absent =
  monthlyReport.absent || 0;

const halfDay =
  monthlyReport.halfDay || 0;

const attendanceRate =
  monthlyReport.attendanceRate || 0;

const monthlyRecords =
  monthlyReport.attendance || [];
  // =================================================
  // LOADING
  // =================================================



  const status =
  attendance?.status || "PRESENT";

const statusStyles = {
  PRESENT: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    iconBg: "bg-emerald-100",
    icon: "text-emerald-600",
    text: "text-emerald-700",
  },

  HALF_DAY: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    iconBg: "bg-amber-100",
    icon: "text-amber-600",
    text: "text-amber-700",
  },

  ABSENT: {
    bg: "bg-red-50",
    border: "border-red-100",
    iconBg: "bg-red-100",
    icon: "text-red-600",
    text: "text-red-700",
  },
};

const currentStatus =
  statusStyles[status] ||
  statusStyles.PRESENT;


  if (loading) {

    return (

      <div className="
        min-h-screen
        bg-slate-50
        flex
        items-center
        justify-center
      ">

        <Loader2
          className="
            animate-spin
            text-blue-600
          "
          size={32}
        />

      </div>

    );

  }


  // =================================================
  // UI
  // =================================================

  return (

    <div className="
      min-h-screen
      bg-slate-50
      p-4
      sm:p-6
      lg:p-8
    ">

      <div className="
        max-w-3xl
        mx-auto
      ">


        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="mb-6">

          <h1 className="
            text-2xl
            font-black
            text-slate-900
          ">
            My Attendance
          </h1>

          <p className="
            text-sm
            text-slate-500
            mt-1
          ">
            Mark your daily attendance
            with your current location.
          </p>

        </div>


        {/* ========================================= */}
        {/* LOCATION ERROR */}
        {/* ========================================= */}

        {locationError && (

          <div className="
            mb-5
            p-4
            bg-red-50
            border
            border-red-200
            rounded-2xl
            flex
            gap-3
            items-start
            text-red-700
          ">

            <AlertCircle
              size={20}
              className="mt-0.5"
            />

            <div>

              <p className="
                font-bold
                text-sm
              ">
                Attendance not marked
              </p>

              <p className="
                text-xs
                mt-1
              ">
                {locationError}
              </p>

            </div>

          </div>

        )}


        {/* ========================================= */}
        {/* NOT MARKED */}
        {/* ========================================= */}

        {!attendance && (

          <div className="
            bg-white
            rounded-3xl
            border
            border-slate-200
            shadow-sm
            p-6
            sm:p-8
          ">

            <div className="
              w-16
              h-16
              bg-blue-50
              text-blue-600
              rounded-2xl
              flex
              items-center
              justify-center
              mb-5
            ">

              <MapPin
                size={30}
              />

            </div>


            <h2 className="
              text-xl
              font-black
              text-slate-900
            ">
              Mark Today's Attendance
            </h2>


            <p className="
              text-sm
              text-slate-500
              mt-2
              max-w-xl
            ">
              Your current location will be
              captured when you mark attendance.
              This allows the administrator to see
              where the attendance was recorded.
            </p>


            <button
              onClick={
                markAttendance
              }
              disabled={marking}
              className="
                mt-6
                w-full
                sm:w-auto
                px-6
                py-3
                rounded-xl
                bg-blue-600
                hover:bg-blue-700
                disabled:opacity-50
                text-white
                font-black
                flex
                items-center
                justify-center
                gap-2
              "
            >

              {marking ? (

                <>
                  <Loader2
                    size={18}
                    className="
                      animate-spin
                    "
                  />

                  Getting Location...

                </>

              ) : (

                <>
                  <MapPin
                    size={18}
                  />

                  Mark Attendance

                </>

              )}

            </button>

          </div>

        )}


        {/* ========================================= */}
        {/* MARKED */}
        {/* ========================================= */}

        {attendance && (

          <div className="
            bg-white
            rounded-3xl
            border
            border-slate-200
            shadow-sm
            overflow-hidden
          ">


            {/* STATUS */}

        <div className={`
  p-6
  ${currentStatus.bg}
  border-b
  ${currentStatus.border}
`}>

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className={`
  w-12
  h-12
  ${currentStatus.iconBg}
  ${currentStatus.icon}
  rounded-xl
  flex
  items-center
  justify-center
`}>

                  <CheckCircle
                    size={25}
                  />

                </div>


                <div>

                  <p className="
                    text-xs
                    font-bold
                    ${currentStatus.text}
                    uppercase
                  ">
                    Attendance Status
                  </p>

                  <h2 className="
                    text-xl
                    font-black
                    ${currentStatus.text} 
                  ">
                    {attendance.status}
                  </h2>

                </div>

              </div>

            </div>


            <div className="
              p-6
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-4
            ">


              {/* CHECK IN */}

              <InfoCard
                icon={Clock}
                title="Check In"
                value={
                  formatTime(
                    attendance.checkInTime
                  )
                }
              />


              {/* CHECK OUT */}

              <InfoCard
                icon={Clock}
                title="Check Out"
                value={
                  formatTime(
                    attendance.checkOutTime
                  )
                }
              />


              {/* WORKING */}

              <InfoCard
                icon={Clock}
                title="Working Time"
                value={
                  formatWorkingTime(
                    attendance.workingMinutes
                  )
                }
              />


              {/* LOCATION */}

              <InfoCard
                icon={MapPin}
                title="Location"
                value="Location Captured"
              />

            </div>


            {/* LOCATION DETAILS */}

            {attendance.checkInLocation && (

              <div className="
                mx-6
                mb-6
                p-5
                bg-slate-50
                border
                border-slate-200
                rounded-2xl
              ">

                <div className="
                  flex
                  items-center
                  gap-2
                  mb-4
                ">

                  <MapPin
                    size={18}
                    className="
                      text-blue-600
                    "
                  />

                  <h3 className="
                    font-black
                    text-slate-900
                  ">
                    Check-in Location
                  </h3>

                </div>


                <div className="
                  grid
                  grid-cols-1
                  sm:grid-cols-3
                  gap-3
                  text-xs
                ">

                  <LocationValue
                    label="Latitude"
                    value={
                      attendance
                        .checkInLocation
                        .latitude
                    }
                  />

                  <LocationValue
                    label="Longitude"
                    value={
                      attendance
                        .checkInLocation
                        .longitude
                    }
                  />

                  <LocationValue
                    label="Accuracy"
                    value={
                      attendance
                        .checkInLocation
                        .accuracy
                        ? `${Math.round(
                            attendance
                              .checkInLocation
                              .accuracy
                          )} m`
                        : "N/A"
                    }
                  />

                </div>

              </div>

            )}


            {/* CHECKOUT */}

            {!attendance.checkOutTime && (

              <div className="
                px-6
                pb-6
              ">

                <button
                  onClick={
                    handleCheckOut
                  }
                  disabled={
                    checkingOut
                  }
                  className="
                    w-full
                    py-3
                    rounded-xl
                    bg-slate-900
                    hover:bg-slate-800
                    disabled:opacity-50
                    text-white
                    font-black
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >

                  {checkingOut ? (

                    <Loader2
                      size={18}
                      className="
                        animate-spin
                      "
                    />

                  ) : (

                    <LogOut
                      size={18}
                    />

                  )}

                  Check Out

                </button>

              </div>

            )}

          </div>

        )}

{/* ========================================= */}
{/* MONTHLY ATTENDANCE */}
{/* ========================================= */}

<div className="mt-6 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

  {/* HEADER */}

  <div className="p-6 border-b border-slate-100">

    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

      <div>

        <h2 className="text-lg font-black text-slate-900">
          Monthly Attendance
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Your attendance history
        </p>

      </div>


      {/* MONTH NAVIGATION */}

      <div className="flex items-center gap-2">

        <button
          onClick={() => changeMonth(-1)}
          className="
            w-9
            h-9
            rounded-xl
            border
            border-slate-200
            bg-white
            hover:bg-slate-50
            font-bold
            text-slate-600
          "
        >
          ‹
        </button>


        <div className="
          min-w-[150px]
          text-center
          px-4
          py-2
          rounded-xl
          bg-slate-50
          text-sm
          font-black
          text-slate-800
        ">
          {monthName}
        </div>


        <button
          onClick={() => changeMonth(1)}
          className="
            w-9
            h-9
            rounded-xl
            border
            border-slate-200
            bg-white
            hover:bg-slate-50
            font-bold
            text-slate-600
          "
        >
          ›
        </button>

      </div>

    </div>

  </div>


  {/* SUMMARY */}

  <div className="
    p-6
    grid
    grid-cols-1
    sm:grid-cols-3
    gap-4
  ">

    <div className="
      p-4
      rounded-2xl
      bg-emerald-50
      border
      border-emerald-100
    ">

      <p className="
        text-[10px]
        font-black
        uppercase
        tracking-wider
        text-emerald-600
      ">
        Present
      </p>

      <p className="
        text-2xl
        font-black
        text-emerald-700
        mt-1
      ">
        {present}
      </p>

    </div>


    <div className="
      p-4
      rounded-2xl
      bg-red-50
      border
      border-red-100
    ">

      <p className="
        text-[10px]
        font-black
        uppercase
        tracking-wider
        text-red-600
      ">
        Absent
      </p>

      <p className="
        text-2xl
        font-black
        text-red-700
        mt-1
      ">
        {absent}
      </p>

    </div>


    <div className="
      p-4
      rounded-2xl
      bg-blue-50
      border
      border-blue-100
    ">

      <p className="
        text-[10px]
        font-black
        uppercase
        tracking-wider
        text-blue-600
      ">
        Attendance Rate
      </p>

      <p className="
        text-2xl
        font-black
        text-blue-700
        mt-1
      ">
        {attendanceRate}%
      </p>

    </div>

  </div>


  {/* DAILY LIST */}

  <div className="px-6 pb-6">

    <div className="
      border
      border-slate-200
      rounded-2xl
      overflow-hidden
    ">

      <div className="
        grid
        grid-cols-3
        bg-slate-50
        px-4
        py-3
        text-[10px]
        font-black
        uppercase
        tracking-wider
        text-slate-400
      ">

        <span>
          Date
        </span>

        <span>
          Status
        </span>

        <span>
          Check In
        </span>

      </div>


      {monthlyLoading ? (

        <div className="
          p-8
          text-center
          text-sm
          text-slate-400
        ">
          Loading attendance...
        </div>

      ) : monthlyRecords.length === 0 ? (

        <div className="
          p-8
          text-center
          text-sm
          text-slate-400
        ">
          No attendance records found.
        </div>

      ) : (

        monthlyRecords.map(
          (record) => (

            <div
              key={record._id}
              className="
                grid
                grid-cols-3
                px-4
                py-3
                border-t
                border-slate-100
                items-center
              "
            >

              <div className="
                text-sm
                font-bold
                text-slate-700
              ">

                {new Date(
                  record.attendanceDate
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  }
                )}

              </div>


              <div>

                <span
                  className={`
                    inline-flex
                    px-2.5
                    py-1
                    rounded-lg
                    text-[10px]
                    font-black
                    ${
                      record.status === "PRESENT"
                        ? "bg-emerald-50 text-emerald-600"
                        : record.status === "HALF_DAY"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-red-50 text-red-600"
                    }
                  `}
                >
                  {record.status}
                </span>

              </div>


              <div className="
                text-sm
                font-bold
                text-slate-600
              ">

                {formatTime(
                  record.checkInTime
                )}

              </div>

            </div>

          )
        )

      )}

    </div>

  </div>

</div>


      </div>

    </div>





  );

}


// =================================================
// SMALL COMPONENTS
// =================================================

function InfoCard({
  icon: Icon,
  title,
  value
}) {

  return (

    <div className="
      border
      border-slate-200
      rounded-2xl
      p-4
    ">

      <div className="
        flex
        items-center
        gap-2
        text-slate-400
      ">

        <Icon size={16} />

        <span className="
          text-[10px]
          uppercase
          font-black
          tracking-wider
        ">
          {title}
        </span>

      </div>

      <div className="
        mt-2
        text-lg
        font-black
        text-slate-900
      ">
        {value}
      </div>

    </div>

  );

}


function LocationValue({
  label,
  value
}) {

  return (

    <div>

      <p className="
        text-[10px]
        uppercase
        font-bold
        text-slate-400
      ">
        {label}
      </p>

      <p className="
        mt-1
        font-bold
        text-slate-700
        break-all
      ">
        {value}
      </p>

    </div>

  );

}


export default AgentAttendance;