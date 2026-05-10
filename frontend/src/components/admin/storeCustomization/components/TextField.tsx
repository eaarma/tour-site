type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  type?: "text" | "email" | "url";
  layout?: "block" | "grid";
};

export default function TextField({
  label,
  value,
  onChange,
  error,
  placeholder,
  maxLength,
  type = "text",
  layout = "block",
}: TextFieldProps) {
  const isGrid = layout === "grid";

  return (
    <label className={isGrid ? "grid gap-2" : "block"}>
      <span className="text-sm font-medium text-base-content">{label}</span>
      <input
        type={type}
        className={`input input-bordered w-full ${
          isGrid ? "" : "mt-2 "
        }${error ? "input-error" : ""}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
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
