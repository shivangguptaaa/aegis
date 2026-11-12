import axiosInstance from "./api.js";
import gsap from "gsap";

const formContainer = document.querySelector(".perspective-container");
const registerForm = document.getElementById("registerForm");
const formElements = gsap.utils.toArray("#registerForm > div");

gsap.set(formElements, { opacity: 1, y: 0 });

formContainer.addEventListener("mousemove", (e) => {
  const { left, top, width, height } = formContainer.getBoundingClientRect();
  const x = e.clientX - left - width / 2;
  const y = e.clientY - top - height / 2;
  gsap.to(registerForm, {
    duration: 0.7,
    rotationX: (y / height) * -15,
    rotationY: (x / width) * 15,
    ease: "power2.out",
  });
});

formContainer.addEventListener("mouseleave", () => {
  gsap.to(registerForm, {
    duration: 1.2,
    rotationX: 0,
    rotationY: 0,
    ease: "elastic.out(1, 0.3)",
  });
});

gsap.from(registerForm, { duration: 0.8, opacity: 0, y: 50, ease: "power3.out", delay: 0.2 });
gsap.from(formElements, { duration: 0.8, opacity: 0, y: 30, stagger: 0.15, ease: "power3.out", delay: 0.5 });

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const phone = document.getElementById("phone").value.trim();

  if (!/^[0-9]{10}$/.test(phone)) {
    alert("Please enter a valid 10-digit phone number.");
    return;
  }

  try {
    const res = await axiosInstance.post("/college/register", {
      name,
      email,
      password,
      phone,
    });
    if (res.data.success) {
      if (res.data.otpCollegeId) {
        sessionStorage.setItem("aegis_otp_college_id", res.data.otpCollegeId);
      }
      alert("OTP sent to your email! Please verify.");
      window.location.href = "./otp.html";
    } else {
      alert(res.data.message || "Registration failed!");
    }
  } catch (err) {
    const message = err.response?.data?.message || "Something went wrong. Please try again.";
    alert(message);
  }
});
