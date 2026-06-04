import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function diseaseLabel(raw) {
  if (!raw) return 'Unknown';
  if (raw === 'Healthy') return 'Healthy';
  return raw.includes('___') ? raw.split('___').pop().replace(/_/g, ' ') : raw;
}

function diseaseColor(disease) {
  if (!disease || disease === 'Healthy') return 'text-primary';
  return 'text-amber-400';
}

function EmptyState() {
  const navigate = useNavigate();
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
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-text-secondary text-sm">No recent scans</p>
      <button
        onClick={() => navigate('/detect')}
        className="mt-3 px-4 py-2 text-sm text-primary border border-primary/30 rounded-md hover:bg-primary/10 transition-colors"
      >
        Start Scanning
      </button>
    </div>
  );
}

export default function RecentScans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !supabase) {
      setLoading(false);
      return;
    }

    async function fetchScans() {
      const { data, error } = await supabase
        .from('detections')
        .select('id, disease, confidence, created_at, image_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error || !data || data.length === 0) {
        setLoading(false);
        return;
      }
      setScans(data);
      setLoading(false);
    }

    fetchScans();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-md p-5 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-32 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-2 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!scans || scans.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-md p-5 flex flex-col gap-3">
      <h3 className="text-text-primary font-semibold text-lg mb-1">
        Recent Scans
      </h3>

      <ul className="flex flex-col gap-2">
        {scans.map((scan) => (
          <li key={scan.id}>
            <button
              onClick={() => navigate('/detect')}
              className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.02] transition-colors text-left group rounded-md"
            >
              <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10">
                {scan.image_url ? (
                  <img
                    src={scan.image_url}
                    alt={scan.disease}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="w-5 h-5 text-text-secondary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${diseaseColor(scan.disease)}`}>
                  {diseaseLabel(scan.disease)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1 bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.round((scan.confidence ?? 0) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary flex-shrink-0">
                    {Math.round((scan.confidence ?? 0) * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs text-text-secondary">
                  {formatDate(scan.created_at)}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}