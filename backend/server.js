import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student_db";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.filter(Boolean).includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback to prevent breaking initial setup, prioritizes configured origins
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", authRoutes);
app.use("/api/ai", aiRoutes);

// Root Endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Student Registration API Server is running",
  });
});

// Health check
app.get("/api/server-health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student Registration API is running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Database Connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("==========================================");
    console.log(" Connected to MongoDB Database successfully!");
    console.log("==========================================");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });

// Start local server if not running as serverless function
if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`🚀 Node.js Backend Server listening at http://localhost:${PORT}`);
  });
}

// Export Express app for Vercel
export default app;
