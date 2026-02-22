"use client";

import Link from "next/link";
import TitleText from "../common/TitleText";

const Footer: React.FC = () => {
  return (
    <footer className="bg-base-100 border-t mt-8">
      <div className="page-container py-6">
        <div className="flex flex-col justify-center items-center text-center h-40">
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
          </div>

          {/* TitleText centered */}
          <TitleText title="TourHub" image="/tree.png" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
