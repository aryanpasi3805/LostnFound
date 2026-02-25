const controller = require("../controllers/itemController");
console.log(controller);
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