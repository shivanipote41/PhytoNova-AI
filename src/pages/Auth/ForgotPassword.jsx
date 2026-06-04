import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const redirectTo = siteUrl + '/auth';

    if (!supabase) {
      // Graceful degradation when Supabase is not configured
      setMessage('Password reset link would be sent to: ' + email);
      setLoading(false);
      return;
    }

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      setMessage('Check your email for a password reset link.');
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-white/[0.02] border border-white/10 rounded-md w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Reset Password</h1>
          <p className="mt-2 text-text-secondary text-sm">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-md px-4 py-2 text-red-400 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-primary/10 border border-primary/30 rounded-md px-4 py-2 text-primary text-sm">
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm text-text-secondary mb-1" htmlFor="fp-email">
              Email
            </label>
            <input
              id="fp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-[#0a0a0a] border border-white/15 rounded-md px-4 py-2 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-md px-6 py-3 hover:bg-primary/90 transition disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/auth"
            className="text-sm text-text-secondary hover:text-primary transition"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}