const jwt = require("jsonwebtoken");

// Lee y verifica la cookie de sesión. Devuelve el id del usuario o null.
function readUserId(req) {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    return Number(payload.sub) || null;
  } catch {
    return null; // token falso, alterado o vencido
  }
}

// Para la API: sin sesión válida responde 401
function requireAuth(req, res, next) {
  const userId = readUserId(req);
  if (!userId) return res.status(401).json({ error: "No autenticado" });
  req.userId = userId;
  next();
}

// Para páginas HTML: sin sesión manda al login
function pageAuth(req, res, next) {
  if (!readUserId(req)) return res.redirect("/login");
  next();
}

// Login y registro: si ya hay sesión, van directo a las tareas
function redirectIfLoggedIn(req, res, next) {
  if (readUserId(req)) return res.redirect("/tasks");
  next();
}

module.exports = { readUserId, requireAuth, pageAuth, redirectIfLoggedIn };
