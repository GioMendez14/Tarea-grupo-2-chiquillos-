# Despliegue en la nube

Hay que publicar **dos cosas**: la base de datos y la aplicación.

## 1. Base de datos (Neon)
1. Crea una cuenta en neon.tech y un proyecto.
2. Copia la *connection string* (empieza con `postgresql://` y termina en `?sslmode=require`).

## 2. Código en GitHub
1. Crea un repositorio nuevo.
2. Sube el proyecto con `package.json` **en la raíz** (no dentro de una carpeta). No subas `.env` ni `node_modules`; ya están en `.gitignore`.

## 3. Aplicación (Render, plan gratuito, sin tarjeta)
1. Entra a render.com con tu cuenta de GitHub.
2. **New → Web Service** y elige el repositorio.
3. Configura:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** Free
4. En **Environment**, agrega:
   - `DATABASE_URL`: la connection string de Neon.
   - `JWT_SECRET`: un texto largo y aleatorio.
5. **Create Web Service**. Cuando termine, Render te da una dirección `https://…onrender.com`.

## 4. Crear las tablas (una sola vez)
Desde tu computadora o un Codespace, con la URL de Neon:
```bash
npm install
DATABASE_URL="postgresql://…" JWT_SECRET="…al menos 16 caracteres…" npm run db:init
DATABASE_URL="postgresql://…" JWT_SECRET="…" npm run db:seed    # opcional
```

## Notas importantes
- **Plan gratuito de Render:** la app se "duerme" tras 15 minutos sin uso; la primera carga tarda cerca de un minuto. Para la presentación, abre el link unos minutos antes.
- **Heroku** ya no tiene plan gratuito. Si tu profesor pide Heroku o AWS, confírmalo con él: el proyecto ya incluye `Procfile` y funciona igual.
- **Neon:** la base gratuita es suficiente para el proyecto. Revisa que el proyecto no se suspenda por inactividad.

## Revisar que todo funciona
1. Abre la dirección pública y crea una cuenta.
2. Crea, edita, completa y elimina una tarea.
3. Cierra sesión y vuelve a entrar.
4. Intenta abrir `/tasks` sin sesión: debe mandarte al login.
