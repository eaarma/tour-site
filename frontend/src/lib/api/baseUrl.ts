export function getApiBaseUrl() {
  const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const internalApiBaseUrl = process.env.INTERNAL_API_BASE_URL;

  const baseUrl =
    typeof window === "undefined"
      ? internalApiBaseUrl || publicApiBaseUrl
      : publicApiBaseUrl;

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not defined. Set INTERNAL_API_BASE_URL as well when server-side requests need a different host.",
    );
  }

  return baseUrl;
}
