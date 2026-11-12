import axiosInstance from "./api.js";

const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Doto:wght@400;500;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const QUICK_PROMPTS = [
  { label: "60s Earthquake", prompt: "What is the immediate 60-second earthquake survival protocol?" },
  { label: "Emergency Kit", prompt: "What essentials belong in a 72-hour emergency go-bag?" },
  { label: "CPR / Bleeding", prompt: "How do I give hands-only CPR and stop severe bleeding?" },
  { label: "Fire Escape", prompt: "What should I do if trapped by fire and smoke?" },
];

const widget = document.createElement("div");
widget.id = "chat-widget";
widget.innerHTML = `
  <button id="close-btn" title="Minimize">&times;</button>
  <div id="chat-title">Aegis AI • Protocols</div>
  <div id="chat-content">
    <div class="chat-meta-bar">
      <div class="memory-indicator">NDMA/FEMA Grounded • 3-turn memory</div>
      <button type="button" id="clear-chat-btn" class="clear-chat-btn">Clear</button>
    </div>
    <div class="quick-chips">
      ${QUICK_PROMPTS.map((q) => `<button type="button" class="quick-chip" data-prompt="${q.prompt}">${q.label}</button>`).join("")}
    </div>
    <div id="message-area">
      <div class="message bot-message">Hello, I'm Aegis AI. Ask any disaster preparedness, triage, or first-aid question.</div>
    </div>
    <form id="user-input">
      <input type="text" id="input-box" autocomplete="off" placeholder="Ask disaster safety or SOS steps..." required />
      <button type="submit" id="send-btn">Send</button>
    </form>
  </div>
`;
document.body.appendChild(widget);

const closeBtn = document.getElementById("close-btn");
const clearBtn = document.getElementById("clear-chat-btn");
const messageArea = document.getElementById("message-area");
const inputBox = document.getElementById("input-box");
const sendBtn = document.getElementById("send-btn");

closeBtn.onclick = (e) => {
  e.stopPropagation();
  widget.classList.remove("open");
};

widget.addEventListener("click", (e) => {
  if (!widget.classList.contains("open") && e.target.id !== "close-btn") {
    widget.classList.add("open");
    setTimeout(() => inputBox.focus(), 250);
  }
});

function appendMessage(text, sender, opts = {}) {
  const div = document.createElement("div");
  div.classList.add("message");
  if (sender === "bot") div.classList.add("bot-message");
  else if (sender === "user") div.classList.add("user-message");
  else if (sender === "error") div.classList.add("error-message");
  if (opts.isLoading) div.classList.add("loading-message");
  if (opts.urgent) div.classList.add("urgent");

  const body = document.createElement("span");
  body.textContent = text;
  div.appendChild(body);

  if (Array.isArray(opts.protocols) && opts.protocols.length > 0) {
    const tag = document.createElement("span");
    tag.className = "protocol-tag";
    tag.textContent = "Source: " + opts.protocols.join(" + ");
    div.appendChild(tag);
  }

  messageArea.appendChild(div);
  messageArea.scrollTop = messageArea.scrollHeight;
  return div;
}

async function submitQuestion(userText) {
  if (!userText) return;
  appendMessage(userText, "user");
  inputBox.value = "";

  if (userText.toLowerCase() === "exit") {
    appendMessage("Goodbye! Stay safe.", "bot");
    setTimeout(() => widget.classList.remove("open"), 800);
    return;
  }

  inputBox.disabled = sendBtn.disabled = true;
  sendBtn.textContent = "...";
  const loadingMsg = appendMessage("Checking safety protocols...", "bot", { isLoading: true });

  try {
    const res = await axiosInstance.post("/aegis/chat", { message: userText });
    loadingMsg.remove();
    appendMessage(res.data.response, "bot", {
      urgent: Boolean(res.data.urgent),
      protocols: res.data.protocols_used || [],
    });
  } catch (err) {
    loadingMsg.remove();
    appendMessage(err.response?.data?.error || "⚠️ Server error. Try again later.", "error");
  } finally {
    inputBox.disabled = sendBtn.disabled = false;
    sendBtn.textContent = "Send";
    inputBox.focus();
  }
}

document.getElementById("user-input").addEventListener("submit", (e) => {
  e.preventDefault();
  submitQuestion(inputBox.value.trim());
});

widget.querySelectorAll(".quick-chip").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    submitQuestion(btn.dataset.prompt);
  });
});

clearBtn.addEventListener("click", async (e) => {
  e.stopPropagation();
  try {
    await axiosInstance.post("/aegis/clear_memory");
  } catch {}
  messageArea.innerHTML = '<div class="message bot-message">Conversation cleared. Ask any disaster preparedness or first-aid question.</div>';
});
