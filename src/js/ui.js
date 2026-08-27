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
    } catch { }

    const notifBadgeHtml = noLeidas > 0
      ? `<span id="notifBadge" style="background:#dc2626;color:#fff;font-size:0.65rem;font-weight:700;padding:0.15rem 0.4rem;border-radius:10px;min-width:18px;text-align:center;">${noLeidas}</span>`
      : '';

    // Navegación principal: se mantiene "Desarrollo Profesional" como
    // opción independiente y no se repite dentro de Recursos.
    const esEmpresa = rol === "empleador" || rol === "reclutador";
    const servicios = esEmpresa
      ? [
        { label: "Gestionar vacantes", href: "vacantes.html", visible: true },
        { label: "Gestionar postulantes", href: "postulaciones.html", visible: true },
        { label: "Buscar candidatos", href: "candidatos.html", visible: true },
        { label: "Empresas", href: "empresas.html", visible: true },
        { label: "Entrevistas", href: "entrevistas.html", visible: true }
      ]
      : [
        { label: "Buscar empleo", href: "vacantes.html", visible: true },
        { label: "Mis postulaciones", href: "postulaciones.html", visible: true },
        { label: "Empresas", href: "empresas.html", visible: true }
      ];

    const recursos = [
      { label: "Mi perfil y CV", href: "perfil.html", visible: true },
      { label: "Entrevistas", href: "entrevistas.html", visible: (rol === "empleador" || rol === "reclutador") },
      { label: "Tareas", href: "tareas.html", visible: (rol === "empleador" || rol === "reclutador") },
      { label: "Notificaciones", href: "notificaciones.html", visible: false, badge: notifBadgeHtml }
    ];

    const menuHTML = (items) => items
      .filter(item => item.visible)
      .map(item => {
        const isActive = currentPath.endsWith(item.href);
        return `
          <a href="${item.href}" class="nav-dropdown__item${isActive ? " is-active" : ""}">
            <span>${item.label}</span>
            ${item.badge ? item.badge : ""}
          </a>
        `;
      }).join("");

    const serviciosActivo = servicios.some(item => item.visible && currentPath.endsWith(item.href));
    const recursosActivo = recursos.some(item => item.visible && currentPath.endsWith(item.href));

    navSection.innerHTML = `
      <a href="principal.html" class="nav-link${currentPath.endsWith("principal.html") ? " nav-link--active" : ""}">
        <span class="nav-text">Inicio</span>
      </a>

      <div class="nav-dropdown">
        <button type="button" class="nav-link nav-dropdown__trigger${serviciosActivo ? " nav-link--active" : ""}" aria-expanded="false">
          <span class="nav-text">Servicios</span>
          <svg class="nav-dropdown__chevron" width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="nav-dropdown__menu">
          ${menuHTML(servicios)}
        </div>
      </div>

      <a href="desarrollo-profesional.html" class="nav-link${currentPath.endsWith("desarrollo-profesional.html") ? " nav-link--active" : ""}">
        <span class="nav-text">Desarrollo Profesional</span>
      </a>

      <div class="nav-dropdown">
        <button type="button" class="nav-link nav-dropdown__trigger${recursosActivo ? " nav-link--active" : ""}" aria-expanded="false">
          <span class="nav-text">Recursos</span>
          <svg class="nav-dropdown__chevron" width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="nav-dropdown__menu">
          ${menuHTML(recursos)}
        </div>
      </div>

      <button type="button" class="nav-link nav-link--help" id="navOpenTicobot">
        <span class="nav-text">Ayuda</span>
      </button>
    `;

    navSection.querySelectorAll(".nav-dropdown").forEach(dropdown => {
      const trigger = dropdown.querySelector(".nav-dropdown__trigger");
      if (!trigger) return;

      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const wasOpen = dropdown.classList.contains("is-open");

        navSection.querySelectorAll(".nav-dropdown.is-open").forEach(openDropdown => {
          openDropdown.classList.remove("is-open");
          openDropdown.querySelector(".nav-dropdown__trigger")?.setAttribute("aria-expanded", "false");
        });

        if (!wasOpen) {
          dropdown.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        }
      });

      trigger.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        trigger.click();
      });
    });

    if (!window.__ticoTalentNavOutsideClick) {
      window.__ticoTalentNavOutsideClick = true;
      document.addEventListener("click", (event) => {
        if (!navSection.contains(event.target)) {
          navSection.querySelectorAll(".nav-dropdown.is-open").forEach(dropdown => {
            dropdown.classList.remove("is-open");
            dropdown.querySelector(".nav-dropdown__trigger")?.setAttribute("aria-expanded", "false");
          });
        }
      });
    }

    navSection.querySelector("#navOpenTicobot")?.addEventListener("click", () => {
      document.getElementById("ticobotToggle")?.click();
    });
  }

  // ── CAMPANITA DE NOTIFICACIONES ──────────────────────────────
  // El botón vive en el header, pero el panel vive SIEMPRE como hijo directo
  // de <body>. Esto evita recortes por overflow y stacking contexts.
  const sidebarFooter = document.querySelector('.sidebar__footer');
  if (sidebarFooter && !document.getElementById('notifDropdownBtn')) {
    const NOTIF_BASE_DATA = [
      { id: 1, tipo: 'vacante', titulo: 'Nueva vacante compatible con tu perfil', detalle: 'Intel Costa Rica busca un Desarrollador Full Stack Senior.', tiempo: 'Hace 5 min', leida: false },
      { id: 2, tipo: 'postulacion', titulo: 'Tu postulación fue revisada', detalle: 'Tu proceso avanzó a la siguiente etapa.', tiempo: 'Hace 23 min', leida: false },
      { id: 3, tipo: 'capacitacion', titulo: 'Nuevo recurso disponible', detalle: 'Hay un nuevo curso disponible para tu desarrollo profesional.', tiempo: 'Hace 1 hora', leida: false },
      { id: 4, tipo: 'sistema', titulo: 'Actualización de Tico Talent', detalle: 'Hemos mejorado la plataforma.', tiempo: 'Hace 2 horas', leida: false }
    ];

    const getNotifs = () => {
      try {
        const raw = localStorage.getItem('tt_notificaciones');
        if (raw) {
          const data = JSON.parse(raw);
          if (Array.isArray(data) && data.length) return data;
        }
      } catch { }
      localStorage.setItem('tt_notificaciones', JSON.stringify(NOTIF_BASE_DATA));
      return [...NOTIF_BASE_DATA];
    };
    const saveNotifs = (list) => localStorage.setItem('tt_notificaciones', JSON.stringify(list));

    const notifWrapper = document.createElement('div');
    notifWrapper.id = 'notifWrapper';
    notifWrapper.style.cssText = 'display:inline-flex;align-items:center;';
    sidebarFooter.insertBefore(notifWrapper, sidebarFooter.querySelector('.sidebar__logout'));

    // Capa global: no depende de ningún contenedor del navbar.
    const portal = document.createElement('div');
    portal.id = 'notifPortal';
    portal.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:2147483647',
      'pointer-events:none',
      'display:none'
    ].join(';');
    document.body.appendChild(portal);

    const iconFor = (tipo) => ({
      vacante: '💼', postulacion: '📄', capacitacion: '🎓', sistema: '🔔'
    }[tipo] || '🔔');

    let open = false;

    function renderButton() {
      const unread = getNotifs().filter(n => !n.leida).length;
      notifWrapper.innerHTML = `
        <button id="notifDropdownBtn" type="button" title="Notificaciones" aria-label="Notificaciones" aria-expanded="${open}"
          style="position:relative;background:none;border:0;cursor:pointer;padding:.5rem;color:var(--text-main,#0f1e3c);display:flex;align-items:center;justify-content:center;border-radius:50%;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          ${unread ? `<span style="position:absolute;top:1px;right:1px;min-width:18px;height:18px;padding:0 4px;border-radius:10px;background:#dc2626;color:#fff;border:2px solid #fff;font-size:.65rem;font-weight:700;display:grid;place-items:center;">${unread}</span>` : ''}
        </button>`;
      notifWrapper.querySelector('#notifDropdownBtn')?.addEventListener('click', (event) => {
        event.stopPropagation();
        open ? closeDropdown() : openDropdown();
      });
    }

    function renderPortal() {
      const list = getNotifs();
      const unread = list.filter(n => !n.leida).length;
      portal.innerHTML = `
        <div id="notifDropdown" role="dialog" aria-label="Notificaciones"
          style="pointer-events:auto;position:absolute;width:min(360px,calc(100vw - 24px));max-height:min(460px,calc(100vh - 24px));background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 22px 60px rgba(15,23,42,.28);overflow:hidden;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:.9rem 1rem;border-bottom:1px solid #e5e7eb;">
            <strong style="color:#0f1e3c;font-size:.95rem;">🔔 Notificaciones${unread ? ` <span style="display:inline-grid;place-items:center;min-width:20px;height:20px;border-radius:10px;background:#531068;color:#fff;font-size:.7rem;">${unread}</span>` : ''}</strong>
            <button id="notifMarkAll" type="button" style="border:0;background:transparent;color:#531068;font-weight:700;font-size:.75rem;cursor:pointer;">Marcar leídas</button>
          </div>
          <div style="max-height:340px;overflow:auto;">
            ${list.map(n => `<button class="notif-item-global" data-id="${n.id}" type="button" style="width:100%;text-align:left;border:0;border-bottom:1px solid #f1f5f9;padding:.8rem 1rem;display:flex;gap:.75rem;background:${n.leida ? '#fff' : 'rgba(83,16,104,.045)'};cursor:pointer;">
              <span style="font-size:1.1rem;">${iconFor(n.tipo)}</span>
              <span style="min-width:0;flex:1;"><strong style="display:block;font-size:.82rem;color:#111827;margin-bottom:.15rem;">${escapeHTML(n.titulo)}</strong><span style="display:block;font-size:.75rem;color:#64748b;line-height:1.35;">${escapeHTML(n.detalle || '')}</span><small style="display:block;margin-top:.25rem;color:#94a3b8;">${escapeHTML(n.tiempo)}</small></span>
              ${!n.leida ? '<span style="width:7px;height:7px;border-radius:50%;background:#d4006e;margin-top:6px;"></span>' : ''}
            </button>`).join('') || '<p style="padding:1.5rem;text-align:center;color:#64748b;">No tienes notificaciones.</p>'}
          </div>
          <div style="padding:.7rem;text-align:center;background:#f8fafc;"><a href="notificaciones.html" style="color:#531068;font-size:.82rem;font-weight:700;text-decoration:none;">Ver todas las notificaciones →</a></div>
        </div>`;

      portal.querySelector('#notifMarkAll')?.addEventListener('click', () => {
        saveNotifs(getNotifs().map(n => ({ ...n, leida: true })));
        renderPortal();
        positionDropdown();
        renderButton();
      });
      portal.querySelectorAll('.notif-item-global').forEach(item => item.addEventListener('click', () => {
        const id = Number(item.dataset.id);
        const updated = getNotifs().map(n => n.id === id ? { ...n, leida: true } : n);
        saveNotifs(updated);
        renderPortal();
        positionDropdown();
        renderButton();
      }));
    }

    function positionDropdown() {
      const btn = notifWrapper.querySelector('#notifDropdownBtn');
      const panel = portal.querySelector('#notifDropdown');
      if (!btn || !panel) return;
      const rect = btn.getBoundingClientRect();
      const gap = 10;
      const width = Math.min(360, window.innerWidth - 24);
      const left = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12));
      let top = rect.bottom + gap;
      if (top + 420 > window.innerHeight && rect.top - gap > 260) {
        top = Math.max(12, rect.top - Math.min(420, window.innerHeight - 24) - gap);
      }
      panel.style.left = `${left}px`;
      panel.style.top = `${Math.max(12, top)}px`;
    }

    function openDropdown() {
      open = true;
      renderPortal();
      portal.style.display = 'block';
      positionDropdown();
      renderButton();
    }
    function closeDropdown() {
      open = false;
      portal.style.display = 'none';
      portal.innerHTML = '';
      renderButton();
    }

    renderButton();
    document.addEventListener('click', (event) => {
      if (open && !portal.contains(event.target) && !notifWrapper.contains(event.target)) closeDropdown();
    });
    window.addEventListener('resize', () => open && positionDropdown());
    window.addEventListener('scroll', () => open && positionDropdown(), true);
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && open) closeDropdown(); });
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
            <a href="desarrollo-profesional.html" style="color:rgba(255,255,255,0.6);font-size:0.85rem;text-decoration:none;">Desarrollo Profesional</a>
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
            ${[1, 2, 3, 4, 5].map(n => `<button class="encuesta-estrella" data-val="${n}" style="background:none;border:none;font-size:1.75rem;cursor:pointer;color:#d1d5db;transition:color 0.15s;">&#9733;</button>`).join('')}
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
  const overlay = document.getElementById("modalOverlay");
  const titleEl = document.getElementById("modalTitle");
  const bodyEl = document.getElementById("modalBody");
  const btnSave = document.getElementById("btnFormSubmit");
  const btnCancel = document.getElementById("btnFormCancel");
  const btnClose = document.getElementById("modalClose");

  if (!overlay) return;

  titleEl.textContent = titulo;
  bodyEl.innerHTML = htmlBody;
  overlay.classList.remove("d-none");

  const cerrar = () => overlay.classList.add("d-none");

  btnClose.onclick = cerrar;
  btnCancel.onclick = cerrar;
  overlay.onclick = (e) => { if (e.target === overlay) cerrar(); };

  btnSave.onclick = () => {
    if (onGuardar) onGuardar();
  };
}

export function cerrarModal() {
  document.getElementById("modalOverlay")?.classList.add("d-none");
}

// ── CONFIRM ───────────────────────────────────────────────────

export function confirmar(mensaje, onConfirmar) {
  const overlay = document.getElementById("confirmOverlay");
  const msgEl = document.getElementById("confirmMessage");
  const btnSi = document.getElementById("btnConfirmYes");
  const btnNo = document.getElementById("btnConfirmNo");

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