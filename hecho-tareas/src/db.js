const { Pool, types } = require("pg");

// Las columnas DATE (tipo 1082) se devuelven como texto "AAAA-MM-DD".
// Así no hay conversión de zona horaria que mueva la fecha un día.
types.setTypeParser(1082, (value) => value);

const connectionString = process.env.DATABASE_URL;

// Si la URL ya trae ?sslmode=..., pg la respeta. Si no y DB_SSL=true, se activa SSL.
const useSsl = process.env.DB_SSL === "true" && !/sslmode=/.test(connectionString || "");

const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  max: 5,
});

// Todas las consultas pasan por aquí y usan parámetros ($1, $2…): así se evita la inyección SQL
const query = (text, params) => pool.query(text, params);

module.exports = { query, pool };
