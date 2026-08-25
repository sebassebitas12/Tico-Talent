// src/js/ui.js
// Utilidades de interfaz reutilizables: toasts, modal, confirm, loading.
// RF-09

// ── TOASTS ────────────────────────────────────────────────────

/**
 * Muestra un toast de retroalimentación.
 * @param {string} mensaje
 * @param {'success'|'error'|'info'|'warning'} tipo
 * @param {number} duracion  ms
 */
export function mostrarToast(mensaje, tipo = "success", duracion = 3000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${tipo}`;

  const iconos = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };
  toast.innerHTML = `
    <span class="toast__icon">${iconos[tipo] ?? "📢"}</span>
    <span class="toast__msg">${mensaje}</span>
    <button class="toast__close">✕</button>
  `;

  container.appendChild(toast);

  // Animar entrada
  requestAnimationFrame(() => toast.classList.add("toast--visible"));

  // Cerrar al hacer clic en ✕
  toast.querySelector(".toast__close").addEventListener("click", () => cerrarToast(toast));

  // Auto-cerrar
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

// ── MODAL GENÉRICO ────────────────────────────────────────────

/**
 * Abre el modal con título y contenido HTML.
 * @param {string} titulo
 * @param {string} htmlBody   innerHTML del cuerpo del modal
 * @param {Function} onGuardar   callback al presionar "Guardar"
 */
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

/**
 * Muestra el diálogo de confirmación.
 * @param {string} mensaje
 * @param {Function} onConfirmar
 */
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