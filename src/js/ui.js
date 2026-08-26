// src/js/ui.js
// Utilidades de interfaz reutilizables: toasts, modal, confirm, loading, navbar dinamica.

import { getUser, logout, getRole, getVisibleModules, getRoleLabel } from "./auth.js";

// ── SEGURIDAD ──────────────────────────────────────────────────

export function escapeHTML(str) {
  if (str == null) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

// ── NAVBAR DINAMICA POR ROL ───────────────────────────────────

const NAV_ITEMS = [
  { id: "vacantes",      label: "Vacantes",              href: "vacantes.html" },
  { id: "candidatos",    label: "Candidatos",            href: "candidatos.html" },
  { id: "empresas",      label: "Empresas",              href: "empresas.html" },
  { id: "postulaciones", label: "Mis Postulaciones",      href: "postulaciones.html" },
  { id: "entrevistas",   label: "Entrevistas",            href: "entrevistas.html" },
  { id: "tareas",        label: "Tareas",                 href: "tareas.html" }
];

/**
 * Renderiza la navbar horizontal superior con los modulos visibles segun el rol.
 * @param {string} activePage - id del modulo activo actual (ej: "vacantes")
 */
export function renderNavbar(activePage) {
  const navbar = document.getElementById("appNavbar");
  if (!navbar) return;

  const user = getUser();
  const visibleModules = getVisibleModules();
  const initials = user ? (user.firstName?.charAt(0) || "U") : "U";
  const fullName = user ? `${user.firstName} ${user.lastName}` : "Usuario";
  const rolLabel = getRoleLabel();

  const navLinks = NAV_ITEMS
    .filter(item => visibleModules.includes(item.id))
    .map(item => {
      const isActive = item.id === activePage;
      return `<a href="${item.href}" class="nav-link${isActive ? " nav-link--active" : ""}"><span class="nav-text">${item.label}</span></a>`;
    }).join("");

  navbar.innerHTML = `
    <div class="navbar__brand">
      <a href="principal.html" class="navbar__logo">Tico Talent</a>
    </div>
    <nav class="navbar__nav" id="navbarNav">
      <a href="principal.html" class="nav-link${activePage === "principal" ? " nav-link--active" : ""}">
        <span class="nav-text">Inicio</span>
      </a>
      ${navLinks}
    </nav>
    <div class="navbar__user">
      <div class="navbar__user-card">
        <div class="navbar__user-avatar">${initials}</div>
        <div class="navbar__user-info">
          <span class="navbar__user-name">${escapeHTML(fullName)}</span>
          <span class="navbar__user-role">${rolLabel}</span>
        </div>
      </div>
      <a href="/login.html" class="navbar__logout" id="btnLogout">Cerrar Sesion</a>
    </div>
  `;

  document.getElementById("btnLogout")?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}

// ── INIT NAVBAR (usuario + logout) ─────────────────────────────

/**
 * Inicializa la navbar: setea nombre, rol, avatar del usuario y conecta logout.
 */
export function initUserNav() {
  const user = getUser();
  if (user) {
    const nameEl = document.getElementById("userName");
    const roleEl = document.getElementById("userRole");
    const avatarEl = document.getElementById("userAvatar");
    if (nameEl) nameEl.textContent = `${user.firstName} ${user.lastName}`;
    if (roleEl) roleEl.textContent = user.email;
    if (avatarEl) avatarEl.textContent = user.firstName.charAt(0).toUpperCase();
  }
  document.getElementById("btnLogout")?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}

// ── TOASTS ────────────────────────────────────────────────────

export function mostrarToast(mensaje, tipo = "success", duracion = 3000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${tipo}`;

  const iconos = { success: "OK", error: "X", info: "i", warning: "!" };
  toast.innerHTML = `
    <span class="toast__icon">${iconos[tipo] ?? "?"}</span>
    <span class="toast__msg">${mensaje}</span>
    <button class="toast__close">X</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("toast--visible"));
  toast.querySelector(".toast__close").addEventListener("click", () => cerrarToast(toast));
  setTimeout(() => cerrarToast(toast), duracion);
}

function cerrarToast(toast) {
  toast.classList.remove("toast--visible");
  toast.addEventListener("transitionend", () => toast.remove(), { once: true });
}

// ── LOADING ───────────────────────────────────────────────────

export function mostrarLoading() {
  document.getElementById("loadingSpinner")?.classList.remove("d-none");
}

export function ocultarLoading() {
  document.getElementById("loadingSpinner")?.classList.add("d-none");
}

// ── MODAL GENERICO ────────────────────────────────────────────

export function abrirModal(titulo, htmlBody, onGuardar) {
  const overlay   = document.getElementById("modalOverlay");
  const titleEl   = document.getElementById("modalTitle");
  const bodyEl    = document.getElementById("modalBody");
  const btnSave   = document.getElementById("btnFormSubmit");
  const btnCancel = document.getElementById("btnFormCancel");
  const btnClose  = document.getElementById("modalClose");

  if (!overlay) return;

  titleEl.textContent = titulo;
  bodyEl.innerHTML    = htmlBody;
  overlay.classList.remove("d-none");

  const cerrar = () => overlay.classList.add("d-none");

  btnClose.onclick  = cerrar;
  btnCancel.onclick = cerrar;
  overlay.onclick   = (e) => { if (e.target === overlay) cerrar(); };

  btnSave.onclick = () => {
    if (onGuardar) onGuardar();
  };
}

export function cerrarModal() {
  document.getElementById("modalOverlay")?.classList.add("d-none");
}

// ── CONFIRM ───────────────────────────────────────────────────

export function confirmar(mensaje, onConfirmar) {
  const overlay   = document.getElementById("confirmOverlay");
  const msgEl     = document.getElementById("confirmMessage");
  const btnSi     = document.getElementById("btnConfirmYes");
  const btnNo     = document.getElementById("btnConfirmNo");

  if (!overlay) return;

  msgEl.textContent = mensaje;
  overlay.classList.remove("d-none");

  const cerrar = () => overlay.classList.add("d-none");

  btnNo.onclick = cerrar;
  btnSi.onclick = () => {
    cerrar();
    if (onConfirmar) onConfirmar();
  };
}
