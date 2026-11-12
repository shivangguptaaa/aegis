const jwt = require("jsonwebtoken");
const collegeModel = require("../models/college-model");
const studentModel = require("../models/student-model");

function extractToken(req, cookieName) {
  if (req.cookies && req.cookies[cookieName]) {
    return req.cookies[cookieName];
  }
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}

const isCollegeLoggedIn = async (req, res, next) => {
  try {
    const token = extractToken(req, "collegeToken");
    if (!token) {
      return res.status(401).json({ success: false, message: "Please login first" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role && decoded.role !== "college") {
      return res.status(401).json({ success: false, message: "Invalid college session" });
    }

    const college = await collegeModel.findById(decoded.id);
    if (!college || !college.isVerified) {
      return res.status(401).json({ success: false, message: "College not found or unverified" });
    }

    req.college = college;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired authentication token" });
  }
};

const isStudentLoggedIn = async (req, res, next) => {
  try {
    const token = extractToken(req, "studentToken");
    if (!token) {
      return res.status(401).json({ success: false, message: "Please login first" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role && decoded.role !== "student") {
      return res.status(401).json({ success: false, message: "Invalid student session" });
    }

    const student = await studentModel.findById(decoded.id);
    if (!student) {
      return res.status(401).json({ success: false, message: "Student not found" });
    }

    req.student = student;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = { isCollegeLoggedIn, isStudentLoggedIn };
