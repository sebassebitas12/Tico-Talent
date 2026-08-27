// src/js/notificaciones.js
import { requireAuth } from './auth.js';
import { mostrarToast, initUserNav, escapeHTML, confirmar } from './ui.js';

requireAuth();
initUserNav();

const TIPOS = {
  vacante: {
    label: 'Nueva Vacante', color: '#1d4ed8', bg: '#eff6ff',
    icono: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`
  },
  postulacion: {
    label: 'Postulación', color: '#7c3aed', bg: '#fdf4ff',
    icono: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`
  },
  sistema: {
    label: 'Sistema', color: '#374151', bg: '#f1f5f9',
    icono: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>`
  },
  capacitacion: {
    label: 'Capacitación', color: '#15803d', bg: '#f0fdf4',
    icono: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`
  }
};

const BASE = [
  { id: 1, tipo: 'vacante', titulo: 'Nueva vacante compatible con tu perfil', detalle: 'Intel Costa Rica busca un Desarrollador Full Stack Senior con experiencia en React y Node.js. Nivel de compatibilidad: 94%.', tiempo: 'Hace 5 min', leida: false },
  { id: 2, tipo: 'postulacion', titulo: 'Tu postulación fue revisada por el reclutador', detalle: 'La empresa Amazon CR actualizó el estado de tu postulación al puesto de Cloud Architect a Revisión Técnica.', tiempo: 'Hace 23 min', leida: false },
  { id: 3, tipo: 'capacitacion', titulo: 'Nuevo curso disponible: IA para RRHH', detalle: 'El curso Inteligencia Artificial aplicada al Reclutamiento ya está disponible. 18 horas, totalmente gratuito. Cupos limitados.', tiempo: 'Hace 1 hora', leida: false },
  { id: 4, tipo: 'sistema', titulo: 'Actualización de la plataforma TicoTalent', detalle: 'Hemos mejorado los algoritmos de compatibilidad de vacantes. Ahora verás resultados más precisos según tus habilidades.', tiempo: 'Hace 2 horas', leida: false },
  { id: 5, tipo: 'vacante', titulo: '5 nuevas vacantes en tu área de interés', detalle: 'Se publicaron 5 nuevas posiciones en Tecnología y Datos que coinciden con tu perfil profesional.', tiempo: 'Hace 3 horas', leida: false },
  { id: 6, tipo: 'postulacion', titulo: 'Entrevista programada exitosamente', detalle: 'Tienes una entrevista virtual con HP Costa Rica para el martes 2 de setiembre a las 10:00 AM. Revisa tu calendario.', tiempo: 'Hace 5 horas', leida: true },
  { id: 7, tipo: 'capacitacion', titulo: 'Recordatorio: Curso de Python inicia mañana', detalle: 'Tu curso Python para Ciencia de Datos comienza mañana. Asegúrate de tener Python 3.11 instalado.', tiempo: 'Hace 6 horas', leida: true },
  { id: 8, tipo: 'sistema', titulo: 'Tu perfil está al 72% de completitud', detalle: 'Agrega tu foto, descripción profesional y al menos 5 habilidades técnicas para aumentar tu visibilidad ante reclutadores.', tiempo: 'Ayer', leida: true },
  { id: 9, tipo: 'vacante', titulo: 'Empresa Cisco Systems te visitó el perfil', detalle: 'Un reclutador de Cisco Systems ha visitado tu perfil en la plataforma. Es un buen momento para actualizar tu información.', tiempo: 'Ayer', leida: true },
  { id: 10, tipo: 'postulacion', titulo: 'Postulación enviada correctamente', detalle: 'Tu postulación al puesto de DevOps Engineer en Procter & Gamble CR fue recibida. Te avisaremos sobre novedades.', tiempo: 'Hace 2 días', leida: true }
];

const LS_KEY = 'tt_notificaciones';

function cargar() {
  try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : JSON.parse(JSON.stringify(BASE)); }
  catch { return JSON.parse(JSON.stringify(BASE)); }
}
function guardar(lista) { localStorage.setItem(LS_KEY, JSON.stringify(lista)); }

