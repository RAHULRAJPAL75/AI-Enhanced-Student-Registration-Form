import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    resetCode: {
      type: String,
      select: false,
      default: undefined,
    },
    resetCodeExpires: {
      type: Date,
      select: false,
      default: undefined,
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    stats: {
      type: Array,
      default: [],
    },
    skills: {
      type: Array,
      default: [],
    },
    tools: {
      type: Array,
      default: [],
    },
    projects: {
      type: Array,
      default: [],
    },
    certs: {
      type: Array,
      default: [],
    },
    roadmap: {
      type: Array,
      default: [],
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model("Student", studentSchema);

export default Student;
