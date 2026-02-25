const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    claimantName: { type: String, required: true },
    contactInfo: { type: String, required: true },
    message: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", claimSchema);