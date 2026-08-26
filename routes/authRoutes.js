import express from "express";
import Student from "../models/Student.js";
import profileRoutes from "./profileRoutes.js";

const router = express.Router();

// @route   POST /api/register
// @desc    Register a new student in MongoDB
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

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
    });

    res.status(201).json({
      success: true,
      message: "Student registered successfully in MongoDB!",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        profileImage: student.profileImage || "",
        createdAt: student.createdAt,
      },
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
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        profileImage: student.profileImage || "",
        createdAt: student.createdAt,
      },
    });
  } catch (error) {
    console.error("Error logging in student:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while logging in.",
    });
  }
});

// @route   GET /api/students?search=query
// @desc    Get list of all registered students, optionally filtered by search
// @access  Public
router.get("/students", async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter = { $or: [{ name: regex }, { email: regex }] };
    }
    const students = await Student.find(filter).select("-password").sort({ createdAt: -1 });
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

// @route   PUT /api/students/:id
// @desc    Update a student's name and/or email
// @access  Public
router.put("/students/:id", async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      return res.status(400).json({ success: false, message: "Name and email are required." });
    }

    const existing = await Student.findOne({ email: cleanEmail, _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Another student already uses this email." });
    }

    const updateData = { name: cleanName, email: cleanEmail };
    if (role && ["student", "instructor", "admin"].includes(role)) {
      updateData.role = role;
    }

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    res.status(200).json({ success: true, message: "Student updated successfully.", student: updated });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ success: false, message: error.message || "Server error while updating student." });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete a student record
// @access  Public
router.delete("/students/:id", async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }
    res.status(200).json({ success: true, message: "Student deleted successfully." });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ success: false, message: error.message || "Server error while deleting student." });
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

router.use("/profile", profileRoutes);

export default router;
