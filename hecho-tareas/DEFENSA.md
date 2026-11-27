Profesor si lee esto, esto es la defensa de nosotros de cosas que hicimos mientras haciamos la web app y empezamos a pensar preguntas que usted nos haria y hicimos esto 👩‍🦲

Respuestas base: cámbialas por tus palabras y practica explicarlas en voz alta.

**¿Qué hace la aplicación?** Permite registrar, organizar, editar y eliminar tareas, con prioridad y fecha de vencimiento. Cada usuario ve solo las suyas.

**¿Qué tecnologías usaste y por qué?** HTML, CSS y JavaScript en el front porque lo pide el enunciado. Node con Express para la API REST, y PostgreSQL porque es relacional e integra bien con claves foráneas.

**¿Qué es una API REST?** Un conjunto de rutas con verbos HTTP: GET para leer, POST para crear, PATCH para editar, DELETE para borrar. Las respuestas son JSON y usan códigos de estado (200, 201, 400, 401, 404…).

**¿Cómo se relaciona el front con el backend?** El navegador hace peticiones `fetch` a `/api/...`. El servidor responde JSON y el front pinta los datos. El front nunca habla directamente con la base de datos.

**¿Qué es una clave foránea?** Una columna que apunta a la clave primaria de otra tabla. `tasks.user_id` apunta a `users.id`.

**¿Qué relación hay entre usuarios y tareas?** Uno a muchos: un usuario tiene muchas tareas y cada tarea pertenece a un solo usuario. Si se borra el usuario, sus tareas se borran (ON DELETE CASCADE).

**¿Autenticación y autorización, en qué se diferencian?** Autenticación es comprobar quién eres (login con correo y contraseña). Autorización es decidir qué puedes hacer (solo ver y editar tus tareas).

**¿Cómo guardas las contraseñas?** Con bcrypt y 12 rondas de salt. Solo se guarda el hash; no se puede recuperar la contraseña original.

**¿Cómo sabe el servidor quién hace la petición?** Al entrar, el servidor firma un JWT con el id del usuario y lo guarda en una cookie `httpOnly`. Cada petición la envía el navegador, y el servidor verifica la firma.

**¿Por qué la cookie es httpOnly?** Para que JavaScript no pueda leerla. Si un ataque XSS lograra ejecutar código en la página, no podría robar el token.

**¿Qué pasa si alguien modifica el id de la tarea en la URL?** La consulta incluye `user_id` de la sesión. Si la tarea no es del usuario, no se encuentra y el servidor responde 404.

**¿Cómo evitas la inyección SQL?** Todas las consultas usan parámetros (`$1`, `$2`). Lo que escribe el usuario nunca se pega como texto dentro del SQL.

**¿Cómo evitas el XSS?** El front crea los elementos con `textContent`, no con `innerHTML`. Además, Helmet envía una política de contenido (CSP).

**¿Y la fuerza bruta?** El login tiene un límite de 20 intentos cada 15 minutos por IP.

**¿Por qué el mensaje de error del login no dice cuál de los dos datos falló?** Para no revelar qué correos están registrados.

**¿Qué hace la validación con Zod?** Revisa cada dato antes de tocar la base: longitud, formato de correo, fecha real, prioridad permitida. Si algo falla, responde 400 con el detalle.

**¿Cómo funciona el ordenamiento y los filtros?** Los valores se validan contra una lista fija. El orden se elige de una tabla de opciones, nunca se concatena texto del usuario al SQL.

**¿Cómo publicaste la aplicación?** GitHub guarda el código; Render la ejecuta; Neon guarda la base de datos. La variable `DATABASE_URL` y `JWT_SECRET` van en el servicio, no en el código.

**¿Qué limitaciones tiene?** El plan gratuito de Render se duerme tras 15 minutos sin uso. Las tareas no se comparten entre usuarios, y no hay recuperación de contraseña ni subida de archivos.

**¿Qué mejorarías?** Recuperación de contraseña por correo, subida de archivos, compartir tareas, notificaciones de vencimiento y pruebas de extremo a extremo.
