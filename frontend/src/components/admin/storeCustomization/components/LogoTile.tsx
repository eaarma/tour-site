type LogoTileProps = {
  imageUrl: string | null;
  label: string;
};

export default function LogoTile({ imageUrl, label }: LogoTileProps) {
  if (imageUrl) {
    return (
      <img src={imageUrl} alt={label} className="h-full w-full object-cover" />
    );
  }

  return (
    <span className="text-lg font-semibold text-base-content/60">
      {label.trim().charAt(0).toUpperCase() || "T"}
    </span>
  );
}
