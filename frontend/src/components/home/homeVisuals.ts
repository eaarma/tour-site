const DEFAULT_HOME_IMAGE = "/images/item_placeholder.jpg";

export function getBackgroundImageValue(imageUrl?: string | null) {
  const resolvedUrl =
    typeof imageUrl === "string" && imageUrl.trim().length > 0
      ? imageUrl.trim()
      : DEFAULT_HOME_IMAGE;

  return `url("${resolvedUrl.replace(/"/g, '\\"')}")`;
}
