import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import cron from "node-cron";
import axios from "axios";
dotenv.config();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/my-notes";
mongoose
    .connect(MONGODB_URI)
    .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📱 Client URL: ${process.env.NODE_ENV === "production"
            ? "Production frontend served by backend"
            : process.env.CLIENT_URL || "http://localhost:5173"}`);
        if (process.env.RENDER_EXTERNAL_URL) {
            const SELF_URL = process.env.RENDER_EXTERNAL_URL;
            cron.schedule("*/14 * * * *", async () => {
                try {
                    await axios.get(SELF_URL);
                    console.log("💓 Pinged Render to stay awake:", SELF_URL);
                }
                catch (err) {
                    if (err instanceof Error) {
                        console.error("❌ Error pinging Render:", err.message);
                    }
                    else {
                        console.error("❌ Error pinging Render:", err);
                    }
                }
            });
        }
    });
})
    .catch((error) => {
    if (error instanceof Error) {
        console.error("❌ MongoDB connection error:", error.message);
    }
    else {
        console.error("❌ MongoDB connection error:", error);
    }
    process.exit(1);
});
process.on("SIGINT", async () => {
    try {
        await mongoose.connection.close();
        console.log("📪 Database connection closed");
        process.exit(0);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error during shutdown:", error.message);
        }
        else {
            console.error("Error during shutdown:", error);
        }
        process.exit(1);
    }
});
//# sourceMappingURL=index.js.map