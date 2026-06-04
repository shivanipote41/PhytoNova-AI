import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../services/supabase';

function getInitials(email) {
  if (!email) return '?';
  const name = email.split('@')[0];
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(email) {
  if (!email) return '#22c55e';
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 40%)`;
}

function formatDate(iso) {
  if (!iso) return 'Unknown';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!user) return;
    getProfile(user.id)
      .then(({ data }) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));
  }, [user]);

  if (authLoading || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const avatarColor = getAvatarColor(user.email);
  const initials = getInitials(user.email);
  const displayName = user.user_metadata?.full_name || profile?.full_name || user.email.split('@')[0];

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-text-primary"
        >
          Your Profile
        </motion.h1>

        <div className="bg-white/[0.02] border border-white/10 rounded-md p-8 flex flex-col items-center text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>

          <h2 className="text-xl font-semibold text-text-primary mb-1">
            {displayName}
          </h2>
          <p className="text-text-secondary text-sm mb-6">{user.email}</p>

          <div className="w-full border-t border-white/10 pt-6 space-y-4 text-left">
            <div className="flex justify-between">
              <span className="text-text-secondary text-sm">Member since</span>
              <span className="text-text-primary text-sm">{formatDate(user.created_at)}</span>
            </div>
            {profile?.avatar_url && (
              <div className="flex justify-between">
                <span className="text-text-secondary text-sm">Avatar</span>
                <a
                  href={profile.avatar_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline"
                >
                  View
                </a>
              </div>
            )}
          </div>

          <button
            onClick={handleSignOut}
            className="mt-8 w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-md px-6 py-3 hover:opacity-90 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}