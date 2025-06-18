const express = require("express");
const db = require("../models/db");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Authenticatie middleware
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

// Middleware om te controleren of de gebruiker een ouder is
const checkParentRole = (req, res, next) => {
  if (req.user.role !== "ouder") {
    return res.status(403).send("Toegang geweigerd: Alleen voor ouders.");
  }
  next();
};

// Route om ouder-info op te halen
router.get("/userinfo", authenticateToken, checkParentRole, (req, res) => {
  const ouderId = req.user.id;

  const sql = "SELECT id, voornaam, achternaam, email, rol FROM gebruiker WHERE id = ?";

  db.query(sql, [ouderId], (err, results) => {
    if (err) {
      console.error("Fout bij ophalen ouder-info:", err);
      return res.status(500).send("Er ging iets mis bij het ophalen van gebruikersinfo");
    }

    if (results.length === 0) {
      return res.status(404).send("Gebruiker niet gevonden");
    }

    // Stuur de gebruikersinfo terug (zonder wachtwoord)
    res.json(results[0]);
  });
});

// Route om gekoppelde kinderen van een ouder op te halen
router.get("/children", authenticateToken, checkParentRole, (req, res) => {
  const ouderId = req.user.id;

  const sql = `
    SELECT g.id, g.voornaam, g.achternaam, g.email
    FROM gebruiker g
    JOIN ouder_leerling ol ON g.id = ol.leerling_id
    WHERE ol.ouder_id = ? AND g.rol = 'leerling'
  `;

  db.query(sql, [ouderId], (err, results) => {
    if (err) {
      console.error("Fout bij ophalen kinderen:", err);
      return res.status(500).send("Er ging iets mis bij het ophalen van kinderen");
    }

    res.json(results);
  });
});

// Route om voortgang van een kind op te halen
router.get("/child-progress/:childId", authenticateToken, checkParentRole, (req, res) => {
  const ouderId = req.user.id;
  const childId = req.params.childId;

  // Controleer eerst of deze ouder toegang heeft tot dit kind
  const checkAccessSql = `
    SELECT 1
    FROM ouder_leerling
    WHERE ouder_id = ? AND leerling_id = ?
  `;

  db.query(checkAccessSql, [ouderId, childId], (err, accessResults) => {
    if (err) {
      console.error("Fout bij controleren toegang:", err);
      return res.status(500).send("Er ging iets mis bij het controleren van toegang");
    }

    if (accessResults.length === 0) {
      return res.status(403).send("Geen toegang tot deze leerling");
    }

    // Haal voortgangsdata voor alle spellen op
    const progressSql = `
      SELECT 
        r.id,
        r.naam as spelnaam,
        COUNT(s.id) as attempts,
        MAX(s.score) as highest_score,
        AVG(s.score) as average_score
      FROM rekenspel r
      LEFT JOIN score s ON r.id = s.spel_id AND s.leerling_id = ?
      GROUP BY r.id, r.naam
      ORDER BY r.id
    `;

    db.query(progressSql, [childId], (err, progressResults) => {
      if (err) {
        console.error("Fout bij ophalen voortgang:", err);
        return res.status(500).send("Er ging iets mis bij het ophalen van de voortgang");
      }

      res.json(progressResults);
    });
  });
});

module.exports = router;
