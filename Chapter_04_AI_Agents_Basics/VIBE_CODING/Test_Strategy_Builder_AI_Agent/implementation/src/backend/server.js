const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../../../../.env") });

const express = require("express");
const cors = require("cors");
const jiraRoutes = require("./routes/jira");
const settingsRoutes = require("./routes/settings");
const generateRoutes = require("./routes/generate");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/jira", jiraRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/generate", generateRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
