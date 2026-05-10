import type { CSSProperties } from "react";

import {
  DEFAULT_STOREFRONT_SETTINGS,
  type StorefrontBasePreset,
  type StorefrontSettingsDto,
} from "@/types/storefront";

type ThemeColorScheme = "light" | "dark";

type StorefrontBasePresetDefinition = {
  label: string;
  description: string;
  colorScheme: ThemeColorScheme;
  base100: string;
  base200: string;
  base300: string;
  base400: string;
  baseContent: string;
  neutral: string;
  secondary: string;
};

type ThemeVariables = Record<`--${string}`, string>;
type ThemeSource = Pick<
  StorefrontSettingsDto,
  "accentColor" | "basePreset" | "primaryColor"
>;

const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

const STOREFRONT_BASE_PRESETS: Record<
  StorefrontBasePreset,
  StorefrontBasePresetDefinition
> = {
  SLATE: {
    label: "Slate",
    description: "Clean blue-gray surfaces close to the current storefront.",
    colorScheme: "light",
    base100: "#f9fafb",
    base200: "#eef2f7",
    base300: "#d9e2ec",
    base400: "#b7c6d6",
    baseContent: "#1f2937",
    neutral: "#374151",
    secondary: "#059669",
  },
  DARK: {
    label: "Dark",
    description: "Deep charcoal surfaces with brighter content contrast.",
    colorScheme: "dark",
    base100: "#0f172a",
    base200: "#182235",
    base300: "#263247",
    base400: "#3d4d66",
    baseContent: "#e5edf7",
    neutral: "#465468",
    secondary: "#38bdf8",
  },
  CONTRAST: {
    label: "Contrast",
    description: "Bold high-contrast surfaces for a sharper editorial mood.",
    colorScheme: "dark",
    base100: "#05070d",
    base200: "#10151f",
    base300: "#1d2531",
    base400: "#374151",
    baseContent: "#f8fafc",
    neutral: "#111827",
    secondary: "#f97316",
  },
  WARM: {
    label: "Warm",
    description: "Soft paper-like surfaces with a more welcoming tone.",
    colorScheme: "light",
    base100: "#faf3eb",
    base200: "#f4e7d8",
    base300: "#e5d1bb",
    base400: "#cdb295",
    baseContent: "#4a3327",
    neutral: "#73513f",
    secondary: "#c26d3f",
  },
  LUXURY: {
    label: "Luxury",
    description: "Moody premium surfaces with richer depth and contrast.",
    colorScheme: "dark",
    base100: "#15141b",
    base200: "#211f28",
    base300: "#302c37",
    base400: "#494352",
    baseContent: "#f5efe2",
    neutral: "#6e5931",
    secondary: "#d4b06a",
  },
  MODERN: {
    label: "Modern",
    description: "Crisp polished surfaces with cool contemporary contrast.",
    colorScheme: "light",
    base100: "#f5f7fb",
    base200: "#e8edf5",
    base300: "#d1dae7",
    base400: "#b2bfd1",
    baseContent: "#162132",
    neutral: "#334155",
    secondary: "#2563eb",
  },
  NATURE: {
    label: "Nature",
    description: "Calmer green-tinted surfaces for an organic feel.",
    colorScheme: "light",
    base100: "#f4f8f0",
    base200: "#e6efe0",
    base300: "#cfdfc4",
    base400: "#aebf9f",
    baseContent: "#233127",
    neutral: "#365243",
    secondary: "#6b8f44",
  },
  OCEAN: {
    label: "Ocean",
    description: "Cool sea-glass surfaces with a breezier coastal feel.",
    colorScheme: "light",
    base100: "#f2fbfc",
    base200: "#def3f5",
    base300: "#bfe1e6",
    base400: "#94c2ca",
    baseContent: "#18353c",
    neutral: "#2f5d67",
    secondary: "#0f766e",
  },
  PLAYFUL: {
    label: "Playful",
    description: "Brighter tinted surfaces with a lighter, more energetic tone.",
    colorScheme: "light",
    base100: "#fff8fb",
    base200: "#ffedf4",
    base300: "#f8d3e3",
    base400: "#dfb0c7",
    baseContent: "#3f2231",
    neutral: "#7c3f5b",
    secondary: "#14b8a6",
  },
  PASTEL: {
    label: "Pastel",
    description: "Soft tinted neutrals with gentle contrast.",
    colorScheme: "light",
    base100: "#faf7ff",
    base200: "#f2ecfb",
    base300: "#e1d7f1",
    base400: "#c5b7db",
    baseContent: "#342b4f",
    neutral: "#7c6aa8",
    secondary: "#8b9cf4",
  },
  SUNSET: {
    label: "Sunset",
    description: "Warm peach and coral surfaces with a softer glow.",
    colorScheme: "light",
    base100: "#fff6f1",
    base200: "#ffe6d9",
    base300: "#f7c9b5",
    base400: "#e2a88f",
    baseContent: "#4a2d22",
    neutral: "#8b4f3d",
    secondary: "#ea580c",
  },
  MINIMAL: {
    label: "Minimal",
    description: "Neutral monochrome surfaces with restrained visual noise.",
    colorScheme: "light",
    base100: "#fcfcfb",
    base200: "#f1f1ef",
    base300: "#dfdfdb",
    base400: "#c4c4be",
    baseContent: "#1f1f1d",
    neutral: "#525252",
    secondary: "#737373",
  },
};

