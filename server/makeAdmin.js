import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);
    
    const result = await User.findOneAndUpdate(
      { email: "admin@college.edu" }, 
      { password: hashedPassword, role: "admin", name: "System Admin", isVerified: true }, 
      { upsert: true, new: true }
    );
    
    console.log("✅ Admin account configured. You can now login with:");
    console.log("Email: admin@college.edu");
    console.log("Password: admin123");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
