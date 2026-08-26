import express from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import Student from "../models/Student.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import profileRoutes from "./profileRoutes.js";

const router = express.Router();

const getStudentId = (student) => student._id?.toString() || student.id;

const formatStudent = (student) => {
  const studentObject = student.toObject ? student.toObject() : student;
  const { password, ...safeStudent } = studentObject;
  return {
    ...safeStudent,
    id: safeStudent._id?.toString() || safeStudent.id,
  };
};

const isValidStudentId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route   POST /api/register
// @desc    Register a new student in MongoDB
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, bio, stats, skills, tools, projects, certs, roadmap } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields (Name, Email, Password).",
      });
    }

    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "A student with this email address already exists.",
      });
    }

    const student = await Student.create({
      name,
      email,
      password,
      role: role && ["student", "instructor", "admin"].includes(role) ? role : "student",
      bio: bio || "",
      stats: Array.isArray(stats) ? stats : [],
      skills: Array.isArray(skills) ? skills : [],
      tools: Array.isArray(tools) ? tools : [],
      projects: Array.isArray(projects) ? projects : [],
      certs: Array.isArray(certs) ? certs : [],
      roadmap: Array.isArray(roadmap) ? roadmap : [],
    });

    res.status(201).json({
      success: true,
      message: "Student registered successfully in MongoDB!",
      student: formatStudent(student),
    });
  } catch (error) {
    console.error("Error registering student:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while creating student profile.",
    });
  }
});

// @route   POST /api/login
// @desc    Authenticate student & get user details
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await student.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful!",
      student: formatStudent(student),
    });
  } catch (error) {
    console.error("Error logging in student:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while logging in.",
    });
  }
});

// @route   POST /api/forgot-password
// @desc    Send a password reset verification code to the user's Gmail address
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address.",
      });
    }

    const student = await Student.findOne({ email: cleanEmail }).select("+resetCode +resetCodeExpires");
    if (!student) {
      return res.status(200).json({
        success: true,
        message: "If an account exists for that email, a verification code has been sent.",
      });
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    student.resetCode = crypto.createHash("sha256").update(code).digest("hex");
    student.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await student.save();

    try {
      await sendPasswordResetEmail({ to: cleanEmail, code });
    } catch (mailErr) {
      student.resetCode = undefined;
      student.resetCodeExpires = undefined;
      await student.save();
      console.error(`[forgot-password] Gmail delivery failed: ${mailErr.message}`);
      return res.status(503).json({
        success: false,
        message: "Verification email could not be sent. Please contact the administrator.",
      });
    }

    res.status(200).json({
      success: true,
      message: "A verification code has been sent to your Gmail address. It expires in 10 minutes.",
    });
  } catch (error) {
    console.error("Error generating reset code:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while generating reset code.",
    });
  }
});

// @route   POST /api/reset-password
// @desc    Verify reset code and set a new password
// @access  Public
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, password } = req.body;
    const cleanEmail = email?.trim().toLowerCase();
    const cleanCode = String(code || "").trim();
    const cleanPassword = password?.trim();

    if (!cleanEmail || !cleanCode) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email and the reset code.",
      });
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const student = await Student.findOne({ email: cleanEmail }).select("+resetCode +resetCodeExpires");
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "No account found with that email address.",
      });
    }

    const codeHash = crypto.createHash("sha256").update(cleanCode).digest("hex");
    if (!student.resetCode || student.resetCode !== codeHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code. Please request a new one.",
      });
    }

    if (!student.resetCodeExpires || student.resetCodeExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Reset code has expired. Please request a new one.",
      });
    }

    student.password = cleanPassword;
    student.resetCode = undefined;
    student.resetCodeExpires = undefined;
    await student.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while resetting password.",
    });
  }
});

// @route   GET /api/students
// @desc    Get list of all registered students
// @access  Public
router.get("/students", async (req, res) => {
  try {
    const students = await Student.find({}).select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching students.",
    });
  }
});

// @route   POST /api/students
// @desc    Create a new student from the dashboard
// @access  Public
router.post("/students", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const existingStudent = await Student.findOne({ email: cleanEmail });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "A student with this email address already exists.",
      });
    }

    const student = await Student.create({
      name: cleanName,
      email: cleanEmail,
      password,
      role: role && ["student", "instructor", "admin"].includes(role) ? role : "student",
    });

    res.status(201).json({
      success: true,
      message: "Student record created successfully.",
      student: formatStudent(student),
    });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while creating student record.",
    });
  }
});

// @route   PUT /api/students/:id
// @desc    Update a student record from the dashboard
// @access  Public
router.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, bio, stats, skills, tools, projects, certs, roadmap } = req.body;
    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!isValidStudentId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student record id.",
      });
    }

    if (!cleanName || !cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Please provide both name and email.",
      });
    }

    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student record not found.",
      });
    }

    const emailOwner = await Student.findOne({ email: cleanEmail });
    if (emailOwner && getStudentId(emailOwner) !== id) {
      return res.status(400).json({
        success: false,
        message: "A student with this email address already exists.",
      });
    }

    student.name = cleanName;
    student.email = cleanEmail;
    if (password) {
      student.password = password;
    }
    if (role && ["student", "instructor", "admin"].includes(role)) {
      student.role = role;
    }
    if (bio !== undefined) {
      student.bio = bio;
    }
    if (Array.isArray(stats)) {
      student.stats = stats;
    }
    if (Array.isArray(skills)) {
      student.skills = skills;
    }
    if (Array.isArray(tools)) {
      student.tools = tools;
    }
    if (Array.isArray(projects)) {
      student.projects = projects;
    }
    if (Array.isArray(certs)) {
      student.certs = certs;
    }
    if (Array.isArray(roadmap)) {
      student.roadmap = roadmap;
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: "Student record updated successfully.",
      student: formatStudent(student),
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while updating student record.",
    });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete a student record from the dashboard
// @access  Public
router.delete("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidStudentId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student record id.",
      });
    }

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student record not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student record deleted successfully.",
      deletedId: id,
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while deleting student record.",
    });
  }
});

// @route   GET /api/health
// @desc    Health check & MongoDB connection status
// @access  Public
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Node.js Express Backend running cleanly.",
    timestamp: new Date(),
  });
});

// Profile routes for image upload and deletion
router.use("/profile", profileRoutes);

export default router;
