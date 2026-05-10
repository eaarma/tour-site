type TextAreaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  layout?: "block" | "grid";
};

export default function TextAreaField({
  label,
  value,
  onChange,
  error,
  placeholder,
  rows = 4,
  maxLength,
  layout = "block",
}: TextAreaFieldProps) {
  const isGrid = layout === "grid";

  return (
    <label className={isGrid ? "grid gap-2" : "block"}>
      <span className="text-sm font-medium text-base-content">{label}</span>
      <textarea
        className={`textarea textarea-bordered min-h-[7rem] w-full ${
          isGrid ? "" : "mt-2 "
        }${error ? "textarea-error" : ""}`}
        value={value}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
      {maxLength ? (
        <span className="text-xs text-base-content/45">
          {value.trim().length}/{maxLength}
        </span>
      ) : null}
      {error ? <span className="text-sm text-error">{error}</span> : null}
    </label>
  );
}
