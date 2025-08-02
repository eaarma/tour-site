"use client";

import Link from "next/link";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";
import TitleText from "../common/TitleText";
import HorizontalMenu from "../common/HorizontalMenu";
import MarginContainer from "../common/MarginContainer";

const Header: React.FC = () => {
  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Items", path: "/items" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <header className="bg-base-100 border-b shadow-md">
      <MarginContainer>
        <div className="flex justify-between items-center p-4">
          {/* Left: Title */}
          <div className="flex-shrink-0">
            <TitleText title="ShopEase" image="/tree.png" />
          </div>

          {/* Center: Navigation Menu */}
          <nav className="flex-grow flex justify-center">
            <HorizontalMenu items={menuItems} />
          </nav>

          {/* Right: Avatar + Cart */}
          <div className="flex items-center gap-4">
            <Link href="/auth/login/user" className="text-2xl text-primary">
              <FaUserCircle />
            </Link>
            <Link
              href="/cart"
              className="btn btn-sm btn-outline flex items-center"
            >
              <FaShoppingCart className="mr-2" />
              Cart
            </Link>
          </div>
        </div>
      </MarginContainer>
    </header>
  );
};

export default Header;
