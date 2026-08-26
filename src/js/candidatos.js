// src/js/candidatos.js
// Vista de Candidatos Postulados (solo Empresa)
// PATCH /comments/{id} para cambiar estado del candidato

import { requireAuth } from "./auth.js";
import { getAll, patch } from "./dummyapi.js";
import { mostrarToast, mostrarLoading, ocultarLoading, escapeHTML, renderNavbar } from "./ui.js";

requireAuth();
renderNavbar("candidatos");

let candidatos = [];

const estadosCandidato = [
  { value: "pendiente",       label: "Pendiente",          bg: "#fff3e0", color: "#e65100" },
  { value: "revision",        label: "En Revision",        bg: "#f0ebf5", color: "var(--primary-purple)" },
  { value: "entrevista",      label: "Entrevista Agendada", bg: "#E6F6EE", color: "var(--color-success)" },
  { value: "rechazado",       label: "Rechazado",          bg: "#fef2f2", color: "#b91c1c" },
  { value: "contratado",      label: "Contratado",         bg: "#E6F6EE", color: "var(--color-success)" }
];

function getEstado(idx) {
  return estadosCandidato[idx % estadosCandidato.length];
}

function renderCards(lista) {
  const contenedor = document.getElementById("candidatesList");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 2rem; background: var(--surface-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <p style="color: var(--text-muted);">No hay candidatos postulados aun.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; width: 100%;">
      <span style="font-size: 0.95rem; color: var(--text-muted);">Total: <strong>${lista.length}</strong> candidatos postulados</span>
    </div>
    <div class="job-list" style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
      ${lista.map((c, idx) => {
        const est = getEstado(c._estadoIdx ?? idx);
        const match = 88 + ((c.id * 3) % 11);
        const nombre = c.user?.username || "candidato_" + (c.postId || (idx + 1));
        const titulo = c.body ? (c.body.length > 55 ? c.body.substring(0, 55) + "..." : c.body) : "Postulacion #" + c.id;

        return `
          <article class="job-card">
            <div class="job-card__header">
              <div class="job-card__company-logo">${(nombre || "U").charAt(0).toUpperCase()}</div>
              <div class="job-card__title-area">
                <h3 class="job-card__title">@${escapeHTML(nombre)}</h3>
                <div class="job-card__company-name">
                  <span>${escapeHTML(titulo)}</span>
                </div>
              </div>
              <span class="badge-match" style="background-color: ${est.bg}; color: ${est.color};">${est.label}</span>
            </div>

            <div class="job-card__details">
              <span class="job-tag">Postulacion #${c.id}</span>
              <span class="job-tag">Post ID: ${c.postId ?? "N/A"}</span>
              <span class="job-tag">${match}% Compatibilidad</span>
            </div>

            <div class="job-card__footer">
              <div>
                <span class="job-card__date">Estado actual: ${est.label}</span>
              </div>
              <div class="job-card__actions" style="display: flex; gap: 0.5rem; align-items: center;">
                <select class="form-control" style="width: auto; padding: 0.4rem 0.6rem; font-size: 0.85rem;" data-id="${c.id}" data-idx="${idx}">
                  ${estadosCandidato.map((e, i) => `<option value="${i}" ${i === (c._estadoIdx ?? idx) ? "selected" : ""}>${e.label}</option>`).join("")}
                </select>
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;

  contenedor.querySelectorAll("select[data-id]").forEach(sel => {
    sel.addEventListener("change", async () => {
      const id = Number(sel.dataset.id);
      const nuevoIdx = Number(sel.value);
      mostrarLoading();
      try {
        await patch("comments", id, { postId: id });
        const c = candidatos.find(item => item.id === id);
        if (c) c._estadoIdx = nuevoIdx;
        mostrarToast("Estado del candidato actualizado.", "success");
        renderCards(candidatos);
      } catch {
        mostrarToast("Error al actualizar estado.", "error");
      } finally {
        ocultarLoading();
      }
    });
  });
}

async function cargarCandidatos() {
  mostrarLoading();
  try {
    const data = await getAll("comments");
    candidatos = data.comments ?? (Array.isArray(data) ? data : []);
    renderCards(candidatos);
  } catch {
    mostrarToast("Error al cargar candidatos.", "error");
  } finally {
    ocultarLoading();
  }
}

cargarCandidatos();
