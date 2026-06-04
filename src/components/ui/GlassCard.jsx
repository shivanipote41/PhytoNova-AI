export default function GlassCard({ children, className = '', ...props }) {
  return (
    <div className={`bg-white/[0.02] border border-white/[0.08] rounded-md ${className}`} {...props}>
      {children}
    </div>
  );
}