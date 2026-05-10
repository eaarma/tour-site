"use client";

type HomeSectionHeadingProps = {
  title: string;
  eyebrow?: string;
  description?: string;
};

export default function HomeSectionHeading({
  title,
  eyebrow,
  description,
}: HomeSectionHeadingProps) {
  return (
    <div className="max-w-2xl space-y-3">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tight text-base-content sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-7 text-base-content/70">
          {description}
        </p>
      ) : null}
    </div>
  );
}
