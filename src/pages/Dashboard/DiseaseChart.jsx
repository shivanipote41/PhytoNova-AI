import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

const SLICE_COLORS = [
  '#22c55e',
  '#06b6d4',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white/10 border border-white/20 rounded-md px-4 py-2 text-sm">
      <span className="text-text-secondary">{name}: </span>
      <span className="text-text-primary font-semibold">{value}</span>
    </div>
  );
}

function CustomLegend({ payload }) {
  if (!payload?.length) return null;
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 px-4">
      {payload.map((entry, i) => (
        <li key={i} className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span
            className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-8">
      <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center mb-3">
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
            d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
          />
        </svg>
      </div>
      <p className="text-text-secondary text-sm">No data yet</p>
      <p className="text-text-secondary/60 text-xs mt-1">
        Complete some scans to see disease distribution
      </p>
    </div>
  );
}

export default function DiseaseChart() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !supabase) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      const { data: rows, error } = await supabase
        .from('detections')
        .select('disease')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !rows || rows.length === 0) {
        setLoading(false);
        return;
      }

      const freq = {};
      rows.forEach((r) => {
        const d = r.disease || 'Unknown';
        freq[d] = (freq[d] || 0) + 1;
      });

      const aggregated = Object.entries(freq)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setData(aggregated.length > 0 ? aggregated : null);
      setLoading(false);
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-md p-5 h-80 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-40 mb-4" />
        <div className="h-64 bg-white/5 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-md p-5">
      <h3 className="text-text-primary font-semibold text-lg mb-4">
        Disease Distribution
      </h3>
      {!data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                  stroke="rgba(255,255,255,0.08)"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}