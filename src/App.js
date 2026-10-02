import {
  BrowserRouter,
  Routes,
  Route
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

import Agents from "./pages/daily/Agents";
import AgentProfile from "./pages/daily/AgentProfile";

import DailyMembers from "./pages/daily/Members";
import DailyMemberRequests from "./pages/daily/DailyMemberRequests";
import DailyMemberProfile from "./pages/daily/MemberProfile";

import AdminCollections from "./pages/daily/AdminCollections";

import PenaltyManagement from "./pages/daily/PenaltyManagement";
import PenaltySettings from "./pages/daily/PenaltySettings";

import AttendanceManagement from "./pages/daily/AttendanceManagement";

import SalaryManagement from "./pages/daily/SalaryManagement";

import DailyCreateLoan from "./pages/daily/CreateLoan";
import LoansDashboard from "./pages/daily/LoansDashboard";
import DailyLoanDetails from "./pages/daily/LoanDetails";

import CreateDailySaving from "./pages/daily/CreateDailySaving";

import CollectPaymentModal from "./pages/daily/CollectPaymentModal";

import Notifications from "./pages/daily/Notifications";

import DailyReports from "./pages/daily/Reports";
import DailyDashboard from "./pages/daily/Dashboard";
import DailyProfitLoss from "./pages/daily/ProfitLoss";

import EditMember from "./pages/daily/EditMember";

import ComingSoon from "./pages/ComingSoon";
import AdminTasks from "./pages/daily/AdminTasks";


// =====================================================
// AGENT PORTAL
// =====================================================

import AgentLayout from "./components/AgentLayout";

import AgentDashboard from "./pages/daily/agent/AgentDashboard";
import AgentMembers from "./pages/daily/agent/AgentMembers";
import AgentAttendance from "./pages/daily/agent/AgentAttendance";
import AgentTerms from "./pages/daily/agent/AgentTerms";

import CollectPayment from "./pages/daily/agent/CollectPayment";
import CollectionHistory from "./pages/daily/agent/CollectionHistory";

import LoanManagment from "./pages/daily/agent/LoanManagment";
import AgentLoanDetails from "./pages/daily/agent/LoanDetails";
import Collection from "./pages/daily/agent/Collection";
import AgentMemberRegister from "./pages/daily/agent/AgentMemberRegister";
import AgentTasks from "./pages/daily/agent/AgentTasks";
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

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/"
          element={<Login />}
        />


        {/* =================================================
            ADMIN PORTAL
        ================================================= */}

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
  path="/daily/member-requests"
  element={<DailyMemberRequests />}
/>

<Route
  path="/daily/tasks"
  element={<AdminTasks />}
/>

          <Route
            path="/daily/member/:id"
            element={<DailyMemberProfile />}
          />

          <Route
            path="/daily/agents"
            element={<Agents />}
          />

          <Route
            path="/daily/agent/:id"
            element={<AgentProfile />}
          />

          <Route
            path="/daily/collections"
            element={<AdminCollections />}
          />

          <Route
            path="/daily/attendance"
            element={<AttendanceManagement />}
          />

          <Route
            path="/daily/salary"
            element={<SalaryManagement />}
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
            path="/daily/notifications"
            element={<Notifications />}
          />

          <Route
            path="/daily/daily-reports"
            element={<DailyReports />}
          />

          <Route
            path="/daily/profit-loss"
            element={<DailyProfitLoss />}
          />

        </Route>


        {/* =================================================
            AGENT PORTAL
        ================================================= */}

        <Route element={<AgentLayout />}>

          <Route
            path="/agent/dashboard"
            element={<AgentDashboard />}
          />

          <Route
            path="/agent/members"
            element={<AgentMembers />}
          />

          <Route
            path="/agent/attendance"
            element={<AgentAttendance />}
          />

          <Route
            path="/agent/terms"
            element={<AgentTerms />}
          />
<Route
  path="/agent/collection"
  element={<Collection />}
/>
<Route
  path="/agent/member-register"
  element={<AgentMemberRegister />}
/>

<Route
  path="/agent/tasks"
  element={<AgentTasks />}
/>

          <Route
            path="/agent/collect/:savingId"
            element={<CollectPayment />}
          />

          <Route
            path="/agent/history"
            element={<CollectionHistory />}
          />

          <Route
            path="/agent/loans"
            element={<LoanManagment />}
          />

          <Route
            path="/agent/loan/:id"
            element={<AgentLoanDetails />}
          />

        </Route>


        {/* =================================================
            DAILY MEMBER PORTAL
        ================================================= */}

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


        {/* =================================================
            SOCIETY MEMBER PORTAL
        ================================================= */}

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

      </Routes>

    </BrowserRouter>
  );
}

export default App;