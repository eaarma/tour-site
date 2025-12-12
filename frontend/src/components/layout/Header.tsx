"use client";

import Link from "next/link";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { clearUser } from "@/store/authSlice";
import { usePathname, useRouter } from "next/navigation";
import TitleText from "../common/TitleText";
import HorizontalMenu from "../common/HorizontalMenu";
import MarginContainer from "../common/MarginContainer";
import { useState, useEffect, useRef } from "react";

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

  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchId, setSearchId] = useState("");

  const handleLogout = () => {
    dispatch(clearUser());
    fetch("http://localhost:8080/auth/logout", {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      if (pathname?.startsWith("/user") || pathname?.startsWith("/manager")) {
        router.push("/");
      } else {
        router.refresh();
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

          {/* Search booking */}
          <div className="relative mr-4" ref={searchRef}>
            <button
              type="button"
              className="btn btn-sm btn-outline flex items-center gap-2 hover:bg-base-200"
              onClick={() => setSearchOpen((prev) => !prev)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0a7.5
          7.5 0 1 0-10.606-10.606 7.5 
          7.5 0 0 0 10.606 10.606Z"
                />
              </svg>
            </button>

            {searchOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-base-100 border border-gray-700 rounded shadow-lg p-4 space-y-3 z-50">
                <h4 className="font-semibold text-sm">Search by booking id</h4>

                <input
                  type="text"
                  placeholder="Enter booking id"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="input input-bordered input-sm w-full"
                />

                <button
                  className="btn btn-primary btn-sm w-full"
                  onClick={() => {
                    if (!searchId.trim()) return;
                    router.push(`/orders/${searchId}`); // you'll create this page later
                    setSearchOpen(false);
                  }}
                >
                  Search
                </button>
              </div>
            )}
          </div>

          {/* Right: Avatar + Cart */}
          <div className="flex items-center gap-4 relative">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="flex items-center gap-2 text-primary hover:text-primary-focus active:text-primary-content transition-colors duration-150"
                  onClick={() => setOpen((prev) => !prev)}
                >
                  <FaUserCircle className="text-2xl" />
                  <span className="hidden sm:inline">{user.name}</span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-44 bg-base-100 border border-gray-700 rounded shadow-lg z-50 text-neutral">
                    {/* View Profile */}
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-base-200 hover:text-primary transition-colors"
                      onClick={() => {
                        router.push("/user");
                        setOpen(false);
                      }}
                    >
                      View Profile
                    </button>

                    {/* View Shops (MANAGER only) */}
                    {user.role === "MANAGER" && (
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-base-200 hover:text-primary transition-colors"
                        onClick={() => {
                          router.push("/shops");
                          setOpen(false);
                        }}
                      >
                        View Shops
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
                className="text-2xl text-primary hover:text-primary-focus active:text-primary-content transition-colors"
              >
                <FaUserCircle />
              </Link>
            )}

            <Link
              href="/cart"
              className="btn btn-sm btn-outline flex items-center hover:bg-base-200 hover:text-primary transition-colors relative"
            >
              <FaShoppingCart className="mr-2" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </MarginContainer>
    </header>
  );
};

export default Header;
