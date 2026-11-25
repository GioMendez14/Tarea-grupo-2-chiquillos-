// Construye la consulta de la lista de tareas. Es una función pura (no toca la base),
// por eso se puede probar sin base de datos.

// Los valores de ORDER BY salen de esta lista fija, nunca de lo que escribe el usuario
const ORDER = {
  created: "created_at DESC, id DESC",
  due: "due_date ASC NULLS LAST, id DESC",
  priority:
    "CASE priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END, due_date ASC NULLS LAST, id DESC",
};

function buildListQuery(userId, filters) {
  const where = ["user_id = $1"]; // siempre se filtra por el dueño
  const params = [userId];

  if (filters.status === "pending") where.push("completed = FALSE");
  if (filters.status === "completed") where.push("completed = TRUE");

  if (filters.priority) {
    params.push(filters.priority);
    where.push(`priority = $${params.length}`);
  }

  if (filters.q) {
    // Se escapan % y _ para que se busquen como texto normal
    params.push(`%${filters.q.replace(/[\\%_]/g, "\\$&")}%`);
    where.push(`title ILIKE $${params.length}`);
  }

  const text = `SELECT * FROM tasks WHERE ${where.join(" AND ")} ORDER BY ${ORDER[filters.sort] ?? ORDER.created}`;
  return { text, params };
}

module.exports = { buildListQuery, ORDER };
