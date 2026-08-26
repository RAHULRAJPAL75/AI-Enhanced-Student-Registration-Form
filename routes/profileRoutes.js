import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import Student from "../models/Student.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDirectory, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadsDirectory),
    filename: (_req, file, callback) => {
      callback(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, callback) => {
    callback(null, ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.mimetype));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please select a valid image file." });
    }

    if (!req.body._id) {
      return res.status(400).json({ success: false, message: "Student ID is required." });
    }

    const student = await Student.findByIdAndUpdate(
      req.body._id,
      { profileImage: `/uploads/${req.file.filename}` },
      { new: true, runValidators: true },
    ).select("-password");

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    return res.json({ success: true, imageUrl: student.profileImage, student });
  } catch (error) {
    console.error("Profile image upload failed:", error);
    return res.status(500).json({ success: false, message: error.message || "Profile image upload failed." });
  }
});

export default router;
