import axiosInstance from "./api.js";

const BADGES_BASE_PATH = "/assets/images/badges/";

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.querySelector(".logout-college");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const res = await axiosInstance.get("/college/logout");
        if (res.status === 200) {
          localStorage.removeItem("aegis_college_token");
          alert("Logout Successful");
          window.location.href = "./collegeLogin.html";
        }
      } catch (error) {
        console.error("Logout failed:", error.response?.data || error.message);
        alert("Failed to logout. Please try again.");
      }
    });
  }

  const studentsListContainer = document.getElementById("students-list-container");
  const headerEl = document.querySelector(".dashboard-header h1");
  const searchInput = document.getElementById("studentSearch");
  const recentAlertsBox = document.getElementById("recent-alerts-box");
  const broadcastForm = document.getElementById("broadcastForm");
  const broadcastFeedback = document.getElementById("broadcastFeedback");
  const sendBroadcastBtn = document.getElementById("sendBroadcastBtn");
  const gdacsListEl = document.getElementById("gdacs-feed-list");

  let students = [];
  let recentAlerts = [];

  function renderRecentAlerts() {
    if (!recentAlertsBox) return;
    if (!recentAlerts.length) {
      recentAlertsBox.innerHTML = '<div class="recent-alert-item">No campus alerts dispatched yet.</div>';
      return;
    }
    recentAlertsBox.innerHTML = recentAlerts
      .slice(0, 5)
      .map(
        (a) => `
      <div class="recent-alert-item">
        <strong>[${escapeHtml(a.severity)}] ${escapeHtml(a.title)}</strong> — ${escapeHtml(a.disasterType)} • Sent to ${a.recipientsCount || 0} student(s)
      </div>`
      )
      .join("");
  }

  async function fetchStudents() {
    try {
      const response = await axiosInstance.get("/college/students");
      const data = response.data;
      if (data.college?.name && headerEl) {
        headerEl.textContent = `${data.college.name} — Preparedness Command`;
      }
      if (data.analytics) {
        document.getElementById("kpi-total").textContent = String(data.analytics.totalStudents ?? 0);
        document.getElementById("kpi-avg").textContent = `${data.analytics.averageReadinessPercent ?? 0}%`;
        document.getElementById("kpi-certified").textContent = String(data.analytics.certifiedCount ?? 0);
        document.getElementById("kpi-weakest").textContent = data.analytics.weakestModule || "N/A";
      }
      recentAlerts = data.alerts || [];
      renderRecentAlerts();

      if (data.success && data.student) {
        students = data.student;
        renderStudents();
      } else {
        studentsListContainer.innerHTML = `<div class='error'>${escapeHtml(data.message || "No students found.")}</div>`;
      }
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      studentsListContainer.innerHTML = "<div class='error'>Failed to load students</div>";
    }
  }

  async function fetchGdacsFeed() {
    if (!gdacsListEl) return;
    try {
      const res = await axiosInstance.get("/aegis/disasters");
      const events = res.data?.events || [];
      if (!events.length) {
        gdacsListEl.innerHTML = '<div class="loading-inline">No active GDACS hazard events reported.</div>';
        return;
      }
      gdacsListEl.innerHTML = "";
      events.forEach((ev) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `gdacs-event-btn sev-${escapeHtml(ev.alertLevel)}`;
        btn.innerHTML = `
          <div class="gdacs-ev-top">
            <span>${escapeHtml(ev.name)}</span>
            <span>${escapeHtml(ev.alertLevel)}</span>
          </div>
          <div class="gdacs-ev-meta">${escapeHtml(ev.country)}${ev.severity ? " • " + escapeHtml(ev.severity) : ""}</div>
        `;
        btn.addEventListener("click", () => {
          document.getElementById("alertTitle").value = `GDACS Alert: ${ev.name}`.slice(0, 110);
          document.getElementById("alertSeverity").value = ev.alertLevel === "Red" ? "Emergency" : ev.alertLevel === "Orange" ? "Warning" : "Advisory";
          document.getElementById("alertMessage").value = `Monitoring ${ev.name} (${ev.country}). Please review your Aegis emergency protocol and stay alert for official campus instructions.`;
        });
        gdacsListEl.appendChild(btn);
      });
    } catch {
      gdacsListEl.innerHTML = '<div class="loading-inline">GDACS feed currently unavailable.</div>';
    }
  }

  if (broadcastForm) {
    broadcastForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("alertTitle").value.trim();
      const disasterType = document.getElementById("alertDisaster").value;
      const severity = document.getElementById("alertSeverity").value;
      const message = document.getElementById("alertMessage").value.trim();

      sendBroadcastBtn.disabled = true;
      sendBroadcastBtn.textContent = "Sending...";
      broadcastFeedback.textContent = "";

      try {
        const res = await axiosInstance.post("/college/broadcast", {
          title,
          disasterType,
          severity,
          message,
        });
        if (res.data.success) {
          broadcastFeedback.textContent = res.data.message;
          if (res.data.alert) {
            recentAlerts.unshift(res.data.alert);
            renderRecentAlerts();
          }
          broadcastForm.reset();
        }
      } catch (err) {
        broadcastFeedback.textContent = err.response?.data?.message || "Failed to send broadcast.";
      } finally {
        sendBroadcastBtn.disabled = false;
        sendBroadcastBtn.textContent = "Send Campus Alert";
      }
    });
  }

  function renderStudents(filterQuery = "") {
    studentsListContainer.innerHTML = "";
    const q = filterQuery.trim().toLowerCase();
    const filtered = students.filter(
      (s) =>
        !q ||
        (s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q)
    );

    if (!filtered.length) {
      studentsListContainer.innerHTML = q
        ? "<div class='error'>No students match your search.</div>"
        : "<div class='error'>No students registered with this college yet.</div>";
      return;
    }

    filtered.forEach((student) => {
      const studentItem = document.createElement("div");
      studentItem.classList.add("student-item");

      const modules = student.disasters
        ? Object.keys(student.disasters).map((key) => ({
            originalName: key,
            name: formatModuleName(key),
            completed: student.disasters[key]?.module || false,
            score: student.disasters[key]?.score || 0,
          }))
        : [];

      const completedModules = modules.filter((m) => m.completed);
      const totalModules = modules.length;
      const progressPercent = totalModules > 0 ? Math.round((completedModules.length / totalModules) * 100) : 0;

      let moduleBadgesHtml = completedModules
        .map((m) => {
          const badgeFileName = m.originalName.toLowerCase() + ".png";
          return `<img src="${BADGES_BASE_PATH}${badgeFileName}" alt="${escapeHtml(m.name)}" title="${escapeHtml(m.name)}" class="module-badge-icon">`;
        })
        .join("");

      if (completedModules.length === totalModules && totalModules > 0) {
        moduleBadgesHtml += `<img src="${BADGES_BASE_PATH}aegis.png" alt="All modules completed" title="All modules completed" class="module-badge-icon special-badge">`;
      }

      studentItem.innerHTML = `
        <div class="student-item-header">
          <span class="student-name">${escapeHtml(student.name || "Unnamed Student")}</span>
          <div class="module-badges">${moduleBadgesHtml}</div>
          <div class="progress-container">
            <div class="progress-bar-wrapper">
              <div class="progress-bar" style="width: ${progressPercent}%"></div>
            </div>
            <span class="progress-text">${progressPercent}%</span>
          </div>
        </div>
        <div class="student-details-content">
          <h4>Completed Modules (${completedModules.length}/${totalModules})</h4>
          <div class="modules-grid">
            ${
              completedModules.length > 0
                ? completedModules
                    .map(
                      (m) => `
                  <div class="module-detail-item">
                    <div class="module-name">${escapeHtml(m.name)}</div>
                    <div class="module-score">Score: ${m.score}/10</div>
                  </div>`
                    )
                    .join("")
                : "<p>No modules completed yet.</p>"
            }
          </div>
        </div>
      `;

      studentItem.addEventListener("click", () => {
        studentItem.classList.toggle("active");
      });

      studentsListContainer.appendChild(studentItem);
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => renderStudents(searchInput.value));
  }

  function formatModuleName(name) {
    return name.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();
  }

  fetchStudents();
  fetchGdacsFeed();
});
