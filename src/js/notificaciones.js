// src/js/notificaciones.js
import { requireAuth } from './auth.js';
import { mostrarToast, initUserNav, escapeHTML, confirmar } from './ui.js';
import { getNotifications, saveNotifications, markAllNotificationsRead, clearNotifications } from './notificationStore.js';
import { restoreDeletedRecord } from './localTrashStore.js';

requireAuth();
initUserNav();

const TIPOS = {
  vacante: {
    label: 'Vacante', color: '#1d4ed8', bg: '#eff6ff',
    icono: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`
  },
  postulacion: {
    label: 'Postulación', color: '#7c3aed', bg: '#fdf4ff',
    icono: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`
  },
  sistema: {
    label: 'Sistema', color: '#374151', bg: '#f1f5f9',
    icono: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>`
  },
  capacitacion: {
    label: 'Desarrollo Profesional', color: '#15803d', bg: '#f0fdf4',
    icono: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`
  }
};

let notificaciones = getNotifications();
let tipoActual = 'todas';

// ── Badge en sidebar ──────────────────────────────────────────

function actualizarBadge() {
  const n = notificaciones.filter((x) => !x.leida).length;
  const b = document.getElementById('notifBadge');
  if (b) {
    b.textContent = n;
    b.style.display = n > 0 ? 'inline-flex' : 'none';
  }
}

function marcarLeida(id) {
  notificaciones = notificaciones.map((n) =>
    String(n.id) === String(id) ? { ...n, leida: true } : n
  );
  saveNotifications(notificaciones);
}

function iconoTipo(tipo) {
  return TIPOS[tipo]?.icono || TIPOS.sistema.icono;
}

function destinoPorTipo(tipo) {
  return ({
    vacante: 'vacantes.html',
    postulacion: 'postulaciones.html',
    capacitacion: 'desarrollo-profesional.html',
    entrevista: 'entrevistas.html',
    sistema: 'notificaciones.html',
    eliminacion: 'notificaciones.html'
  })[tipo] || 'notificaciones.html';
}

// ── Sync static filter chips with current state ───────────────

function sincronizarFiltros() {
  const chips = document.querySelectorAll('#notifFiltros [data-tipo]');
  chips.forEach((chip) => {
    const isActive = chip.dataset.tipo === tipoActual;
    chip.classList.toggle('notif-filter-chip--active', isActive);
    chip.setAttribute('aria-selected', String(isActive));
  });
}

// ── Render only the notification list ────────────────────────

function renderLista() {
  const container = document.getElementById('notificacionesContainer');
  if (!container) return;

  notificaciones = getNotifications();
  actualizarBadge();
  sincronizarFiltros();

  const lista = tipoActual === 'todas'
    ? notificaciones
    : notificaciones.filter((n) => n.tipo === tipoActual);

  if (lista.length === 0) {
    container.innerHTML = `
      <div class="notifications-empty">
        <div class="notifications-empty__icon">${iconoTipo('sistema')}</div>
        <h3>Sin notificaciones en esta categoría</h3>
        <p>Las nuevas actualizaciones aparecerán aquí.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = lista.map((n) => {
    const esUndo = n.accion?.tipo === 'deshacer-eliminacion';
    const tipoMeta = TIPOS[n.tipo] || TIPOS.sistema;
    return `
      <article class="notification-card ${n.leida ? 'is-read' : 'is-unread'}" data-notif-id="${escapeHTML(String(n.id))}">
        <button type="button" class="notification-card__main" data-open-notif="${escapeHTML(String(n.id))}" aria-label="Abrir notificación">
          <span class="notification-card__icon" style="color:${tipoMeta.color};background:${tipoMeta.bg};">${iconoTipo(n.tipo)}</span>
          <span class="notification-card__content">
            <span class="notification-card__topline">
              <span class="notification-card__type">${escapeHTML(tipoMeta.label || n.tipo)}</span>
              <time>${escapeHTML(n.tiempo || 'Ahora')}</time>
            </span>
            <strong class="notification-card__title">${escapeHTML(n.titulo)}</strong>
            <span class="notification-card__desc">${escapeHTML(n.detalle || '')}</span>
          </span>
          ${!n.leida ? '<span class="notification-card__dot" aria-hidden="true"></span>' : ''}
        </button>
        <div class="notification-card__actions">
          ${!n.leida ? `<button type="button" class="btn btn--ghost btn-marcar" data-id="${escapeHTML(String(n.id))}">Marcar leída</button>` : ''}
          ${esUndo ? `<button type="button" class="btn btn--secondary btn-undo-delete" data-entity="${escapeHTML(n.accion.entidad)}" data-record-id="${escapeHTML(String(n.accion.id))}" data-notification-id="${escapeHTML(String(n.id))}">Deshacer eliminación</button>` : ''}
          <button type="button" class="btn btn--ghost btn-eliminar-notif" data-id="${escapeHTML(String(n.id))}" aria-label="Eliminar notificación">Eliminar</button>
        </div>
      </article>
    `;
  }).join('');

  // ── Event delegation on container ────────────────────────────

  container.querySelectorAll('[data-open-notif]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = notificaciones.find((n) => String(n.id) === String(btn.dataset.openNotif));
      if (!item) return;
      marcarLeida(item.id);
      const dest = destinoPorTipo(item.tipo);
      if (dest !== 'notificaciones.html') {
        window.location.href = dest;
      } else {
        renderLista();
      }
    });
  });

  container.querySelectorAll('.btn-marcar').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      marcarLeida(btn.dataset.id);
      renderLista();
    });
  });

  container.querySelectorAll('.btn-eliminar-notif').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      notificaciones = getNotifications().filter((n) => String(n.id) !== String(btn.dataset.id));
      saveNotifications(notificaciones);
      renderLista();
      mostrarToast('Notificación eliminada.', 'info');
    });
  });

  container.querySelectorAll('.btn-undo-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const restored = restoreDeletedRecord(btn.dataset.entity, btn.dataset.recordId);
      if (!restored) {
        mostrarToast('No se pudo restaurar el registro.', 'error');
        return;
      }
      notificaciones = getNotifications().filter((n) => String(n.id) !== String(btn.dataset.notificationId));
      saveNotifications(notificaciones);
      renderLista();
      mostrarToast('La eliminación fue deshecha correctamente.', 'success');
    });
  });
}

// ── Wire static HTML filter chips ────────────────────────────

function inicializarFiltros() {
  const bar = document.getElementById('notifFiltros');
  if (!bar) return;
  bar.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-tipo]');
    if (!chip) return;
    tipoActual = chip.dataset.tipo;
    renderLista();
  });
}

// ── Wire static HTML action buttons ──────────────────────────

function inicializarAcciones() {
  document.getElementById('btnMarcarTodas')?.addEventListener('click', () => {
    markAllNotificationsRead();
    notificaciones = getNotifications();
    renderLista();
    mostrarToast('Todas las notificaciones marcadas como leídas.', 'success');
  });

  document.getElementById('btnLimpiarTodas')?.addEventListener('click', () => {
    confirmar('¿Deseas limpiar todas las notificaciones?', () => {
      clearNotifications();
      notificaciones = [];
      renderLista();
      mostrarToast('Centro de notificaciones limpiado.', 'success');
    });
  });
}

// ── Init ──────────────────────────────────────────────────────

inicializarFiltros();
inicializarAcciones();
renderLista();
