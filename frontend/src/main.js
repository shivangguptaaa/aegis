import axiosInstance from "./api.js";

function getModuleUrl(disaster) {
  if (disaster === "earthquake") return "./earthquake.html";
  return `./module.html?type=${encodeURIComponent(disaster)}`;
}

document.querySelectorAll(".module-div").forEach((module) => {
  module.addEventListener("click", async (e) => {
    e.preventDefault();
    const disaster = module.dataset.disaster;
    try {
      const res = await axiosInstance.get("/student/verify");
      if (res.data.success) {
        window.location.href = getModuleUrl(disaster);
      } else {
        window.location.href = "./login.html";
      }
    } catch {
      window.location.href = "./login.html";
    }
  });
});

document.querySelectorAll(".disaster-module a").forEach((link) => {
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    const targetHref = link.getAttribute("href");
    if (!targetHref || targetHref === "#") return;
    try {
      const res = await axiosInstance.get("/student/verify");
      if (res.data.success) {
        window.location.href = targetHref;
      } else {
        window.location.href = "./login.html";
      }
    } catch {
      window.location.href = "./login.html";
    }
  });
});
