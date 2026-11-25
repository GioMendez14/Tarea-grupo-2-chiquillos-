// Comprueba al arrancar que las variables de entorno necesarias existen
function assertEnv() {
  const missing = ["DATABASE_URL", "JWT_SECRET"].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Faltan variables de entorno: ${missing.join(", ")}. Copia .env.example a .env y complétalo.`);
    process.exit(1);
  }
  if (process.env.JWT_SECRET.length < 16) {
    console.error("JWT_SECRET es demasiado corto: usa al menos 16 caracteres aleatorios.");
    process.exit(1);
  }
}

module.exports = { assertEnv };
