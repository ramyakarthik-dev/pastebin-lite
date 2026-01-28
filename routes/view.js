const express = require("express");
const store = require("../db/store");

const router = express.Router();

router.get("/:id", (req, res) => {
  const paste = store.get(req.params.id);
  if (!paste) return res.status(404).send("Not found");

  const now = Date.now();

  if (paste.expires_at && now > paste.expires_at) {
    return res.status(404).send("Expired");
  }

  if (paste.max_views !== null && paste.views >= paste.max_views) {
    return res.status(404).send("View limit exceeded");
  }

  paste.views += 1;

  res.send(`
    <html>
      <body>
        <pre>${paste.content.replace(/</g, "&lt;")}</pre>
      </body>
    </html>
  `);
});

module.exports = router;
