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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", authRoutes);
app.use("/api/ai", aiRoutes);

// Root Endpoint
app.get("/", (req, res) => {
  res.send({
    message: "Student Registration API Server is running",
    mongoURI: MONGO_URI,
    endpoints: {
      health: "/api/health",
      register: "POST /api/register",
      login: "POST /api/login",
      students: "GET /api/students",
      createStudent: "POST /api/students",
      updateStudent: "PUT /api/students/:id",
      deleteStudent: "DELETE /api/students/:id",
    },
  });
});

// Database Connection & Server Start
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("==========================================");
    console.log(" Connected to MongoDB Database successfully!");
    console.log(` MongoDB Compass URI: ${MONGO_URI}`);
    console.log("==========================================");

    app.listen(PORT, () => {
      console.log(`🚀 Node.js Backend Server listening at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    app.listen(PORT, () => {
      console.log(`🚀 Node.js Backend Server listening at http://localhost:${PORT} (Database pending)`);
    });
  });
