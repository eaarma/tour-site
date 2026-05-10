type PreviewRowProps = {
  label: string;
  value: string;
  multiline?: boolean;
};

export default function PreviewRow({
  label,
  value,
  multiline = false,
}: PreviewRowProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
        {label}
      </p>
      <p
        className={`mt-1 break-words leading-6 ${
          multiline ? "whitespace-pre-line" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