let notificaciones = cargar();
if (notificaciones.length < BASE.length) { notificaciones = JSON.parse(JSON.stringify(BASE)); guardar(notificaciones); }
let tipoActual = 'todas';

function actualizarBadge() {
  const n = notificaciones.filter(x => !x.leida).length;
  const b = document.getElementById('notifBadge');
  if (b) { b.textContent = n; b.style.display = n > 0 ? 'inline-flex' : 'none'; }
}

function render() {
  const container = document.getElementById('notificacionesContainer');
  if (!container) return;
  let lista = tipoActual === 'todas' ? notificaciones : notificaciones.filter(n => n.tipo === tipoActual);
  if (!lista.length) { container.innerHTML = '<p style="text-align:center;padding:3rem;color:#6b7280;">No hay notificaciones en esta categoria.</p>'; return; }
  container.innerHTML = lista.map(n => {
    const t = TIPOS[n.tipo] || TIPOS.sistema;
    return `
      <div class="job-card" data-notif-id="${n.id}" style="padding:1.25rem;display:flex;gap:1rem;align-items:flex-start;${n.leida ? 'opacity:0.7;' : 'border-left:3px solid #531068;'}">
        <div style="width:46px;height:46px;border-radius:12px;background:${t.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:${t.color};">
          ${t.icono}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;">
            <div>
              <span style="background:${t.bg};color:${t.color};font-size:0.72rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:10px;">${t.label}</span>
              ${!n.leida ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#531068;margin-left:0.5rem;vertical-align:middle;"></span>' : ''}
            </div>
            <span style="font-size:0.78rem;color:#9ca3af;white-space:nowrap;">${n.tiempo}</span>
          </div>
          <h3 style="font-size:0.95rem;font-weight:700;margin:0.4rem 0 0.25rem 0;">${escapeHTML(n.titulo)}</h3>
          <p style="font-size:0.85rem;color:#6b7280;margin:0;line-height:1.5;">${escapeHTML(n.detalle)}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.4rem;flex-shrink:0;">
          ${!n.leida ? `<button class="btn btn-secondary btn-marcar" data-id="${n.id}" style="font-size:0.75rem;padding:0.35rem 0.65rem;">Leida</button>` : ''}
          <button class="btn btn-secondary btn-eliminar-notif" data-id="${n.id}" style="font-size:0.75rem;padding:0.35rem 0.65rem;color:#b91c1c;">Eliminar</button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.btn-marcar').forEach(btn => {
    btn.addEventListener('click', () => {
      const x = notificaciones.find(n => n.id === Number(btn.dataset.id));
      if (x) { x.leida = true; guardar(notificaciones); render(); actualizarBadge(); }
    });
  });
  container.querySelectorAll('.btn-eliminar-notif').forEach(btn => {
    btn.addEventListener('click', () => {
      notificaciones = notificaciones.filter(n => n.id !== Number(btn.dataset.id));
      guardar(notificaciones); render(); actualizarBadge();
    });
  });
}

document.getElementById('notifFiltros')?.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-tipo]');
  if (!btn) return;
  tipoActual = btn.dataset.tipo;
  document.querySelectorAll('[data-tipo]').forEach(b => b.classList.remove('curso-filtro--activo'));
  btn.classList.add('curso-filtro--activo');
  render();
});

document.getElementById('btnMarcarTodas')?.addEventListener('click', () => {
  notificaciones.forEach(n => n.leida = true);
  guardar(notificaciones); render(); actualizarBadge();
  mostrarToast('Todas las notificaciones marcadas como leídas', 'success');
});

document.getElementById('btnLimpiarTodas')?.addEventListener('click', () => {
  confirmar('¿Eliminar todas las notificaciones?', () => {
    notificaciones = []; guardar(notificaciones); render(); actualizarBadge();
    mostrarToast('Notificaciones eliminadas', 'info');
  });
});

render();
actualizarBadge();