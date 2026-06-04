import { useEffect, useState } from 'react';
import { getTreatment } from '../../utils/treatments';

function ConfidenceBar({ confidence }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const target = Math.round(confidence * 100);
    const step = Math.ceil(target / 40);
    let current = 0;
    const id = setInterval(() => {
      current = Math.min(current + step, target);
      setPct(current);
      if (current >= target) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [confidence]);

  const color =
    pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400';

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-text-secondary">Confidence</span>
        <span className="text-text-primary font-medium">{pct}%</span>
      </div>
      <div className="h-3 bg-white/10 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ResultPanel({ result, preview }) {
  if (!result) return null;

  const treatment = getTreatment(result.label);

  return (
    <div className="border border-white/10 bg-white/[0.02] rounded-md p-6 space-y-6">
      {/* Preview + label */}
      <div className="flex gap-5 items-start">
        {preview && (
          <img
            src={preview}
            alt="Uploaded plant"
            className="w-24 h-24 object-cover flex-shrink-0 border border-white/10"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-text-secondary text-sm mb-1">Detected Disease</p>
          <h2 className="text-xl font-bold text-text-primary leading-snug">
            {result.label.replace(/_/g, ' ')}
          </h2>
        </div>
      </div>

      {/* Confidence bar */}
      <ConfidenceBar confidence={result.confidence} />

      {/* Treatment */}
      <div className="space-y-3">
        <h3 className="text-text-primary font-semibold text-lg">
          {treatment.title}
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          {treatment.description}
        </p>

        {treatment.steps.length > 0 && (
          <ol className="space-y-2 mt-4">
            {treatment.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-text-primary">
                <span className="flex-shrink-0 w-6 h-6 rounded-sm bg-primary text-background flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span className="leading-snug pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}