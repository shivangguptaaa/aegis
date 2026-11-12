const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  disasterType: {
    type: String,
    required: true,
    trim: true,
    default: "General",
  },
  severity: {
    type: String,
    enum: ["Drill", "Advisory", "Warning", "Emergency"],
    default: "Advisory",
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 600,
  },
  recipientsCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Alert", alertSchema);
