import express from "express";
import Student from "../models/Student.js";
import { chatWithAssistant, generateStudentInsights, semanticSearch } from "../services/aiService.js";

const router = express.Router();

// @route   POST /api/ai/chat
// @desc    Chat with AI assistant
// @access  Public
router.post("/chat", async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const result = await chatWithAssistant(message, context || {});

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("AI Chat Route Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "AI chat failed",
    });
  }
});

// @route   POST /api/ai/insights
// @desc    Generate AI insights for a student
// @access  Public
router.post("/insights", async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const student = await Student.findById(studentId).select("-password");
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const allStudents = await Student.find({}).select("-password");
    const result = await generateStudentInsights(student.toObject(), allStudents);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("AI Insights Route Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate insights",
    });
  }
});

// @route   POST /api/ai/search
// @desc    Semantic search for students
// @access  Public
router.post("/search", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const allStudents = await Student.find({}).select("-password");
    const result = await semanticSearch(query, allStudents);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("AI Search Route Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Semantic search failed",
    });
  }
});

// @route   GET /api/ai/status
// @desc    Check AI service status
// @access  Public
router.get("/status", (req, res) => {
  const hasApiKey = !!process.env.GROQ_API_KEY;
  
  res.status(200).json({
    success: true,
    aiEnabled: hasApiKey,
    message: hasApiKey 
      ? "AI features are fully enabled" 
      : "AI features running in demo mode. Add GROQ_API_KEY to .env for full functionality.",
    features: {
      chat: true,
      insights: true,
      semanticSearch: hasApiKey,
    },
  });
});

export default router;
