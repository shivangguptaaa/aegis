const fetch = require("node-fetch");
const sendMail = require("./mailer");
const collegeModel = require("../models/college-model");

const notifiedEvents = new Set();
let cachedEvents = null;
let cachedAt = 0;

async function fetchGdacsEvents() {
  const now = Date.now();
  if (cachedEvents && now - cachedAt < 5 * 60 * 1000) {
    return cachedEvents;
  }
  const res = await fetch("https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH");
  if (!res.ok) {
    throw new Error(`GDACS API returned status ${res.status}`);
  }
  const data = await res.json();
  cachedEvents = Array.isArray(data?.features) ? data.features : [];
  cachedAt = now;
  return cachedEvents;
}

const checkDisasters = async () => {
  try {
    const features = await fetchGdacsEvents();
    if (!features.length) return;

    const latest = features[0]?.properties;
    if (!latest || notifiedEvents.has(latest.eventid)) return;

    const eventName = latest.name || "Unknown Event";
    const region = latest.country || "Unknown Region";
    const dateTime = latest.fromdate ? new Date(latest.fromdate).toLocaleString() : "Unknown";
    const alertLevel = latest.alertlevel || "Unknown";
    const alertScore = latest.alertscore || "N/A";
    const severityText = latest.severitydata?.severitytext || "N/A";

    const colleges = await collegeModel.find({ isVerified: true }, "email name");
    if (!colleges.length) return;

    for (const college of colleges) {
      const subject = `⚠️ Urgent Disaster Alert: ${eventName} at ${region}`;
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: #d32f2f; padding: 16px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 22px;">⚠️ Urgent Disaster Alert</h1>
            </div>
            <div style="padding: 24px; color: #333;">
              <h2 style="margin-top:0; font-size: 20px; color: #d32f2f;">Hi ${college.name},</h2>
              <p><strong>${eventName}</strong> has been reported at <strong>${region}</strong>.</p>
              <p><strong>Date & Time:</strong> ${dateTime}</p>
              <p><strong>Alert Level:</strong> ${alertLevel} (Score: ${alertScore})</p>
              <p><strong>Severity:</strong> ${severityText}</p>
            </div>
          </div>
        </div>`;
      await sendMail({ to: college.email, subject, html: htmlContent });
    }

    notifiedEvents.add(latest.eventid);
  } catch (err) {
    console.error("Error in checkDisasters:", err.message);
  }
};

const getLatestDisasters = async (req, res) => {
  try {
    const features = await fetchGdacsEvents();
    const events = features.slice(0, 6).map((f) => ({
      id: f.properties?.eventid,
      name: f.properties?.name || f.properties?.eventtype,
      type: f.properties?.eventtype,
      country: f.properties?.country || "Global",
      alertLevel: f.properties?.alertlevel || "Green",
      date: f.properties?.fromdate,
      severity: f.properties?.severitydata?.severitytext || "",
    }));
    res.json({ success: true, events });
  } catch (err) {
    res.status(502).json({ success: false, message: "Could not fetch GDACS disaster feed", events: [] });
  }
};

module.exports = checkDisasters;
module.exports.getLatestDisasters = getLatestDisasters;
