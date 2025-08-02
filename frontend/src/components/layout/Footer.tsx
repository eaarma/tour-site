"use client";

import Link from "next/link";
import TitleText from "../common/TitleText";
import MarginContainer from "../common/MarginContainer";

const Footer: React.FC = () => {
  return (
    <footer className="bg-base-200 border-t p-6 mt-8">
      <MarginContainer>
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
        <div className="flex justify-center">
          <TitleText title="ShopEase" image="/tree.png" />
        </div>
      </MarginContainer>
    </footer>
  );
};

export default Footer;
