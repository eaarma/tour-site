import { ApiErrorData } from "@/types/ApiErrorData";

export class ApiError extends Error {
  status: number;
  data?: ApiErrorData;

  constructor(status: number, rawData?: unknown) {
    const parsed = isApiErrorData(rawData) ? rawData : undefined;

    super(parsed?.message || "Request failed");

    this.status = status;
    this.data = parsed;
  }
}

function isApiErrorData(data: unknown): data is ApiErrorData {
  return (
    typeof data === "object" &&
    data !== null &&
    ("message" in data || "errors" in data || "details" in data)
  );
}
