const express = require("express");
const db = require("../models/db");

const router = express.Router();

// Route to add a new class
router.post("/add", (req, res) => {
    const { naam } = req.body;

    const sql = "INSERT INTO klas (naam) VALUES (?)";
    db.query(sql, [naam], (err) => {
        if (err) return res.status(500).send("❌ Fout bij toevoegen van klas.");
        res.send("✅ Klas succesvol toegevoegd!");
    });
});

// Route to fetch all classes
router.get("/", (req, res) => {
    const sql = "SELECT id, naam FROM klas";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send("❌ Fout bij ophalen van klassen.");
        res.json(results);
    });
});

module.exports = router;