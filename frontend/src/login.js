import axiosInstance from "./api.js";
import gsap from "gsap";

const formContainer = document.querySelector(".perspective-container");
const loginForm = document.getElementById("loginForm");
const formElements = gsap.utils.toArray("#loginForm > div");

gsap.set(formElements, { opacity: 1, y: 0 });

formContainer.addEventListener("mousemove", (e) => {
  const { left, top, width, height } = formContainer.getBoundingClientRect();
  const x = e.clientX - left - width / 2;
  const y = e.clientY - top - height / 2;
  gsap.to(loginForm, {
    duration: 0.7,
    rotationX: (y / height) * -15,
    rotationY: (x / width) * 15,
    ease: "power2.out",
  });
});

formContainer.addEventListener("mouseleave", () => {
  gsap.to(loginForm, {
    duration: 1.2,
    rotationX: 0,
    rotationY: 0,
    ease: "elastic.out(1, 0.3)",
  });
});

gsap.from(loginForm, { duration: 0.8, opacity: 0, y: 50, ease: "power3.out", delay: 0.2 });
gsap.from(formElements, { duration: 0.8, opacity: 0, y: 30, stagger: 0.15, ease: "power3.out", delay: 0.5 });

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await axiosInstance.post("/student/login", { email, password });
    if (res.data.success) {
      if (res.data.token) {
        localStorage.setItem("aegis_student_token", res.data.token);
      }
      alert("Login successful!");
      window.location.href = "./student.html";
    } else {
      alert(res.data.message || "Login failed!");
    }
  } catch (err) {
    const message = err.response?.data?.message || "Something went wrong. Please try again.";
    alert(message);
  }
});
