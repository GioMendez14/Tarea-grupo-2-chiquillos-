const { ZodError } = require("zod");

const notFoundApi = (_req, res) => res.status(404).json({ error: "Ruta no encontrada" });

// Manejador central de errores: convierte cualquier error en una respuesta JSON limpia
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Datos inválidos", details: err.issues.map((i) => i.message) });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido" });
  }
  if (err.code === "23505") {
    // Violación de UNIQUE en PostgreSQL (por ejemplo, dos registros a la vez con el mismo correo)
    return res.status(409).json({ error: "Ese correo ya está registrado" });
  }
  // El detalle real solo va al log del servidor, nunca al cliente
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
}

module.exports = { errorHandler, notFoundApi };
