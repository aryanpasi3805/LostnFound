import Item from "../models/Item.js";

// GET all items (with optional filters)
export const getItems = async (req, res) => {
  try {
    const { category, status, type, search, date } = req.query;
    let query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) query.title = { $regex: search, $options: "i" };
    if (date) query.date = { $eq: new Date(date) };

    const items = await Item.find(query).populate("reportedBy", "name email");

    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single item
export const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "reportedBy",
      "name email"
    );
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE new item
export const createItem = async (req, res) => {
  try {
    const images = req.files?.map(file => `/uploads/${file.filename}`) || [];
    const item = new Item({
      ...req.body,
      images,
      reportedBy: req.user.id,
      status: req.body.type // default: lost or found
    });
    await item.save();
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE item (only reporter or admin)
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    if (item.reportedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Merge updates
    Object.assign(item, req.body);

    // Append new images if uploaded
    if (req.files?.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      item.images.push(...newImages);
    }

    await item.save();
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE item (only reporter or admin)
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    if (item.reportedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await item.deleteOne();
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};