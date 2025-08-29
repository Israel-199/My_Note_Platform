import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

dotenv.config();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/my-notes";

if (process.env.NODE_ENV === "production") {
  // Use project root + Frontend/dist
  const frontendDist = path.join(process.cwd(), "Frontend/dist");

  app.use(express.static(frontendDist));

  // SPA fallback
  app.get("*", (_, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
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
