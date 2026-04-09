import express from "express";
import { signup, login, getMe } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected route
router.get("/me", auth, getMe);

export default router;