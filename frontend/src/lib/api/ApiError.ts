export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any) {
    super(data?.message || data?.error || "Request failed");
    this.status = status;
    this.data = data;
  }
}
