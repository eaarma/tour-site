import { formatDuration } from "./formatDuration";

const RAW_DURATIONS = [
  5, 10, 15, 30, 60, 120, 180, 240, 480, 720, 1440, 2880, 10080,
];

export const DURATION_OPTIONS = RAW_DURATIONS.map((minutes) => ({
  value: minutes,
  label: formatDuration(minutes),
}));
