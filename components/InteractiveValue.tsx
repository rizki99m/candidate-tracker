export function InteractiveValue({
  value,
  truncate = true,
  className = "",
}: {
  value: string;
  truncate?: boolean;
  className?: string;
}) {
  if (!value) return "-";

  const href = getInteractiveHref(value);
  const label = truncate ? truncateText(value) : value;

  if (!href) return label;

  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
      className={`font-semibold text-emerald-700 underline-offset-2 hover:underline ${className}`}
    >
      {label}
    </a>
  );
}

export function truncateText(value: string, maxLength = 80) {
  if (!value) return "-";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}

function getInteractiveHref(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return `mailto:${trimmed}`;
  }

  const digits = trimmed.replace(/\D/g, "");
  const looksLikePhone =
    digits.length >= 9 &&
    digits.length <= 15 &&
    (digits.startsWith("0") || digits.startsWith("62"));

  if (!looksLikePhone) return "";

  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}`;
}
