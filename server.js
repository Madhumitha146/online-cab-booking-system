const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicPath = path.join(__dirname, "public");

// MySQL database connection
const db = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "YourNewPass123!",
    database: "cab_booking"
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.code, err.message);
        return;
    }

    console.log("MySQL connected successfully!");
});

// FIRST PAGE: Login
app.get("/", (req, res) => {
    res.redirect("/login.html");
});

// Login page
app.get("/login", (req, res) => {
    res.sendFile(path.join(publicPath, "login.html"));
});

// Dashboard page
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(publicPath, "dashboard.html"));
});

// Database connection test
app.get("/test-db", (req, res) => {
    db.query("SELECT 1 AS working", (err) => {
        if (err) {
            return res.status(500).send("Database error: " + err.message);
        }

        res.send("Website and MySQL connected successfully!");
    });
});

// Save cab booking
app.post("/book", (req, res) => {
    const { customer_name, pickup, destination } = req.body;

    if (!customer_name || !pickup || !destination) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all booking details."
        });
    }

    const sql = `
        INSERT INTO bookings (customer_name, pickup, destination)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [customer_name, pickup, destination], (err, result) => {
        if (err) {
            console.error("Booking error:", err.message);

            return res.status(500).json({
                success: false,
                message: "Unable to save booking."
            });
        }

        res.json({
            success: true,
            message: "Cab booked successfully!",
            bookingId: result.insertId
        });
    });
});

// View saved bookings
app.get("/bookings", (req, res) => {
    db.query(
        "SELECT * FROM bookings ORDER BY id DESC",
        (err, results) => {
            if (err) {
                console.error("Bookings error:", err.message);
                return res.status(500).json({
                    error: "Unable to load bookings."
                });
            }

            res.json(results);
        }
    );
});

// Start website
app.listen(PORT, () => {
    console.log(`Website running at http://localhost:${PORT}`);
    console.log(`Login page: http://localhost:${PORT}/login.html`);
});