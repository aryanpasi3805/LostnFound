import Claim from "../models/Claim.js";
import Item from "../models/Item.js";
import User from "../models/User.js";

// GET all pending claims
export const getPendingClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ status: "pending" })
      .populate("item")
      .populate("claimant", "name email");
    res.json({ success: true, data: claims });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single claim details (admin view)
export const getClaimByIdAdmin = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate("item")
      .populate("claimant", "name email")
      .populate("reviewedBy", "name email");

    if (!claim) return res.status(404).json({ success: false, message: "Claim not found" });

    res.json({ success: true, data: claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// APPROVE claim
export const approveClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ success: false, message: "Claim not found" });

    claim.status = "approved";
    claim.reviewedBy = req.user.id;
    claim.reviewedAt = new Date();
    await claim.save();

    // Update item status
    const item = await Item.findById(claim.item);
    if (item) {
      item.status = "verified";
      await item.save();
    }

    res.json({ success: true, message: "Claim approved", data: claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// REJECT claim
export const rejectClaim = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) return res.status(400).json({ success: false, message: "Rejection reason required" });

    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ success: false, message: "Claim not found" });

    claim.status = "rejected";
    claim.rejectionReason = rejectionReason;
    claim.reviewedBy = req.user.id;
    claim.reviewedAt = new Date();
    await claim.save();

    res.json({ success: true, message: "Claim rejected", data: claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET all items (admin view)
export const getAllItemsAdmin = async (req, res) => {
  try {
    const items = await Item.find().populate("reportedBy", "name email");
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE any item
export const deleteItemAdmin = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    await item.deleteOne();
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DASHBOARD stats
export const getStats = async (req, res) => {
  try {
    const totalLost = await Item.countDocuments({ type: "lost" });
    const totalFound = await Item.countDocuments({ type: "found" });
    const claimsPending = await Claim.countDocuments({ status: "pending" });
    const claimsApproved = await Claim.countDocuments({ status: "approved" });
    const claimsRejected = await Claim.countDocuments({ status: "rejected" });
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      data: {
        totalLost,
        totalFound,
        claimsPending,
        claimsApproved,
        claimsRejected,
        totalUsers
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ACTIVITY logs (recent actions)
export const getLogs = async (req, res) => {
  try {
    // For simplicity, show last 20 claims + items actions
    const recentClaims = await Claim.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("claimant", "name email")
      .populate("reviewedBy", "name email");

    const recentItems = await Item.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("reportedBy", "name email");

    res.json({
      success: true,
      data: { recentClaims, recentItems }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};