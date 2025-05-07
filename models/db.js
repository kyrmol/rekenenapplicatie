const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // Ensure this matches the .env file
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
        throw err;
    }
    console.log("✅ Database verbonden!");
});

module.exports = db;