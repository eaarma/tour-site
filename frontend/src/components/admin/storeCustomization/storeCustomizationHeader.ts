export type StoreCustomizationHeaderMeta = {
  statusBadgeClassName: string | null;
  statusBadgeLabel: string | null;
  lastUpdatedLabel: string | null;
};

export type StoreCustomizationTabProps = {
  onHeaderMetaChange?: (meta: StoreCustomizationHeaderMeta) => void;
};

export const EMPTY_STORE_CUSTOMIZATION_HEADER_META: StoreCustomizationHeaderMeta =
  {
    statusBadgeClassName: null,
    statusBadgeLabel: null,
    lastUpdatedLabel: null,
  };

export const formatStoreCustomizationDateTime = (value?: string) => {
  if (!value) return "Not saved yet";

  const parsedValue = new Date(value);

  if (Number.isNaN(parsedValue.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedValue);
};
