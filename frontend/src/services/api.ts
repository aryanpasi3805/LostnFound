import axios from "axios";
import type { Item } from "@/types";

const API = axios.create({
  baseURL: "http://localhost:5001",
});

/* =========================
   ITEMS
========================= */

export const getItems = async (): Promise<Item[]> => {
  const res = await API.get("/api/items");
  return res.data;
};

export const getItem = async (id: string): Promise<Item> => {
  const res = await API.get(`/api/items/${id}`);
  return res.data;
};

export const createItem = async (data: Partial<Item>) => {
  const res = await API.post("/api/items", data);
  return res.data;
};

export const deleteItem = async (id: string) => {
  const res = await API.delete(`/api/items/${id}`);
  return res.data;
};

export const resolveItem = async (id: string) => {
  const res = await API.put(`/api/items/${id}/resolve`);
  return res.data;
};

/* =========================
   CLAIMS
========================= */

export const getClaims = async () => {
  const res = await API.get("/api/claims");
  return res.data;
};

export const createClaim = async (data: any) => {
  const res = await API.post("/api/claims", data);
  return res.data;
};

export default API;