const express = require("express");
const tasks = require("../models/tasks");
const { requireAuth } = require("../middleware/auth");
const {
  createTaskSchema,
  updateTaskSchema,
  listQuerySchema,
  statsQuerySchema,
  idSchema,
} = require("../validation");

const router = express.Router();
router.use(requireAuth); // todas las rutas de tareas exigen sesión

const notFound = (res) => res.status(404).json({ error: "Tarea no encontrada" });

// Ignora parámetros vacíos de la URL (por ejemplo ?priority=)
const cleanQuery = (q) => Object.fromEntries(Object.entries(q).filter(([, v]) => v !== ""));

// Importante: /stats va ANTES de /:id, o Express lo tomaría como un id
router.get("/stats", async (req, res) => {
  const { today } = statsQuerySchema.parse(cleanQuery(req.query));
  res.json(await tasks.stats(req.userId, today));
});

router.get("/", async (req, res) => {
  const filters = listQuerySchema.parse(cleanQuery(req.query));
  res.json(await tasks.list(req.userId, filters));
});

router.post("/", async (req, res) => {
  const data = createTaskSchema.parse(req.body);
  res.status(201).json(await tasks.create(req.userId, data));
});

router.get("/:id", async (req, res) => {
  const task = await tasks.get(req.userId, idSchema.parse(req.params.id));
  task ? res.json(task) : notFound(res);
});

router.patch("/:id", async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const data = updateTaskSchema.parse(req.body);
  const task = await tasks.update(req.userId, id, data);
  task ? res.json(task) : notFound(res);
});

router.delete("/:id", async (req, res) => {
  const removed = await tasks.remove(req.userId, idSchema.parse(req.params.id));
  removed ? res.status(204).end() : notFound(res);
});

module.exports = router;
