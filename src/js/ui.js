// src/js/ui.js
// Utilidades de interfaz reutilizables: toasts, modal, confirm, loading, navbar dinámica por rol.

import { getUser, logout, getRole, getVisibleModules, getPerfilExtendido } from "./auth.js";

// ── SEGURIDAD ──────────────────────────────────────────────────

export function escapeHTML(str) {
  if (str == null) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

// ── INIT NAVBAR DINÁMICA POR ROL ──────────────────────────────

/**
 * Inicializa la barra de navegación horizontal superior:
 * - Adapta el nombre, rol y avatar del usuario activo.
 * - Muestra u oculta enlaces según el rol (Candidato vs Empleador).
 * - Agrega el enlace a "Mi Perfil".
 * - Conecta el evento de cerrar sesión.
 */
export function initUserNav() {
  const user = getUser();
  const perfil = getPerfilExtendido();
  const rol = getRole();

  // 1. Datos de usuario en la barra
  const nameEl = document.getElementById("userName");
  const roleEl = document.getElementById("userRole");
  const avatarEl = document.getElementById("userAvatar");

  const displayName = perfil.nombre || (user ? `${user.firstName} ${user.lastName}` : "Usuario");
  const rolLabel = (rol === "empleador" || rol === "reclutador") ? "🏢 Empleador" : "👤 Candidato";

  if (nameEl) nameEl.textContent = displayName;
  if (roleEl) roleEl.textContent = rolLabel;
  if (avatarEl) {
    avatarEl.textContent = displayName.charAt(0).toUpperCase();
    avatarEl.title = `${displayName} (${rolLabel})`;
  }

  // 2. Conectar click en avatar / user card para ir a perfil
  document.querySelector(".sidebar__user-card")?.addEventListener("click", () => {
    window.location.href = "perfil.html";
  });

  // 3. Ajustar visibilidad de enlaces en el nav según rol
  const navSection = document.querySelector(".sidebar__nav-section");
  if (navSection) {
    const currentPath = window.location.pathname;
    
    // Configuración de items según rol
    const items = [
      { id: "explorar", label: "Inicio", href: "principal.html", visible: true },
      { id: "vacantes", label: "Vacantes", href: "vacantes.html", visible: true },
      { id: "postulaciones", label: rol === "empleador" ? "Pipeline Postulaciones" : "Mis Postulaciones", href: "postulaciones.html", visible: true },
      { id: "candidatos", label: "Candidatos", href: "candidatos.html", visible: (rol === "empleador" || rol === "reclutador") },
      { id: "entrevistas", label: "Entrevistas", href: "entrevistas.html", visible: (rol === "empleador" || rol === "reclutador") },
      { id: "empresas", label: "Empresas", href: "empresas.html", visible: true },
      { id: "tareas", label: "Tareas", href: "tareas.html", visible: (rol === "empleador" || rol === "reclutador") },
      { id: "perfil", label: "Mi Perfil", href: "perfil.html", visible: true }
    ];

    navSection.innerHTML = items
      .filter(item => item.visible)
      .map(item => {
        const isActive = currentPath.endsWith(item.href);
        return `
          <a href="${item.href}" class="nav-link${isActive ? " nav-link--active" : ""}">
            <span class="nav-text">${item.label}</span>
            ${item.badge ? `<span class="nav-badge" style="background: var(--surface-subtle); color: var(--text-main); font-size: 0.75rem;">${item.badge}</span>` : ""}
          </a>
        `;
      }).join("");
  }

  // 4. Conectar Cerrar Sesión
  document.getElementById("btnLogout")?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}

// ── TOASTS ────────────────────────────────────────────────────

export function mostrarToast(mensaje, tipo = "success", duracion = 3200) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast--${tipo}`;

  const iconos = { success: "✓", error: "✕", info: "ℹ", warning: "⚠" };
  toast.innerHTML = `
    <span class="toast__icon">${iconos[tipo] ?? "ℹ"}</span>
    <span class="toast__msg">${escapeHTML(mensaje)}</span>
    <button class="toast__close" aria-label="Cerrar">✕</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("toast--visible"));
  
  toast.querySelector(".toast__close").addEventListener("click", () => cerrarToast(toast));
  setTimeout(() => cerrarToast(toast), duracion);
}

function cerrarToast(toast) {
  toast.classList.remove("toast--visible");
  setTimeout(() => toast.remove(), 300);
}

// ── LOADING ───────────────────────────────────────────────────

export function mostrarLoading() {
  document.getElementById("loadingSpinner")?.classList.remove("d-none");
}

export function ocultarLoading() {
  document.getElementById("loadingSpinner")?.classList.add("d-none");
}

// ── MODAL GENÉRICO ────────────────────────────────────────────

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

  if (!overlay) {
    if (confirm(mensaje)) onConfirmar();
    return;
  }

  msgEl.textContent = mensaje;
  overlay.classList.remove("d-none");

  const cerrar = () => overlay.classList.add("d-none");

  btnNo.onclick = cerrar;
  btnSi.onclick = () => {
    cerrar();
    if (onConfirmar) onConfirmar();
  };
}
