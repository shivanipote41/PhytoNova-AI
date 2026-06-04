import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm() {
  const { signIn, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (!err) {
      window.location.href = '/';
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-md px-4 py-2 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm text-text-secondary mb-1" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1" htmlFor="login-password">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white rounded-md px-6 py-3 hover:bg-primary/90 transition disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <div className="text-center">
        <Link
          to="/forgot-password"
          className="text-sm text-text-secondary hover:text-primary transition"
        >
          Forgot password?
        </Link>
      </div>
    </form>
  );
}