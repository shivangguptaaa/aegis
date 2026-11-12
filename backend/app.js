require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const DB = require("./config/db");
const collegeRoute = require("./routes/collegeRoute");
const studentRoute = require("./routes/studentRoute");
const chatRoute = require("./routes/chatRoute");
const checkDisasters = require("./util/checkDisaster");
const startCollegeCleanup = require("./util/cleanup");

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = new Set(
  [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((s) => s.trim()) : []),
  ].filter(Boolean)
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    dbConnected: mongoose.connection.readyState === 1,
  });
});

app.use("/college", collegeRoute);
app.use("/student", studentRoute);
app.use("/aegis", chatRoute);

const distDir = path.join(__dirname, "..", "frontend", "dist");
if ((process.env.SERVE_FRONTEND === "true" || process.env.NODE_ENV === "production") && fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

const PORT = process.env.PORT || 5000;

(async () => {
  await DB();
  // Drop legacy unique index on emgMail if present so students can share guardian email
  try {
    await mongoose.connection.db.collection("students").dropIndex("emgMail_1");
    console.log("Dropped legacy unique index emgMail_1");
  } catch (_) {}

  startCollegeCleanup();

  app.listen(PORT, () => {
    console.log("Aegis backend running on port:", PORT);
    if (process.env.ENABLE_DISASTER_ALERTS === "true") {
      checkDisasters();
      setInterval(checkDisasters, 60 * 60 * 1000);
    }
  });
})();
