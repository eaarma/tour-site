export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterCategory {
  key: string;
  label: string;
  options: (string | FilterOption)[];
}
