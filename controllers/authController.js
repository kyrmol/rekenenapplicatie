const db = require("../models/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = (req, res) => {
    const { voornaam, achternaam, email, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = `
    INSERT INTO gebruiker (voornaam, achternaam, email, wachtwoord, rol)
    VALUES (?, ?, ?, ?, ?)
  `;
    db.query(sql, [voornaam, achternaam, email, hashedPassword, role], (err) => {
        if (err) return res.status(500).send(err);
        res.send("✅ Gebruiker geregistreerd!");
    });
};


exports.login = (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM gebruiker WHERE email = ?";
    db.query(sql, [email], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(401).send("❌ Ongeldige login!");

        const user = result[0];
        const isValid = bcrypt.compareSync(password, user.wachtwoord);
        if (!isValid) return res.status(401).send("❌ Fout wachtwoord!");

        const token = jwt.sign({ id: user.id, role: user.rol }, "SECRET_KEY", { expiresIn: "1h" });
        res.json({ token, role: user.rol });
    });
};
