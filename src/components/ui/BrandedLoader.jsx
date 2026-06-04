import { useEffect, useState } from 'react';
import { GiPlantSeed } from 'react-icons/gi';

/**
 * Vercel-inspired branded loading screen.
 * Shows a sleek progress bar with PhytoNova branding — no spinner, no dots.
 * Full-screen, centered, dark theme.
 */
export default function BrandedLoader() {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Simulate a smooth progress ramp; caller can also show/hide via CSS/conditional render
    const steps = [10, 25, 40, 55, 70, 85, 100];
    let i = 0;
    const tick = () => {
      if (i < steps.length) {
        setProgress(steps[i]);
        i++;
        setTimeout(tick, 180 + i * 40);
      }
    };
    const start = setTimeout(tick, 80);
    return () => clearTimeout(start);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
      role="status"
      aria-label="Loading PhytoNova"
    >
      {/* Logo + wordmark */}
      <div className="flex items-center gap-3 mb-10">
        <GiPlantSeed className="w-9 h-9 text-emerald-400" aria-hidden="true" />
        <span className="text-2xl font-bold text-slate-50 tracking-tight">
          PhytoNova
        </span>
      </div>

      {/* Progress bar track */}
      <div className="w-56 sm:w-72 h-1 rounded-full bg-white/10 overflow-hidden">
        {/* Progress fill */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Label */}
      <p className="mt-4 text-xs text-slate-500 font-mono tracking-widest uppercase">
        {progress < 100 ? 'Loading experience' : 'Ready'}
      </p>
    </div>
  );
}