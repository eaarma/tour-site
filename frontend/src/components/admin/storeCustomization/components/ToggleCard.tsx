type ToggleCardProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function ToggleCard({
  label,
  description,
  checked,
  onChange,
}: ToggleCardProps) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-base-300 bg-base-200/20 p-4">
      <div className="min-w-0">
        <p className="font-medium text-base-content">{label}</p>
        <p className="mt-1 text-sm leading-6 text-base-content/60">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        className="toggle toggle-primary mt-1"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
