// Formularios de login y registro
import { api } from "/js/api.js";

const form = document.getElementById("authForm");
const errorBox = document.getElementById("formError");
const mode = document.body.dataset.mode; // "login" o "register"

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorBox.hidden = true;

  // Valida con las reglas HTML (required, minlength, type=email)
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const button = form.querySelector("button[type=submit]");
  button.disabled = true;

  try {
    const data = Object.fromEntries(new FormData(form));
    await api.post(mode === "register" ? "/api/auth/register" : "/api/auth/login", data);
    window.location.href = "/tasks";
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.hidden = false;
    button.disabled = false;
  }
});
