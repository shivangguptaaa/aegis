const mongoose = require("mongoose");
const collegeModel = require("../models/college-model");
const studentModel = require("../models/student-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("../util/mailer");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;

function getCookieOptions(maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: isProd && process.env.CROSS_SITE_COOKIES === "true" ? "none" : "lax",
    secure: isProd,
    maxAge: maxAgeMs,
  };
}

function buildOtpHtml(collegeName, otp) {
  return `
    <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
      <h2>College Registration OTP</h2>
      <p>Hello <strong>${collegeName}</strong>,</p>
      <p>Your OTP for college registration is:</p>
      <h1 style="color: #0b76ef; letter-spacing: 4px;">${otp}</h1>
      <p>It is valid for <strong>10 minutes</strong>.</p>
      <p>If you did not register, please ignore this email.</p>
    </div>
  `;
}

module.exports.collegeRegister = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";
    const phone = (req.body.phone || "").trim();

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: "Please enter a valid 10-digit phone number" });
    }

    const existingVerified = await collegeModel.findOne({
      $or: [{ email }, { name }],
      isVerified: true,
    });
    if (existingVerified) {
      const conflictField = existingVerified.email === email ? "Email" : "College name";
      return res.status(409).json({ success: false, message: `${conflictField} already registered` });
    }

    // Remove any stale unverified registration for the same email/name so user can retry cleanly
    await collegeModel.deleteMany({
      $or: [{ email }, { name }],
      isVerified: false,
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const college = await collegeModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      otp,
      otpExpiresAt: Date.now() + 10 * 60 * 1000,
    });

    try {
      await sendMail({
        to: email,
        subject: "Your Aegis College Registration OTP",
        text: `Your OTP is ${otp}. Valid for 10 minutes.`,
        html: buildOtpHtml(college.name, otp),
      });
    } catch (mailErr) {
      console.warn("Mail dispatch skipped/failed:", mailErr.message);
    }

    res.cookie("otpCollegeId", college._id.toString(), getCookieOptions(10 * 60 * 1000));

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify within 10 minutes.",
      otpCollegeId: college._id.toString(),
      demoOtp: otp,
    });
  } catch (err) {
    console.error("collegeRegister error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

module.exports.verifyOtp = async (req, res) => {
  try {
    const otp = String(req.body.otp || "").trim();
    const collegeId = req.cookies.otpCollegeId || req.body.otpCollegeId;

    if (!collegeId) {
      return res.status(400).json({ success: false, message: "OTP session expired. Please register again." });
    }
    if (!/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: "Please enter a valid 6-digit OTP" });
    }

    const college = await collegeModel.findById(collegeId);
    if (!college) {
      return res.status(400).json({ success: false, message: "Registration not found. Please register again." });
    }
    if (college.isVerified) {
      return res.status(400).json({ success: false, message: "College is already verified. Please login." });
    }

    if (Date.now() > new Date(college.otpExpiresAt).getTime()) {
      await collegeModel.findByIdAndDelete(college._id);
      res.clearCookie("otpCollegeId", getCookieOptions(0));
      return res.status(400).json({ success: false, message: "OTP expired. Please register again." });
    }

    college.otpAttempts += 1;

    if (parseInt(otp, 10) !== college.otp) {
      if (college.otpAttempts >= 3) {
        await collegeModel.findByIdAndDelete(college._id);
        res.clearCookie("otpCollegeId", getCookieOptions(0));
        return res.status(400).json({ success: false, message: "Maximum attempts exceeded. Registration removed." });
      }
      await college.save();
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. Attempts left: ${3 - college.otpAttempts}`,
      });
    }

    college.isVerified = true;
    college.otp = null;
    college.otpAttempts = 0;
    college.otpExpiresAt = null;
    await college.save();

    const token = jwt.sign({ id: college._id, email: college.email, role: "college" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("collegeToken", token, getCookieOptions());
    res.clearCookie("otpCollegeId", getCookieOptions(0));

    return res.status(200).json({
      success: true,
      message: "College verified and registered successfully",
      token,
      data: { id: college._id, name: college.name, email: college.email },
    });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.resendOtp = async (req, res) => {
  try {
    const collegeId = req.cookies.otpCollegeId || req.body.otpCollegeId;
    if (!collegeId) {
      return res.status(400).json({ success: false, message: "No active registration session. Please register again." });
    }

    const college = await collegeModel.findById(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: "Registration not found. Please register again." });
    }
    if (college.isVerified) {
      return res.status(400).json({ success: false, message: "Already verified. Please login." });
    }

    const otp = generateOTP();
    college.otp = otp;
    college.otpAttempts = 0;
    college.otpExpiresAt = Date.now() + 10 * 60 * 1000;
    await college.save();

    await sendMail({
      to: college.email,
      subject: "Your New Aegis College Registration OTP",
      text: `Your new OTP is ${otp}. Valid for 10 minutes.`,
      html: buildOtpHtml(college.name, otp),
    });

    res.cookie("otpCollegeId", college._id.toString(), getCookieOptions(10 * 60 * 1000));
    return res.status(200).json({ success: true, message: "A new 6-digit OTP has been sent to your email." });
  } catch (err) {
    console.error("resendOtp error:", err);
    return res.status(500).json({ success: false, message: "Failed to resend OTP" });
  }
};

module.exports.collegeLogin = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const college = await collegeModel.findOne({ email });
    if (!college) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    if (!college.isVerified) {
      return res.status(401).json({ success: false, message: "Please verify your email via OTP before logging in" });
    }

    const isMatch = await bcrypt.compare(password, college.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: college._id, email: college.email, role: "college" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("collegeToken", token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: { id: college._id, name: college.name, email: college.email },
    });
  } catch (err) {
    console.error("collegeLogin error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.collegeLogout = (req, res) => {
  try {
    res.clearCookie("collegeToken", getCookieOptions(0));
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error during logout" });
  }
};

module.exports.studentRegister = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";
    const college = (req.body.college || "").trim();
    const emgMail = (req.body.emgMail || "").trim().toLowerCase();

    if (!name || !email || !password || !college || !emgMail) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (name.length < 2) {
      return res.status(400).json({ success: false, message: "Name must be at least 2 characters long" });
    }
    if (!emailRegex.test(email) || !emailRegex.test(emgMail)) {
      return res.status(400).json({ success: false, message: "Please enter valid email addresses" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }
    if (!mongoose.Types.ObjectId.isValid(college)) {
      return res.status(400).json({ success: false, message: "Please select a valid college" });
    }

    const collegeDoc = await collegeModel.findOne({ _id: college, isVerified: true });
    if (!collegeDoc) {
      return res.status(404).json({ success: false, message: "Selected college was not found or is not verified" });
    }

    const existingStudent = await studentModel.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await studentModel.create({
      name,
      email,
      password: hashedPassword,
      college: collegeDoc._id,
      emgMail,
    });

    const token = jwt.sign({ id: student._id, email: student.email, role: "student" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("studentToken", token, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      token,
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
      },
    });
  } catch (error) {
    console.error("studentRegister error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

module.exports.studentLogin = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const student = await studentModel.findOne({ email });
    if (!student) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: student._id, email: student.email, role: "student" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("studentToken", token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
      },
    });
  } catch (error) {
    console.error("studentLogin error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

module.exports.studentLogout = (req, res) => {
  try {
    res.clearCookie("studentToken", getCookieOptions(0));
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error during logout" });
  }
};

module.exports.studentVerify = (req, res) => {
  res.status(200).json({ success: true, student: { id: req.student._id, name: req.student.name, email: req.student.email } });
};

module.exports.collegeVerify = (req, res) => {
  res.status(200).json({ success: true, college: { id: req.college._id, name: req.college.name, email: req.college.email } });
};
