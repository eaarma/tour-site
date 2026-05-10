type ColorFieldProps = {
  label: string;
  description: string;
  value: string;
  fallbackColor: string;
  error?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onPickerChange?: (value: string) => void;
  onTextChange?: (value: string) => void;
  descriptionClassName?: string;
};

const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{6})$/i;

export default function ColorField({
  label,
  description,
  value,
  fallbackColor,
  error,
  placeholder = "#ffffff",
  onChange,
  onPickerChange,
  onTextChange,
  descriptionClassName = "mt-1",
}: ColorFieldProps) {
  const handlePickerChange = onPickerChange ?? onChange;
  const handleTextChange = onTextChange ?? onChange;

  return (
    <label className="block rounded-2xl border border-base-300 bg-base-200/35 p-4">
      <span className="text-sm font-medium text-base-content">{label}</span>
      <p className={`${descriptionClassName} text-sm text-base-content/60`}>
        {description}
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="color"
          className="h-14 w-full cursor-pointer rounded-xl border border-base-300 bg-base-100 px-1 sm:w-20"
          value={HEX_COLOR_PATTERN.test(value) ? value : fallbackColor}
          onChange={(event) => handlePickerChange?.(event.target.value)}
        />
        <input
          type="text"
          className={`input input-bordered w-full font-mono ${
            error ? "input-error" : ""
          }`}
          value={value}
          onChange={(event) => handleTextChange?.(event.target.value)}
          maxLength={7}
          placeholder={placeholder}
        />
      </div>
      {error ? <span className="mt-2 text-sm text-error">{error}</span> : null}
    </label>
  );
}
