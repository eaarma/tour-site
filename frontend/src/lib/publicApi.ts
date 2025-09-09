import axios from "axios";

const publicApi = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: false, // no cookies sent
});

export default publicApi;
