"use client";

import { useCallback, useState } from "react";

import AdminStoreBrandingTab from "./AdminStoreBrandingTab";
import AdminStoreContactTab from "./AdminStoreContactTab";
import AdminStoreHomepageTab from "./AdminStoreHomepageTab";
import AdminStorePagesTab from "./AdminStorePagesTab";
import AdminStoreProfileTab from "./AdminStoreProfileTab";
import AdminStoreSeoTab from "./AdminStoreSeoTab";
import {
  EMPTY_STORE_CUSTOMIZATION_HEADER_META,
  type StoreCustomizationHeaderMeta,
} from "./storeCustomizationHeader";

type StoreCustomizationTabId =
  | "profile"
  | "branding"
  | "homepage"
  | "pages"
  | "contact"
  | "seo";

const STORE_CUSTOMIZATION_TABS = [
  {
    id: "profile",
    label: "Store",
    summary:
      "Update the website identity used in the header, footer, contact page, and browser tab.",
  },
  {
    id: "branding",
    label: "Branding",
    summary: "Theme, visual styling, and storefront presentation.",
  },
  {
    id: "homepage",
    label: "Homepage",
    summary: "Editable content for the public homepage layout sections.",
  },
  {
    id: "pages",
    label: "Pages",
    summary: "Public information pages and reusable storefront copy.",
  },
  {
    id: "contact",
    label: "Contact",
    summary: "Support channels, addresses, and business details.",
  },
  {
    id: "seo",
    label: "SEO",
    summary: "Metadata defaults, search previews, and indexing text.",
  },
] as const satisfies readonly {
  id: StoreCustomizationTabId;
  label: string;
  summary: string;
}[];

export default function StoreCustomizationSection() {
  const [activeTab, setActiveTab] =
    useState<StoreCustomizationTabId>("profile");
  const [headerMeta, setHeaderMeta] = useState<StoreCustomizationHeaderMeta>(
    EMPTY_STORE_CUSTOMIZATION_HEADER_META,
  );

  const activeTabConfig =
    STORE_CUSTOMIZATION_TABS.find((tab) => tab.id === activeTab) ??
    STORE_CUSTOMIZATION_TABS[0];

  const handleHeaderMetaChange = useCallback(
    (nextHeaderMeta: StoreCustomizationHeaderMeta) => {
      setHeaderMeta(nextHeaderMeta);
    },
    [],
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <AdminStoreProfileTab onHeaderMetaChange={handleHeaderMetaChange} />
        );
      case "branding":
        return (
          <AdminStoreBrandingTab onHeaderMetaChange={handleHeaderMetaChange} />
        );
      case "homepage":
        return (
          <AdminStoreHomepageTab onHeaderMetaChange={handleHeaderMetaChange} />
        );
      case "pages":
        return <AdminStorePagesTab onHeaderMetaChange={handleHeaderMetaChange} />;
      case "contact":
        return (
          <AdminStoreContactTab onHeaderMetaChange={handleHeaderMetaChange} />
        );
      case "seo":
        return <AdminStoreSeoTab onHeaderMetaChange={handleHeaderMetaChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="mb-4 space-y-6">
      <section className="bg-transparent">
        <div className="space-y-4 py-2 sm:py-3">
          <div
            role="tablist"
            aria-label="Store customization tabs"
            className="tabs tabs-boxed h-auto flex-wrap"
          >
            {STORE_CUSTOMIZATION_TABS.map((tab) => (
              <button
                key={tab.id}
                id={`store-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`store-panel-${tab.id}`}
                className={`tab h-auto px-4 py-2 text-sm ${
                  activeTab === tab.id ? "tab-active" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setHeaderMeta(EMPTY_STORE_CUSTOMIZATION_HEADER_META);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="border-t border-base-300/80">
            <div className="border-b border-base-300 px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-base-content">
                    {activeTabConfig.label}
                  </h3>
                  <p className="mt-1 text-sm text-base-content/60">
                    {activeTabConfig.summary}
                  </p>
                </div>

                {headerMeta.statusBadgeLabel || headerMeta.lastUpdatedLabel ? (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/55 sm:justify-end">
                    {headerMeta.statusBadgeLabel &&
                    headerMeta.statusBadgeClassName ? (
                      <span
                        className={`badge ${headerMeta.statusBadgeClassName}`}
                      >
                        {headerMeta.statusBadgeLabel}
                      </span>
                    ) : null}
                    {headerMeta.lastUpdatedLabel ? (
                      <span>{headerMeta.lastUpdatedLabel}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div
              id={`store-panel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`store-tab-${activeTab}`}
              className=""
            >
              {renderTabContent()}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
