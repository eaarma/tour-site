import { countryDialCodes } from "@/utils/countryDialCodes";

export function splitPhoneNumber(phone?: string) {
  if (!phone || !phone.startsWith("+")) {
    return {
      countryCode: "",
      localNumber: phone || "",
    };
  }

  const match = countryDialCodes.find((c) => phone.startsWith(c.dial_code));

  if (!match) {
    return {
      countryCode: "",
      localNumber: phone.replace("+", ""),
    };
  }

  return {
    countryCode: match.dial_code.replace("+", ""),
    localNumber: phone.replace(match.dial_code, ""),
  };
}
