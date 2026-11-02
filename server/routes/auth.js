const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "That email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name.trim(), cleanEmail, passwordHash]
    );

    req.session.userId = result.insertId;
    res.status(201).json({ id: result.insertId, name: name.trim(), email: cleanEmail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not register. Try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email.trim().toLowerCase(),
    ]);
    const user = rows[0];
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) {
      return res.status(401).json({ error: "Wrong email or password." });
    }

    req.session.userId = user.id;
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not log in. Try again." });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// GET /api/auth/me  (the frontend uses this to check if a user is already logged in)
router.get("/me", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not logged in." });
    const [rows] = await pool.query("SELECT id, name, email FROM users WHERE id = ?", [
      req.session.userId,
    ]);
    if (!rows[0]) return res.status(401).json({ error: "Not logged in." });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not check login." });
  }
});

module.exports = router;
