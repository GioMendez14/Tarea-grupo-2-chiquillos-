const { z } = require("zod");

// Fecha real en formato AAAA-MM-DD (rechaza, por ejemplo, 2026-02-31)
const isRealDate = (v) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;

const dateString = z.string().refine(isRealDate, "Fecha inválida (usa AAAA-MM-DD)");
const priority = z.enum(["LOW", "MEDIUM", "HIGH"], { message: "Prioridad inválida" });

const registerSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(60),
  email: z.string().trim().toLowerCase().email("Correo inválido").max(120),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "Máximo 72 caracteres (límite de bcrypt)"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z.string().min(1, "Escribe tu contraseña").max(72),
});

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(120),
  description: z.string().trim().max(1000).nullable().optional(),
  priority: priority.default("MEDIUM"),
  dueDate: dateString.nullable().optional(),
});

// PATCH: todos los campos son opcionales, pero debe venir al menos uno
const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, "El título no puede estar vacío").max(120),
    description: z.string().trim().max(1000).nullable(),
    priority,
    dueDate: dateString.nullable(),
    completed: z.boolean(),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, "Envía al menos un campo para actualizar");

const listQuerySchema = z.object({
  status: z.enum(["all", "pending", "completed"]).default("all"),
  priority: priority.optional(),
  q: z.string().trim().max(100).optional(),
  sort: z.enum(["created", "due", "priority"]).default("created"),
});

const statsQuerySchema = z.object({ today: dateString.optional() });
const idSchema = z.coerce.number().int().positive();

module.exports = {
  isRealDate,
  registerSchema,
  loginSchema,
  createTaskSchema,
  updateTaskSchema,
  listQuerySchema,
  statsQuerySchema,
  idSchema,
};
