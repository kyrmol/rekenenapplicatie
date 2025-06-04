const express = require("express");
const db = require("../models/db");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Authenticatie middleware (token verificatie)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).send("Geen token opgegeven");

  jwt.verify(token, "SECRET_KEY", (err, user) => {
    if (err) return res.status(403).send("Ongeldige token");
    req.user = user;
    next();
  });
};

// Route om score op te slaan
router.post("/save", authenticateToken, (req, res) => {
  const { spel_id, score } = req.body;
  const leerling_id = req.user.id;
  const datum = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format

  const sql = "INSERT INTO score (leerling_id, spel_id, score, datum) VALUES (?, ?, ?, ?)";

  db.query(sql, [leerling_id, spel_id, score, datum], (err, result) => {
    if (err) {
      console.error("Fout bij opslaan score:", err);
      return res.status(500).send("Er ging iets mis bij het opslaan van de score");
    }

    res.status(201).json({
      message: "Score succesvol opgeslagen",
      score_id: result.insertId
    });
  });
});

// Route om scores voor een leerling op te halen
router.get("/student", authenticateToken, (req, res) => {
  const leerling_id = req.user.id;

  const sql = `
    SELECT s.id, s.spel_id, r.naam as spelnaam, s.score, s.datum
    FROM score s
    JOIN rekenspel r ON s.spel_id = r.id
    WHERE s.leerling_id = ?
    ORDER BY s.datum DESC, s.id DESC
  `;

  db.query(sql, [leerling_id], (err, results) => {
    if (err) {
      console.error("Fout bij ophalen scores:", err);
      return res.status(500).send("Er ging iets mis bij het ophalen van de scores");
    }

    res.json(results);
  });
});

module.exports = router;
