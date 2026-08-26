// src/js/postulaciones.js
// Vista de Mis Postulaciones (solo Solicitante)
// Historial de postulaciones del usuario

import { requireAuth, getUser } from "./auth.js";
import { getAll } from "./dummyapi.js";
import { mostrarToast, mostrarLoading, ocultarLoading, escapeHTML, renderNavbar } from "./ui.js";

requireAuth();
renderNavbar("postulaciones");

let postulaciones = [];

const estados = [
  { texto: "CV Recibido",           bg: "#f0ebf5", color: "var(--primary-purple)" },
  { texto: "En Revision Tecnica",   bg: "#E6F6EE", color: "var(--color-success)" },
  { texto: "Entrevista Agendada",   bg: "#fff3e0", color: "#e65100" },
  { texto: "Oferta Final",          bg: "#E6F6EE", color: "var(--color-success)" }
];

function renderCards(lista) {
  const contenedor = document.getElementById("applicationsList");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; background: var(--surface-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <p style="color: var(--text-muted); margin-bottom: 1rem;">No tienes postulaciones aun.</p>
        <a href="vacantes.html" class="btn btn-cta">Explorar Vacantes</a>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; width: 100%;">
      <span style="font-size: 0.95rem; color: var(--text-muted);">Total: <strong>${lista.length}</strong> postulaciones en seguimiento</span>
    </div>
    <div class="job-list" style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
      ${lista.map((p, idx) => {
        const est = estados[idx % estados.length];
        const match = 90 + ((p.id * 5) % 10);
        const tags = Array.isArray(p.tags) ? p.tags.slice(0, 3) : ["tech", "developer", "remoto"];
        const salary = "$" + (3000 + (p.id * 80) % 3000).toLocaleString() + " - $" + (5500 + (p.id * 90) % 2500).toLocaleString() + " USD / mes";

        return `
          <article class="job-card">
            <div class="job-card__header">
              <div class="job-card__company-logo">PC</div>
              <div class="job-card__title-area">
                <h3 class="job-card__title">${escapeHTML(p.title)}</h3>
                <div class="job-card__company-name">
                  <span>TechCR Solutions & Partners</span> - <span>Postulado recientemente</span>
                </div>
              </div>
              <span class="badge-match" style="background-color: ${est.bg}; color: ${est.color};">${est.texto}</span>
            </div>

            <div class="job-card__details">
              <span class="job-tag">Remoto</span>
              <span class="job-tag">${match}% Match</span>
              ${tags.map((t) => "<span class=\"job-tag\">" + escapeHTML(t) + "</span>").join("")}
              <span class="job-tag">Folio #${p.id}</span>
            </div>

            <div class="job-card__footer">
              <div>
                <span class="job-card__salary">${escapeHTML(salary)}</span>
              </div>
              <div class="job-card__actions" style="display: flex; gap: 0.5rem;">
                <button type="button" class="btn btn--secondary btn-detalle" data-id="${p.id}">Ver Detalles</button>
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;

  contenedor.querySelectorAll(".btn-detalle").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = postulaciones.find(item => item.id === Number(btn.dataset.id));
      if (p) mostrarToast("Detalle: " + p.title + " - " + (p.body ? p.body.substring(0, 60) + "..." : "Sin observaciones"), "info", 4000);
    });
  });
}

async function cargarPostulaciones() {
  mostrarLoading();
  try {
    const data = await getAll("posts");
    postulaciones = data.posts ?? (Array.isArray(data) ? data : []);
    renderCards(postulaciones);
  } catch {
    mostrarToast("Error al cargar postulaciones.", "error");
  } finally {
    ocultarLoading();
  }
}

cargarPostulaciones();
