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
app.use(helmet({
    contentSecurityPolicy: false,
}));
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://my-note-platform-76tm-674x2er70.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.get("/api/health", (req, res) => res.status(200).json({ status: "OK" }));
if (process.env.NODE_ENV === "production") {
    const frontendDist = path.resolve(__dirname, "../../Frontend/dist");
    app.use(express.static(frontendDist));
    app.get("*", (req, res) => res.sendFile(path.join(frontendDist, "index.html")));
}
app.use((err, req, res, next) => {
    console.error(err);
    res
        .status(err.status || 500)
        .json({ error: err.message || "Internal server error" });
});
export default app;
//# sourceMappingURL=app.js.map