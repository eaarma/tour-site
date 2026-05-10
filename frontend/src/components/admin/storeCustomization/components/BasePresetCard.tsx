import {
  getStorefrontBasePresetDefinition,
} from "@/lib/storefront/storefrontTheme";
import type { StorefrontBasePreset } from "@/types/storefront";

import PresetSwatch from "./PresetSwatch";

type BasePresetCardProps = {
  preset: StorefrontBasePreset;
  label: string;
  description: string;
  selected: boolean;
  onSelect: (preset: StorefrontBasePreset) => void;
};

export default function BasePresetCard({
  preset,
  label,
  description,
  selected,
  onSelect,
}: BasePresetCardProps) {
  const definition = getStorefrontBasePresetDefinition(preset);
  const isDark = definition.colorScheme === "dark";

  return (
    <button
      type="button"
      className={`rounded-xl border p-3 text-left transition ${
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-base-300 bg-base-200/35 hover:border-primary/35 hover:bg-base-200/55"
      }`}
      onClick={() => onSelect(preset)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-base-content">
              {label}
            </p>
          </div>
          <p className="mt-1 text-xs leading-5 text-base-content/65">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="badge badge-ghost badge-xs whitespace-nowrap">
            {isDark ? "Dark" : "Light"}
          </span>
          {selected ? (
            <span className="badge badge-primary badge-outline badge-sm whitespace-nowrap">
              On
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <PresetSwatch label="100" color={definition.base100} />
        <PresetSwatch label="200" color={definition.base200} />
        <PresetSwatch label="300" color={definition.base300} />
      </div>
    </button>
  );
}

