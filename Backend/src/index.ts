import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";

dotenv.config();

// ---------------- Constants ----------------
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/my-notes";

// ---------------- __dirname fix for ES Modules ----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- Serve Frontend in Production ----------------
if (process.env.NODE_ENV === "production") {
  // Absolute path from Backend/dist → Frontend/dist
  const frontendDist = path.resolve(__dirname, "../../Frontend/dist");
  console.log("Serving frontend from:", frontendDist);

  app.use(express.static(frontendDist));

  // SPA fallback for React Router
  app.get("*", (_, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// ---------------- Connect MongoDB ----------------
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `📱 Client URL: ${
          process.env.NODE_ENV === "production"
            ? "Production frontend served by backend"
            : process.env.CLIENT_URL || "http://localhost:5173"
        }`
      );
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
