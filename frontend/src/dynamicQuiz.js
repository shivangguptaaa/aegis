import axiosInstance from "./api.js";
import disastersData from "./disastersData.js";

const params = new URLSearchParams(window.location.search);
const type = (params.get("type") || "flood").toLowerCase();
const disaster = disastersData[type] || disastersData.flood;

document.title = `${disaster.name} Preparedness Quiz`;
document.getElementById("nav-video").href = `./video.html?type=${encodeURIComponent(disaster.key)}`;
document.getElementById("nav-book").href = `./module.html?type=${encodeURIComponent(disaster.key)}`;

const quizData = disaster.quiz;
const quizContainer = document.getElementById("quiz-container");
const progressBar = document.getElementById("progress-bar");
const questionCounter = document.getElementById("question-counter");
const questionText = document.getElementById("question-text");
const answerOptionsContainer = document.getElementById("answer-options");
const nextButton = document.getElementById("next-button");
const quizBody = document.getElementById("quiz-body");
const quizFooter = document.getElementById("quiz-footer");

let currentQuestionIndex = 0;
let score = 0;

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  quizBody.style.display = "block";
  quizFooter.style.display = "flex";
  const existing = document.getElementById("results-container");
  if (existing) existing.remove();
  loadQuestion();
}

function loadQuestion() {
  nextButton.style.visibility = "hidden";
  answerOptionsContainer.innerHTML = "";
  const q = quizData[currentQuestionIndex];
  questionText.textContent = q.question;
  questionCounter.textContent = `${currentQuestionIndex + 1}/${quizData.length}`;
  progressBar.style.width = `${((currentQuestionIndex + 1) / quizData.length) * 100}%`;

  q.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "option";
    button.textContent = option;
    button.addEventListener("click", () => selectAnswer(index, button));

    const rationaleDiv = document.createElement("div");
    rationaleDiv.className = "rationale";
    rationaleDiv.innerHTML = `
      <svg class="check-icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
      <div>
        <strong>Explanation</strong>
        <div class="rationale-text">${q.rationale}</div>
      </div>
    `;
    button.appendChild(rationaleDiv);
    answerOptionsContainer.appendChild(button);
  });
}

function selectAnswer(selectedIndex, selectedButton) {
  const q = quizData[currentQuestionIndex];
  if (selectedIndex === q.correctAnswerIndex) {
    score++;
    selectedButton.classList.add("correct");
  } else {
    selectedButton.classList.add("incorrect");
    answerOptionsContainer.children[q.correctAnswerIndex].classList.add("correct");
  }
  Array.from(answerOptionsContainer.children).forEach((btn) => btn.classList.add("disabled"));
  nextButton.style.visibility = "visible";
}

async function showResults() {
  quizBody.style.display = "none";
  quizFooter.style.display = "none";

  try {
    const res = await axiosInstance.post("/student/quiz", {
      type: disaster.apiType,
      score,
      module: true,
    });
    if (res.data.success) {
      alert(`${disaster.name} quiz saved! Score: ${score}/${quizData.length}`);
    }
  } catch (err) {
    console.error("Failed to save quiz score:", err.response?.data || err.message);
    alert("Could not save score—make sure you are logged in as a student.");
  }

  const resultsHTML = `
    <div id="results-container">
      <h2>${disaster.name} Quiz Complete!</h2>
      <p>You scored ${score} out of ${quizData.length}</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button id="restart-button">Restart Quiz</button>
        <button id="home-button" style="background:#3a5a78;color:#fff;border:none;border-radius:4px;padding:12px 24px;font-size:1rem;font-weight:500;cursor:pointer;">Back to Modules</button>
      </div>
    </div>
  `;
  quizContainer.insertAdjacentHTML("beforeend", resultsHTML);
  document.getElementById("restart-button").addEventListener("click", startQuiz);
  document.getElementById("home-button").addEventListener("click", () => {
    window.location.href = "./student.html";
  });
}

nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < quizData.length) loadQuestion();
  else showResults();
});

startQuiz();
