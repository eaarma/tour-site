"use client";

import Link from "next/link";
import TitleText from "../common/TitleText";
import type { StorefrontSettingsDto } from "@/types/storefront";

type FooterProps = {
  storefront: StorefrontSettingsDto;
};

const Footer: React.FC<FooterProps> = ({ storefront }) => {
  const storefrontName = storefront.siteName?.trim() || "TourHub";
  const brandImage = storefront.logoUrl?.trim() || null;
  const contactEmail = storefront.contactEmail?.trim() || null;

  return (
    <footer className="bg-base-100 border-t">
      <div className="page-container py-6">
        <div className="flex min-h-40 flex-col items-center justify-center text-center">
          {/* Links section */}
          <div className="flex flex-wrap justify-center gap-6 mb-4 text-sm">
            <Link href="/legal/faq" className="link link-hover">
              FAQ
            </Link>
            <Link href="/legal/terms" className="link link-hover">
              Terms of Service
            </Link>
            <Link href="/legal/privacy" className="link link-hover">
              Privacy Policy
            </Link>
            <Link href="/legal/refund" className="link link-hover">
              Cancellation & Refund Policy
            </Link>
            <Link href="/about" className="link link-hover">
              About
            </Link>
          </div>

          {/* TitleText centered */}
          <TitleText title={storefrontName} image={brandImage} />

          {contactEmail ? (
            <p className="mt-3 text-sm text-base-content/65">
              <a className="link link-hover" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
