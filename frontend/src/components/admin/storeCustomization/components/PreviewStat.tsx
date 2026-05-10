type PreviewStatProps = {
  label: string;
  value: string;
  className: string;
};

export default function PreviewStat({
  label,
  value,
  className,
}: PreviewStatProps) {
  return (
    <div className={`rounded-2xl border border-base-300 p-3 ${className}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-base-content">{value}</p>
    </div>
  );
}
