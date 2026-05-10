import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/providers/ReduxProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import GlobalLoader from "@/components/common/GlobalLoader";
import SessionExpiredModal from "@/components/common/SessionExpiredModal";
import { getPublicStorefrontOrFallback } from "@/lib/storefront/publicStorefront";
import {
  buildStoreMetadata,
  buildStoreStructuredData,
} from "@/lib/storefront/storeSeo";
import {
  STOREFRONT_THEME_NAME,
  buildStorefrontThemeStyle,
} from "@/lib/storefront/storefrontTheme";

import localFont from "next/font/local";
import StripeProvider from "@/providers/StripeProvider";

const geistSans = localFont({
  src: "../fonts/Geist-Regular.ttf",
  variable: "--font-geist-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const storefront = await getPublicStorefrontOrFallback();
  const metadata = buildStoreMetadata({
    storefront,
  });

  return {
    ...metadata,
    icons: storefront.faviconUrl?.trim()
      ? {
          icon: storefront.faviconUrl.trim(),
        }
      : undefined,
  };
}

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const storefront = await getPublicStorefrontOrFallback();
  const storefrontThemeStyle = buildStorefrontThemeStyle(storefront);
  const structuredData = buildStoreStructuredData(storefront);

  return (
    <html
      lang="en"
      data-theme={STOREFRONT_THEME_NAME}
      style={storefrontThemeStyle}
      className={`${geistSans.variable} `}
    >
      <body className="flex flex-col min-h-screen bg-base-100 overflow-x-hidden">
        <ReduxProvider>
          <AuthProvider>
            <StripeProvider>
              <GlobalLoader />
              <SessionExpiredModal />
              <Header storefront={storefront} />
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(structuredData),
                }}
              />
              <main className="flex-grow">
                <div className="page-container">{children}</div>
              </main>
              <Toaster
                position="top-center"
                containerStyle={{
                  top: "5rem",
                }}
              />
              <Footer storefront={storefront} />
            </StripeProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

