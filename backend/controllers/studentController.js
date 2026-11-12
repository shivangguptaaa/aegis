const studentModel = require("../models/student-model");
const alertModel = require("../models/alert-model");

module.exports.studentDetails = async (req, res) => {
  try {
    const student = await studentModel
      .findOne({ email: req.student.email })
      .select("-password")
      .populate("college", "name");

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    return res.status(200).json({ success: true, account: student });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.studentAlerts = async (req, res) => {
  try {
    const alerts = await alertModel
      .find({ college: req.student.college })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    return res.status(200).json({ success: true, alerts });
  } catch (err) {
    console.error("Error fetching student alerts:", err);
    return res.status(500).json({ success: false, alerts: [] });
  }
};
