import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASEURL,
  headers: { "Content-Type": "application/json" },
});

export const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_BASEURL,
  headers: { "Content-Type": "application/json" },
});