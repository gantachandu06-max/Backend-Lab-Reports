
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/teatime.db", (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to TeaTime database!");
    }
});

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");

    // Operators table
    db.run(`
        CREATE TABLE IF NOT EXISTS operators (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )
    `);

    // Machines table
    db.run(`
        CREATE TABLE IF NOT EXISTS machines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            product TEXT NOT NULL
        )
    `);

    // Assignments table
    db.run(`
        CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            operator_id INTEGER NOT NULL,
            machine_id INTEGER NOT NULL,
            FOREIGN KEY (operator_id) REFERENCES operators(id),
            FOREIGN KEY (machine_id) REFERENCES machines(id)
        )
    `);

    // Audit table for machine changes
    db.run(`
        CREATE TABLE IF NOT EXISTS audit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            machine_id INTEGER NOT NULL,
            time DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});


db.serialize(() => {
    db.get("SELECT COUNT(*) AS count FROM operators", (err, row) => {
        if (err) return console.error(err.message);

        if (row.count === 0) {
            db.run("INSERT INTO operators (name) VALUES (?)", ["Hasya"]);
            db.run("INSERT INTO operators (name) VALUES (?)", ["Susvitha"]);
            db.run("INSERT INTO operators (name) VALUES (?)", ["Chandu"]);
            db.run("INSERT INTO operators (name) VALUES (?)", ["Vinay Vardhan"]);
            db.run("INSERT INTO operators (name) VALUES (?)", ["Madhukar"]);
        }
    });

    db.get("SELECT COUNT(*) AS count FROM machines", (err, row) => {
        if (err) return console.error(err.message);

        if (row.count === 0) {
            db.run("INSERT INTO machines (name, product) VALUES (?, ?)", ["Machine 1", "Tea"]);
            db.run("INSERT INTO machines (name, product) VALUES (?, ?)", ["Machine 2", "Coffee"]);
            db.run("INSERT INTO machines (name, product) VALUES (?, ?)", ["Machine 3", "Green Tea"]);
        }
    });
});



db.get("SELECT COUNT(*) AS count FROM assignments", (err, row) => {
    if (err) {
        return console.error(err.message);
    }

    if (row.count === 0) {
        db.run(
            "INSERT INTO assignments (operator_id, machine_id) VALUES (?, ?)",
            [1, 1],
            (err) => {
                if (err) return console.error(err.message);

                db.run(
                    "INSERT INTO assignments (operator_id, machine_id) VALUES (?, ?)",
                    [2, 2],
                    (err) => {
                        if (err) console.error(err.message);
                        else console.log("Sample assignments added!");
                    }
                );
            }
        );
    }
});


module.exports = db;
