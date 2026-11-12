import axiosInstance from "./api";

const account = document.querySelector(".account-a");
const student_name = document.querySelector(".student-name");

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

const fetchStudent = async () => {
  try {
    const res = await axiosInstance.get("/student");
    if (res.data.success) {
      account.querySelector("li").textContent = res.data.account.name;
      student_name.textContent = res.data.account.name;
    } else {
      alert(res.data.message || "Something went wrong!");
      window.location.href = "./login.html";
    }
  } catch (err) {
    console.log(err.response?.data?.message || err.message);
  }
};

function initLiveAlertsDrawer() {
  const widget = document.createElement("div");
  widget.id = "alerts-widget";
  widget.innerHTML = `
    <div class="alerts-header">
      <div class="alerts-title">
        <span class="alerts-badge-dot" id="alerts-dot"></span>
        <span id="alerts-summary">Live Alerts</span>
      </div>
      <button type="button" class="alerts-close-btn" id="alerts-close">&times;</button>
    </div>
    <div class="alerts-body" id="alerts-body">
      <div class="alerts-section-label">Campus Broadcasts</div>
      <div id="campus-alerts-list"><div class="alert-feed-meta">Loading broadcasts...</div></div>
      <div class="alerts-section-label">Live Global Hazards (GDACS)</div>
      <div id="gdacs-alerts-list"><div class="alert-feed-meta">Fetching live GDACS feed...</div></div>
    </div>
  `;
  document.body.appendChild(widget);

  const closeBtn = document.getElementById("alerts-close");
  widget.addEventListener("click", () => {
    if (!widget.classList.contains("open")) widget.classList.add("open");
  });
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    widget.classList.remove("open");
  });

  Promise.allSettled([
    axiosInstance.get("/student/alerts"),
    axiosInstance.get("/aegis/disasters"),
  ]).then(([campusRes, gdacsRes]) => {
    const campusAlerts = campusRes.status === "fulfilled" ? campusRes.value.data?.alerts || [] : [];
    const gdacsEvents = gdacsRes.status === "fulfilled" ? gdacsRes.value.data?.events || [] : [];

    const summaryEl = document.getElementById("alerts-summary");
    const dotEl = document.getElementById("alerts-dot");
    summaryEl.textContent = `Live Alerts (${campusAlerts.length + gdacsEvents.length})`;
    if (campusAlerts.length > 0 || gdacsEvents.some((e) => e.alertLevel === "Orange" || e.alertLevel === "Red")) {
      dotEl.classList.add("has-warning");
    }

    const campusList = document.getElementById("campus-alerts-list");
    if (!campusAlerts.length) {
      campusList.innerHTML = '<div class="alert-feed-meta">No active campus broadcasts from your institution.</div>';
    } else {
      campusList.innerHTML = campusAlerts
        .map(
          (a) => `
        <div class="alert-feed-card sev-${escapeHtml(a.severity)}">
          <div class="alert-feed-top">
            <span>${escapeHtml(a.title)}</span>
            <span>${escapeHtml(a.severity)}</span>
          </div>
          <div>${escapeHtml(a.message)}</div>
          <div class="alert-feed-meta">${escapeHtml(a.disasterType)} • ${new Date(a.createdAt).toLocaleString()}</div>
        </div>`
        )
        .join("");
    }

    const gdacsList = document.getElementById("gdacs-alerts-list");
    if (!gdacsEvents.length) {
      gdacsList.innerHTML = '<div class="alert-feed-meta">Global GDACS feed temporarily unreachable.</div>';
    } else {
      gdacsList.innerHTML = gdacsEvents
        .map(
          (ev) => `
        <div class="alert-feed-card sev-${escapeHtml(ev.alertLevel)}">
          <div class="alert-feed-top">
            <span>${escapeHtml(ev.name)}</span>
            <span>${escapeHtml(ev.alertLevel)}</span>
          </div>
          <div class="alert-feed-meta">${escapeHtml(ev.country)}${ev.severity ? " • " + escapeHtml(ev.severity) : ""}</div>
        </div>`
        )
        .join("");
    }
  });
}

fetchStudent();
initLiveAlertsDrawer();
