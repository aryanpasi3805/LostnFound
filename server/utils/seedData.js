import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// Models
import User from "../models/User.js";
import Item from "../models/Item.js";
import Claim from "../models/Claim.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ MongoDB connected for seeding");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Item.deleteMany({});
    await Claim.deleteMany({});

    // Users
    const salt = await bcrypt.genSalt(10);

    const adminPassword = await bcrypt.hash("admin123", salt);
    const userPassword = await bcrypt.hash("pass123", salt);

    const users = await User.insertMany([
      { name: "Admin User", email: "admin@college.edu", password: adminPassword, role: "admin", isVerified: true },
      { name: "Rahul Sharma", email: "rahul@college.edu", password: userPassword, role: "user", isVerified: true },
      { name: "Priya Patel", email: "priya@college.edu", password: userPassword, role: "user", isVerified: true }
    ]);

    // Items
    const items = await Item.insertMany([
      {
        title: "Blue Nike Backpack",
        type: "lost",
        category: "Accessories",
        description: "Navy blue Nike backpack with laptop compartment. Has a small tear on the right strap.",
        location: "Library 2nd Floor",
        status: "lost",
        identifiers: { brand: "Nike", color: "Navy Blue", uniqueMarks: "Small tear on right strap" },
        reportedBy: users[1]._id
      },
      {
        title: "MacBook Pro Charger",
        type: "found",
        category: "Electronics",
        description: "67W USB-C charger found near outlet in Study Hall B",
        location: "Study Hall B",
        status: "found",
        identifiers: { brand: "Apple", color: "White", uniqueMarks: "Scratch on connector" },
        reportedBy: users[2]._id
      },
      {
        title: "Student ID Card",
        type: "found",
        category: "Documents",
        description: "Student ID card found in cafeteria",
        location: "Main Cafeteria",
        status: "found",
        identifiers: { brand: "", color: "White/Blue", uniqueMarks: "2024 batch" },
        reportedBy: users[2]._id
      }
    ]);

    console.log("✅ Seed data inserted successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding data:", err.message);
    process.exit(1);
  }
};

connectDB().then(seedData);