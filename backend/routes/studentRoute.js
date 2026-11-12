const express = require("express");
const { studentRegister, studentLogin, studentLogout, studentVerify } = require("../controllers/authController");
const { Quiz } = require("../controllers/quizController");
const { studentDetails, studentAlerts } = require("../controllers/studentController");
const { isStudentLoggedIn } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", isStudentLoggedIn, studentDetails);
router.get("/alerts", isStudentLoggedIn, studentAlerts);
router.post("/register", studentRegister);
router.post("/login", studentLogin);
router.get("/logout", isStudentLoggedIn, studentLogout);
router.get("/verify", isStudentLoggedIn, studentVerify);
router.post("/quiz", isStudentLoggedIn, Quiz);

module.exports = router;
