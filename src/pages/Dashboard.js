import StatsCards from "../components/StatsCards";
import AlertBanner from "../components/AlertBanner";
import CollectionChart from "../components/CollectionChart";
import RecentActivity from "../components/RecentActivity";

function Dashboard() {

  return (

    <div className="flex bg-slate-100 min-h-screen">


      <div className="flex-1">

        <div className="p-6">

          <StatsCards />

          <AlertBanner />

          <div className="grid lg:grid-cols-3 gap-6 mt-6">

            <div className="lg:col-span-2">

              <CollectionChart />

            </div>

            <RecentActivity />

          </div>

        </div>

      </div>

    </div>

  );

}

export default Dashboard;