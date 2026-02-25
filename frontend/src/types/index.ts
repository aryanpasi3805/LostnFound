export interface Item {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  location: string;
  date: string;
  imageURL: string;
  contactInfo: string;
  type: "lost" | "found";
  status: "active" | "resolved";
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  _id: string;
  itemId: string;
  claimantName: string;
  contactInfo: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export type ItemFormData = Omit<Item, "_id" | "status" | "createdAt" | "updatedAt">;
export type ClaimFormData = Omit<Claim, "_id" | "createdAt" | "updatedAt">;
