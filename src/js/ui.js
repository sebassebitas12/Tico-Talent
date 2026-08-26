// src/js/ui.js
// Utilidades de interfaz reutilizables: toasts, modal, confirm, loading, navbar dinámica por rol.

import { getUser, logout, getRole, getVisibleModules, getPerfilExtendido } from "./auth.js";
import { initChatbot } from "./chatbot.js";

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
  const rolLabel = (rol === "empleador" || rol === "reclutador") ? "Empleador" : "Candidato";

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
    
    // Contar notificaciones no leidas
    let noLeidas = 0;
    try {
      const raw = localStorage.getItem('tt_notificaciones');
      if (raw) noLeidas = JSON.parse(raw).filter(n => !n.leida).length;
      else noLeidas = 5; // default para nuevos usuarios
    } catch {}

    const notifBadgeHtml = noLeidas > 0 
      ? `<span id="notifBadge" style="background:#dc2626;color:#fff;font-size:0.65rem;font-weight:700;padding:0.15rem 0.4rem;border-radius:10px;min-width:18px;text-align:center;">${noLeidas}</span>`
      : '';

    // Configuración de items según rol
    const items = [
      { id: "explorar",       label: "Inicio",              href: "principal.html",      visible: true },
      { id: "vacantes",       label: "Vacantes",             href: "vacantes.html",        visible: true },
      { id: "postulaciones",  label: rol === "empleador" ? "Pipeline" : "Postulaciones", href: "postulaciones.html", visible: true },
      { id: "candidatos",     label: "Candidatos",           href: "candidatos.html",      visible: (rol === "empleador" || rol === "reclutador") },
      { id: "entrevistas",    label: "Entrevistas",          href: "entrevistas.html",     visible: (rol === "empleador" || rol === "reclutador") },
      { id: "empresas",       label: "Empresas",             href: "empresas.html",        visible: true },
      { id: "tareas",         label: "Tareas",               href: "tareas.html",          visible: (rol === "empleador" || rol === "reclutador") },
      { id: "capacitacion",   label: "Capacitacion",         href: "capacitacion.html",   visible: true },
      { id: "notificaciones", label: "Notificaciones",       href: "notificaciones.html", visible: true, badge: notifBadgeHtml },
      { id: "perfil",         label: "Mi Perfil",            href: "perfil.html",          visible: true }
    ];

    navSection.innerHTML = items
      .filter(item => item.visible)
      .map(item => {
        const isActive = currentPath.endsWith(item.href);
        return `
          <a href="${item.href}" class="nav-link${isActive ? " nav-link--active" : ""}" style="display:flex;justify-content:space-between;align-items:center;">
            <span class="nav-text">${item.label}</span>
            ${item.badge ? item.badge : ""}
          </a>
        `;
      }).join("");
  }

  // Actualizar foto de perfil en sidebar si existe
  const avatar = document.getElementById('userAvatar');
  if (avatar) {
    const user = getUser();
    const photoKey = user ? 'avatar_' + user.id : null;
    const photo = photoKey ? localStorage.getItem(photoKey) : null;
    if (photo) {
      avatar.innerHTML = `<img src="${photo}" alt="Foto perfil" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
    }
  }

  // Widget de encuesta (se inicializa una vez)
  initEncuesta();

  // 4. Conectar Cerrar Sesión
  document.getElementById("btnLogout")?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  // 5. Inicializar Asistente TicoBot AI Flotante
  initChatbot();
}

// ── FOOTER DE APP (PAGINAS AUTENTICADAS) ──────────────────────

export function renderAppFooter() {
  const footer = document.getElementById('mainFooter');
  if (!footer) return;
  footer.innerHTML = `
    <div style="background:var(--secondary-navy,#0f1e3c);color:rgba(255,255,255,0.8);padding:2.5rem 2rem 1.5rem;margin-top:3rem;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:2rem;max-width:1200px;margin:0 auto 2rem;">
        <div>
          <div style="font-size:1.25rem;font-weight:800;color:#fff;margin-bottom:0.75rem;">Tico Talent</div>
          <p style="font-size:0.85rem;line-height:1.6;color:rgba(255,255,255,0.6);">La plataforma de empleo numero uno en Costa Rica. Conectamos talento con oportunidades.</p>
        </div>
        <div>
          <h4 style="font-size:0.85rem;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1rem;">Candidatos</h4>
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            <a href="vacantes.html" style="color:rgba(255,255,255,0.6);font-size:0.85rem;text-decoration:none;">Buscar empleo</a>
            <a href="perfil.html" style="color:rgba(255,255,255,0.6);font-size:0.85rem;text-decoration:none;">Mi Perfil y CV</a>
            <a href="capacitacion.html" style="color:rgba(255,255,255,0.6);font-size:0.85rem;text-decoration:none;">Capacitacion</a>
          </div>
        </div>
        <div>
          <h4 style="font-size:0.85rem;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1rem;">Empresas</h4>
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            <a href="vacantes.html" style="color:rgba(255,255,255,0.6);font-size:0.85rem;text-decoration:none;">Publicar vacante</a>
            <a href="candidatos.html" style="color:rgba(255,255,255,0.6);font-size:0.85rem;text-decoration:none;">Directorio de Candidatos</a>
            <a href="empresas.html" style="color:rgba(255,255,255,0.6);font-size:0.85rem;text-decoration:none;">Empresas Aliadas</a>
          </div>
        </div>
        <div>
          <h4 style="font-size:0.85rem;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1rem;">Contacto</h4>
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            <span style="color:rgba(255,255,255,0.6);font-size:0.85rem;">info@ticotalent.com</span>
            <span style="color:rgba(255,255,255,0.6);font-size:0.85rem;">+506 2222-3333</span>
            <span style="color:rgba(255,255,255,0.6);font-size:0.85rem;">San Jose, Costa Rica</span>
          </div>
        </div>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:1.25rem;text-align:center;font-size:0.8rem;color:rgba(255,255,255,0.4);">© 2026 Tico Talent. Todos los derechos reservados.</div>
    </div>
  `;
}

// ── WIDGET DE ENCUESTA ────────────────────────────────────────

function initEncuesta() {
  // No mostrar si ya fue respondida o descartada
  if (localStorage.getItem('tt_encuesta_respondida')) return;
  // No duplicar
  if (document.getElementById('encuestaWidget')) return;

  // Contar visitas
  const visitas = Number(localStorage.getItem('tt_visitas') || 0) + 1;
  localStorage.setItem('tt_visitas', visitas);

  // Mostrar en 2da visita o tras 25 segundos en primera
  const delay = visitas >= 2 ? 8000 : 25000;

  setTimeout(() => {
    if (localStorage.getItem('tt_encuesta_respondida')) return;
    const widget = document.createElement('div');
    widget.id = 'encuestaWidget';
    widget.innerHTML = `
      <div style="position:fixed;bottom:6rem;left:1.5rem;z-index:9000;width:290px;background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,0.18);border:1px solid #e5e7eb;animation:slideUpFade 0.4s ease;">
        <div style="background:linear-gradient(135deg,#531068 0%,#1e3a8a 100%);color:#fff;padding:1rem 1.25rem;border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:0.85rem;font-weight:700;">Cuéntanos tu opinion</div>
            <div style="font-size:0.75rem;opacity:0.8;">Solo toma 10 segundos</div>
          </div>
          <button id="encuestaCerrar" style="background:rgba(255,255,255,0.15);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;">x</button>
        </div>
        <div style="padding:1.25rem;">
          <p style="font-size:0.88rem;color:#374151;margin:0 0 0.75rem 0;font-weight:500;">Como calificarias TicoTalent?</p>
          <div id="encuestaEstrellas" style="display:flex;gap:0.4rem;margin-bottom:1rem;">
            ${[1,2,3,4,5].map(n => `<button class="encuesta-estrella" data-val="${n}" style="background:none;border:none;font-size:1.75rem;cursor:pointer;color:#d1d5db;transition:color 0.15s;">&#9733;</button>`).join('')}
          </div>
          <textarea id="encuestaComentario" placeholder="Comentario opcional..." style="width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.82rem;resize:none;height:60px;box-sizing:border-box;font-family:inherit;"></textarea>
          <button id="encuestaEnviar" style="width:100%;background:#531068;color:#fff;border:none;border-radius:8px;padding:0.6rem;font-weight:700;font-size:0.85rem;cursor:pointer;margin-top:0.75rem;">Enviar opinion</button>
        </div>
      </div>
    `;
    document.body.appendChild(widget);

    let calificacion = 0;
    widget.querySelectorAll('.encuesta-estrella').forEach(btn => {
      btn.addEventListener('mouseover', () => {
        const val = Number(btn.dataset.val);
        widget.querySelectorAll('.encuesta-estrella').forEach((b, i) => {
          b.style.color = i < val ? '#f59e0b' : '#d1d5db';
        });
      });
      btn.addEventListener('click', () => {
        calificacion = Number(btn.dataset.val);
        widget.querySelectorAll('.encuesta-estrella').forEach((b, i) => {
          b.style.color = i < calificacion ? '#f59e0b' : '#d1d5db';
        });
      });
    });
    widget.querySelector('#encuestaWidget')?.addEventListener('mouseleave', () => {
      widget.querySelectorAll('.encuesta-estrella').forEach((b, i) => {
        b.style.color = i < calificacion ? '#f59e0b' : '#d1d5db';
      });
    });

    document.getElementById('encuestaCerrar')?.addEventListener('click', () => {
      widget.remove();
      localStorage.setItem('tt_encuesta_respondida', 'descartada');
    });

    document.getElementById('encuestaEnviar')?.addEventListener('click', () => {
      if (calificacion === 0) {
        mostrarToast('Selecciona una calificacion de 1 a 5 estrellas', 'warning');
        return;
      }
      localStorage.setItem('tt_encuesta_respondida', JSON.stringify({ calificacion, comentario: document.getElementById('encuestaComentario')?.value || '', fecha: new Date().toISOString() }));
      widget.remove();
      mostrarToast('Gracias por tu opinion! Tu retroalimentacion nos ayuda a mejorar.', 'success', 4000);
    });
  }, delay);
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
