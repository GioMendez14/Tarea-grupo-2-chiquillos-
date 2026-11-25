const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const users = require("../models/users");
const { registerSchema, loginSchema } = require("../validation");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Limita los intentos de login/registro por IP: frena la fuerza bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta de nuevo en unos minutos." },
});

const WEEK = 7 * 24 * 60 * 60 * 1000;
const cookieOptions = () => ({
  httpOnly: true, // JavaScript del navegador no puede leer la cookie (protege contra XSS)
  sameSite: "lax", // no se envía en peticiones de otros sitios (protege contra CSRF)
  secure: process.env.NODE_ENV === "production", // en la nube, solo por HTTPS
});

function startSession(res, userId) {
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "7d" });
  res.cookie("token", token, { ...cookieOptions(), maxAge: WEEK });
}

// Hash falso para que el tiempo de respuesta sea parecido exista o no el correo
const DUMMY_HASH = bcrypt.hashSync("contraseña-falsa", 12);

router.post("/register", limiter, async (req, res) => {
  const data = registerSchema.parse(req.body);

  if (await users.findByEmail(data.email)) {
    return res.status(409).json({ error: "Ese correo ya está registrado" });
  }

  const passwordHash = await bcrypt.hash(data.password, 12); // 12 rondas de salt
  const user = await users.create({ name: data.name, email: data.email, passwordHash });

  startSession(res, user.id);
  res.status(201).json(user); // nunca se devuelve el hash
});

router.post("/login", limiter, async (req, res) => {
  const data = loginSchema.parse(req.body);

  const user = await users.findByEmail(data.email);
  const passwordOk = await bcrypt.compare(data.password, user ? user.password_hash : DUMMY_HASH);

  // Mismo mensaje si falla el correo o la contraseña: no revelamos cuál de los dos
  if (!user || !passwordOk) return res.status(401).json({ error: "Correo o contraseña incorrectos" });

  startSession(res, user.id);
  res.json(users.toUser(user));
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token", cookieOptions());
  res.status(204).end();
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await users.findById(req.userId);
  if (!user) return res.status(401).json({ error: "No autenticado" });
  res.json(user);
});

module.exports = router;
