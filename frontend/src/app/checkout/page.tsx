"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { countryDialCodes } from "@/utils/countryDialCodes";
import { useDispatch, useSelector } from "react-redux";
import { setCheckoutInfo, updateCheckoutInfo } from "@/store/checkoutSlice";
import { RootState } from "@/store"; // Adjust path if needed

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const checkout = useSelector((state: RootState) => state.checkout);

  const [countryCode, setCountryCode] = useState("+30");
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState(
    checkout.phone.replace(/^\+\d+/, "") // Remove country code initially
  );

  useEffect(() => {
    // Sync Redux value when countryCode or phoneNumber changes
    dispatch(
      updateCheckoutInfo({
        phone: `${countryCode}${phoneNumber}`,
      })
    );
  }, [countryCode, phoneNumber, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = `${countryCode}${checkout.phone.replace(
      countryCode,
      ""
    )}`;

    dispatch(
      setCheckoutInfo({
        name: checkout.name,
        email: checkout.email,
        phone: fullPhone,
        nationality: checkout.nationality,
      })
    );

    router.push("/payment");
  };

  const filteredCountries = countryDialCodes.filter((country) =>
    country.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (dial_code: string) => {
    setCountryCode(dial_code);
    setQuery("");
    setDropdownOpen(false);
  };

  return (
    <main className="bg-base-200 min-h-screen p-6">
      <div className="max-w-2xl mx-auto bg-base-100 p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

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
              required
            />
          </div>

          {/* Phone Number with Searchable Country Code */}
          <div>
            <label className="label">
              <span className="label-text">Phone Number</span>
            </label>

            <div className="flex gap-2 relative">
              {/* Country Code Search & Dropdown */}
              <div className="w-40 relative">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Search"
                  value={isFocused ? query : countryCode}
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
                      setIsFocused(false);
                      setDropdownOpen(false);
                    }, 150);
                  }}
                />

                {dropdownOpen && (
                  <ul className="absolute z-20 mt-1 max-h-60 overflow-y-auto w-full bg-base-100 border border-base-300 rounded-box shadow-lg">
                    {filteredCountries.map((country) => (
                      <li
                        key={country.code}
                        className="px-3 py-2 cursor-pointer hover:bg-base-200"
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

              {/* Phone number input */}
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
    </main>
  );
}
