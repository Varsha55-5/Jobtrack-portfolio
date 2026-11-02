const express = require("express");
const pool = require("../db");

const router = express.Router();
const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

// Every query uses "user_id = ?" so users only ever see their own rows.

// GET /api/applications?search=&status=&page=1&limit=8
router.get("/", async (req, res) => {
  try {
    const userId = req.session.userId;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 8, 1), 50);
    const offset = (page - 1) * limit;

    let where = "WHERE user_id = ?";
    const params = [userId];

    if (req.query.search) {
      where += " AND (company LIKE ? OR role LIKE ?)";
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }
    if (STATUSES.includes(req.query.status)) {
      where += " AND status = ?";
      params.push(req.query.status);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM applications ${where}`,
      params
    );
    const total = countRows[0].total;

    const [data] = await pool.query(
      `SELECT * FROM applications ${where} ORDER BY applied_date DESC, id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ data, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load applications." });
  }
});

// GET /api/applications/stats  -> { Applied: 3, Interview: 1, Offer: 0, Rejected: 2 }
router.get("/stats", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT status, COUNT(*) AS count FROM applications WHERE user_id = ? GROUP BY status",
      [req.session.userId]
    );
    const stats = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
    rows.forEach((r) => (stats[r.status] = r.count));
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load stats." });
  }
});

function validate(body) {
  const { company, role, status } = body;
  if (!company || !company.trim()) return "Company is required.";
  if (!role || !role.trim()) return "Role is required.";
  if (status && !STATUSES.includes(status)) return "Status is not valid.";
  return null;
}

// POST /api/applications
router.post("/", async (req, res) => {
  try {
    const problem = validate(req.body);
    if (problem) return res.status(400).json({ error: problem });

    const { company, role, status = "Applied", applied_date, notes = "" } = req.body;
    const date = applied_date || new Date().toISOString().slice(0, 10);

    const [result] = await pool.query(
      "INSERT INTO applications (user_id, company, role, status, applied_date, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [req.session.userId, company.trim(), role.trim(), status, date, notes]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save the application." });
  }
});

// PUT /api/applications/:id
router.put("/:id", async (req, res) => {
  try {
    const problem = validate(req.body);
    if (problem) return res.status(400).json({ error: problem });

    const { company, role, status = "Applied", applied_date, notes = "" } = req.body;
    const date = applied_date || new Date().toISOString().slice(0, 10);

    const [result] = await pool.query(
      "UPDATE applications SET company = ?, role = ?, status = ?, applied_date = ?, notes = ? WHERE id = ? AND user_id = ?",
      [company.trim(), role.trim(), status, date, notes, req.params.id, req.session.userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Application not found." });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update the application." });
  }
});

// DELETE /api/applications/:id
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM applications WHERE id = ? AND user_id = ?",
      [req.params.id, req.session.userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Application not found." });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete the application." });
  }
});

module.exports = router;
