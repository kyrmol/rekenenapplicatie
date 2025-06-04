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

// Route om gebruikersinfo op te halen
router.get("/userinfo", authenticateToken, (req, res) => {
  const userId = req.user.id;

  const sql = "SELECT id, voornaam, achternaam, email, rol FROM gebruiker WHERE id = ?";

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Fout bij ophalen gebruikersinfo:", err);
      return res.status(500).send("Er ging iets mis bij het ophalen van gebruikersinfo");
    }

    if (results.length === 0) {
      return res.status(404).send("Gebruiker niet gevonden");
    }

    // Stuur de gebruikersinfo terug (zonder wachtwoord)
    res.json(results[0]);
  });
});

// Route om doelen voor een leerling op te halen
router.get("/doelen", authenticateToken, (req, res) => {
  const leerling_id = req.user.id;

  const sql = `
    SELECT id, tekst, voltooid 
    FROM doel 
    WHERE leerling_id = ? 
    ORDER BY id DESC
  `;

  db.query(sql, [leerling_id], (err, results) => {
    if (err) {
      console.error("Fout bij ophalen doelen:", err);
      return res.status(500).send("Er ging iets mis bij het ophalen van de doelen");
    }

    res.json(results);
  });
});

// Route om beloningen voor een leerling op te halen
router.get("/beloningen", authenticateToken, (req, res) => {
  const leerling_id = req.user.id;

  const sql = `
    SELECT id, naam, punten_kosten, ingewisseld 
    FROM beloning 
    WHERE leerling_id = ? 
    ORDER BY ingewisseld ASC, id DESC
  `;

  db.query(sql, [leerling_id], (err, results) => {
    if (err) {
      console.error("Fout bij ophalen beloningen:", err);
      return res.status(500).send("Er ging iets mis bij het ophalen van de beloningen");
    }

    res.json(results);
  });
});

module.exports = router;
