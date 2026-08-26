// src/js/postulaciones.js
// CRUD Postulaciones → /posts de DummyJSON
// RF-05 al RF-10

import { requireAuth } from "./auth.js";
import { getAll, create, patch, remove } from "./dummyapi.js";
import { mostrarToast, mostrarLoading, ocultarLoading, abrirModal, cerrarModal, confirmar, escapeHTML, initUserNav } from "./ui.js";

requireAuth();
initUserNav();

let postulaciones = [];

const estados = [
  { texto: "🟢 En Revisión Técnica", bg: "#E6F6EE", color: "var(--color-success)" },
  { texto: "⚡ Entrevista Agendada", bg: "#fff3e0", color: "#e65100" },
  { texto: "📄 CV Recibido", bg: "#f0ebf5", color: "var(--primary-purple)" },
  { texto: "🎯 Oferta Final", bg: "#E6F6EE", color: "var(--color-success)" }
];

function renderCards(lista) {
  const contenedor = document.getElementById("applicationsList");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; background: var(--surface-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <p style="color: var(--text-muted); margin-bottom: 1rem;">No hay postulaciones registradas.</p>
        <button class="btn btn-cta" id="btnNuevaEmpty">+ Crear postulación</button>
      </div>
    `;
    document.getElementById("btnNuevaEmpty")?.addEventListener("click", () => abrirFormulario());
    return;
  }

  contenedor.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; width: 100%;">
      <span style="font-size: 0.95rem; color: var(--text-muted);">Total: <strong>${lista.length}</strong> postulaciones en seguimiento</span>
      <button class="btn btn-cta" id="btnNuevaPostulacion">+ Nueva Postulación</button>
    </div>
    <div class="job-list" style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
      ${lista.map((p, idx) => {
        const est = estados[idx % estados.length];
        const match = 90 + ((p.id * 5) % 10);
        const tags = Array.isArray(p.tags) ? p.tags.slice(0, 3) : ["tech", "developer", "remoto"];
        const salary = `$${(3000 + (p.id * 80) % 3000).toLocaleString()} - $${(5500 + (p.id * 90) % 2500).toLocaleString()} USD / mes`;

        return `
          <article class="job-card">
            <div class="job-card__header">
              <div class="job-card__company-logo">💻</div>
              <div class="job-card__title-area">
                <h3 class="job-card__title">${escapeHTML(p.title)}</h3>
                <div class="job-card__company-name">
                  <span>TechCR Solutions & Partners</span> • <span>Postulado recientemente</span>
                </div>
              </div>
              <span class="badge-match" style="background-color: ${est.bg}; color: ${est.color};">${est.texto}</span>
            </div>

            <div class="job-card__details">
              <span class="job-tag">🏠 Remoto</span>
              <span class="job-tag">⚡ ${match}% Match</span>
              ${tags.map((t) => `<span class="job-tag">🏷️ ${escapeHTML(t)}</span>`).join("")}
              <span class="job-tag">🆔 Folio #${p.id}</span>
            </div>

            <div class="job-card__footer">
              <div>
                <span class="job-card__salary">${escapeHTML(salary)}</span>
              </div>
              <div class="job-card__actions" style="display: flex; gap: 0.5rem;">
                <button type="button" class="btn btn-secondary btn-detalle" data-id="${p.id}">Ver Detalles</button>
                <button type="button" class="btn btn-secondary btn-editar" data-id="${p.id}">✏️</button>
                <button type="button" class="btn btn--danger btn-eliminar" data-id="${p.id}" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding: 0.55rem 0.8rem; border-radius: var(--radius-md); font-weight:600; cursor:pointer;">🗑️</button>
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;

  document.getElementById("btnNuevaPostulacion")?.addEventListener("click", () => abrirFormulario());

  contenedor.querySelectorAll(".btn-detalle").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = postulaciones.find(item => item.id === Number(btn.dataset.id));
      if (p) mostrarToast(`Detalle: ${p.title} - ${p.body ? p.body.substring(0, 40) + '...' : 'Sin observaciones'}`, "info", 4000);
    });
  });
  contenedor.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", () => abrirFormulario(Number(btn.dataset.id)));
  });
  contenedor.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", () => confirmar("¿Eliminar esta postulación?", () => eliminarPostulacionConfirmada(Number(btn.dataset.id))));
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

function formularioHTML(p = {}) {
  return `
    <div class="form-group">
      <label>Título / Cargo Postulado</label>
      <input class="form-control" id="fTitulo" value="${escapeHTML(p.title ?? "")}" placeholder="Ej: Senior Frontend Developer" required>
    </div>
    <div class="form-group">
      <label>Descripción / Observaciones</label>
      <textarea class="form-control" id="fBody" rows="3" placeholder="Detalles de la postulación">${escapeHTML(p.body ?? "")}</textarea>
    </div>
    <div class="form-group">
      <label>ID Candidato (userId)</label>
      <input class="form-control" type="number" id="fUserId" value="${p.userId ?? 1}" placeholder="1">
    </div>
    <div class="form-group">
      <label>Etiquetas (separadas por coma)</label>
      <input class="form-control" id="fTags" value="${escapeHTML((p.tags ?? []).join(", "))}" placeholder="react, typescript, remoto">
    </div>
  `;
}

function abrirFormulario(id = null) {
  const post = id ? postulaciones.find((p) => p.id === id) : {};
  const titulo = id ? "Editar postulación" : "Nueva postulación";

  abrirModal(titulo, formularioHTML(post), async () => {
    const datos = {
      title:  document.getElementById("fTitulo").value.trim(),
      body:   document.getElementById("fBody").value.trim(),
      userId: Number(document.getElementById("fUserId").value),
      tags:   document.getElementById("fTags").value.split(",").map((t) => t.trim()).filter(Boolean),
    };

    if (!datos.title) {
      mostrarToast("El título es obligatorio.", "warning");
      return;
    }

    mostrarLoading();
    try {
      if (id) {
        await patch("posts", id, datos);
        const idx = postulaciones.findIndex((p) => p.id === id);
        if (idx !== -1) postulaciones[idx] = { ...postulaciones[idx], ...datos };
        mostrarToast("Postulación actualizada.", "success");
      } else {
        const nueva = await create("posts", datos);
        postulaciones.unshift({ ...nueva, ...datos, id: Date.now() });
        mostrarToast("Postulación registrada.", "success");
      }
      cerrarModal();
      renderCards(postulaciones);
    } catch {
      mostrarToast("Error al guardar.", "error");
    } finally {
      ocultarLoading();
    }
  });
}

async function eliminarPostulacionConfirmada(id) {
  mostrarLoading();
  try {
    await remove("posts", id);
    postulaciones = postulaciones.filter((p) => p.id !== id);
    mostrarToast("Postulación eliminada.", "success");
    renderCards(postulaciones);
  } catch {
    mostrarToast("Error al eliminar.", "error");
  } finally {
    ocultarLoading();
  }
}

cargarPostulaciones();
