import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ---------------- Security ----------------
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---------------- Middleware ----------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- Serve Frontend in Production ----------------
if (process.env.NODE_ENV === "production") {
  // Absolute path from Backend/dist → Frontend/dist
  const frontendDist = path.resolve(__dirname, "../../Frontend/dist");
  console.log("Serving frontend from:", frontendDist);

  app.use(express.static(frontendDist));

  // SPA fallback for React Router
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });

// ---------------- API Routes ----------------
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ---------------- Error Handling ----------------
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});
}

export default app;
