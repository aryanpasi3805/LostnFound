require("dotenv").config();
console.log("ENV CHECK:", process.env.MONGO_URI);
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const itemRoutes = require("./routes/itemRoutes");
const claimRoutes = require("./routes/claimRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

console.log("itemRoutes type:", typeof itemRoutes);
console.log("claimRoutes type:", typeof claimRoutes);

// Routes
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);

// Health check
app.get("/", (_req, res) => res.json({ message: "Lost & Found API running" }));

// Error handler
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));