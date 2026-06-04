import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDetections } from '../../utils/detectionsStore';

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-md p-5 flex flex-col gap-3">
      <div className="text-3xl text-primary">
        {icon}
      </div>
      <div>
        <div className="text-3xl font-bold text-text-primary tabular-nums">
          {value}
        </div>
        <div className="mt-1 text-sm text-text-secondary">{label}</div>
      </div>
    </div>
  );
}

function EmptyStateCard() {
  return (
    <div className="col-span-full bg-white/[0.02] border border-white/10 rounded-md p-8 text-center">
      <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center mx-auto mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-6 h-6 text-text-secondary/50"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
          />
        </svg>
      </div>
      <p className="text-text-secondary text-sm">
        No detections yet. Start scanning to see your analytics.
      </p>
    </div>
  );
}

export default function StatsCards() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data } = await getDetections(user?.id);

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      const total = data.length;
      const diseaseCount = data.filter((d) => d.disease && d.disease !== 'Healthy').length;
      const healthyCount = total - diseaseCount;

      const freq = {};
      data.forEach((d) => {
        if (d.disease && d.disease !== 'Healthy') {
          freq[d.disease] = (freq[d.disease] || 0) + 1;
        }
      });
      const topDisease =
        Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

      setStats({
        totalScans: total,
        diseasesDetected: diseaseCount,
        healthyScans: healthyCount,
        topDisease
      });
      setLoading(false);
    }

    if (!user) {
      setLoading(false);
      return;
    }

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/10 rounded-md p-5 animate-pulse">
            <div className="h-8 w-8 bg-white/10 rounded mb-3" />
            <div className="h-8 bg-white/10 rounded w-20 mb-2" />
            <div className="h-4 bg-white/10 rounded w-28" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats || stats.totalScans === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <EmptyStateCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        }
        label="Total Scans"
        value={stats.totalScans}
      />
      <StatCard
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        }
        label="Diseases Detected"
        value={stats.diseasesDetected}
      />
      <StatCard
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        label="Healthy Scans"
        value={stats.healthyScans}
      />
      {stats.topDisease && (
        <StatCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
            </svg>
          }
          label="Top Disease"
          value={stats.topDisease.split('___').pop().replace(/_/g, ' ')}
        />
      )}
    </div>
  );
}