const db = require("../models/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = (req, res) => {
    const { role, ouder, leerling, docent } = req.body;

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
        const koppelingOuderLeerlingSql = `
            INSERT INTO ouder_leerling (ouder_id, leerling_id)
            VALUES (?, ?)
        `;
        const koppelingKlasLeerlingSql = `
            INSERT INTO klas_leerling (klas_id, leerling_id)
            VALUES (?, ?)
        `;

        // Insert parent into the database
        db.query(ouderSql, [ouder.voornaam, ouder.achternaam, ouder.email, ouderHashedPassword], (err, ouderResult) => {
            if (err) return res.status(500).send(err);

            const ouderId = ouderResult.insertId;

            // Insert child into the database
            db.query(leerlingSql, [leerling.voornaam, leerling.achternaam, leerling.email, leerlingHashedPassword], (err, leerlingResult) => {
                if (err) return res.status(500).send(err);

                const leerlingId = leerlingResult.insertId;

                // Link parent to child
                db.query(koppelingOuderLeerlingSql, [ouderId, leerlingId], (err) => {
                    if (err) return res.status(500).send(err);

                    // Link child to class
                    db.query(koppelingKlasLeerlingSql, [leerling.klasId, leerlingId], (err) => {
                        if (err) return res.status(500).send(err);

                        res.send("✅ Ouder, leerling en klas succesvol gekoppeld!");
                    });
                });
            });
        });
    } else if (role === "docent") {
        const docentHashedPassword = bcrypt.hashSync(docent.password, 10);

        const docentSql = `
            INSERT INTO gebruiker (voornaam, achternaam, email, wachtwoord, rol)
            VALUES (?, ?, ?, ?, 'docent')
        `;
        const klasSql = `
            INSERT INTO klas (naam, docent_id)
            VALUES (?, ?)
        `;

        // Insert teacher into the database
        db.query(docentSql, [docent.voornaam, docent.achternaam, docent.email, docentHashedPassword], (err, docentResult) => {
            if (err) return res.status(500).send(err);

            const docentId = docentResult.insertId;

            // Insert class and link it to the teacher
            db.query(klasSql, [docent.className, docentId], (err) => {
                if (err) return res.status(500).send(err);

                res.send("✅ Docent en klas succesvol geregistreerd!");
            });
        });
    } else {
        res.status(400).send("❌ Ongeldige rol geselecteerd.");
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