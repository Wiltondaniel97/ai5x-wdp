const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../../../../.env") });
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jiraRoutes = require("./routes/jira");
const settingsRoutes = require("./routes/settings");
const generateRoutes = require("./routes/generate");

const app = express();
app.use(cors());
app.use(express.json());

// Support both /api/* and direct routes in serverless environments
app.use("/api/jira", jiraRoutes);
app.use("/jira", jiraRoutes);

app.use("/api/settings", settingsRoutes);
app.use("/settings", settingsRoutes);

app.use("/api/generate", generateRoutes);
app.use("/generate", generateRoutes);

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
