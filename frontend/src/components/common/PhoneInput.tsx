"use client";

import { useState, useEffect } from "react";
import { countryDialCodes } from "@/utils/countryDialCodes";

interface Props {
  value?: string;
  onChange: (phone: string) => void;
}

export default function PhoneInput({ value, onChange }: Props) {
  const [countryCode, setCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (!value) return;

    const match = countryDialCodes.find((c) => value.startsWith(c.dial_code));

    if (match) {
      setCountryCode(match.dial_code.replace("+", ""));
      setPhoneNumber(value.replace(match.dial_code, ""));
    }
  }, [value]);

  useEffect(() => {
    if (!countryCode && !phoneNumber) return;

    const phone = `+${countryCode}${phoneNumber}`;
    onChange(phone);
  }, [countryCode, phoneNumber, onChange]);

  return (
    <div className="flex gap-2">
      <select
        className="select select-bordered w-40"
        value={countryCode}
        onChange={(e) => setCountryCode(e.target.value)}
      >
        {countryDialCodes.map((c) => (
          <option key={c.code} value={c.dial_code.replace("+", "")}>
            {c.name} ({c.dial_code})
          </option>
        ))}
      </select>

      <input
        type="tel"
        className="input input-bordered flex-1"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Phone number"
      />
    </div>
  );
}
