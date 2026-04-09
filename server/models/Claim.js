import mongoose from "mongoose";
import Item from "../models/Item.js";
import Claim from "../models/Claim.js";

const claimSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  claimant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  answers: {
    uniqueFeatures: String,
    contents: String,
    colorBrand: String
  },
  proofImages: [String],
  status: { type: String, default: "pending" },
  rejectionReason: String,
  confidenceScore: Number,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date
}, { timestamps: true });

export default mongoose.model("Claim", claimSchema);