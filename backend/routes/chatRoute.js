const express = require("express");
const router = express.Router();
const { handleChat, getMemory, clearMemory } = require("../controllers/chatController");
const { getLatestDisasters } = require("../util/checkDisaster");

router.post("/chat", handleChat);
router.get("/memory", getMemory);
router.post("/clear_memory", clearMemory);
router.get("/disasters", getLatestDisasters);

module.exports = router;
