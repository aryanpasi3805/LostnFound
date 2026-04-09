import express from "express";
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
} from "../controllers/itemController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getItems);
router.get("/:id", getItem);

// Protected routes
router.post("/", auth, upload.array("images", 5), createItem);
router.put("/:id", auth, upload.array("images", 5), updateItem);
router.delete("/:id", auth, deleteItem);

export default router;