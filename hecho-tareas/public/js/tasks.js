// Pantalla principal: lista, filtros, crear, editar, completar y eliminar tareas
import { api } from "/js/api.js";

const $ = (id) => document.getElementById(id);
const PRIORITY_LABEL = { HIGH: "Alta", MEDIUM: "Media", LOW: "Baja" };

// Fecha de hoy en hora local, formato AAAA-MM-DD
const today = () => new Date().toLocaleDateString("en-CA");

function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" });
}

// Crea elementos del DOM de forma segura: el texto se asigna con textContent,
// así lo que escriba un usuario nunca se interpreta como HTML (evita XSS).
function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "class") el.className = value;
    else if (key === "text") el.textContent = value;
    else if (key === "checked") el.checked = value;
    else if (key.startsWith("on")) el.addEventListener(key.slice(2), value);
    else el.setAttribute(key, value);
  }
  el.append(...children.filter(Boolean));
  return el;
}

const filters = { status: "all", priority: "", sort: "created", q: "" };
let editingId = null;
let deletingTask = null;

// ---------- Mostrar datos ----------

function renderTask(task) {
  const overdue = !task.completed && task.dueDate && task.dueDate < today();
  const level = task.priority.toLowerCase();

  return h(
    "li",
    { class: `task priority-${level}${task.completed ? " done" : ""}` },
    h("input", {
      type: "checkbox",
      checked: task.completed,
      "aria-label": `Marcar “${task.title}” como ${task.completed ? "pendiente" : "completada"}`,
      onchange: () => toggleCompleted(task),
    }),
    h(
      "div",
      { class: "task-body" },
      h("p", { class: "task-title", text: task.title }),
      task.description && h("p", { class: "task-desc", text: task.description }),
      h(
        "p",
        { class: "task-meta" },
        h("span", { class: `badge badge-${level}`, text: `Prioridad ${PRIORITY_LABEL[task.priority].toLowerCase()}` }),
        task.dueDate &&
          h("span", {
            class: overdue ? "due overdue" : "due",
            text: `${overdue ? "Venció el " : "Vence el "}${formatDate(task.dueDate)}`,
          }),
        h("span", { class: "state", text: task.completed ? "Completada" : "Pendiente" }),
      ),
    ),
    h(
      "div",
      { class: "task-actions" },
      h("button", { class: "btn ghost", type: "button", text: "Editar", onclick: () => openEdit(task) }),
      h("button", { class: "btn ghost", type: "button", text: "Eliminar", onclick: () => openDelete(task) }),
    ),
  );
}

function render(tasks, stats) {
  $("taskList").replaceChildren(...tasks.map(renderTask));
  $("emptyState").hidden = tasks.length > 0;
  $("statTotal").textContent = stats.total;
  $("statPending").textContent = stats.pending;
  $("statCompleted").textContent = stats.completed;
  $("statOverdue").textContent = stats.overdue;
}

function showListError(message) {
  $("listError").textContent = message;
  $("listError").hidden = false;
}

async function load() {
  try {
    const params = new URLSearchParams({ status: filters.status, sort: filters.sort });
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.q.trim()) params.set("q", filters.q.trim());

    const [tasks, stats] = await Promise.all([
      api.get(`/api/tasks?${params}`),
      api.get(`/api/tasks/stats?today=${today()}`),
    ]);
    $("listError").hidden = true;
    render(tasks, stats);
  } catch (error) {
    showListError(error.message);
  }
}

// ---------- Crear y editar ----------

function openCreate() {
  editingId = null;
  $("taskForm").reset();
  $("taskDialogTitle").textContent = "Nueva tarea";
  $("taskFormError").hidden = true;
  $("taskDialog").showModal();
  $("title").focus();
}

function openEdit(task) {
  editingId = task.id;
  $("taskDialogTitle").textContent = "Editar tarea";
  $("title").value = task.title;
  $("description").value = task.description ?? "";
  $("priority").value = task.priority;
  $("dueDate").value = task.dueDate ?? "";
  $("taskFormError").hidden = true;
  $("taskDialog").showModal();
  $("title").focus();
}

async function saveTask(event) {
  event.preventDefault();
  const form = $("taskForm");
  if (!form.checkValidity()) return form.reportValidity();

  const body = {
    title: $("title").value.trim(),
    description: $("description").value.trim() || null,
    priority: $("priority").value,
    dueDate: $("dueDate").value || null,
  };

  $("saveTask").disabled = true;
  try {
    if (editingId === null) await api.post("/api/tasks", body);
    else await api.patch(`/api/tasks/${editingId}`, body);
    $("taskDialog").close();
    await load();
  } catch (error) {
    $("taskFormError").textContent = error.message;
    $("taskFormError").hidden = false;
  } finally {
    $("saveTask").disabled = false;
  }
}

// ---------- Completar y eliminar ----------

async function toggleCompleted(task) {
  try {
    await api.patch(`/api/tasks/${task.id}`, { completed: !task.completed });
  } catch (error) {
    showListError(error.message);
  }
  await load();
}

function openDelete(task) {
  deletingTask = task;
  $("deleteMessage").textContent = `Vas a eliminar “${task.title}”. Esta acción no se puede deshacer.`;
  $("deleteDialog").showModal();
}

async function confirmDelete() {
  try {
    await api.delete(`/api/tasks/${deletingTask.id}`);
  } catch (error) {
    showListError(error.message);
  }
  $("deleteDialog").close();
  await load();
}

// ---------- Eventos ----------

$("newTaskBtn").addEventListener("click", openCreate);
$("cancelTask").addEventListener("click", () => $("taskDialog").close());
$("taskForm").addEventListener("submit", saveTask);
$("cancelDelete").addEventListener("click", () => $("deleteDialog").close());
$("confirmDelete").addEventListener("click", confirmDelete);
$("filters").addEventListener("submit", (e) => e.preventDefault());

$("fStatus").addEventListener("change", (e) => { filters.status = e.target.value; load(); });
$("fPriority").addEventListener("change", (e) => { filters.priority = e.target.value; load(); });
$("fSort").addEventListener("change", (e) => { filters.sort = e.target.value; load(); });

// Pequeña espera (debounce) para no llamar a la API en cada tecla de la búsqueda
let searchTimer;
$("q").addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { filters.q = e.target.value; load(); }, 250);
});

$("logoutBtn").addEventListener("click", async () => {
  await api.post("/api/auth/logout");
  window.location.href = "/";
});

// ---------- Inicio ----------

(async () => {
  const me = await api.get("/api/auth/me"); // si no hay sesión, api.js manda al login
  $("userName").textContent = me.name;
  await load();
})();
