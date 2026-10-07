import axios from "axios";

const BASEURL =
  import.meta.env.VITE_BASEURL ?? "http://127.0.0.1:8000/api/";

export const api = axios.create({
  baseURL: BASEURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const refreshApi = axios.create({
  baseURL: BASEURL,
  headers: {
    "Content-Type": "application/json",
  },
});