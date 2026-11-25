const test = require("node:test");
const assert = require("node:assert/strict");
const { buildListQuery, ORDER } = require("../src/queries");

test("la consulta siempre filtra por el dueño", () => {
  const q = buildListQuery(7, { status: "all", sort: "created" });
  assert.match(q.text, /user_id = \$1/);
  assert.deepEqual(q.params, [7]);
});

test("cada filtro usa un parámetro, nunca texto pegado en el SQL", () => {
  const q = buildListQuery(7, { status: "pending", priority: "HIGH", q: "'; DROP TABLE tasks; --", sort: "due" });
  assert.equal(q.text.includes("DROP"), false);
  assert.deepEqual(q.params, [7, "HIGH", "%'; DROP TABLE tasks; --%"]);
});

test("el orden solo puede salir de la lista fija", () => {
  const q = buildListQuery(7, { status: "all", sort: "no-existe" });
  assert.ok(q.text.endsWith(ORDER.created));
});

test("los comodines % y _ de la búsqueda se escapan", () => {
  const q = buildListQuery(7, { status: "all", q: "100%_ok" });
  assert.equal(q.params[1], "%100\\%\\_ok%");
});
