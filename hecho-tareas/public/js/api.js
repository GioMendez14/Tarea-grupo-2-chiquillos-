// Pequeño cliente para hablar con la API REST usando fetch.
// Todas las peticiones envían la cookie de sesión automáticamente (mismo origen).

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });

  // Sesión vencida o inexistente: se manda al login (menos en login/registro, que muestran su propio error)
  if (res.status === 401 && !url.startsWith("/api/auth/login") && !url.startsWith("/api/auth/register")) {
    window.location.href = "/login";
    throw new ApiError("Tu sesión terminó. Inicia sesión de nuevo.", 401);
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.details?.[0] ?? data.error ?? "Ocurrió un error", res.status);
  return data;
}

export const api = {
  get: (url) => request("GET", url),
  post: (url, body) => request("POST", url, body ?? {}),
  patch: (url, body) => request("PATCH", url, body),
  delete: (url) => request("DELETE", url),
};
