type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  error?: string;
  description?: string;
};

export default function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  error,
  description,
}: NumberFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-base-content">{label}</span>
      {description ? (
        <p className="mt-1 text-sm text-base-content/60">{description}</p>
      ) : null}
      <input
        type="number"
        className={`input input-bordered mt-2 w-full ${
          error ? "input-error" : ""
        }`}
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {error ? (
        <span className="mt-2 block text-sm text-error">{error}</span>
      ) : null}
    </label>
  );
}