const expandShortHex = (hex: string) =>
  `#${hex
    .slice(1)
    .split("")
    .map((character) => `${character}${character}`)
    .join("")}`;

const clampByte = (value: number) => Math.max(0, Math.min(255, value));

const parseHexColor = (hex: string) => {
  const normalized = hex.length === 4 ? expandShortHex(hex) : hex;
  const raw = normalized.slice(1);

  return {
    r: Number.parseInt(raw.slice(0, 2), 16),
    g: Number.parseInt(raw.slice(2, 4), 16),
    b: Number.parseInt(raw.slice(4, 6), 16),
  };
};

const toHexColor = ({ r, g, b }: { r: number; g: number; b: number }) =>
  `#${[r, g, b]
    .map((channel) =>
      clampByte(Math.round(channel)).toString(16).padStart(2, "0"),
    )
    .join("")}`;

const mixHexColors = (firstHex: string, secondHex: string, ratio: number) => {
  const first = parseHexColor(firstHex);
  const second = parseHexColor(secondHex);
  const mix = Math.max(0, Math.min(1, ratio));

  return toHexColor({
    r: first.r + (second.r - first.r) * mix,
    g: first.g + (second.g - first.g) * mix,
    b: first.b + (second.b - first.b) * mix,
  });
};

const getReadableTextColor = (hex: string) => {
  const { r, g, b } = parseHexColor(hex);
  const toLinear = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  return luminance > 0.48 ? "#111827" : "#f8fafc";
};

export const STOREFRONT_THEME_NAME = "light_custom";

export const STOREFRONT_BASE_PRESET_OPTIONS: ReadonlyArray<{
  value: StorefrontBasePreset;
  label: string;
  description: string;
}> = Object.entries(STOREFRONT_BASE_PRESETS).map(([value, definition]) => ({
  value: value as StorefrontBasePreset,
  label: definition.label,
  description: definition.description,
}));

export function normalizeHexColor(
  value: string | null | undefined,
  fallback: string,
) {
  const candidate = value?.trim() ?? "";

  if (!HEX_COLOR_PATTERN.test(candidate)) {
    return fallback.toLowerCase();
  }

  return (candidate.length === 4 ? expandShortHex(candidate) : candidate).toLowerCase();
}

export function normalizeStorefrontBasePreset(
  value: string | null | undefined,
): StorefrontBasePreset {
  if (!value) {
    return DEFAULT_STOREFRONT_SETTINGS.basePreset;
  }

  return value in STOREFRONT_BASE_PRESETS
    ? (value as StorefrontBasePreset)
    : DEFAULT_STOREFRONT_SETTINGS.basePreset;
}

export function getStorefrontBasePresetDefinition(
  value: string | null | undefined,
) {
  return STOREFRONT_BASE_PRESETS[normalizeStorefrontBasePreset(value)];
}

export function buildStorefrontThemeVariables(
  source: ThemeSource,
): ThemeVariables {
  const preset = getStorefrontBasePresetDefinition(source.basePreset);
  const primary = normalizeHexColor(
    source.primaryColor,
    DEFAULT_STOREFRONT_SETTINGS.primaryColor,
  );
  const accent = normalizeHexColor(
    source.accentColor,
    DEFAULT_STOREFRONT_SETTINGS.accentColor,
  );
  const hoverMixTarget = preset.colorScheme === "dark" ? "#ffffff" : "#0f172a";

  return {
    "--color-primary": primary,
    "--color-primary-content": getReadableTextColor(primary),
    "--color-accent": accent,
    "--color-accent-content": getReadableTextColor(accent),
    "--color-secondary": preset.secondary,
    "--color-secondary-content": getReadableTextColor(preset.secondary),
    "--color-neutral": preset.neutral,
    "--color-neutral-content": getReadableTextColor(preset.neutral),
    "--color-base-100": preset.base100,
    "--color-base-200": preset.base200,
    "--color-base-300": preset.base300,
    "--color-base-400": preset.base400,
    "--color-base-content": preset.baseContent,
    "--color-primary-hover": mixHexColors(primary, hoverMixTarget, 0.12),
    "--color-info": "#3b82f6",
    "--color-success": "#16a34a",
    "--color-warning": "#f59e0b",
    "--color-error": "#ef4444",
    "--color-sky-300": mixHexColors(primary, "#ffffff", 0.42),
    "--color-sky-400": mixHexColors(primary, "#ffffff", 0.22),
  };
}

export function buildStorefrontThemeStyle(source: ThemeSource) {
  const preset = getStorefrontBasePresetDefinition(source.basePreset);

  return {
    colorScheme: preset.colorScheme,
    ...buildStorefrontThemeVariables(source),
  } satisfies CSSProperties & ThemeVariables;
}

export function applyStorefrontThemeToDocument(source: ThemeSource) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const preset = getStorefrontBasePresetDefinition(source.basePreset);
  const variables = buildStorefrontThemeVariables(source);

  root.setAttribute("data-theme", STOREFRONT_THEME_NAME);
  root.style.colorScheme = preset.colorScheme;

  Object.entries(variables).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}
