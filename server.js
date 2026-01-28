const express = require("express");
const cors = require("cors");

const healthRoute = require("./routes/health");
const pastesRoute = require("./routes/pastes");
const viewRoute = require("./routes/view");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/healthz", healthRoute);
app.use("/api/pastes", pastesRoute);
app.use("/p", viewRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
