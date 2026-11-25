// Carga un usuario de demostración con tareas de ejemplo:  npm run db:seed
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { assertEnv } = require("../src/config");

assertEnv();
const db = require("../src/db");

const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-CA"); // AAAA-MM-DD
};

(async () => {
  await db.query("DELETE FROM users WHERE email = $1", ["demo@hecho.app"]); // borra también sus tareas (CASCADE)
  const hash = await bcrypt.hash("demo12345", 12);
  const { rows } = await db.query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
    ["Usuario Demo", "demo@hecho.app", hash],
  );
  const userId = rows[0].id;

  const tasks = [
    ["Entregar informe de Sistemas", "Versión final en PDF", "HIGH", day(1), false],
    ["Estudiar para el examen de SQL", null, "MEDIUM", day(5), false],
    ["Pagar el internet", null, "HIGH", day(-2), false],
    ["Practicar JavaScript", "Repasar fetch y async/await", "LOW", day(10), false],
    ["Comprar café", null, "LOW", null, true],
  ];
  for (const [title, description, priority, due, completed] of tasks) {
    await db.query(
      "INSERT INTO tasks (user_id, title, description, priority, due_date, completed) VALUES ($1, $2, $3, $4, $5, $6)",
      [userId, title, description, priority, due, completed],
    );
  }
  console.log("Seed listo: demo@hecho.app / demo12345");
  await db.pool.end();
})().catch((err) => {
  console.error("No se pudo cargar el seed:", err.message);
  process.exit(1);
});
