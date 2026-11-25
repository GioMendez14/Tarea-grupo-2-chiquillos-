const db = require("../db");

const toUser = (r) => ({ id: r.id, name: r.name, email: r.email });

async function findByEmail(email) {
  const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0] ?? null; // incluye password_hash: solo se usa dentro del servidor
}

async function findById(id) {
  const { rows } = await db.query("SELECT id, name, email FROM users WHERE id = $1", [id]);
  return rows[0] ? toUser(rows[0]) : null;
}

async function create({ name, email, passwordHash }) {
  const { rows } = await db.query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
    [name, email, passwordHash],
  );
  return toUser(rows[0]);
}

module.exports = { findByEmail, findById, create, toUser };
