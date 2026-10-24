
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

// =====================================================
// ADMIN LAYOUT
// =====================================================

import Layout from "./components/Layout";

// =====================================================
// LOGIN
// =====================================================

import Login from "./pages/Login";

// =====================================================
// ADMIN - SOCIETY
// =====================================================

import Dashboard from "./pages/Dashboard";
import CreateSociety from "./pages/CreateSociety";
import SocietyList from "./pages/SocietyList";

import Members from "./pages/Members";
import AddMember from "./pages/AddMember";
import MemberProfile from "./pages/MemberProfile";

import Payments from "./pages/Payments";
import Reports from "./pages/Reports";

import SocietyProfitLoss from "./pages/ProfitLoss";

// =====================================================
// ADMIN - LOAN
// =====================================================

import CreateLoan from "./pages/loan/CreateLoan";
import LoanList from "./pages/loan/LoanList";
import LoanDetails from "./pages/loan/LoanDetails";
import CollectInterest from "./pages/loan/CollectInterest";
import CloseLoan from "./pages/loan/CloseLoan";

import TermsAndConditions from "./pages/TermsAndConditions";

// =====================================================
// DAILY SAVING - ADMIN
// =====================================================

import DailySaving from "./pages/daily/DailySaving";

import DailyMembers from "./pages/daily/Members";
import DailyMemberProfile from "./pages/daily/MemberProfile";

import AdminCollections from "./pages/daily/AdminCollections";

import PenaltyManagement from "./pages/daily/PenaltyManagement";
import PenaltySettings from "./pages/daily/PenaltySettings";

import DailyCreateLoan from "./pages/daily/CreateLoan";
import LoansDashboard from "./pages/daily/LoansDashboard";
import DailyLoanDetails from "./pages/daily/LoanDetails";

import CreateDailySaving from "./pages/daily/CreateDailySaving";

import CollectPaymentModal from "./pages/daily/CollectPaymentModal";

import DailyReports from "./pages/daily/Reports";
import DailyDashboard from "./pages/daily/Dashboard";
import DailyProfitLoss from "./pages/daily/ProfitLoss";

import EditMember from "./pages/daily/EditMember";

import ComingSoon from "./pages/ComingSoon";



// =====================================================
// DAILY MEMBER PORTAL
// =====================================================

import UserLayout from "./components/UserLayout";

import UserDashboard from "./pages/daily/user/UserDashboard";
import UserSavings from "./pages/daily/user/UserSavings";
import UserPassbook from "./pages/daily/user/Passbook";
import UserLoan from "./pages/daily/user/UserLoan";
import UserProfile from "./pages/daily/user/UserProfile";

import ContactUs from "./pages/daily/user/ContactUs";
import About from "./pages/daily/user/About";
import PrivacyPolicy from "./pages/daily/user/PrivacyPolicy";
import TermsConditions from "./pages/daily/user/TermsConditions";
import HelpFaq from "./pages/daily/user/HelpFaq";

// =====================================================
// SOCIETY MEMBER PORTAL
// =====================================================

import SocietyMemberLayout
  from "./pages/societyMember/SocietyMemberLayout";

import SocietyMemberDashboard
  from "./pages/societyMember/SocietyMemberDashboard";

  import SocietyMemberPassbook
  from "./pages/societyMember/SocietyMemberPassbook";

  import SocietyMemberSaving
  from "./pages/societyMember/SocietyMemberSaving";
  
  import SocietyMemberLoan
  from "./pages/societyMember/SocietyMemberLoan";

import SocietyMemberProfile
  from "./pages/societyMember/SocietyMemberProfile";

  import SocietyMemberSupport
  from "./pages/societyMember/SocietyMemberSupport";
  
// =====================================================
// APP
// =====================================================


const ROLE_HOME = {
  ADMIN: "/dashboard",
  MEMBER: "/user/dashboard",
  SOCIETY_MEMBER: "/society-member/dashboard",
};

function getSavedSession() {
  try {
    const role = localStorage.getItem("role");
    const home = ROLE_HOME[role];

    const token =
      role === "SOCIETY_MEMBER"
        ? localStorage.getItem("societyMemberToken")
        : localStorage.getItem("token");

    if (!home || !token) return null;

    if (role === "MEMBER" &&
        !localStorage.getItem("member")) return null;

    if (role === "SOCIETY_MEMBER" &&
        !localStorage.getItem("societyMember")) return null;

    return { role, token, home };
  } catch {
    return null;
  }
}

function RequireAuth({ allowedRoles }) {
  const location = useLocation();
  const session = getSavedSession();

  if (!session || !allowedRoles.includes(session.role)) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}


function LoginRedirect() {
  const session = getSavedSession();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={session.home} replace />;
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            LOGIN
        ================================================= */}

     <Route
  path="/"
  element={
    getSavedSession()
      ? <LoginRedirect />
      : <Login />
  }
/>


        {/* =================================================
            ADMIN PORTAL
        ================================================= */}
<Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
  <Route element={<Layout />}>

          {/* -------------------------------
              MAIN ADMIN
          ------------------------------- */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/societies"
            element={<SocietyList />}
          />

          <Route
            path="/create-society"
            element={<CreateSociety />}
          />

          <Route
            path="/edit-society/:id"
            element={<CreateSociety />}
          />

          <Route
            path="/members"
            element={<Members />}
          />

          <Route
            path="/add-member"
            element={<AddMember />}
          />

          <Route
            path="/edit-member/:id"
            element={<AddMember />}
          />

          <Route
            path="/memberprofile/:id"
            element={<MemberProfile />}
          />

          <Route
            path="/payments"
            element={<Payments />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/profit-loss"
            element={<SocietyProfitLoss />}
          />

          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />


          {/* -------------------------------
              ADMIN - SOCIETY LOANS
          ------------------------------- */}

          <Route
            path="/create-loan"
            element={<CreateLoan />}
          />

          <Route
            path="/loans"
            element={<LoanList />}
          />
          <Route
  path="/daily/create-loan/:id"
  element={<CreateLoan />}
/>

          <Route
            path="/loan-details/:loanId"
            element={<LoanDetails />}
          />

          <Route
            path="/collect-interest/:loanId"
            element={<CollectInterest />}
          />

          <Route
            path="/close-loan/:loanId"
            element={<CloseLoan />}
          />


          {/* -------------------------------
              DAILY SAVING - ADMIN
          ------------------------------- */}

          <Route
            path="/coming-soon"
            element={<ComingSoon />}
          />

          <Route
            path="/daily/collect-payment-modal"
            element={<CollectPaymentModal />}
          />

          <Route
            path="/daily-saving"
            element={<DailySaving />}
          />

          <Route
            path="/daily/dashboard"
            element={<DailyDashboard />}
          />

          <Route
            path="/daily/members"
            element={<DailyMembers />}
          />



          <Route
            path="/daily/member/:id"
            element={<DailyMemberProfile />}
          />

          <Route
            path="/daily/collections"
            element={<AdminCollections />}
          />

          <Route
            path="/daily/penalty-management"
            element={<PenaltyManagement />}
          />

          <Route
            path="/daily/penalty"
            element={<PenaltySettings />}
          />


          {/* -------------------------------
              DAILY LOANS
          ------------------------------- */}

          <Route
            path="/daily/createloan"
            element={<DailyCreateLoan />}
          />

          <Route
            path="/daily/edit-loan/:id"
            element={<DailyCreateLoan />}
          />

          <Route
            path="/daily/loansdashboard"
            element={<LoansDashboard />}
          />

          <Route
            path="/daily/loan/:id"
            element={<DailyLoanDetails />}
          />


          {/* -------------------------------
              DAILY SAVING ACCOUNT
          ------------------------------- */}

          <Route
            path="/daily/create-saving"
            element={<CreateDailySaving />}
          />

          <Route
            path="/daily/create-saving/:memberId"
            element={<CreateDailySaving />}
          />

          <Route
            path="/daily/edit-saving/:id"
            element={<CreateDailySaving />}
          />


          {/* -------------------------------
              DAILY MEMBER MANAGEMENT
          ------------------------------- */}

          <Route
            path="/daily/edit-member/:id"
            element={<EditMember />}
          />


          {/* -------------------------------
              DAILY REPORTS
          ------------------------------- */}

         

          <Route
            path="/daily/daily-reports"
            element={<DailyReports />}
          />

          <Route
            path="/daily/profit-loss"
            element={<DailyProfitLoss />}
          />

        </Route>
</Route>

        {/* =================================================
            DAILY MEMBER PORTAL
        ================================================= */}

       <Route element={<RequireAuth allowedRoles={["MEMBER"]} />}>
  <Route element={<UserLayout />}>


          <Route
            path="/user/dashboard"
            element={<UserDashboard />}
          />

          <Route
            path="/user/saving"
            element={<UserSavings />}
          />

          <Route
            path="/user/passbook"
            element={<UserPassbook />}
          />

          <Route
            path="/user/loan"
            element={<UserLoan />}
          />

          <Route
            path="/user/profile"
            element={<UserProfile />}
          />

          <Route
            path="/user/contact"
            element={<ContactUs />}
          />

          <Route
            path="/user/about"
            element={<About />}
          />

          <Route
            path="/user/privacy"
            element={<PrivacyPolicy />}
          />

          <Route
            path="/user/terms"
            element={<TermsConditions />}
          />

          <Route
            path="/user/help"
            element={<HelpFaq />}
          />

        </Route>
</Route>

        {/* =================================================
            SOCIETY MEMBER PORTAL
        ================================================= */}
<Route element={<RequireAuth allowedRoles={["SOCIETY_MEMBER"]} />}>
  <Route element={<SocietyMemberLayout />}>

  <Route
    path="/society-member/dashboard"
    element={<SocietyMemberDashboard />}
  />

  <Route
    path="/society-member/saving"
    element={<SocietyMemberSaving />}
  />

  <Route
    path="/society-member/passbook"
    element={<SocietyMemberPassbook />}
  />
  <Route
    path="/society-member/loan"
    element={<SocietyMemberLoan />}
  />
  <Route
  path="/society-member/profile"
  element={<SocietyMemberProfile />}
/>
<Route
  path="/society-member/support"
  element={<SocietyMemberSupport />}
/>

</Route>

</Route>
      </Routes>

    </BrowserRouter>
  );
}

export default App;