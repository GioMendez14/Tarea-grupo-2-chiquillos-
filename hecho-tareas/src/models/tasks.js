const db = require("../db");
const { buildListQuery } = require("../queries");

// REGLA DE SEGURIDAD: toda consulta lleva user_id en el WHERE.
// El userId viene de la sesión, nunca del cuerpo de la petición.

const toTask = (r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  priority: r.priority,
  dueDate: r.due_date, // texto AAAA-MM-DD o null
  completed: r.completed,
  createdAt: r.created_at,
});

async function list(userId, filters) {
  const { text, params } = buildListQuery(userId, filters);
  const { rows } = await db.query(text, params);
  return rows.map(toTask);
}

async function get(userId, id) {
  const { rows } = await db.query("SELECT * FROM tasks WHERE id = $1 AND user_id = $2", [id, userId]);
  return rows[0] ? toTask(rows[0]) : null;
}

async function create(userId, data) {
  const { rows } = await db.query(
    `INSERT INTO tasks (user_id, title, description, priority, due_date)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, data.title, data.description || null, data.priority, data.dueDate ?? null],
  );
  return toTask(rows[0]);
}

// Nombres de columna fijos: lo que escribe el usuario solo llega como valor ($n), nunca como SQL
const COLUMNS = { title: "title", description: "description", priority: "priority", dueDate: "due_date", completed: "completed" };

async function update(userId, id, data) {
  const sets = [];
  const params = [];
  for (const [key, column] of Object.entries(COLUMNS)) {
    if (key in data) {
      params.push(key === "description" ? data.description || null : data[key]);
      sets.push(`${column} = $${params.length}`);
    }
  }
  params.push(id, userId);
  const { rows } = await db.query(
    `UPDATE tasks SET ${sets.join(", ")}, updated_at = now()
     WHERE id = $${params.length - 1} AND user_id = $${params.length} RETURNING *`,
    params,
  );
  return rows[0] ? toTask(rows[0]) : null; // null: no existe o no es del usuario
}

async function remove(userId, id) {
  const { rowCount } = await db.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2", [id, userId]);
  return rowCount > 0;
}

async function stats(userId, today) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE completed)::int AS completed,
            COUNT(*) FILTER (WHERE NOT completed)::int AS pending,
            COUNT(*) FILTER (WHERE NOT completed AND due_date < COALESCE($2::date, CURRENT_DATE))::int AS overdue
     FROM tasks WHERE user_id = $1`,
    [userId, today ?? null],
  );
  return rows[0];
}

module.exports = { list, get, create, update, remove, stats };
