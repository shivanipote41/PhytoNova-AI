import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

function buildLast7Days() {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({
      date: d,
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      iso: d.toISOString().slice(0, 10)
    });
  }
  return days;
}

function EmptyState() {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-md p-8 text-center">
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
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-text-secondary text-sm">No activity yet</p>
      <p className="text-text-secondary/60 text-xs mt-1">
        Your detection activity will appear here
      </p>
    </div>
  );
}

export default function ActivityTimeline() {
  const { user } = useAuth();
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !supabase) {
      setLoading(false);
      return;
    }

    async function fetchTimeline() {
      const since = new Date();
      since.setDate(since.getDate() - 7);
      since.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('detections')
        .select('disease, created_at')
        .eq('user_id', user.id)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setLoading(false);
        return;
      }

      const groups = {};
      data.forEach((d) => {
        const iso = d.created_at.slice(0, 10);
        if (!groups[iso]) groups[iso] = [];
        groups[iso].push(d.disease);
      });

      const days = buildLast7Days();
      const result = days.map(({ iso, label }) => {
        const diseases = groups[iso] ?? [];
        const count = diseases.length;
        const freq = {};
        diseases.forEach((dis) => { freq[dis] = (freq[dis] || 0) + 1; });
        const topDisease =
          Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
        return { date: iso, label, count, topDisease };
      });

      setTimeline(result);
      setLoading(false);
    }

    fetchTimeline();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-md p-5 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-48 mb-4" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-24 h-4 bg-white/10 rounded" />
              <div className="flex-1 h-2 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!timeline || timeline.every(t => t.count === 0)) {
    return <EmptyState />;
  }

  const maxCount = Math.max(...timeline.map((t) => t.count), 1);

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-md p-5 flex flex-col gap-4">
      <h3 className="text-text-primary font-semibold text-lg">
        Activity — Last 7 Days
      </h3>

      <ol className="relative border-l border-white/15 ml-3 flex flex-col gap-5">
        {timeline.map((item) => (
          <li key={item.date} className="ml-5 flex items-start gap-4">
            <span
              className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-sm border-2 mt-1.5 ${
                item.count > 0
                  ? 'border-primary bg-primary'
                  : 'border-white/30 bg-transparent'
              }`}
            />

            <div className="flex-shrink-0 w-24 text-xs text-text-secondary font-medium pt-1">
              {item.label}
            </div>

            <div className="flex-1 min-w-0">
              {item.count > 0 ? (
                <div className="flex flex-col gap-1">
                  <div className="h-1.5 bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-700"
                      style={{ width: `${Math.round((item.count / maxCount) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      {item.count} scan{item.count !== 1 ? 's' : ''}
                    </span>
                    {item.topDisease && (
                      <span
                        className={`text-xs font-medium ${
                          item.topDisease === 'Healthy' ? 'text-primary' : 'text-amber-400'
                        }`}
                      >
                        {item.topDisease === 'Healthy'
                          ? 'Healthy'
                          : item.topDisease.includes('___')
                          ? item.topDisease.split('___').pop().replace(/_/g, ' ')
                          : item.topDisease}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-1.5 bg-white/5" />
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}