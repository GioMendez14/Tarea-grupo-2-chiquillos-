# Hecho — Gestor de tareas

Aplicación web para registrar, organizar, editar y eliminar tareas, con prioridad (alta, media, baja) y fecha de vencimiento. Proyecto de **Sistemas y Computación I, Grupo 2**.

## Tecnologías
- **Front:** HTML, CSS y JavaScript puro (sin frameworks). Módulos ES nativos.
- **Backend:** Node.js 20+ con Express 5 (API REST).
- **Base de datos:** PostgreSQL, con consultas parametrizadas (`pg`).
- **Seguridad:** autenticación con JWT en cookie `httpOnly`, bcrypt para contraseñas, validación con Zod, Helmet (cabeceras), límite de intentos de login, protección por usuario en cada consulta.

## Funcionalidades
- Registro, inicio y cierre de sesión.
- Crear, ver, editar, completar y eliminar tareas (con confirmación).
- Prioridad: alta, media o baja. Fecha de vencimiento. Descripción.
- Filtros por estado y prioridad, búsqueda por título y orden por fecha, prioridad o creación.
- Resumen: total, pendientes, completadas y atrasadas.
- Cada usuario ve solo sus tareas.

## Estructura
```
server.js                 arranque del servidor
src/app.js                configuración de Express, rutas y páginas
src/routes/               auth.js (login, registro) y tasks.js (API de tareas)
src/models/               acceso a datos (siempre filtrado por el usuario)
src/middleware/           sesión, rutas protegidas, manejo de errores
src/validation.js         reglas de validación (Zod)
src/queries.js           construcción de la consulta de la lista
db/schema.sql             tablas e índices
public/                   CSS y JavaScript del navegador
views/                    páginas HTML (login, registro, tareas)
scripts/                  crear tablas y cargar datos de demostración
tests/                    pruebas unitarias
docs/                     documentación de diseño, API y despliegue
```

## Instalación local
Necesitas Node.js 20 o superior y una base PostgreSQL (puedes crear una gratis en neon.tech).
```bash
npm install
cp .env.example .env          # completa DATABASE_URL y JWT_SECRET
npm run db:init               # crea las tablas
npm run db:seed               # opcional: usuario demo@hecho.app / demo12345
npm start                     # http://localhost:3000
npm test                      # pruebas unitarias
```

## Variables de entorno
| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `JWT_SECRET` | Firma la sesión. Al menos 16 caracteres aleatorios (`openssl rand -base64 32`) |
| `PORT` | Puerto (la nube lo asigna sola) |
| `DB_SSL` | `true` solo si la base exige SSL y la URL no trae `sslmode` |

## Documentación
- [docs/API.md](docs/API.md): endpoints, ejemplos y códigos de respuesta.
- [docs/DISENO.md](docs/DISENO.md): arquitectura, modelo de datos y decisiones.
- [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md): cómo publicarla en la nube paso a paso.
- [DEFENSA.md](DEFENSA.md): preguntas frecuentes para la presentación oral.
