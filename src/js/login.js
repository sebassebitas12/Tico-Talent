// src/js/login.js
// Controlador de la página login.html
// Conecta el formulario con auth.js

import { login, isAuthenticated } from "./auth.js";

// Si ya está autenticado, redirigir al panel
if (isAuthenticated()) {
  window.location.href = "/src/html/principal.html";
}

const form       = document.getElementById("loginForm");
const inputUser  = document.getElementById("loginEmail");
const inputPass  = document.getElementById("loginPassword");
const errorBox   = document.getElementById("loginError");
const btnLogin   = document.getElementById("btnLogin");
const btnText    = btnLogin.querySelector(".btn__text");
const spinner    = btnLogin.querySelector(".login__spinner");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setLoading(true);
  hideError();

  const username = inputUser.value.trim();
  const password = inputPass.value.trim();

  try {
    await login(username, password);
    // Redirigir al panel principal
    window.location.href = "/src/html/principal.html";
  } catch (error) {
    showError(error.message || "Usuario o contraseña incorrectos.");
  } finally {
    setLoading(false);
  }
});

function setLoading(loading) {
  btnLogin.disabled = loading;
  btnText.classList.toggle("d-none", loading);
  spinner.classList.toggle("d-none", !loading);
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("d-none");
}

function hideError() {
  errorBox.textContent = "";
  errorBox.classList.add("d-none");
}