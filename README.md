# FINORA — Frontend + Backend

## Requirements
- Install Node.js LTS from https://nodejs.org/ (choose the LTS version).
- VS Code or another editor.

## Run on Windows
1. Extract this folder.
2. Open the `finora_backend_project` folder in VS Code.
3. Open Terminal → New Terminal.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the backend:
   ```bash
   npm start
   ```
6. Open **http://localhost:3000** in Chrome. Do not open `index.html` directly.

## Features
- Existing FINORA frontend design.
- SQLite database file `finora.db` is created in the project root on first run.
- Add and delete transactions from the dashboard.
- Search and type filters.
- Dashboard totals, donut chart, category breakdown and rule-based advisor recalculate from saved transactions.
- REST endpoints: `GET /api/health`, `GET /api/transactions`, `POST /api/transactions`, `PUT /api/transactions/:id`, `DELETE /api/transactions/:id`, `GET /api/summary`.

## Important
This starter is a local single-user app, not yet a secure multi-user hosted product. Do not store bank credentials or sensitive financial account details in it. To make it accessible over the internet or support separate user accounts, add authentication, authorization, HTTPS and a hosted database before deployment.
