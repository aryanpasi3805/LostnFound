import express from "express";
import auth from "../middleware/auth.js";
import Item from "../models/Item.js";
import { calculateMatch } from "../utils/matchingEngine.js";

const router = express.Router();

router.get("/:itemId", auth, async (req, res) => {
  const item = await Item.findById(req.params.itemId);
  const items = await Item.find({ _id: { $ne: item._id } });

  const matches = items
    .map(i => ({
      item: i,
      score: calculateMatch(item, i)
    }))
    .filter(m => m.score >= 40)
    .sort((a, b) => b.score - a.score);

  res.json({ success: true, data: matches });
});

export default router;