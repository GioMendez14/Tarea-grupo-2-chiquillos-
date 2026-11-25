const test = require("node:test");
const assert = require("node:assert/strict");
const v = require("../src/validation");

test("registro: normaliza el correo y exige contraseña de 8+ caracteres", () => {
  const ok = v.registerSchema.parse({ name: "Ana", email: "  ANA@Mail.com ", password: "clave12345" });
  assert.equal(ok.email, "ana@mail.com");
  assert.equal(v.registerSchema.safeParse({ name: "Ana", email: "a@b.com", password: "123" }).success, false);
});

test("fechas: acepta fechas reales y rechaza 2026-02-31 o texto", () => {
  assert.equal(v.isRealDate("2026-12-01"), true);
  assert.equal(v.isRealDate("2026-02-31"), false);
  assert.equal(v.isRealDate("mañana"), false);
});

test("tareas: prioridad por defecto MEDIUM y rechazo de prioridades inventadas", () => {
  assert.equal(v.createTaskSchema.parse({ title: "Algo" }).priority, "MEDIUM");
  assert.equal(v.createTaskSchema.safeParse({ title: "x", priority: "URGENTE" }).success, false);
});

test("PATCH: exige al menos un campo y no acepta user_id del cliente", () => {
  assert.equal(v.updateTaskSchema.safeParse({}).success, false);
  const r = v.updateTaskSchema.parse({ completed: true, user_id: 99 });
  assert.equal("user_id" in r, false);
});

test("filtros: valores desconocidos de orden o estado se rechazan", () => {
  assert.equal(v.listQuerySchema.safeParse({ sort: "hack" }).success, false);
  assert.equal(v.listQuerySchema.safeParse({ status: "todas" }).success, false);
});
