type FaviconTileProps = {
  imageUrl: string | null;
};

export default function FaviconTile({ imageUrl }: FaviconTileProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt="Website favicon"
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <span className="text-xs font-semibold uppercase text-base-content/45">
      ico
    </span>
  );
}
