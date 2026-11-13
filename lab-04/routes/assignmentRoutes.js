
const express = require("express");
const router = express.Router();

const db = require("../database/db");

// GET all assignments with operator and machine names
router.get("/", (req, res) => {
    const sql = `
        SELECT
            assignments.id,
            operators.name AS operator_name,
            machines.name AS machine_name,
            machines.product
        FROM assignments
        JOIN operators
            ON assignments.operator_id = operators.id
        JOIN machines
            ON assignments.machine_id = machines.id
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json(rows);
    });
});

module.exports = router;
