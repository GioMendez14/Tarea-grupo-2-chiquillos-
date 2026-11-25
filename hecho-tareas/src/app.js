const path = require("node:path");
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const { pageAuth, redirectIfLoggedIn } = require("./middleware/auth");
const { errorHandler, notFoundApi } = require("./middleware/errors");

const app = express();

app.set("trust proxy", 1); // detrás del proxy de la nube, para que el límite de intentos use la IP real
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      // Se quita esta directiva: en http://localhost rompe la carga de estilos en Safari
      directives: { "upgrade-insecure-requests": null },
    },
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// ---- API REST ----
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api", notFoundApi);

// ---- Páginas HTML ----
const views = path.join(__dirname, "..", "views");
app.get("/login", redirectIfLoggedIn, (_req, res) => res.sendFile(path.join(views, "login.html")));
app.get("/register", redirectIfLoggedIn, (_req, res) => res.sendFile(path.join(views, "register.html")));
app.get("/tasks", pageAuth, (_req, res) => res.sendFile(path.join(views, "tasks.html"))); // protegida

// Archivos públicos: inicio, CSS y JavaScript del navegador
app.use(express.static(path.join(__dirname, "..", "public")));

app.use(errorHandler);

module.exports = app;
