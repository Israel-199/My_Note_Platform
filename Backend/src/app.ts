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
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false, // important in v7
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "blob:"],
        "script-src-elem": ["'self'", "'unsafe-inline'", "blob:"], // fixes your blob issue
        "worker-src": ["'self'", "blob:"], // allows Vite web workers
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "blob:"],
        "connect-src": ["'self'", "ws:", "http:", "https:"],
        "font-src": ["'self'", "data:"]
      }
    }
  })
);



const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// ---------------- CORS ----------------
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

// ---------------- API Routes ----------------
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ---------------- Serve Frontend in Production ----------------
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.resolve(__dirname, "../../Frontend/dist");
  console.log("Serving frontend from:", frontendDist);

  // Serve static frontend files
  app.use(express.static(frontendDist));

  // SPA fallback (must be last!)
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// ---------------- Error Handling ----------------
app.use(
  (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal server error",
    });
  }
);

export default app;
