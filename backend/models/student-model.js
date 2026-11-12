const mongoose = require("mongoose");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "college",
      required: true,
    },
    emgMail: {
      type: String,
      required: [true, "Emergency Email is required"],
      lowercase: true,
      trim: true,
      match: [emailRegex, "Please enter a valid emergency email address"],
    },
    disasters: {
      earthquake: {
        score: { type: Number, default: 0 },
        module: { type: Boolean, default: false },
      },
      landslide: {
        score: { type: Number, default: 0 },
        module: { type: Boolean, default: false },
      },
      tsunami: {
        score: { type: Number, default: 0 },
        module: { type: Boolean, default: false },
      },
      flood: {
        score: { type: Number, default: 0 },
        module: { type: Boolean, default: false },
      },
      drought: {
        score: { type: Number, default: 0 },
        module: { type: Boolean, default: false },
      },
      cyclone: {
        score: { type: Number, default: 0 },
        module: { type: Boolean, default: false },
      },
      heatWave: {
        score: { type: Number, default: 0 },
        module: { type: Boolean, default: false },
      },
      fire: {
        score: { type: Number, default: 0 },
        module: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("student", studentSchema);
