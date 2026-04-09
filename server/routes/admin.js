import express from "express";
import {
  getPendingClaims,
  getClaimByIdAdmin,
  approveClaim,
  rejectClaim,
  getAllItemsAdmin,
  deleteItemAdmin,
  getStats,
  getLogs
} from "../controllers/adminController.js";
import auth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// All routes protected by auth and adminAuth
router.use(auth);
router.use(adminAuth);

// Claims
router.get("/claims", getPendingClaims);
router.get("/claims/:id", getClaimByIdAdmin);
router.put("/claims/:id/approve", approveClaim);
router.put("/claims/:id/reject", rejectClaim);

// Items
router.get("/items", getAllItemsAdmin);
router.delete("/items/:id", deleteItemAdmin);

// Dashboard
router.get("/stats", getStats);
router.get("/logs", getLogs);

export default router;