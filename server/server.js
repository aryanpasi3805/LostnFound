import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";

// Routes
import authRoutes from "./routes/auth.js";
import itemRoutes from "./routes/items.js";
import claimRoutes from "./routes/claims.js";
import adminRoutes from "./routes/admin.js";

// Middleware
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// ----- MIDDLEWARE -----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for frontend (Vite dev server)
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true
  })
);

// Serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ----- ROUTES -----
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/admin", adminRoutes);

// ----- ERROR HANDLER -----
app.use(errorHandler);

// ----- CONNECT MONGODB -----
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB connected locally");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
  });