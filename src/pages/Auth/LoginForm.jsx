import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm() {
  const { signIn, signInWithGoogle, error } = useAuth();

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
          className="w-full bg-[#0a0a0a] border border-white/15 rounded-md px-4 py-2 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
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
          className="w-full bg-[#0a0a0a] border border-white/15 rounded-md px-4 py-2 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white rounded-md px-6 py-3 hover:bg-primary/90 transition disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-white/10" />
        <span className="mx-4 text-xs text-text-secondary">or</span>
        <div className="flex-grow border-t border-white/10" />
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        className="w-full flex items-center justify-center gap-2 bg-white/[0.02] border border-white/10 text-text-primary rounded-md px-6 py-3 hover:bg-white/[0.04] transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
      >
        <FcGoogle className="w-5 h-5" />
        <span className="text-sm font-medium">Continue with Google</span>
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