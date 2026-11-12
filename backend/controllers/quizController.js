const studentModel = require("../models/student-model");

const DISASTER_KEY_MAP = {
  earthquake: "earthquake",
  landslide: "landslide",
  tsunami: "tsunami",
  flood: "flood",
  drought: "drought",
  cyclone: "cyclone",
  heatwave: "heatWave",
  fire: "fire",
};

module.exports.Quiz = async (req, res) => {
  try {
    const rawType = String(req.body.type || "").trim().toLowerCase();
    const disasterKey = DISASTER_KEY_MAP[rawType];
    const score = Number(req.body.score);
    const completed = req.body.module !== false;

    if (!disasterKey) {
      return res.status(400).json({ success: false, message: "Invalid disaster type" });
    }
    if (!Number.isFinite(score) || score < 0 || score > 10) {
      return res.status(400).json({ success: false, message: "Invalid score (expected 0-10)" });
    }

    const student = await studentModel.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const prevScore = student.disasters[disasterKey]?.score || 0;
    student.disasters[disasterKey].score = Math.max(prevScore, score);
    student.disasters[disasterKey].module = completed;
    await student.save();

    return res.json({
      success: true,
      message: "Quiz updated successfully",
      disaster: disasterKey,
      score: student.disasters[disasterKey].score,
    });
  } catch (err) {
    console.error("Quiz update error:", err);
    return res.status(500).json({ success: false, message: "Failed to save quiz score" });
  }
};
