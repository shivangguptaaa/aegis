const mongoose = require("mongoose");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;

const collegeModel = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "College name is required"],
        unique: true,
        minlength: [2, "College name must be at least 2 characters long"],
        maxlength: [100, "College name can’t exceed 100 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [emailRegex, "Please enter a valid email address"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    phone: {
        type: String,
        match: [phoneRegex, "Please enter a valid 10-digit phone number"],
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: Number
    },
    otpExpiresAt: {
        type: Date
    },
    otpAttempts: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("college", collegeModel); 