
const express = require("express");
const router = express.Router();

const db = require("../database/db");


// GET all machines and search by product
router.get("/", (req, res) => {
    const { product } = req.query;

    let sql = "SELECT * FROM machines";
    let params = [];

    if (product) {
        sql += " WHERE product LIKE ?";
        params.push(`%${product}%`);
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json(rows);
    });
});


// GET machine by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;

    db.get("SELECT * FROM machines WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: "Machine not found" });
        }
        res.status(200).json(row);
    });
});


// ADD a new machine
router.post("/", (req, res) => {
    const { name, product } = req.body;

    if (!name || !name.trim() || !product || !product.trim()) {
        return res.status(400).json({
            message: "Machine name and product are required"
        });
    }

    db.run(
        "INSERT INTO machines (name, product) VALUES (?, ?)",
        [name.trim(), product.trim()],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const machineId = this.lastID;

            db.run(
                "INSERT INTO audit (action, machine_id) VALUES (?, ?)",
                ["ADD", machineId],
                (auditErr) => {
                    if (auditErr) {
                        return res.status(500).json({ error: auditErr.message });
                    }

                    res.status(201).json({
                        message: "Machine added successfully",
                        id: machineId
                    });
                }
            );
        }
    );
});

// UPDATE a machine
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, product } = req.body;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({ message: "Invalid machine ID" });
    }

    if (!name || !name.trim() || !product || !product.trim()) {
        return res.status(400).json({
            message: "Machine name and product are required"
        });
    }

    db.run(
        "UPDATE machines SET name = ?, product = ? WHERE id = ?",
        [name.trim(), product.trim(), id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: "Machine not found" });
            }

            db.run(
                "INSERT INTO audit (action, machine_id) VALUES (?, ?)",
                ["UPDATE", id],
                (auditErr) => {
                    if (auditErr) {
                        return res.status(500).json({ error: auditErr.message });
                    }

                    res.status(200).json({
                        message: "Machine updated successfully"
                    });
                }
            );
        }
    );
});

// DELETE a machine
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({ message: "Invalid machine ID" });
    }

    db.run(
        "DELETE FROM machines WHERE id = ?",
        [id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: "Machine not found" });
            }

            db.run(
                "INSERT INTO audit (action, machine_id) VALUES (?, ?)",
                ["DELETE", id],
                (auditErr) => {
                    if (auditErr) {
                        return res.status(500).json({ error: auditErr.message });
                    }

                    res.status(200).json({
                        message: "Machine deleted successfully"
                    });
                }
            );
        }
    );
});


module.exports = router;
