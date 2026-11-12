import axiosInstance from "./api.js";

(async function verifyUser() {
  try {
    await axiosInstance.get("/student/verify");
    // ✅ User is logged in → do nothing
  } catch (err) {
    // ❌ If not logged in, interceptor already redirected to login
  }
})();
