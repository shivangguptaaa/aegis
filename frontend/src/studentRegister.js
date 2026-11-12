import axiosInstance from "./api.js";
import gsap from "gsap";

const formContainer = document.querySelector(".perspective-container");
const registerForm = document.getElementById("studentRegisterForm");
const collegeSelect = document.getElementById("college");
const submitBtn = document.getElementById("submitBtn");
const formElements = gsap.utils.toArray("#studentRegisterForm > div");

gsap.set(formElements, { opacity: 1, y: 0 });

formContainer.addEventListener("mousemove", (e) => {
  const { left, top, width, height } = formContainer.getBoundingClientRect();
  const x = e.clientX - left - width / 2;
  const y = e.clientY - top - height / 2;
  gsap.to(registerForm, {
    duration: 0.7,
    rotationX: (y / height) * -12,
    rotationY: (x / width) * 12,
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

async function loadColleges() {
  try {
    const res = await axiosInstance.get("/college/list");
    const colleges = res.data?.colleges || [];
    if (!colleges.length) {
      collegeSelect.innerHTML = '<option value="">No verified colleges found — register a college first</option>';
      return;
    }
    collegeSelect.innerHTML =
      '<option value="">Select your college</option>' +
      colleges.map((c) => `<option value="${c._id}">${c.name}</option>`).join("");
  } catch (err) {
    console.error("Failed to load colleges:", err);
    collegeSelect.innerHTML = '<option value="">Could not load colleges (check server)</option>';
  }
}

loadColleges();

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const college = collegeSelect.value;
  const emgMail = document.getElementById("emgMail").value.trim();

  if (!college) {
    alert("Please select a verified college first.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Registering...";
  try {
    const res = await axiosInstance.post("/student/register", {
      name,
      email,
      password,
      college,
      emgMail,
    });
    if (res.data.success) {
      if (res.data.token) {
        localStorage.setItem("aegis_student_token", res.data.token);
      }
      alert("Registration successful!");
      window.location.href = "./student.html";
    } else {
      alert(res.data.message || "Registration failed.");
    }
  } catch (err) {
    alert(err.response?.data?.message || "Could not complete registration.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Register";
  }
});
