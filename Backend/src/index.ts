import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

dotenv.config();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/my-notes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  // Serve frontend build folder
  app.use(express.static(path.join(__dirname, "../../Frontend/dist")));

  // Catch-all for SPA (React Router)
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../Frontend/dist/index.html"));
  });
}

// ---------------- MongoDB Connection ----------------
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

// ---------------- Graceful Shutdown ----------------
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("📪 Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});
