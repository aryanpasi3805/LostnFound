const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    imageURL: { type: String, default: "" },
    contactInfo: { type: String, required: true },
    type: { type: String, enum: ["lost", "found"], required: true },
    status: { type: String, enum: ["active", "resolved"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);