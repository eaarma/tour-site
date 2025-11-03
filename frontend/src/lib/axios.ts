import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // must be true to send/receive cookies
});

// 🔎 Log outgoing requests
api.interceptors.request.use((config) => {
  // clone to avoid circular structure issues in console
  const safeData =
    typeof config.data === "string"
      ? config.data
      : JSON.parse(JSON.stringify(config.data || {}));
  console.groupCollapsed(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  console.log("Headers:", config.headers);
  console.log("Payload:", safeData);
  console.groupEnd();
  return config;
});

export default api;
