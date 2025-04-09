const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.listen(5000, () => console.log("🚀 Server draait op poort 5000"));
