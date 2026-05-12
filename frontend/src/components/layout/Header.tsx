"use client";

import Link from "next/link";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { clearUser } from "@/store/authSlice";
import { usePathname, useRouter } from "next/navigation";
import TitleText from "../common/TitleText";
import HorizontalMenu from "../common/HorizontalMenu";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/api/axios";
import type { StorefrontSettingsDto } from "@/types/storefront";

type HeaderProps = {
  storefront: StorefrontSettingsDto;
};

const Header: React.FC<HeaderProps> = ({ storefront }) => {
  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Items", path: "/items" },
    { label: "Contact", path: "/contact" },
  ];

  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = cartItems.length;

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const storefrontName = storefront.siteName?.trim() || "TourHub";
  const brandImage = storefront.logoUrl?.trim() || null;

  const handleLogout = async () => {
    dispatch(clearUser());

    try {
      await api.post("/auth/logout");
    } finally {
      if (
        pathname?.startsWith("/user") ||
        pathname?.startsWith("/manager") ||
        pathname?.startsWith("/admin")
      ) {
        router.push("/");
      } else {
        router.refresh();
      }
    }
  };

  // Close the dropdown on an outside click.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-base-100 border-b shadow-md page-container">
      <div className="flex items-center justify-between py-1 px-2 md:p-2">
        <button
          className="md:hidden btn btn-ghost btn-sm"
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Left: Title */}
        <div className="flex-shrink-0">
          <TitleText title={storefrontName} image={brandImage} />
        </div>

        {/* Center: Navigation Menu */}
        <nav className="hidden md:flex flex-grow justify-center">
          <HorizontalMenu items={menuItems} />
        </nav>

        {/* Right: Avatar + Cart */}
        <div className="flex items-center gap-3 relative">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="
          group flex items-center gap-2 rounded-full
          border border-base-300/70 bg-base-100/70
          px-2.5 py-1.5
          text-sm font-medium text-base-content/80
          shadow-sm backdrop-blur-sm
          transition-all duration-200
          hover:-translate-y-[1px]
          hover:border-primary/40
          hover:bg-base-100
          hover:text-primary
        "
              >
                <FaUserCircle className="text-[22px] transition-transform duration-200 group-hover:scale-105" />

                <span className="hidden max-w-[120px] truncate sm:inline">
                  {user.name}
                </span>
              </button>

              {open && (
                <div
                  className="
            absolute right-0 mt-3 w-52 overflow-hidden
            rounded-2xl border border-base-300/70
            bg-base-100/95 p-1.5
            shadow-[0_12px_40px_rgba(0,0,0,0.14)]
            backdrop-blur-xl z-50
          "
                >
                  {user.role === "ADMIN" && (
                    <button
                      className="
                w-full rounded-xl px-4 py-2.5 text-left text-sm
                transition-colors hover:bg-base-200 hover:text-primary
              "
                      onClick={() => {
                        router.push("/admin");
                        setOpen(false);
                      }}
                    >
                      Admin Panel
                    </button>
                  )}

                  {user.role === "MANAGER" && (
                    <>
                      <button
                        className="
                  w-full rounded-xl px-4 py-2.5 text-left text-sm
                  transition-colors hover:bg-base-200 hover:text-primary
                "
                        onClick={() => {
                          router.push("/user");
                          setOpen(false);
                        }}
                      >
                        View Profile
                      </button>

                      <button
                        className="
                  w-full rounded-xl px-4 py-2.5 text-left text-sm
                  transition-colors hover:bg-base-200 hover:text-primary
                "
                        onClick={() => {
                          router.push("/shops");
                          setOpen(false);
                        }}
                      >
                        View Shops
                      </button>
                    </>
                  )}

                  {user.role === "USER" && (
                    <button
                      className="
                w-full rounded-xl px-4 py-2.5 text-left text-sm
                transition-colors hover:bg-base-200 hover:text-primary
              "
                      onClick={() => {
                        router.push("/user");
                        setOpen(false);
                      }}
                    >
                      View Profile
                    </button>
                  )}

                  <div className="my-1 border-t border-base-300/70" />

                  <button
                    className="
              w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium
              text-red-500 transition-colors
              hover:bg-red-500/10 hover:text-red-600
            "
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="
        group flex h-9 w-9 items-center justify-center rounded-full
        border border-base-300/70 bg-base-100/70
        text-primary shadow-sm backdrop-blur-sm
        transition-all duration-200
        hover:-translate-y-[1px]
        hover:border-primary/40
        hover:bg-base-100
      "
            >
              <FaUserCircle className="text-[22px] transition-transform duration-200 group-hover:scale-105" />
            </Link>
          )}

          <Link
            href="/cart"
            className="
               group relative inline-flex h-9 items-center gap-2 rounded-full
             border border-base-300/70 bg-base-100/70 px-3.5
             text-sm font-medium text-base-content/80
              shadow-sm backdrop-blur-sm transition-all duration-200
             hover:-translate-y-[1px] hover:border-primary/40 hover:bg-base-100 hover:text-primary
             focus:outline-none focus:ring-2 focus:ring-primary/25
  "
            aria-label={`Cart with ${cartCount} item${cartCount === 1 ? "" : "s"}`}
          >
            <FaShoppingCart className="text-base transition-transform duration-200 group-hover:scale-110" />

            <span className="hidden md:inline">Cart</span>

            {cartCount > 0 && (
              <span
                className="
        absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center
        rounded-full bg-gradient-to-r from-primary to-secondary
        px-1 text-[11px] font-bold leading-none text-white
        shadow-[0_4px_10px_rgba(0,0,0,0.18)] ring-2 ring-base-100
      "
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden top-[58px]"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-x-0 top-[58px] z-30 bg-base-100 border-t shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="page-container py-4 space-y-3">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-3 py-2 rounded hover:bg-base-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
