import axios from "axios";
import type { Item, Claim, ItemFormData, ClaimFormData } from "@/types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_BASE });

// ── Mock Data ──
const mockItems: Item[] = [
  {
    _id: "1",
    itemName: "Blue Backpack",
    category: "Bags",
    description: "Navy blue Jansport backpack with laptop sleeve. Contains a notebook and charger.",
    location: "Library, 2nd Floor",
    date: "2026-02-20",
    imageURL: "",
    contactInfo: "john@university.edu",
    type: "lost",
    status: "active",
    createdAt: "2026-02-20T10:00:00Z",
    updatedAt: "2026-02-20T10:00:00Z",
  },
  {
    _id: "2",
    itemName: "iPhone 15 Pro",
    category: "Electronics",
    description: "Space black iPhone 15 Pro with a clear case. Lock screen shows a dog photo.",
    location: "Cafeteria",
    date: "2026-02-22",
    imageURL: "",
    contactInfo: "jane@university.edu",
    type: "found",
    status: "active",
    createdAt: "2026-02-22T14:30:00Z",
    updatedAt: "2026-02-22T14:30:00Z",
  },
  {
    _id: "3",
    itemName: "Student ID Card",
    category: "Documents",
    description: "University student ID card belonging to Alex M.",
    location: "Gym Entrance",
    date: "2026-02-23",
    imageURL: "",
    contactInfo: "security@university.edu",
    type: "found",
    status: "active",
    createdAt: "2026-02-23T09:15:00Z",
    updatedAt: "2026-02-23T09:15:00Z",
  },
  {
    _id: "4",
    itemName: "Silver Watch",
    category: "Accessories",
    description: "Casio silver digital watch lost during sports practice.",
    location: "Football Field",
    date: "2026-02-18",
    imageURL: "",
    contactInfo: "mike@university.edu",
    type: "lost",
    status: "resolved",
    createdAt: "2026-02-18T16:00:00Z",
    updatedAt: "2026-02-24T11:00:00Z",
  },
  {
    _id: "5",
    itemName: "Wireless Earbuds",
    category: "Electronics",
    description: "White AirPods Pro in charging case found on a bench.",
    location: "Central Park Bench, Campus",
    date: "2026-02-24",
    imageURL: "",
    contactInfo: "lost-found@university.edu",
    type: "found",
    status: "active",
    createdAt: "2026-02-24T08:45:00Z",
    updatedAt: "2026-02-24T08:45:00Z",
  },
];

const mockClaims: Claim[] = [
  {
    _id: "c1",
    itemId: "2",
    claimantName: "Sarah K.",
    contactInfo: "sarah@university.edu",
    message: "That's my phone! The wallpaper is my golden retriever named Buddy.",
    createdAt: "2026-02-23T10:00:00Z",
    updatedAt: "2026-02-23T10:00:00Z",
  },
];

let localItems = [...mockItems];
let localClaims = [...mockClaims];
let nextId = 6;
let nextClaimId = 2;

// Helper: try API, fall back to mock
async function tryApi<T>(apiFn: () => Promise<T>, mockFn: () => T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    console.info("Backend unavailable — using mock data");
    return mockFn();
  }
}

// ── Items ──
export const getItems = () =>
  tryApi(
    async () => (await api.get<Item[]>("/items")).data,
    () => localItems
  );

export const getItem = (id: string) =>
  tryApi(
    async () => (await api.get<Item>(`/items/${id}`)).data,
    () => {
      const item = localItems.find((i) => i._id === id);
      if (!item) throw new Error("Item not found");
      return item;
    }
  );

export const createItem = (data: ItemFormData) =>
  tryApi(
    async () => (await api.post<Item>("/items", data)).data,
    () => {
      const newItem: Item = {
        ...data,
        _id: String(nextId++),
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localItems.unshift(newItem);
      return newItem;
    }
  );

export const updateItem = (id: string, data: Partial<Item>) =>
  tryApi(
    async () => (await api.put<Item>(`/items/${id}`, data)).data,
    () => {
      const idx = localItems.findIndex((i) => i._id === id);
      if (idx === -1) throw new Error("Item not found");
      localItems[idx] = { ...localItems[idx], ...data, updatedAt: new Date().toISOString() };
      return localItems[idx];
    }
  );

export const deleteItem = (id: string) =>
  tryApi(
    async () => (await api.delete(`/items/${id}`)).data,
    () => {
      localItems = localItems.filter((i) => i._id !== id);
      return { message: "Deleted" };
    }
  );

export const resolveItem = (id: string) =>
  tryApi(
    async () => (await api.patch<Item>(`/items/${id}/resolve`)).data,
    () => {
      const idx = localItems.findIndex((i) => i._id === id);
      if (idx === -1) throw new Error("Item not found");
      localItems[idx] = { ...localItems[idx], status: "resolved", updatedAt: new Date().toISOString() };
      return localItems[idx];
    }
  );

export const searchItems = (q: string) =>
  tryApi(
    async () => (await api.get<Item[]>(`/items/search?q=${encodeURIComponent(q)}`)).data,
    () => {
      const lower = q.toLowerCase();
      return localItems.filter(
        (i) =>
          i.itemName.toLowerCase().includes(lower) ||
          i.description.toLowerCase().includes(lower) ||
          i.location.toLowerCase().includes(lower) ||
          i.category.toLowerCase().includes(lower)
      );
    }
  );

// ── Claims ──
export const getClaims = () =>
  tryApi(
    async () => (await api.get<Claim[]>("/claims")).data,
    () => localClaims
  );

export const createClaim = (data: ClaimFormData) =>
  tryApi(
    async () => (await api.post<Claim>("/claims", data)).data,
    () => {
      const newClaim: Claim = {
        ...data,
        _id: `c${nextClaimId++}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localClaims.push(newClaim);
      return newClaim;
    }
  );
