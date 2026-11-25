# API REST

Base: `/api`. Autenticación por cookie `token` (httpOnly), que se obtiene al registrarse o entrar.
Todas las respuestas de error tienen la forma `{ "error": "mensaje" }` y, si son de validación, `details` con la lista de problemas.

## Autenticación
| Método | Ruta | Cuerpo | Respuestas |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | 201 usuario · 400 datos inválidos · 409 correo registrado · 429 demasiados intentos |
| POST | `/api/auth/login` | `{ email, password }` | 200 usuario · 401 credenciales incorrectas · 429 |
| POST | `/api/auth/logout` | — | 204 |
| GET | `/api/auth/me` | — | 200 usuario · 401 |

## Tareas (requieren sesión)
| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/tasks?status=&priority=&q=&sort=` | Lista con filtros | 200 · 400 |
| GET | `/api/tasks/stats?today=AAAA-MM-DD` | Totales y atrasadas | 200 |
| POST | `/api/tasks` | Crear | 201 · 400 · 401 |
| GET | `/api/tasks/:id` | Ver una | 200 · 404 |
| PATCH | `/api/tasks/:id` | Editar o completar (al menos un campo) | 200 · 400 · 404 |
| DELETE | `/api/tasks/:id` | Eliminar | 204 · 404 |

### Valores permitidos
- `status`: `all`, `pending`, `completed`
- `priority`: `LOW`, `MEDIUM`, `HIGH`
- `sort`: `created`, `due`, `priority`
- `dueDate`: `AAAA-MM-DD` real, o `null`

### Ejemplos
```bash
# Crear una tarea
curl -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" \
  -b cookies.txt -d '{"title":"Entregar informe","priority":"HIGH","dueDate":"2026-12-01"}'

# Marcarla como completada
curl -X PATCH http://localhost:3000/api/tasks/1 -H "Content-Type: application/json" \
  -b cookies.txt -d '{"completed":true}'
```

## Seguridad de la API
- Sin cookie válida: 401. Una cookie alterada o vencida cuenta como “sin sesión”.
- Un usuario nunca puede leer, editar o borrar tareas de otro: la consulta incluye `user_id` de la sesión, así que responde 404.
- El límite de intentos de login es de 20 cada 15 minutos por IP.
