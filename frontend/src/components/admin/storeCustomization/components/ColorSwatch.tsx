import { normalizeHexColor } from "@/lib/storefront/storefrontTheme";

type ColorSwatchProps = {
  label: string;
  value: string;
  color: string;
  fallbackColor: string;
};

export default function ColorSwatch({
  label,
  value,
  color,
  fallbackColor,
}: ColorSwatchProps) {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">
        {label}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <span
          className="h-10 w-10 rounded-xl border border-base-300"
          style={{ backgroundColor: normalizeHexColor(color, fallbackColor) }}
        />
        <span className="font-mono text-sm text-base-content/75">{value}</span>
      </div>
    </div>
  );
}

