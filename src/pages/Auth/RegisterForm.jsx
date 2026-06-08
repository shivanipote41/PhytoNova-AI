import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { signUp, error } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError('');

    // Validate username: only alphabets
    if (!username.trim()) {
      setLocalError('Username is required.');
      return;
    }
    if (!/^[a-zA-Z]+$/.test(username)) {
      setLocalError('Username must contain only alphabets (no numbers, underscores, or special characters).');
      return;
    }

    // Validate password: at least 10 characters
    if (password.length < 10) {
      setLocalError('Password must be at least 10 characters.');
      return;
    }
    if (password !== confirm) {
      setLocalError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: err } = await signUp(email, password);
    setLoading(false);

    if (err) {
      setLocalError(err.message);
    } else {
      navigate('/', { replace: true });
    }
  }

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {displayError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-md px-4 py-2 text-red-400 text-sm">
          {displayError}
        </div>
      )}

      <div>
        <label className="block text-sm text-text-secondary mb-1" htmlFor="reg-username">
          Username
        </label>
        <input
          id="reg-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Alphabets only"
          required
          className="w-full bg-[#0a0a0a] border border-white/15 rounded-md px-4 py-2 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1" htmlFor="reg-email">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full bg-[#0a0a0a] border border-white/15 rounded-md px-4 py-2 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1" htmlFor="reg-password">
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 10 characters"
          required
          className="w-full bg-[#0a0a0a] border border-white/15 rounded-md px-4 py-2 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1" htmlFor="reg-confirm">
          Confirm Password
        </label>
        <input
          id="reg-confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat your password"
          required
          className="w-full bg-[#0a0a0a] border border-white/15 rounded-md px-4 py-2 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white rounded-md px-6 py-3 hover:bg-primary/90 transition disabled:opacity-50"
      >
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
}