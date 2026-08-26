import { login, isAuthenticated, register, forgotPassword } from "./auth.js";
import { mostrarToast } from "./ui.js";

if (isAuthenticated()) {
  window.location.href = "/src/html/principal.html";
}

const form = document.getElementById("loginForm");
const inputUser = document.getElementById("loginUser");
const inputPass = document.getElementById("loginPassword");
const errorBox = document.getElementById("loginError");
const btnLogin = document.getElementById("btnLogin");
const loader = document.getElementById("loginLoader");

const DEMO_CREDS = {
  empresa:     { username: "carlos",  password: "carlos123" },
  solicitante: { username: "maria",   password: "maria123" }
};

document.querySelectorAll(".login__demo-user").forEach(demo => {
  demo.addEventListener("click", () => {
    const role = demo.dataset.role;
    const creds = DEMO_CREDS[role];
    inputUser.value = creds.username;
    inputPass.value = creds.password;
    hideError();
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();
  const username = inputUser.value.trim();
  const password = inputPass.value.trim();
  if (!username || !password) {
    showError("Por favor completa todos los campos.");
    return;
  }
  setLoading(true);
  try {
    await login(username, password);
    window.location.href = "/src/html/principal.html";
  } catch (error) {
    showError(error.message || "Usuario o contrasena incorrectos.");
  } finally {
    setLoading(false);
  }
});

function setLoading(loading) {
  btnLogin.classList.toggle("d-none", loading);
  loader.classList.toggle("d-none", !loading);
  btnLogin.disabled = loading;
  inputUser.disabled = loading;
  inputPass.disabled = loading;
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("d-none");
}

function hideError() {
  errorBox.textContent = "";
  errorBox.classList.add("d-none");
}

const forgotModal = document.getElementById("forgotModal");
const registerModal = document.getElementById("registerModal");

document.getElementById("forgotPasswordLink").addEventListener("click", (e) => {
  e.preventDefault();
  forgotModal.classList.remove("d-none");
});

document.getElementById("registerLink").addEventListener("click", (e) => {
  e.preventDefault();
  registerModal.classList.remove("d-none");
});

document.getElementById("closeForgotModal").addEventListener("click", () => {
  forgotModal.classList.add("d-none");
});

document.getElementById("closeRegisterModal").addEventListener("click", () => {
  registerModal.classList.add("d-none");
});

forgotModal.addEventListener("click", (e) => {
  if (e.target === forgotModal) forgotModal.classList.add("d-none");
});

registerModal.addEventListener("click", (e) => {
  if (e.target === registerModal) registerModal.classList.add("d-none");
});

document.getElementById("forgotForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("forgotEmail").value.trim();
  if (!email) return;
  try {
    await forgotPassword(email);
    mostrarToast("Se enviaron las instrucciones de recuperacion a tu correo");
    forgotModal.classList.add("d-none");
    document.getElementById("forgotForm").reset();
  } catch (err) {
    mostrarToast(err.message, "error");
  }
});

document.querySelectorAll("[data-reg-role]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-reg-role]").forEach(b => b.classList.remove("role-card--active"));
    btn.classList.add("role-card--active");
    document.getElementById("regRole").value = btn.dataset.regRole;
  });
});

document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const username = document.getElementById("regUser").value.trim();
  const password = document.getElementById("regPass").value.trim();
  const rol = document.getElementById("regRole").value;
  if (!name || !email || !username || !password) {
    mostrarToast("Completa todos los campos", "error");
    return;
  }
  if (password.length < 6) {
    mostrarToast("La contrasena debe tener al menos 6 caracteres", "error");
    return;
  }
  if (rol === "empresa" && !email.endsWith("@ticotalent.com")) {
    mostrarToast("El correo de la empresa debe ser @ticotalent.com", "error");
    return;
  }
  if (rol === "solicitante" && email.endsWith("@ticotalent.com")) {
    mostrarToast("El correo del solicitante debe ser un correo personal", "error");
    return;
  }
  try {
    register({ name, email, username, password, rol });
    mostrarToast("Cuenta creada exitosamente. Ya puedes iniciar sesion.");
    registerModal.classList.add("d-none");
    document.getElementById("registerForm").reset();
    inputUser.value = username;
    inputPass.value = "";
    inputPass.focus();
  } catch (err) {
    mostrarToast(err.message, "error");
  }
});
