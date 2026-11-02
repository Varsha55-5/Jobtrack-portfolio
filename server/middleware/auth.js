// Blocks the request unless the user has logged in (a session exists).
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Please log in first." });
  }
  next();
}

module.exports = { requireLogin };
