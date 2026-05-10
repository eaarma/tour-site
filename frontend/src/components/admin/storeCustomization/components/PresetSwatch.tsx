type PresetSwatchProps = {
  label: string;
  color: string;
};

export default function PresetSwatch({ label, color }: PresetSwatchProps) {
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-1.5">
      <div
        className="h-8 rounded-md border border-base-300"
        style={{ backgroundColor: color }}
      />
      <p className="mt-1 text-center text-[11px] font-medium text-base-content/60">
        {label}
      </p>
    </div>
  );
}
