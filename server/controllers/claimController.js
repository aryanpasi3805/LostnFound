import Claim from "../models/Claim.js";
import Item from "../models/Item.js";

// CREATE new claim
export const createClaim = async (req, res) => {
  try {
    const proofImages = req.files?.map(file => `/uploads/${file.filename}`) || [];
    const claim = new Claim({
      ...req.body,
      claimant: req.user.id,
      proofImages,
      status: "pending"
    });
    await claim.save();
    res.json({ success: true, data: claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET all claims of current user
export const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user.id }).populate("item");
    res.json({ success: true, data: claims });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single claim
export const getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate("item")
      .populate("claimant", "name email");
    if (!claim) return res.status(404).json({ success: false, message: "Claim not found" });

    // Only claimant or admin can view
    if (claim.claimant._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.json({ success: true, data: claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};