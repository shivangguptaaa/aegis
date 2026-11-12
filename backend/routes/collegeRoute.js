const express = require("express");
const {
  collegeRegister,
  verifyOtp,
  resendOtp,
  collegeLogin,
  collegeLogout,
  collegeVerify,
} = require("../controllers/authController");
const {
  studentsOfACollege,
  listVerifiedColleges,
  broadcastCampusAlert,
} = require("../controllers/collegeController");
const { isCollegeLoggedIn } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/list", listVerifiedColleges);
router.post("/register", collegeRegister);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", collegeLogin);
router.get("/logout", isCollegeLoggedIn, collegeLogout);
router.get("/verify", isCollegeLoggedIn, collegeVerify);
router.get("/students", isCollegeLoggedIn, studentsOfACollege);
router.post("/broadcast", isCollegeLoggedIn, broadcastCampusAlert);

module.exports = router;
