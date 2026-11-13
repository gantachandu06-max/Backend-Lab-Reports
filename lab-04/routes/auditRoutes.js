
const express = require("express");
const router = express.Router();

const db = require("../database/db");

// GET latest 10 audit records
router.get("/", (req, res) => {
    const sql = `
        SELECT * FROM audit
        ORDER BY id DESC
        LIMIT 10
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json(rows);
    });
});

module.exports = router;
