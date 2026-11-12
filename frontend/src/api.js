import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : import.meta.env.PROD
      ? ""
      : "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    const token = url.startsWith("/college")
      ? localStorage.getItem("aegis_college_token")
      : localStorage.getItem("aegis_student_token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AUTH_EXEMPT_PAGES = new Set([
  "index.html",
  "login.html",
  "registerStudent.html",
  "collegeLogin.html",
  "collegeRegister.html",
  "otp.html",
  "",
]);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentFile = window.location.pathname.split("/").pop() || "";
      if (!AUTH_EXEMPT_PAGES.has(currentFile)) {
        if (currentFile.startsWith("college")) {
          localStorage.removeItem("aegis_college_token");
          window.location.href = "./collegeLogin.html";
        } else {
          localStorage.removeItem("aegis_student_token");
          window.location.href = "./login.html";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
