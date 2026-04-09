import express from "express";
import {
  createClaim,
  getMyClaims,
  getClaimById
} from "../controllers/claimController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Protected routes
router.post("/", auth, upload.array("proofImages", 5), createClaim);
router.get("/my", auth, getMyClaims);
router.get("/:id", auth, getClaimById);

export default router;