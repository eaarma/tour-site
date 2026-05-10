"use client";

import { useEffect, useState } from "react";

import { countryDialCodes } from "@/utils/countryDialCodes";

interface Props {
  value?: string;
  onChange: (phone: string) => void;
}

function splitPhoneValue(value?: string) {
  if (!value) {
    return { countryCode: "", phoneNumber: "" };
  }

  const match = countryDialCodes.find((country) =>
    value.startsWith(country.dial_code),
  );

  if (!match) {
    return {
      countryCode: "",
      phoneNumber: value.replace(/^\+/, ""),
    };
  }

  return {
    countryCode: match.dial_code.replace("+", ""),
    phoneNumber: value.replace(match.dial_code, ""),
  };
}

export default function PhoneInput({ value, onChange }: Props) {
  const [countryCode, setCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const next = splitPhoneValue(value);

    setCountryCode((current) =>
      current === next.countryCode ? current : next.countryCode,
    );
    setPhoneNumber((current) =>
      current === next.phoneNumber ? current : next.phoneNumber,
    );
  }, [value]);

  const emitChange = (nextCountryCode: string, nextPhoneNumber: string) => {
    const normalizedPhoneNumber = nextPhoneNumber.trim();

    if (!nextCountryCode && !normalizedPhoneNumber) {
      onChange("");
      return;
    }

    const prefix = nextCountryCode ? `+${nextCountryCode}` : "+";
    onChange(`${prefix}${normalizedPhoneNumber}`);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <select
        className="select select-bordered h-12 w-full bg-base-100 sm:w-40"
        value={countryCode}
        onChange={(event) => {
          const nextCountryCode = event.target.value;
          setCountryCode(nextCountryCode);
          emitChange(nextCountryCode, phoneNumber);
        }}
      >
        <option value="">Code</option>
        {countryDialCodes.map((country) => (
          <option key={country.code} value={country.dial_code.replace("+", "")}>
            {country.name} ({country.dial_code})
          </option>
        ))}
      </select>

      <input
        type="tel"
        className="input input-bordered h-12 flex-1 bg-base-100"
        value={phoneNumber}
        onChange={(event) => {
          const nextPhoneNumber = event.target.value;
          setPhoneNumber(nextPhoneNumber);
          emitChange(countryCode, nextPhoneNumber);
        }}
        placeholder="Phone number"
      />
    </div>
  );
}
