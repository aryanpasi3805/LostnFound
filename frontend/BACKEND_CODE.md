# Smart Lost & Found Portal — Backend Code (MERN)

Copy the files below into a `backend/` folder on your machine.

---

## Folder Structure

```
backend/
├── server.js
├── config/
│   └── db.js
├── models/
│   ├── Item.js
│   └── Claim.js
├── controllers/
│   ├── itemController.js
│   └── claimController.js
├── routes/
│   ├── itemRoutes.js
│   └── claimRoutes.js
├── middleware/
│   └── errorHandler.js
├── .env.example
└── package.json
```

---

## package.json

```json
{
  "name": "lost-found-backend",
  "version": "1.0.0",
  "description": "Smart Lost & Found Portal — Express + MongoDB backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "mongoose": "^8.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

---

## .env.example

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lost_found_db
```

Copy to `.env` and update `MONGO_URI` if needed.

---

## config/db.js

```js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## models/Item.js

```js
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
```

---

## models/Claim.js

```js
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
```

---

## controllers/itemController.js

```js
const Item = require("../models/Item");

// POST /api/items
exports.createItem = async (req, res, next) => {
  try {
    const item = await Item.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// GET /api/items
exports.getItems = async (_req, res, next) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// GET /api/items/search?q=keyword
exports.searchItems = async (req, res, next) => {
  try {
    const q = req.query.q || "";
    const regex = new RegExp(q, "i");
    const items = await Item.find({
      $or: [
        { itemName: regex },
        { description: regex },
        { location: regex },
        { category: regex },
      ],
    }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// GET /api/items/:id
exports.getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// PUT /api/items/:id
exports.updateItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/items/:id
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/items/:id/resolve
exports.resolveItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};
```

---

## controllers/claimController.js

```js
const Claim = require("../models/Claim");

// POST /api/claims
exports.createClaim = async (req, res, next) => {
  try {
    const claim = await Claim.create(req.body);
    res.status(201).json(claim);
  } catch (err) {
    next(err);
  }
};

// GET /api/claims
exports.getClaims = async (_req, res, next) => {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    next(err);
  }
};
```

---

## routes/itemRoutes.js

```js
const express = require("express");
const router = express.Router();
const {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
  searchItems,
  resolveItem,
} = require("../controllers/itemController");

router.get("/search", searchItems);
router.route("/").get(getItems).post(createItem);
router.route("/:id").get(getItem).put(updateItem).delete(deleteItem);
router.patch("/:id/resolve", resolveItem);

module.exports = router;
```

---

## routes/claimRoutes.js

```js
const express = require("express");
const router = express.Router();
const { createClaim, getClaims } = require("../controllers/claimController");

router.route("/").get(getClaims).post(createClaim);

module.exports = router;
```

---

## middleware/errorHandler.js

```js
const errorHandler = (err, _req, res, _next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
```

---

## server.js

```js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const itemRoutes = require("./routes/itemRoutes");
const claimRoutes = require("./routes/claimRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);

// Health check
app.get("/", (_req, res) => res.json({ message: "Lost & Found API running" }));

// Error handler
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## Setup Instructions

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env to set your MONGO_URI (default uses local MongoDB)
npm run dev
```

### Frontend (Lovable)

The frontend runs in Lovable's preview. To connect it to your local backend:

1. In your Lovable project, set the environment variable:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
2. The app automatically falls back to mock data when the backend is unreachable.

### Running Both Together

1. Start MongoDB locally (or use MongoDB Atlas free tier)
2. Start backend: `cd backend && npm run dev`
3. Frontend runs in Lovable preview or `npm run dev` locally
