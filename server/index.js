require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const authRoutes = require("./routes/auth");
const applicationRoutes = require("./routes/applications");
const { requireLogin } = require("./middleware/auth");

const app = express();
const isProd = process.env.NODE_ENV === "production";

// Needed on hosts like Render so secure cookies work behind their proxy.
if (isProd) app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // lets the browser send the session cookie
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/applications", requireLogin, applicationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`JobTrack API running on port ${PORT}`));
