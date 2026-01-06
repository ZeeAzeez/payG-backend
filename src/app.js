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

//adding test routes
const testRoutes = require("./routes/test.routes");

app.use("/api/test", testRoutes);

module.exports = app;
