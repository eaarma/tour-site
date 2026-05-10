import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  enabled?: boolean;
  onToggle?: (checked: boolean) => void;
  enabledLabel?: string;
  disabledLabel?: string;
  sectionClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
};

const joinClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export default function SectionCard({
  title,
  description,
  children,
  enabled,
  onToggle,
  enabledLabel = "Enabled",
  disabledLabel = "Hidden",
  sectionClassName,
  headerClassName,
  contentClassName,
}: SectionCardProps) {
  const hasToggle =
    typeof enabled === "boolean" && typeof onToggle === "function";

  return (
    <section
      className={joinClasses(
        "border-b border-base-300 bg-base-100",
        sectionClassName,
      )}
    >
      <div
        className={joinClasses(
          hasToggle
            ? "flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5"
            : "space-y-1 px-4 sm:px-5",
          headerClassName,
        )}
      >
        <div>
          <h4 className="text-base font-semibold text-base-content">{title}</h4>
          <p className="mt-1 text-sm text-base-content/65">{description}</p>
        </div>

        {hasToggle ? (
          <label className="flex items-center gap-3 self-start rounded-full border border-base-300 bg-base-200/55 px-3 py-2 text-sm text-base-content">
            <span>{enabled ? enabledLabel : disabledLabel}</span>
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={enabled}
              onChange={(event) => onToggle(event.target.checked)}
            />
          </label>
        ) : null}
      </div>

      <div
        className={joinClasses(
          hasToggle
            ? "space-y-4 px-4 py-4 sm:px-5"
            : "mt-5 space-y-4 px-4 sm:px-5",
          hasToggle && !enabled ? "opacity-70" : "",
          contentClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
