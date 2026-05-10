type SummaryRowProps = {
  label: string;
  value: string;
};

export default function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-medium text-base-content">{value}</span>
    </div>
  );
}
