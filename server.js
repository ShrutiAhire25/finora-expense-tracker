const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database(path.join(__dirname, "finora.db"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    amount REAL NOT NULL CHECK(amount > 0),
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) reject(err);
    else resolve({ id: this.lastID, changes: this.changes });
  });
});
const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "FINORA" }));

app.get("/api/transactions", async (_req, res) => {
  try {
    const rows = await all(
      "SELECT id, description, amount, type, category, date FROM transactions ORDER BY date DESC, id DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Could not load transactions." });
  }
});

app.post("/api/transactions", async (req, res) => {
  const { description, amount, type, category, date } = req.body || {};
  const numericAmount = Number(amount);
  if (typeof description !== "string" || !description.trim()) {
    return res.status(400).json({ error: "Description is required." });
  }
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than zero." });
  }
  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({ error: "Type must be income or expense." });
  }
  if (typeof category !== "string" || !category.trim() || typeof date !== "string" ||
      !/^\\d{4}-\\d{2}-\\d{2}$/.test(date)) {
    return res.status(400).json({ error: "A category and valid date are required." });
  }
  try {
    const result = await run(
      "INSERT INTO transactions (description, amount, type, category, date) VALUES (?, ?, ?, ?, ?)",
      [description.trim(), numericAmount, type, category.trim(), date]
    );
    const [transaction] = await all(
      "SELECT id, description, amount, type, category, date FROM transactions WHERE id = ?",
      [result.id]
    );
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: "Could not save transaction." });
  }
});

app.put("/api/transactions/:id", async (req, res) => {
  const { description, amount, type, category, date } = req.body || {};
  const numericAmount = Number(amount);
  if (typeof description !== "string" || !description.trim() ||
      !Number.isFinite(numericAmount) || numericAmount <= 0 ||
      !["income", "expense"].includes(type) || typeof category !== "string" ||
      !category.trim() || typeof date !== "string" || !/^\\d{4}-\\d{2}-\\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Please provide valid transaction details." });
  }
  try {
    const result = await run(
      "UPDATE transactions SET description=?, amount=?, type=?, category=?, date=? WHERE id=?",
      [description.trim(), numericAmount, type, category.trim(), date, req.params.id]
    );
    if (!result.changes) return res.status(404).json({ error: "Transaction not found." });
    const [transaction] = await all(
      "SELECT id, description, amount, type, category, date FROM transactions WHERE id=?",
      [req.params.id]
    );
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: "Could not update transaction." });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const result = await run("DELETE FROM transactions WHERE id=?", [req.params.id]);
    if (!result.changes) return res.status(404).json({ error: "Transaction not found." });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not delete transaction." });
  }
});

app.get("/api/summary", async (_req, res) => {
  try {
    const [summary] = await all(`
      SELECT
        COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS expense,
        COUNT(*) AS transactionCount
      FROM transactions
    `);
    res.json({ ...summary, balance: summary.income - summary.expense });
  } catch (err) {
    res.status(500).json({ error: "Could not calculate summary." });
  }
});

app.listen(PORT, () => {
  console.log(`FINORA is running at http://localhost:${PORT}`);
  console.log("SQLite database: finora.db");
});
