import disastersData from "./disastersData.js";

const params = new URLSearchParams(window.location.search);
const type = (params.get("type") || "flood").toLowerCase();
const disaster = disastersData[type] || disastersData.flood;

document.title = `${disaster.name} — Safety Briefing`;
document.getElementById("nav-book").href = `./module.html?type=${encodeURIComponent(disaster.key)}`;
document.getElementById("nav-quiz").href = `./quiz.html?type=${encodeURIComponent(disaster.key)}`;
document.getElementById("briefing-bg").src = disaster.bg;

const slides = disaster.briefing || [];
let currentIdx = 0;
let autoPlay = true;
let timer = null;

const phaseBadge = document.getElementById("phase-badge");
const stepCounter = document.getElementById("step-counter");
const headingEl = document.getElementById("briefing-heading");
const pointsEl = document.getElementById("briefing-points");
const dotsEl = document.getElementById("progress-dots");
const playToggle = document.getElementById("play-toggle");

function renderSlide() {
  const s = slides[currentIdx];
  if (!s) return;
  phaseBadge.textContent = `${disaster.name.toUpperCase()} · ${s.phase}`;
  stepCounter.textContent = `Chapter ${currentIdx + 1} / ${slides.length}`;
  headingEl.textContent = s.heading;
  pointsEl.innerHTML = s.points.map((pt) => `<li>• ${pt}</li>`).join("");
  dotsEl.innerHTML = slides
    .map((_, i) => `<button data-idx="${i}" style="width:10px;height:10px;border-radius:999px;border:none;cursor:pointer;background:${i === currentIdx ? "#3b82f6" : "#4b5563"};"></button>`)
    .join("");
  dotsEl.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentIdx = Number(btn.dataset.idx);
      renderSlide();
    });
  });
}

function scheduleNext() {
  clearInterval(timer);
  if (autoPlay) {
    timer = setInterval(() => {
      currentIdx = (currentIdx + 1) % slides.length;
      renderSlide();
    }, 6500);
  }
}

document.getElementById("prev-slide").addEventListener("click", () => {
  currentIdx = (currentIdx - 1 + slides.length) % slides.length;
  renderSlide();
  scheduleNext();
});

document.getElementById("next-slide").addEventListener("click", () => {
  currentIdx = (currentIdx + 1) % slides.length;
  renderSlide();
  scheduleNext();
});

playToggle.addEventListener("click", () => {
  autoPlay = !autoPlay;
  playToggle.textContent = autoPlay ? "❚❚ Pause Auto-Play" : "▶ Resume Auto-Play";
  scheduleNext();
});

renderSlide();
scheduleNext();
