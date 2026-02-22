import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/providers/ReduxProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import GlobalLoader from "@/components/common/GlobalLoader";
import SessionExpiredModal from "@/components/common/SessionExpiredModal";

import localFont from "next/font/local";
import StripeProvider from "@/providers/StripeProvider";

const geistSans = localFont({
  src: "../fonts/Geist-Regular.ttf",
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TourHub",
  description: "Explore and Book Amazing Tours",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" className={`${geistSans.variable} `}>
      <body className="flex flex-col min-h-screen bg-base-100 overflow-x-hidden">
        <ReduxProvider>
          <AuthProvider>
            <StripeProvider>
              <GlobalLoader />
              <SessionExpiredModal />
              <Header />
              <main className="flex-grow">
                <div className="page-container">{children}</div>
              </main>
              <Toaster
                position="top-center"
                containerStyle={{
                  top: "5rem",
                }}
              />
              <Footer />
            </StripeProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
