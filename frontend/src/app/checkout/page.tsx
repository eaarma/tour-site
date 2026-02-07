"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { countryDialCodes } from "@/utils/countryDialCodes";
import { setCheckoutInfo, updateCheckoutInfo } from "@/store/checkoutSlice";
import { RootState } from "@/store/store";
import { UserService } from "@/lib/userService";
import toast from "react-hot-toast";
import { useRef } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const checkout = useSelector((state: RootState) => state.checkout);

  const [countryCode, setCountryCode] = useState("");
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [highlightIndex, setHighlightIndex] = useState(0);
  const selectingWithKeyboard = useRef(false);
  // ✅ 1. Pre-fill checkout info from logged-in user
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const user = await UserService.getProfile();

        if (user) {
          // detect country code from phone if available
          let detectedCode = "+";
          let localNumber = user.phone || "";
          if (user.phone?.startsWith("+")) {
            const match = countryDialCodes.find((c) =>
              user.phone?.startsWith(c.dial_code),
            );
            if (match) {
              detectedCode = match.dial_code;
              localNumber = user.phone.replace(match.dial_code, "");
            }
          }

          // set local states immediately
          setCountryCode(detectedCode);
          setPhoneNumber(localNumber);

          // update Redux checkout state
          dispatch(
            setCheckoutInfo({
              name: user.name || "",
              email: user.email || "",
              phone: `${detectedCode}${localNumber}` || "",
              nationality: user.nationality || "",
            }),
          );
        }
      } catch (err: unknown) {
        console.warn("User not logged in or failed to fetch profile:", err);

        // ✅ Reset checkout state for logged-out users
        dispatch(
          setCheckoutInfo({
            name: "",
            email: "",
            phone: "",
            nationality: "",
          }),
        );
      }
    };

    loadUserProfile();
  }, [dispatch]);

  // ✅ 2. Sync Redux state when phone or code changes
  useEffect(() => {
    dispatch(updateCheckoutInfo({ phone: `${countryCode}${phoneNumber}` }));
  }, [countryCode, phoneNumber, dispatch]);

  // ✅ 3. Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fullPhone = `${countryCode}${phoneNumber}`.replace(/\D/g, "");

    if (!checkout.name || !checkout.email || !phoneNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    // ✅ Email format validation
    if (!emailRegex.test(checkout.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // ✅ Phone length validation
    if (fullPhone.length < 7 || fullPhone.length > 15) {
      toast.error("Phone number must be between 7 and 15 digits long");
      return;
    }

    dispatch(
      setCheckoutInfo({
        name: checkout.name.trim(),
        email: checkout.email.trim(),
        phone: `+${fullPhone}`,
        nationality: checkout.nationality,
      }),
    );

    router.push("/payment");
  };

  // ✅ Unified search by name or dial code
  const filteredCountries = countryDialCodes.filter((country) => {
    const lowerQuery = query.toLowerCase();
    return (
      country.name.toLowerCase().includes(lowerQuery) ||
      country.dial_code.replace("+", "").startsWith(lowerQuery)
    );
  });

  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  const handleSelect = (dial_code: string) => {
    setCountryCode(dial_code.replace("+", "")); // store digits only
    setQuery("");
    setDropdownOpen(false);
  };

  return (
    <div className="bg-base-200 min-h-screen p-6">
      <div className="max-w-2xl mx-auto bg-base-100 p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="label">
              <span className="label-text">Full Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={checkout.name}
              onChange={(e) =>
                dispatch(updateCheckoutInfo({ name: e.target.value }))
              }
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              value={checkout.email}
              onChange={(e) =>
                dispatch(updateCheckoutInfo({ email: e.target.value }))
              }
              onBlur={(e) =>
                dispatch(updateCheckoutInfo({ email: e.target.value.trim() }))
              }
              required
            />
          </div>

          {/* Phone and country code */}
          <div>
            <label className="label">
              <span className="label-text">Phone Number</span>
            </label>
            <div className="flex gap-2 relative">
              <div className="flex gap-2 relative">
                <div className="w-40 relative">
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="+372"
                    value={
                      isFocused ? query : countryCode ? `+${countryCode}` : ""
                    }
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setDropdownOpen(true);
                    }}
                    onFocus={() => {
                      setIsFocused(true);
                      setQuery("");
                      setDropdownOpen(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        if (
                          filteredCountries.length > 0 &&
                          query.trim() !== ""
                        ) {
                          handleSelect(filteredCountries[0].dial_code);
                        }

                        setIsFocused(false);
                        setDropdownOpen(false);
                      }, 150);
                    }}
                    onKeyDown={(e) => {
                      if (
                        !dropdownOpen &&
                        (e.key === "ArrowDown" || e.key === "ArrowUp")
                      ) {
                        setDropdownOpen(true);
                      }

                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setHighlightIndex((i) =>
                          Math.min(i + 1, filteredCountries.length - 1),
                        );
                      }

                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setHighlightIndex((i) => Math.max(i - 1, 0));
                      }
                    }}
                  />
                  {dropdownOpen && (
                    <ul className="absolute z-20 mt-1 max-h-60 overflow-y-auto w-full bg-base-100 border border-base-300 rounded-box shadow-lg">
                      {filteredCountries.map((country, index) => (
                        <li
                          key={country.code}
                          className={`px-3 py-2 cursor-pointer ${
                            index === highlightIndex ? "bg-base-300" : ""
                          }`}
                          onMouseDown={() => handleSelect(country.dial_code)}
                        >
                          {country.name} ({country.dial_code})
                        </li>
                      ))}
                      {filteredCountries.length === 0 && (
                        <li className="px-3 py-2 text-sm text-gray-500">
                          No results
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              <input
                type="tel"
                className="input input-bordered flex-1"
                placeholder="1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Nationality */}
          <div>
            <label className="label">
              <span className="label-text">Nationality</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={checkout.nationality}
              onChange={(e) =>
                dispatch(updateCheckoutInfo({ nationality: e.target.value }))
              }
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4">
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
}
