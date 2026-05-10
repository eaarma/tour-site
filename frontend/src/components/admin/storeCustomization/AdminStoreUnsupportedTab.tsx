"use client";

import { useEffect } from "react";

import { type StoreCustomizationTabProps } from "./storeCustomizationHeader";

type Props = StoreCustomizationTabProps & {
  title: string;
  description: string;
  missingCapabilities: string[];
  nextStep: string;
};

export default function AdminStoreUnsupportedTab({
  title,
  description,
  missingCapabilities,
  nextStep,
  onHeaderMetaChange,
}: Props) {
  useEffect(() => {
    onHeaderMetaChange?.({
      statusBadgeClassName: "badge-ghost",
      statusBadgeLabel: "Planned",
      lastUpdatedLabel: "Awaiting EcommerceProject data support",
    });
  }, [onHeaderMetaChange]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="space-y-1">
          <h4 className="text-base font-semibold text-base-content">{title}</h4>
          <p className="text-sm text-base-content/65">{description}</p>
        </div>

        <div className="mt-5 rounded-2xl bg-base-200/45 p-4 text-sm text-base-content/80">
          <p className="font-medium text-base-content">
            This tab is intentionally scaffolded first.
          </p>
          <p className="mt-2">
            The admin shell now matches the source project more closely, but
            these controls still need backend fields and services before they
            can become editable.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-sm font-medium text-base-content">
            Missing capabilities in EcommerceProject
          </p>
          <ul className="space-y-2 text-sm text-base-content/75">
            {missingCapabilities.map((item) => (
              <li
                key={item}
                className="rounded-xl bg-base-200/45 px-4 py-3 leading-6"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <aside className="rounded-2xl border border-base-300 bg-base-200/35 p-5 shadow-sm">
        <h4 className="text-base font-semibold text-base-content">
          Next implementation step
        </h4>
        <p className="mt-3 text-sm leading-6 text-base-content/75">
          {nextStep}
        </p>
      </aside>
    </div>
  );
}
