import axiosInstance from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const studentName = document.querySelector("#student-name");
  const studentEmail = document.querySelector("#student-email");
  const studentCollege = document.getElementById("student-college");
  const studentEmgEmail = document.getElementById("student-emg-mail");
  const modulesGrid = document.querySelector(".modules-grid");
  const aegisBadge = document.querySelector('img[src="/assets/images/badges/aegis.png"]');

  try {
    const res = await axiosInstance.get("/student");
    if (res.data.success) {
      const student = res.data.account;
      studentName.textContent = student.name;
      studentEmail.textContent = student.email;
      studentEmgEmail.textContent = student.emgMail;
      studentCollege.textContent = student.college?.name || "N/A";

      modulesGrid.innerHTML = "";
      let allCompleted = true;

      for (const [key, disaster] of Object.entries(student.disasters || {})) {
        const moduleEl = document.createElement("div");
        moduleEl.className = "module-item";

        const statusText = disaster.module ? "Completed" : "Not Started";
        const statusClass = disaster.module ? "completed" : "not-started";
        const disasterName = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

        moduleEl.innerHTML = `
          <h3>${disasterName}</h3>
          <p>Score: <span class="score">${disaster.score}/10</span></p>
          <p>Status: <span class="status ${statusClass}">${statusText}</span></p>
        `;
        modulesGrid.appendChild(moduleEl);

        const badgeEl = document.querySelector(`.badge[src*="${key.toLowerCase()}"]`);
        if (disaster.module && badgeEl) {
          badgeEl.style.opacity = "1";
        } else {
          allCompleted = false;
        }
      }
      if (allCompleted && aegisBadge) {
        aegisBadge.classList.remove("hidden");
        aegisBadge.style.opacity = "1";
      }
    } else {
      alert(res.data.message || "Please login first!");
      window.location.href = "./login.html";
    }
  } catch (err) {
    window.location.href = "./login.html";
  }
});

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.get("/student/logout");
      if (res.data.success) {
        localStorage.removeItem("aegis_student_token");
        alert("Logged out successfully!");
        window.location.href = "./index.html";
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  });
}
