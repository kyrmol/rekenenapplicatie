const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
const classRoutes = require("./routes/classes");
app.use("/api/classes", classRoutes);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const scoreRoutes = require("./routes/scores");
app.use("/api/scores", scoreRoutes);

const leerlingRoutes = require("./routes/leerling");
app.use("/api/leerling", leerlingRoutes);

const ouderRoutes = require("./routes/ouder");
app.use("/api/ouder", ouderRoutes);

// Placeholder image route
app.get("/api/placeholder/:width/:height", (req, res) => {
  const { width, height } = req.params;
  res.redirect(`https://via.placeholder.com/${width}x${height}`);
});

// Start server
app.listen(5000, () => console.log("🚀 Server draait op poort 5000"));

