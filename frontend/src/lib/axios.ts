import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // Replace with your backend URL
  withCredentials: false, // Set to true if you need cookies/session
});

export default api;
