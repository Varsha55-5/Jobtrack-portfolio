require("dotenv").config();
const mysql = require("mysql2/promise");

// A pool keeps several connections open and reuses them for every request.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true, // return DATE columns as "YYYY-MM-DD" text
});

module.exports = pool;
