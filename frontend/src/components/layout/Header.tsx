"use client";

import Link from "next/link";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { clearUser } from "@/store/authSlice";
import { useRouter } from "next/navigation";
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

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    dispatch(clearUser());
    fetch("http://localhost:8080/auth/logout", {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      if (
        router.pathname?.startsWith("/user") ||
        router.pathname?.startsWith("/manager")
      ) {
        router.push("/");
      } else {
        router.refresh();
      }
    });
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
          <div className="flex items-center gap-4 relative">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center gap-2 text-primary hover:text-primary-focus active:text-primary-content transition-colors duration-150"
                  onClick={() => setOpen((prev) => !prev)}
                >
                  <FaUserCircle className="text-2xl" />
                  <span className="hidden sm:inline">{user.name}</span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-44 bg-base-100 border border-gray-700 rounded shadow-lg z-50 text-neutral">
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-base-200 hover:text-primary transition-colors"
                      onClick={() => {
                        router.push(
                          user.role === "ADMIN" || user.role === "MANAGER"
                            ? "/manager"
                            : "/user"
                        );
                        setOpen(false);
                      }}
                    >
                      View Profile
                    </button>
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
              className="btn btn-sm btn-outline flex items-center hover:bg-base-200 hover:text-primary transition-colors"
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
