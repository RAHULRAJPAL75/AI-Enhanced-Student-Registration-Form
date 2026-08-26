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
const uploadsDirectory = process.env.VERCEL ? "/tmp" : path.join(__dirname, "..", "uploads");

try {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
} catch (e) {
  // Ignore on read-only serverless filesystems
}

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// Initialize multer with the storage and file filter
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// @route   POST /api/profile/image
// @desc    Upload profile image
// @access  Private (student or admin)
// Note: In a real application, you'd add proper authentication/authorization here
router.post("/image", upload.single("image"), async (req, res) => {
  try {
    // In a real app, you'd verify the user is authenticated and authorized
    // For now, we'll assume the user is authenticated
    
    const { _id } = req.body; // Expecting student ID in request body
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }
    
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }
    
    // Find student and update profile image
    const student = await Student.findByIdAndUpdate(
      _id,
      { profileImage: `/uploads/${req.file.filename}` },
      { new: true, runValidators: true }
    );
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      imageUrl: student.profileImage,
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while uploading image",
    });
  }
});

// @route   DELETE /api/profile/image
// @desc    Delete profile image
// @access  Private (student or admin)
// Note: In a real application, you'd add proper authentication/authorization here
router.delete("/image", async (req, res) => {
  try {
    // In a real app, you'd verify the user is authenticated and authorized
    // For now, we'll assume the user is authenticated
    
    const { _id } = req.body; // Expecting student ID in request body
    
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }
    
    // Find student and clear profile image
    const student = await Student.findByIdAndUpdate(
      _id,
      { profileImage: "" },
      { new: true, runValidators: true }
    );
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    
    // Optionally delete the file from the server
    // This would require knowing the actual file path, which we don't store
    // In a real app, you might want to implement file deletion
    
    res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while deleting image",
    });
  }
});

export default router;