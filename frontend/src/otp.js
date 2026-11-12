import gsap from "gsap";
import axiosInstance from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const formContainer = document.querySelector(".perspective-container");
  const otpForm = document.getElementById("otpForm");
  const otpInputs = document.querySelectorAll(".otp-input");
  const resendLink = document.getElementById("resendOtpLink");

  formContainer.addEventListener("mousemove", (e) => {
    const { left, top, width, height } = formContainer.getBoundingClientRect();
    const x = e.clientX - left - width / 2;
    const y = e.clientY - top - height / 2;
    gsap.to(otpForm, {
      duration: 0.7,
      rotationX: (y / height) * -10,
      rotationY: (x / width) * 10,
      ease: "power2.out",
    });
  });

  formContainer.addEventListener("mouseleave", () => {
    gsap.to(otpForm, {
      duration: 1.2,
      rotationX: 0,
      rotationY: 0,
      ease: "elastic.out(1, 0.3)",
    });
  });

  const formElements = gsap.utils.toArray("#otpForm > *");
  gsap.from(otpForm, { duration: 0.8, opacity: 0, y: 50, ease: "power3.out", delay: 0.2 });
  gsap.from(formElements, { duration: 0.8, opacity: 1, y: 0, stagger: 0.1, ease: "power3.out", delay: 0.5 });

  otpInputs.forEach((input, index) => {
    input.addEventListener("keyup", (e) => {
      const nextInput = input.nextElementSibling;
      const prevInput = input.previousElementSibling;
      if (input.value.length > 0 && nextInput) nextInput.focus();
      if (e.key === "Backspace" && prevInput) prevInput.focus();
    });
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasteDigits = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
      for (let i = 0; i < pasteDigits.length; i++) {
        if (index + i < otpInputs.length) {
          otpInputs[index + i].value = pasteDigits[i];
        }
      }
      const nextFocusIndex = Math.min(index + pasteDigits.length, otpInputs.length - 1);
      otpInputs[nextFocusIndex].focus();
    });
  });

  if (resendLink) {
    resendLink.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const otpCollegeId = sessionStorage.getItem("aegis_otp_college_id");
        const res = await axiosInstance.post("/college/resend-otp", { otpCollegeId });
        alert(res.data?.message || "A new OTP has been sent.");
      } catch (err) {
        alert(err.response?.data?.message || "Could not resend OTP. Please register again.");
      }
    });
  }

  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let otp = "";
    otpInputs.forEach((input) => {
      otp += input.value.trim();
    });
    if (otp.length !== 6) {
      alert("Please fill all 6 digits.");
      return;
    }
    try {
      const otpCollegeId = sessionStorage.getItem("aegis_otp_college_id");
      const response = await axiosInstance.post("/college/verify-otp", { otp, otpCollegeId });
      if (response.data.success) {
        sessionStorage.removeItem("aegis_otp_college_id");
        if (response.data.token) {
          localStorage.setItem("aegis_college_token", response.data.token);
        }
        alert(response.data.message);
        window.location.href = "./college.html";
      } else {
        alert(response.data.message || "OTP verification failed");
      }
    } catch (error) {
      alert(error.response?.data?.message || "OTP verification failed. Please check your code.");
    }
  });
});
