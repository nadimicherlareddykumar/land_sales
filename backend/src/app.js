const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const layoutRoutes = require("./routes/layoutRoutes");
const plotRoutes = require("./routes/plotRoutes");
const visitRoutes = require("./routes/visitRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*"
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("PND Developers API is running. Please access the frontend at http://localhost:5173");
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/layouts", layoutRoutes);
app.use("/api/plots", plotRoutes);
app.use("/api/visits", visitRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
