const db = require("../models/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = (req, res) => {
    const { role, ouder, leerling } = req.body;

    if (role === "ouder") {
        const ouderHashedPassword = bcrypt.hashSync(ouder.password, 10);
        const leerlingHashedPassword = bcrypt.hashSync(leerling.password, 10);

        const ouderSql = `
      INSERT INTO gebruiker (voornaam, achternaam, email, wachtwoord, rol)
      VALUES (?, ?, ?, ?, 'ouder')
    `;
        const leerlingSql = `
      INSERT INTO gebruiker (voornaam, achternaam, email, wachtwoord, rol)
      VALUES (?, ?, ?, ?, 'leerling')
    `;
        const koppelingSql = `
      INSERT INTO ouder_leerling (ouder_id, leerling_id)
      VALUES (?, ?)
    `;

        db.query(ouderSql, [ouder.voornaam, ouder.achternaam, ouder.email, ouderHashedPassword], (err, ouderResult) => {
            if (err) return res.status(500).send(err);

            const ouderId = ouderResult.insertId;

            db.query(leerlingSql, [leerling.voornaam, leerling.achternaam, leerling.email, leerlingHashedPassword], (err, leerlingResult) => {
                if (err) return res.status(500).send(err);

                const leerlingId = leerlingResult.insertId;

                db.query(koppelingSql, [ouderId, leerlingId], (err) => {
                    if (err) return res.status(500).send(err);

                    res.send("✅ Ouder en leerling succesvol geregistreerd!");
                });
            });
        });
    } else {
        res.status(400).send("❌ Alleen ouders kunnen een leerling registreren.");
    }
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
