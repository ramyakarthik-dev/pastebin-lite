const express = require("express");
const { nanoid } = require("nanoid");
const store = require("../db/store");

const router = express.Router();

function getNow(req) {
  if (process.env.TEST_MODE === "1") {
    return Number(req.headers["x-test-now-ms"]) || Date.now();
  }
  return Date.now();
}

// CREATE paste
router.post("/", (req, res) => {
  const { content, ttl_seconds, max_views } = req.body;

  if (!content || typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ error: "Invalid content" });
  }

  if (ttl_seconds !== undefined && ttl_seconds < 1) {
    return res.status(400).json({ error: "Invalid ttl_seconds" });
  }

  if (max_views !== undefined && max_views < 1) {
    return res.status(400).json({ error: "Invalid max_views" });
  }

  const id = nanoid(8);
  const now = getNow(req);

  const paste = {
    id,
    content,
    created_at: now,
    expires_at: ttl_seconds ? now + ttl_seconds * 1000 : null,
    max_views: max_views ?? null,
    views: 0,
  };

  store.set(id, paste);

  res.json({
    id,
    url: `${req.protocol}://${req.get("host")}/p/${id}`,
  });
});

// FETCH paste (API)
router.get("/:id", (req, res) => {
  const paste = store.get(req.params.id);
  if (!paste) return res.status(404).json({ error: "Not found" });

  const now = getNow(req);

  if (paste.expires_at && now > paste.expires_at) {
    return res.status(404).json({ error: "Expired" });
  }

  if (paste.max_views !== null && paste.views >= paste.max_views) {
    return res.status(404).json({ error: "View limit exceeded" });
  }

  paste.views += 1;

  res.json({
    content: paste.content,
    remaining_views:
      paste.max_views === null ? null : paste.max_views - paste.views,
    expires_at: paste.expires_at
      ? new Date(paste.expires_at).toISOString()
      : null,
  });
});

module.exports = router;
