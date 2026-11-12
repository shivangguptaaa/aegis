import disastersData from "./disastersData.js";

const params = new URLSearchParams(window.location.search);
const type = (params.get("type") || "flood").toLowerCase();
const disaster = disastersData[type] || disastersData.flood;

document.title = `${disaster.name} — ${disaster.title}`;
document.getElementById("nav-video").href = `./video.html?type=${encodeURIComponent(disaster.key)}`;
document.getElementById("nav-quiz").href = `./quiz.html?type=${encodeURIComponent(disaster.key)}`;

// Override page background dynamically to match this disaster while preserving module.css layout
const bgStyle = document.createElement("style");
bgStyle.textContent = `body::before { background-image: url('${disaster.bg}'); }`;
document.head.appendChild(bgStyle);

const book = document.getElementById("book");

// Cover paper
const coverHtml = `
  <div class="paper" id="p1">
    <div class="front cover" style="flex-direction:column;gap:12px;padding:24px;text-align:center;">
      <img src="${disaster.badge}" alt="${disaster.name}" style="width:84px;height:84px;object-fit:contain;" />
      <h1 data-translation-key="title">${disaster.title}</h1>
      <p style="font-family:'Lato',sans-serif;opacity:0.85;font-size:0.95rem;">${disaster.name} Preparedness Guide · Click to open</p>
    </div>
    <div class="back">
      <div class="page-content" style="padding:24px;background:#111827;color:#f3f4f6;">
        <img src="${disaster.bg}" alt="${disaster.name}" style="width:100%;height:78%;object-fit:cover;border-radius:8px;" />
        <p style="margin-top:12px;font-family:'Lato',sans-serif;font-size:0.95rem;color:#cbd5e1;">${disaster.name} Safety Handbook</p>
      </div>
    </div>
  </div>
`;

const chapterHtml = disaster.pages
  .map((pg, idx) => {
    const num = idx + 1;
    const isLast = idx === disaster.pages.length - 1;
    const backInner = isLast
      ? `<div class="page-content" style="background:#3a5a78;color:#fff;padding:28px;text-align:center;gap:16px;">
          <h2 style="font-size:1.6rem;font-weight:700;">Module Complete</h2>
          <p style="font-family:'Lato',sans-serif;font-size:1rem;opacity:0.9;">Watch the visual briefing or test your score in the ${disaster.name} Quiz.</p>
          <a href="./quiz.html?type=${encodeURIComponent(disaster.key)}" style="padding:10px 22px;background:#000;color:#fff;border-radius:999px;text-decoration:none;font-family:'Doto',sans-serif;">Take Quiz →</a>
        </div>`
      : `<div class="page-content" style="padding:24px;background:#0f172a;color:#e2e8f0;justify-content:center;text-align:center;gap:14px;">
          <img src="${disaster.badge}" alt="${disaster.name}" style="width:72px;height:72px;opacity:0.9;" />
          <div style="font-family:'Lato',sans-serif;font-size:0.85rem;letter-spacing:0.12em;text-transform:uppercase;color:#93c5fd;">${disaster.name} Field Card #${num}</div>
          <p style="font-family:'Noto Sans',sans-serif;font-size:0.95rem;max-width:85%;color:#cbd5e1;">Click the right page to continue reading →</p>
        </div>`;

    return `
      <div class="paper" id="p${idx + 2}">
        <div class="line-center"></div>
        <div class="front">
          <div class="text-content"><p data-translation-key="page${num}">${pg.en}</p></div>
          <div class="page-number">${num}</div>
        </div>
        <div class="back">${backInner}</div>
      </div>
    `;
  })
  .join("");

book.innerHTML = coverHtml + chapterHtml;

const papers = Array.from(document.querySelectorAll(".paper"));
const totalPapers = papers.length;
let currentLocation = 0;
let isFlipping = false;

papers.forEach((paper, index) => {
  paper.style.zIndex = totalPapers - index;
});

book.addEventListener("click", (e) => {
  if (e.target.closest("a")) return;
  if (isFlipping) return;
  const clickedPaper = e.target.closest(".paper");
  if (!clickedPaper) return;
  const bookRect = book.getBoundingClientRect();
  const isRightSide = e.clientX - bookRect.left > bookRect.width / 2;
  if (isRightSide) goNextPage();
  else goPrevPage();
});

function goNextPage() {
  if (isFlipping || currentLocation >= totalPapers - 1) return;
  isFlipping = true;
  const paperToFlip = papers[currentLocation];
  paperToFlip.classList.add("flipped");
  setTimeout(() => {
    paperToFlip.style.zIndex = currentLocation + 1;
  }, 600);
  currentLocation++;
  setTimeout(() => { isFlipping = false; }, 1200);
}

function goPrevPage() {
  if (isFlipping || currentLocation <= 1) return;
  isFlipping = true;
  currentLocation--;
  const paperToUnflip = papers[currentLocation];
  paperToUnflip.style.zIndex = totalPapers - currentLocation;
  paperToUnflip.classList.remove("flipped");
  setTimeout(() => { isFlipping = false; }, 1200);
}

// Flip cover open cleanly on load matching earthquake.html
const cover = papers[0];
cover.style.transition = "none";
cover.classList.add("flipped");
cover.style.zIndex = 0;
currentLocation = 1;
setTimeout(() => {
  cover.style.transition = "transform 1.2s cubic-bezier(0.65, 0, 0.35, 1)";
}, 20);

const dropdownToggle = document.querySelector(".dropdown-toggle");
const dropdownContent = document.querySelector(".dropdown-content");
const langLinks = document.querySelectorAll(".dropdown-content a");

dropdownToggle.addEventListener("click", () => dropdownContent.classList.toggle("show"));
window.addEventListener("click", (event) => {
  if (!event.target.closest(".language-dropdown")) dropdownContent.classList.remove("show");
});

function changeLanguage(lang) {
  const titleEl = document.querySelector('[data-translation-key="title"]');
  if (titleEl) {
    titleEl.textContent = lang === "hi" ? disaster.hiTitle : disaster.title;
  }
  disaster.pages.forEach((pg, idx) => {
    const el = document.querySelector(`[data-translation-key="page${idx + 1}"]`);
    if (el) el.textContent = lang === "hi" ? pg.hi : pg.en;
  });
  langLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.lang === lang);
  });
}

langLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    changeLanguage(link.dataset.lang);
    dropdownContent.classList.remove("show");
  });
});
