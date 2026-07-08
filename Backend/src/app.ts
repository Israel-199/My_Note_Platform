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

// ---------------- Security ----------------
app.use(
  helmet({
    contentSecurityPolicy: false, // temporarily disable CSP to fix blob errors
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://my-note-platform-76tm-674x2er70.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// Health check
app.get("/api/health", (req, res) => res.status(200).json({ status: "OK" }));

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.resolve(__dirname, "../../Frontend/dist");
  app.use(express.static(frontendDist));
  app.get("*", (req, res) =>
    res.sendFile(path.join(frontendDist, "index.html")),
  );
}

// Error handling
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal server error" });
  },
);

export default app;
