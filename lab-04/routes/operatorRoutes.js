
const express = require("express");
const router = express.Router();

const db = require("../database/db");

// GET all operators
router.get("/", (req, res) => {
    db.all("SELECT * FROM operators", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json(rows);
    });
});

// GET operator by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;

    db.get("SELECT * FROM operators WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({
                message: "Operator not found"
            });
        }

        res.status(200).json(row);
    });
});

module.exports = router;
