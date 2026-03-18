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

const Header: React.FC = () => {
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

  // 🔹 Close dropdown on outside click
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
          <TitleText title="TourHub" image="/tree.png" />
        </div>

        {/* Center: Navigation Menu */}
        <nav className="hidden md:flex flex-grow justify-center">
          <HorizontalMenu items={menuItems} />
        </nav>

        {/* Right: Avatar + Cart */}
        <div className="flex items-center gap-4 relative">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="flex items-center justify-center p-1 gap-2 text-primary hover:bg-primary/10 active:bg-primary/20 rounded-full w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 transition-colors duration-150"
                onClick={() => setOpen((prev) => !prev)}
              >
                <FaUserCircle className="text-2xl" />
                <span className="hidden sm:inline mb-0.5">{user.name}</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-44 bg-base-100 border border-gray-700 rounded shadow-lg z-50 text-neutral">
                  {/* ADMIN */}
                  {user.role === "ADMIN" && (
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-base-200 hover:text-primary transition-colors"
                      onClick={() => {
                        router.push("/admin");
                        setOpen(false);
                      }}
                    >
                      Admin Page
                    </button>
                  )}

                  {/* MANAGER */}
                  {user.role === "MANAGER" && (
                    <>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-base-200 hover:text-primary transition-colors"
                        onClick={() => {
                          router.push("/user");
                          setOpen(false);
                        }}
                      >
                        View Profile
                      </button>

                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-base-200 hover:text-primary transition-colors"
                        onClick={() => {
                          router.push("/shops");
                          setOpen(false);
                        }}
                      >
                        View Shops
                      </button>
                    </>
                  )}

                  {/* USER */}
                  {user.role === "USER" && (
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-base-200 hover:text-primary transition-colors"
                      onClick={() => {
                        router.push("/user");
                        setOpen(false);
                      }}
                    >
                      View Profile
                    </button>
                  )}
                  {/* Logout */}
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-base-100 hover:text-red-700 transition-colors text-red-500"
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
              className="flex items-center justify-center text-primary hover:text-primary-focus hover:bg-base-200 active:bg-primary/20 rounded-full w-10 h-10 transition-colors duration-150"
            >
              <FaUserCircle className="text-2xl" />
            </Link>
          )}

          <Link
            href="/cart"
            className="btn btn-sm btn-outline flex items-center hover:bg-base-200 hover:text-primary rounded-lg transition-colors relative"
          >
            <FaShoppingCart className="text-lg md:mr-2 hover:bg-primary/10" />
            <span className="hidden md:inline">Cart</span>

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {cartCount}
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
