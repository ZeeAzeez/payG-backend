const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);

// health check
app.get("/", (req, res) => {
  res.json({ message: "PayG API running" });
});

module.exports = app;
