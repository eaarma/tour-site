type OptionCardOption = {
  value: string;
  label: string;
  description: string;
};

type OptionCardsProps = {
  label: string;
  options: OptionCardOption[];
  value: string;
  onChange: (value: string) => void;
};

export default function OptionCards({
  label,
  options,
  value,
  onChange,
}: OptionCardsProps) {
  return (
    <div>
      <p className="text-sm font-medium text-base-content">{label}</p>
      <div className="mt-2 gap-3 space-y-4">
        {options.map((option) => (
          <button
            key={`${label}-${option.value}`}
            type="button"
            className={`rounded-2xl border p-4 text-left transition ${
              value === option.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-base-300 bg-base-200/35 hover:border-primary/35"
            }`}
            onClick={() => onChange(option.value)}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-base-content">
                {option.label}
              </p>
              {value === option.value ? (
                <span className="badge badge-primary badge-outline">On</span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-base-content/65">
              {option.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
