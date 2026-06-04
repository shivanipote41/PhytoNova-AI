/**
 * ChartCard — sharp design card wrapper for charts.
 * Uses solid bg with border, no glassmorphism.
 */
export default function ChartCard({ title, subtitle, children, className = '', ...props }) {
  return (
    <div
      className={`bg-white/[0.02] border border-white/10 rounded-md ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-6 pt-6 pb-4">
          {title && (
            <h3 className="text-base font-semibold text-text-primary leading-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
      )}
      <div className="h-64 sm:h-72 w-full px-2 pb-4">
        {children}
      </div>
    </div>
  );
}