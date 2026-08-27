// src/js/capacitacion.js
import { requireAuth } from './auth.js';
import { mostrarToast, initUserNav, escapeHTML, renderAppFooter } from './ui.js';

requireAuth();
initUserNav();
if (typeof renderAppFooter === 'function') renderAppFooter();

const CURSOS = [
  { id: 1, titulo: 'Desarrollo Web Full Stack con React y Node.js', instructor: 'Carlos Vargas', horas: 48, nivel: 'Intermedio', categoria: 'tecnologia', precio: 'Gratis', calificacion: 4.8, inscritos: 1240, descripcion: 'Aprende a construir aplicaciones web modernas con las tecnologias mas demandadas del mercado laboral costarricense.' },
  { id: 2, titulo: 'Gestion del Talento Humano y Seleccion por Competencias', instructor: 'Maria Solano', horas: 24, nivel: 'Basico', categoria: 'rrhh', precio: 'Gratis', calificacion: 4.7, inscritos: 876, descripcion: 'Domina los procesos de reclutamiento, evaluacion y seleccion de talento con enfoque basado en competencias.' },
  { id: 3, titulo: 'Liderazgo Transformacional y Gestion de Equipos', instructor: 'Roberto Alvarado', horas: 16, nivel: 'Intermedio', categoria: 'liderazgo', precio: 'Gratis', calificacion: 4.9, inscritos: 2100, descripcion: 'Desarrolla habilidades de liderazgo efectivo para motivar equipos de alto rendimiento en entornos VUCA.' },
  { id: 4, titulo: 'Ingles de Negocios para Profesionales de TI', instructor: 'Ana Benavides', horas: 40, nivel: 'Intermedio', categoria: 'idiomas', precio: 'Gratis', calificacion: 4.6, inscritos: 3450, descripcion: 'Mejora tu fluidez en ingles tecnico para entrevistas internacionales, reuniones y documentacion profesional.' },
  { id: 5, titulo: 'Finanzas Personales e Inversion para Profesionales', instructor: 'Diego Mora', horas: 12, nivel: 'Basico', categoria: 'finanzas', precio: 'Gratis', calificacion: 4.5, inscritos: 1890, descripcion: 'Aprende a gestionar tus finanzas, construir un fondo de emergencia e iniciar tu camino en la inversion.' },
  { id: 6, titulo: 'Marketing Digital y Marca Personal en LinkedIn', instructor: 'Valeria Castro', horas: 20, nivel: 'Basico', categoria: 'marketing', precio: 'Gratis', calificacion: 4.8, inscritos: 2780, descripcion: 'Construye una presencia digital poderosa y aprende a usar LinkedIn para conseguir oportunidades de empleo.' },
  { id: 7, titulo: 'Cloud Computing con AWS para Desarrolladores', instructor: 'Luis Fernandez', horas: 36, nivel: 'Avanzado', categoria: 'tecnologia', precio: 'Gratis', calificacion: 4.7, inscritos: 654, descripcion: 'Certificate en los servicios fundamentales de AWS: EC2, S3, Lambda, RDS y arquitecturas serverless.' },
  { id: 8, titulo: 'Derecho Laboral Costarricense para Empresas', instructor: 'Gabriela Hidalgo', horas: 10, nivel: 'Basico', categoria: 'legal', precio: 'Gratis', calificacion: 4.6, inscritos: 430, descripcion: 'Conoce la legislacion laboral vigente en Costa Rica: contratos, despidos, beneficios y cumplimiento normativo.' },
  { id: 9, titulo: 'Inteligencia Artificial Aplicada al Reclutamiento', instructor: 'Marco Rodriguez', horas: 18, nivel: 'Intermedio', categoria: 'rrhh', precio: 'Gratis', calificacion: 4.9, inscritos: 1120, descripcion: 'Descubre como usar herramientas de IA para optimizar la busqueda, evaluacion y contratacion de candidatos.' },
  { id: 10, titulo: 'Python para Ciencia de Datos y Machine Learning', instructor: 'Sofia Pizarro', horas: 60, nivel: 'Avanzado', categoria: 'tecnologia', precio: 'Gratis', calificacion: 4.8, inscritos: 987, descripcion: 'Domina Python, Pandas, NumPy y scikit-learn para analizar datos y construir modelos predictivos.' },
  { id: 11, titulo: 'Comunicacion Efectiva y Presentaciones Ejecutivas', instructor: 'Patricia Gamboa', horas: 8, nivel: 'Basico', categoria: 'liderazgo', precio: 'Gratis', calificacion: 4.7, inscritos: 3200, descripcion: 'Desarrolla habilidades de comunicacion oral y escrita para presentar ideas con impacto y claridad.' },
  { id: 12, titulo: 'Contabilidad y Tributacion para PYMES en Costa Rica', instructor: 'Juan Esquivel', horas: 14, nivel: 'Basico', categoria: 'finanzas', precio: 'Gratis', calificacion: 4.5, inscritos: 760, descripcion: 'Comprende los principios contables y las obligaciones fiscales de tu empresa ante el Ministerio de Hacienda.' }
];

const COLORES = {
  tecnologia: { bg: '#eff6ff', color: '#1d4ed8', label: 'Tecnologia' },
  rrhh: { bg: '#fdf4ff', color: '#7c3aed', label: 'Recursos Humanos' },
  liderazgo: { bg: '#fff7ed', color: '#c2410c', label: 'Liderazgo' },
  idiomas: { bg: '#f0fdf4', color: '#15803d', label: 'Idiomas' },
  finanzas: { bg: '#fefce8', color: '#a16207', label: 'Finanzas' },
  marketing: { bg: '#fdf2f8', color: '#9d174d', label: 'Marketing' },
  legal: { bg: '#f8fafc', color: '#334155', label: 'Legal' }
};

