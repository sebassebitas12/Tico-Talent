// src/js/notificaciones.js
import { requireAuth } from './auth.js';
import { mostrarToast, initUserNav, escapeHTML, renderAppFooter, confirmar } from './ui.js';

requireAuth();
initUserNav();
if (typeof renderAppFooter === 'function') renderAppFooter();

const TIPOS = {
  vacante:     { label:'Nueva Vacante',  color:'#1d4ed8', bg:'#eff6ff' },
  postulacion: { label:'Postulacion',    color:'#7c3aed', bg:'#fdf4ff' },
  sistema:     { label:'Sistema',        color:'#374151', bg:'#f1f5f9' },
  capacitacion:{ label:'Capacitacion',   color:'#15803d', bg:'#f0fdf4' }
};

const BASE = [
  { id:1,  tipo:'vacante',      titulo:'Nueva vacante compatible con tu perfil',         detalle:'Intel Costa Rica busca un Desarrollador Full Stack Senior con experiencia en React y Node.js. Nivel de compatibilidad: 94%.',                                           tiempo:'Hace 5 min',   leida:false },
  { id:2,  tipo:'postulacion',  titulo:'Tu postulacion fue revisada por el reclutador',  detalle:'La empresa Amazon CR actualizo el estado de tu postulacion al puesto de Cloud Architect a Revision Tecnica.',                                                          tiempo:'Hace 23 min',  leida:false },
  { id:3,  tipo:'capacitacion', titulo:'Nuevo curso disponible: IA para RRHH',           detalle:'El curso Inteligencia Artificial aplicada al Reclutamiento ya esta disponible. 18 horas, totalmente gratuito. Cupos limitados.',                                       tiempo:'Hace 1 hora',  leida:false },
  { id:4,  tipo:'sistema',      titulo:'Actualizacion de la plataforma TicoTalent',      detalle:'Hemos mejorado los algoritmos de compatibilidad de vacantes. Ahora veras resultados mas precisos segun tus habilidades.',                                               tiempo:'Hace 2 horas', leida:false },
  { id:5,  tipo:'vacante',      titulo:'5 nuevas vacantes en tu area de interes',        detalle:'Se publicaron 5 nuevas posiciones en Tecnologia y Datos que coinciden con tu perfil profesional.',                                                                      tiempo:'Hace 3 horas', leida:false },
  { id:6,  tipo:'postulacion',  titulo:'Entrevista programada exitosamente',             detalle:'Tienes una entrevista virtual con HP Costa Rica para el martes 2 de setiembre a las 10:00 AM. Revisa tu calendario.',                                                   tiempo:'Hace 5 horas', leida:true  },
  { id:7,  tipo:'capacitacion', titulo:'Recordatorio: Curso de Python inicia manana',   detalle:'Tu curso Python para Ciencia de Datos comienza manana. Asegurate de tener Python 3.11 instalado.',                                                                      tiempo:'Hace 6 horas', leida:true  },
  { id:8,  tipo:'sistema',      titulo:'Tu perfil esta al 72 porciento de completitud', detalle:'Agrega tu foto, descripcion profesional y al menos 5 habilidades tecnicas para aumentar tu visibilidad ante reclutadores.',                                              tiempo:'Ayer',         leida:true  },
  { id:9,  tipo:'vacante',      titulo:'Empresa Cisco Systems te visito el perfil',     detalle:'Un reclutador de Cisco Systems ha visitado tu perfil en la plataforma. Es un buen momento para actualizar tu informacion.',                                              tiempo:'Ayer',         leida:true  },
  { id:10, tipo:'postulacion',  titulo:'Postulacion enviada correctamente',              detalle:'Tu postulacion al puesto de DevOps Engineer en Procter and Gamble CR fue recibida. Te avisaremos sobre novedades.',                                                     tiempo:'Hace 2 dias',  leida:true  }
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
    const letra = { vacante:'V', postulacion:'P', capacitacion:'C', sistema:'S' }[n.tipo] || 'N';
    return `
      <div class="job-card" data-notif-id="${n.id}" style="padding:1.25rem;display:flex;gap:1rem;align-items:flex-start;${n.leida ? 'opacity:0.7;' : 'border-left:3px solid #531068;'}">
        <div style="width:42px;height:42px;border-radius:50%;background:${t.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <span style="font-size:1rem;color:${t.color};font-weight:700;">${letra}</span>
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
  mostrarToast('Todas las notificaciones marcadas como leidas', 'success');
});

document.getElementById('btnLimpiarTodas')?.addEventListener('click', () => {
  confirmar('Eliminar todas las notificaciones?', () => {
    notificaciones = []; guardar(notificaciones); render(); actualizarBadge();
    mostrarToast('Notificaciones eliminadas', 'info');
  });
});

render();
actualizarBadge();