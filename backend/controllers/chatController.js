const { GoogleGenerativeAI } = require("@google/generative-ai");
const { retrieveProtocols } = require("../util/disasterProtocols");

let model = null;
if (process.env.GOOGLE_API_KEY) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
} else {
  console.warn("Warning: GOOGLE_API_KEY not set — /aegis/chat will return 503.");
}

// Per-session 3-turn memory store
const sessionMemories = new Map();

function getSessionKey(req) {
  const token =
    req.cookies?.studentToken ||
    req.cookies?.collegeToken ||
    req.headers.authorization ||
    req.ip ||
    "default";
  return String(token).slice(0, 64);
}

function getMemoryFor(key) {
  return sessionMemories.get(key) || [];
}

function addToMemory(key, user, bot) {
  const arr = getMemoryFor(key);
  arr.push({ user, bot, timestamp: new Date() });
  if (arr.length > 3) arr.shift();
  sessionMemories.set(key, arr);
  if (sessionMemories.size > 500) {
    const oldestKey = sessionMemories.keys().next().value;
    sessionMemories.delete(oldestKey);
  }
}

function getMemoryContext(key) {
  return getMemoryFor(key)
    .map((conv) => `User: ${conv.user}\nBot: ${conv.bot}`)
    .join("\n\n");
}

function isGreetingOrDisaster(query, docs) {
  if (docs.length > 0) return true;
  const q = query.toLowerCase().trim();
  const greetings = /^(hi|hello|hey|namaste|help|thanks|thank you|bye)\b/;
  const extraDisasterTerms = /(disaster|calamity|relief|rescue|alert|warning|aftershock|hazard|ndma|fema|safety|kit)/;
  return greetings.test(q) || extraDisasterTerms.test(q);
}

exports.handleChat = async (req, res) => {
  try {
    if (!model) {
      return res.status(503).json({ error: "AI assistant unavailable: GOOGLE_API_KEY not configured." });
    }

    const { message } = req.body;
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    const userInput = String(message).trim();
    const sessionKey = getSessionKey(req);
    const memory = getMemoryFor(sessionKey);
    const { docs, isUrgent } = retrieveProtocols(userInput, memory);

    if (!isGreetingOrDisaster(userInput, docs)) {
      return res.json({
        response: "⚠️ I can only answer disaster-related, emergency, or first-aid safety questions.",
        is_disaster_related: false,
        protocols_used: [],
      });
    }

    const retrievedContext = docs.length
      ? docs
          .map(
            (d) =>
              `[${d.title}]\nHelplines: ${d.helplines}\nVerified Steps:\n${d.steps
                .map((s) => "- " + s)
                .join("\n")}`
          )
          .join("\n\n")
      : "No exact protocol doc matched; stick strictly to official NDMA/FEMA disaster preparedness principles.";

    const memoryContext = getMemoryContext(sessionKey);
    const systemPrompt = `You are Aegis AI, an institutional disaster-preparedness assistant grounded in NDMA/FEMA safety protocols.

VERIFIED PROTOCOL CONTEXT (prioritize these facts and helplines when relevant):
${retrievedContext}

PREVIOUS CONVERSATION CONTEXT:
${memoryContext || "None"}

URGENCY FLAG: ${isUrgent ? "HIGH — lead with immediate life-safety action and 112 / 108 / 101 helplines." : "Standard"}

FORMAT RULES:
- Use concise bullet lines starting with "- "
- Max 14 words per bullet
- 5-8 actionable bullets total
- Include the official Indian helpline numbers when urgent or life-safety related
- Stay under 120 words total

User Question: ${userInput}`;

    const result = await model.generateContent(systemPrompt);
    const botResponse = result.response.text().trim();

    addToMemory(sessionKey, userInput, botResponse);
    return res.json({
      response: botResponse,
      is_disaster_related: true,
      urgent: isUrgent,
      protocols_used: docs.map((d) => d.title),
    });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

exports.getMemory = (req, res) => {
  const memory = getMemoryFor(getSessionKey(req));
  res.json({
    memory: {
      conversations: memory,
      count: memory.length,
      last_updated: memory.at(-1)?.timestamp || null,
    },
  });
};

exports.clearMemory = (req, res) => {
  const key = getSessionKey(req);
  const cleared = getMemoryFor(key).length;
  sessionMemories.delete(key);
  res.json({ message: "Memory cleared", cleared_conversations: cleared });
};
