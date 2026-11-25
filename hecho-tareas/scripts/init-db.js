// Crea las tablas ejecutando db/schema.sql:  npm run db:init
require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { assertEnv } = require("../src/config");

assertEnv();
const db = require("../src/db");

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
  await db.query(sql);
  console.log("Tablas creadas (o ya existían).");
  await db.pool.end();
})().catch((err) => {
  console.error("No se pudo crear el esquema:", err.message);
  process.exit(1);
});
