import mongoose from "mongoose";
import Item from "../models/Item.js";
import Claim from "../models/Claim.js";

const itemSchema = new mongoose.Schema({
  title: String,
  type: String,
  category: String,
  description: String,
  location: String,
  date: Date,
  time: String,
  images: [String],
  identifiers: {
    brand: String,
    color: String,
    uniqueMarks: String
  },
  status: { type: String, default: "lost" },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Item", itemSchema);