# Diseño de la aplicación

## Arquitectura
```
Navegador (HTML/CSS/JS)  ──fetch JSON + cookie──►  Express (API REST + páginas)
                                                    │
                                                    ├─ middleware: sesión, errores, cabeceras
                                                    ├─ validación: Zod
                                                    ├─ modelos: consultas SQL parametrizadas
                                                    ▼
                                                 PostgreSQL
```
El front no conoce la base de datos: solo llama a la API. El servidor es el único que decide qué puede hacer cada usuario.

## Modelo de datos (ER)
```
users (id, name, email UNIQUE, password_hash, created_at)
   1 ─────< N
tasks (id, user_id → users.id ON DELETE CASCADE, title, description,
       priority CHECK IN (LOW, MEDIUM, HIGH), due_date DATE, completed,
       created_at, updated_at)
```
- Índices `(user_id, completed)` y `(user_id, due_date)`, porque casi todas las consultas filtran por dueño y estado o fecha.
- Borrar un usuario borra sus tareas (cascada).

## Flujo de una petición
1. El navegador envía la petición con la cookie `token`.
2. `requireAuth` verifica la firma del JWT y obtiene `userId`.
3. Zod valida el cuerpo y los parámetros.
4. El modelo ejecuta la consulta con `user_id = $n`.
5. Se responde JSON, o el error con su código HTTP.

## Decisiones y por qué
| Decisión | Motivo |
|---|---|
| Front en HTML/CSS/JS puro | Lo pide el enunciado; sin compilación ni frameworks |
| Express | Simple, muy usado y fácil de explicar |
| PostgreSQL | Relacional, con claves foráneas e integridad garantizada |
| JWT en cookie httpOnly | JavaScript no puede leer el token (protege contra XSS) y el navegador lo envía solo |
| `sameSite=lax` | Reduce ataques CSRF |
| bcrypt, 12 rondas | Contraseñas no recuperables si se filtra la base |
| Zod en el servidor | El cliente se puede saltar; el servidor siempre valida |
| Respuesta igual si falla el correo o la contraseña | No revela qué correos existen |
| Límite de intentos | Frena la fuerza bruta |
| Helmet | Cabeceras de seguridad (CSP, nosniff, HSTS) |
| Texto con `textContent` en el front | Lo que escribe el usuario nunca se interpreta como HTML (evita XSS) |
| Fechas como texto `AAAA-MM-DD` | Evita que la zona horaria mueva un día la fecha |

## Riesgos y mitigación
| Riesgo | Mitigación |
|---|---|
| Inyección SQL | Parámetros `$n` en todas las consultas; nombres de columna fijos |
| XSS | `textContent` en el front; CSP de Helmet |
| Acceso a datos ajenos (IDOR) | `user_id` de la sesión en cada consulta |
| Fuerza bruta al login | `express-rate-limit` |
| Robo de sesión | Cookie `httpOnly` y `secure` en producción |
| Secretos en el código | Variables de entorno; `.env` fuera de Git |
| Datos maliciosos | Zod, límite de tamaño de cuerpo (10 KB) |
| Filtración de errores internos | Errores genéricos al cliente; detalle solo en el log |
