import axiosInstance from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.querySelector(".logout-college");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.get("/college/logout");
      if (res.data?.success || res.status === 200) {
        localStorage.removeItem("aegis_college_token");
        alert("Logout Successful");
        window.location.href = "./collegeLogin.html";
      }
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
      alert("Failed to logout. Please try again.");
    }
  });
});