let categoriaActual = 'todos';
let busquedaActual = '';

function renderEstrellas(r) {
  let s = '';
  for (let i = 0; i < Math.floor(r); i++) s += '<span style="color:#f59e0b">&#9733;</span>';
  return s;
}

function renderCursos() {
  const container = document.getElementById('cursosContainer');
  if (!container) return;
  const inscritosIds = JSON.parse(localStorage.getItem('cursosInscritos') || '[]');
  let lista = [...CURSOS];
  if (categoriaActual !== 'todos') lista = lista.filter(c => c.categoria === categoriaActual);
  if (busquedaActual) {
    const q = busquedaActual.toLowerCase();
    lista = lista.filter(c => c.titulo.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q));
  }
  if (!lista.length) {
    container.innerHTML = '<p style="text-align:center;padding:3rem;color:#6b7280;">No se encontraron cursos.</p>';
    return;
  }
  const nivelC = { 'Basico': '#16a34a', 'Intermedio': '#d97706', 'Avanzado': '#dc2626' };
  container.innerHTML = lista.map(c => {
    const col = COLORES[c.categoria] || { bg: '#f1f5f9', color: '#64748b', label: c.categoria };
    const nColor = nivelC[c.nivel] || '#374151';
    const badge1 = `<span style="background:${col.bg};color:${col.color};font-size:0.73rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:12px;">${col.label}</span>`;
    const badge2 = `<span style="background:${nColor}18;color:${nColor};font-size:0.73rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:12px;">${escapeHTML(c.nivel)}</span>`;
    return `
      <article class="job-card" style="padding:0;overflow:hidden;display:flex;flex-direction:column;">
        <div style="height:140px;background:linear-gradient(135deg,#531068 0%,#1e3a8a 100%);display:flex;align-items:center;justify-content:center;">
          <div style="text-align:center;">
            <div style="font-size:2.5rem;">&#128218;</div>
            <div style="color:rgba(255,255,255,0.85);font-size:0.75rem;font-weight:600;letter-spacing:0.5px;margin-top:0.4rem;">CENTRO DE CAPACITACION</div>
          </div>
        </div>
        <div style="padding:1.25rem;flex:1;display:flex;flex-direction:column;">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.75rem;gap:0.5rem;">
            ${badge1}
            ${badge2}
          </div>
          <h3 style="font-size:0.97rem;font-weight:700;margin:0 0 0.35rem 0;line-height:1.4;">${escapeHTML(c.titulo)}</h3>
          <p style="font-size:0.82rem;color:#6b7280;margin:0 0 0.6rem 0;">Instructor: ${escapeHTML(c.instructor)}</p>
          <p style="font-size:0.84rem;color:#6b7280;line-height:1.5;margin:0 0 1rem 0;flex:1;">${escapeHTML(c.descripcion)}</p>
          <div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.9rem;">
            ${renderEstrellas(c.calificacion)}
            <span style="font-size:0.8rem;font-weight:700;color:#374151;">${c.calificacion}</span>
            <span style="font-size:0.78rem;color:#9ca3af;">(${c.inscritos.toLocaleString('es-CR')} inscritos)</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="display:flex;gap:0.75rem;align-items:center;">
              <span style="font-size:0.8rem;color:#9ca3af;">${c.horas} horas</span>
              <span style="font-size:0.85rem;font-weight:700;color:#16a34a;">${c.precio}</span>
            </div>
            <button class="btn btn-cta" style="font-size:0.83rem;padding:0.45rem 1rem;${inscritosIds.includes(c.id) ? 'background-color:#9ca3af;cursor:not-allowed;' : ''}" data-curso-id="${c.id}" ${inscritosIds.includes(c.id) ? 'disabled' : ''}>
              ${inscritosIds.includes(c.id) ? 'Inscrito' : 'Inscribirse'}
            </button>
          </div>
      </article>
    `;
  }).join('');

  container.querySelectorAll('[data-curso-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const id = Number(btn.dataset.cursoId);
      const c = CURSOS.find(x => x.id === id);
      if (c) {
        const inscritos = JSON.parse(localStorage.getItem('cursosInscritos') || '[]');
        if (!inscritos.includes(id)) {
          inscritos.push(id);
          localStorage.setItem('cursosInscritos', JSON.stringify(inscritos));
        }
        mostrarToast('Inscrito en: ' + c.titulo, 'success');
        renderCursos();
      }
    });
  });
}

document.getElementById('cursosFiltros')?.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-categoria]');
  if (!btn) return;
  categoriaActual = btn.dataset.categoria;
  document.querySelectorAll('.curso-filtro').forEach(b => b.classList.remove('curso-filtro--activo'));
  btn.classList.add('curso-filtro--activo');
  renderCursos();
});

document.getElementById('cursosBusqueda')?.addEventListener('input', (e) => {
  busquedaActual = e.target.value.trim();
  renderCursos();
});

document.getElementById('btnInscribirDestacado')?.addEventListener('click', () => {
  const inscritos = JSON.parse(localStorage.getItem('cursosInscritos') || '[]');
  if (!inscritos.includes(0)) {
    inscritos.push(0);
    localStorage.setItem('cursosInscritos', JSON.stringify(inscritos));
  }
  mostrarToast('Te inscribiste al Programa Integral de Empleabilidad TicoTalent', 'success');
});

renderCursos();