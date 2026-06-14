export function LoadingIndicator({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="loading-spinner" aria-hidden="true" />
      {label && <span>{label}</span>}
    </span>
  );
}
