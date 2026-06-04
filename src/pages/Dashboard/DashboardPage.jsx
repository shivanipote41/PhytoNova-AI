import StatsCards from './StatsCards';
import DiseaseChart from './DiseaseChart';
import RecentScans from './RecentScans';
import ActivityTimeline from './ActivityTimeline';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-text-secondary">
            Your detection analytics and scan history in one place.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <StatsCards />
      </div>

      {/* Charts + recent scans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DiseaseChart />
          </div>
          <div className="lg:col-span-2">
            <RecentScans />
          </div>
        </div>
      </div>

      {/* Activity timeline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ActivityTimeline />
      </div>
    </div>
  );
}