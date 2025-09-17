export function formatDuration(minutes: number | null | undefined): string {
  if (minutes == null || minutes <= 0) return "Unknown";

  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""}`;

  const hours = minutes / 60;
  if (hours < 24)
    return `${hours % 1 === 0 ? hours : hours.toFixed(1)} hour${
      hours === 1 ? "" : "s"
    }`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day";
  if (days > 1 && days < 7) return `${days} days`;
  if (days >= 7)
    return `${Math.floor(days / 7)} week${days / 7 > 1 ? "s" : ""}`;

  return "Unknown";
}
