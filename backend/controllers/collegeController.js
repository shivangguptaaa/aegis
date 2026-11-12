const collegeModel = require("../models/college-model");
const studentModel = require("../models/student-model");
const alertModel = require("../models/alert-model");
const sendMail = require("../util/mailer");

function formatDisasterLabel(key) {
  return String(key || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

module.exports.listVerifiedColleges = async (req, res) => {
  try {
    const colleges = await collegeModel
      .find({ isVerified: true })
      .select("_id name")
      .sort({ name: 1 })
      .lean();
    return res.status(200).json({ success: true, colleges });
  } catch (error) {
    console.error("Error listing colleges:", error);
    return res.status(500).json({ success: false, message: "Failed to load colleges" });
  }
};

module.exports.studentsOfACollege = async (req, res) => {
  try {
    if (!req.college || !req.college.email) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. College email not found.",
      });
    }

    const college = await collegeModel.findOne({ email: req.college.email });
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found. Please contact support.",
      });
    }

    const students = await studentModel
      .find({ college: college._id })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const disasterKeys = ["earthquake", "landslide", "tsunami", "flood", "drought", "cyclone", "heatWave", "fire"];
    const moduleCompletionCounts = Object.fromEntries(disasterKeys.map((k) => [k, 0]));

    let totalCompletionSum = 0;
    let certifiedCount = 0;

    for (const s of students) {
      let done = 0;
      for (const k of disasterKeys) {
        if (s.disasters?.[k]?.module) {
          done++;
          moduleCompletionCounts[k]++;
        }
      }
      totalCompletionSum += Math.round((done / disasterKeys.length) * 100);
      if (done === disasterKeys.length) certifiedCount++;
    }

    let weakestModule = "Earthquake";
    if (students.length > 0) {
      const sortedWeakest = Object.entries(moduleCompletionCounts).sort((a, b) => a[1] - b[1]);
      weakestModule = formatDisasterLabel(sortedWeakest[0][0]);
    }

    const alerts = await alertModel
      .find({ college: college._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      college: { id: college._id, name: college.name, email: college.email },
      student: students || [],
      count: students ? students.length : 0,
      analytics: {
        totalStudents: students.length,
        averageReadinessPercent: students.length ? Math.round(totalCompletionSum / students.length) : 0,
        certifiedCount,
        weakestModule: students.length ? weakestModule : "N/A",
      },
      alerts,
      message: !students || students.length === 0 ? "No students registered with this college yet" : undefined,
    });
  } catch (error) {
    console.error("Error in studentsOfACollege:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

module.exports.broadcastCampusAlert = async (req, res) => {
  try {
    const college = await collegeModel.findById(req.college._id);
    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    const title = String(req.body.title || "").trim();
    const disasterType = String(req.body.disasterType || "General").trim();
    const severity = ["Drill", "Advisory", "Warning", "Emergency"].includes(req.body.severity)
      ? req.body.severity
      : "Advisory";
    const message = String(req.body.message || "").trim();

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Alert title and instructions are required." });
    }

    const students = await studentModel.find({ college: college._id }).select("name email emgMail").lean();
    const recipientEmails = new Set();
    for (const s of students) {
      if (s.email) recipientEmails.add(s.email);
      if (s.emgMail) recipientEmails.add(s.emgMail);
    }

    let emailedCount = 0;
    const emailPromises = Array.from(recipientEmails).slice(0, 50).map(async (recipient) => {
      try {
        await sendMail({
          to: recipient,
          subject: `[${severity.toUpperCase()}] ${college.name}: ${title}`,
          html: `
            <div style="font-family: Arial, sans-serif; background:#0f172a; color:#e2e8f0; padding:24px; border-radius:12px;">
              <h2 style="margin:0 0 8px 0; color:${severity === "Emergency" || severity === "Warning" ? "#f87171" : "#60a5fa"};">
                ⚠️ ${severity}: ${title}
              </h2>
              <p style="margin:0 0 12px 0; color:#94a3b8;">Issued by <strong>${college.name}</strong> • Category: <strong>${disasterType}</strong></p>
              <div style="background:#1e293b; padding:16px; border-radius:8px; border-left:4px solid #3b82f6; line-height:1.5;">
                ${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
              </div>
              <p style="margin-top:16px; font-size:12px; color:#94a3b8;">Aegis Campus Preparedness Network • National Emergency: 112</p>
            </div>
          `,
        });
        emailedCount++;
      } catch (mailErr) {
        console.warn(`Alert email skipped for ${recipient}:`, mailErr.message);
      }
    });

    await Promise.all(emailPromises);

    const savedAlert = await alertModel.create({
      college: college._id,
      title,
      disasterType,
      severity,
      message,
      recipientsCount: students.length,
    });

    return res.status(201).json({
      success: true,
      message: `Broadcast logged for ${students.length} student(s) (${emailedCount} notification email(s) delivered).`,
      alert: savedAlert,
      emailedCount,
      studentCount: students.length,
    });
  } catch (err) {
    console.error("Broadcast alert error:", err);
    return res.status(500).json({ success: false, message: "Failed to broadcast campus alert" });
  }
};
