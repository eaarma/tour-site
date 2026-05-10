function isBulletBlock(lines: string[]) {
  return lines.length > 0 && lines.every((line) => line.startsWith("- "));
}

function normalizeBlocks(text: string) {
  return text
    .split(/\n\s*\n/g)
    .map((block) =>
      block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .filter((block) => block.length > 0);
}

export default function StorePageRichText({
  text,
  paragraphClassName = "text-base leading-7 text-base-content/70",
  listClassName = "list-disc space-y-1 pl-5 text-base leading-7 text-base-content/70",
}: {
  text: string;
  paragraphClassName?: string;
  listClassName?: string;
}) {
  const blocks = normalizeBlocks(text);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        if (isBulletBlock(block)) {
          return (
            <ul key={`list-${index}`} className={listClassName}>
              {block.map((line) => (
                <li key={line}>{line.replace(/^- /, "")}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`paragraph-${index}`} className={paragraphClassName}>
            {block.join(" ")}
          </p>
        );
      })}
    </div>
  );
}
