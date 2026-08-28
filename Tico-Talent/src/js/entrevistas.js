// src/js/entrevistas.js
// CRUD Entrevistas / Notas Técnicas → /comments de DummyJSON (GET, POST, PATCH, DELETE — SIN PUT)
// RF-05 al RF-10

import { requireAuth, getRole } from "./auth.js";
import { getAll, create, patch, remove } from "./dummyapi.js";
import { adaptarEntrevista } from "./adapters.js";
import { mostrarToast, mostrarLoading, ocultarLoading, abrirModal, cerrarModal, confirmar, escapeHTML, initUserNav } from "./ui.js";

requireAuth();
initUserNav();

let entrevistasRaw = [];
let entrevistasAdaptadas = [];


function avatarIniciales(nombre = "Usuario") {
  const iniciales = String(nombre).split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  return `<div class="interview-avatar" aria-hidden="true">${escapeHTML(iniciales || "U")}</div>`;
}

function iconoModalidad(modalidad = "") {
  const texto = modalidad.toLowerCase();
  if (texto.includes("meet")) return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="2"></rect><path d="m16 10 5-3v10l-5-3"></path></svg>';
  if (texto.includes("teams")) return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M8 9h8M12 9v7"></path></svg>';
  return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h16M6 10V7h12v3M7 10v8M17 10v8M4 18h16"></path></svg>';
}

function renderCards(lista) {
  const contenedor = document.getElementById("interviewsList");
  if (!contenedor) return;

  const rol = getRole();
  const esEmpleador = (rol === "empleador" || rol === "reclutador");

  if (lista.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; background: var(--surface-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <p style="color: var(--text-muted); margin-bottom: 1rem;">No hay entrevistas programadas.</p>
        <button class="btn btn-cta" id="btnNuevaEmpty">+ Agendar primera entrevista</button>
      </div>
    `;
    document.getElementById("btnNuevaEmpty")?.addEventListener("click", () => abrirFormulario());
    return;
  }

  contenedor.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; width: 100%; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin: 0;">Agenda de Entrevistas & Sesiones Técnicas</h2>
        <span style="font-size: 0.9rem; color: var(--text-muted);">Total: <strong>${lista.length}</strong> entrevistas agendadas</span>
      </div>
      <button class="btn btn-cta" id="btnNuevaEntrevista">+ Agendar Entrevista</button>
    </div>

    <div class="job-list" style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
      ${lista.map((ent) => {
    return `
          <article class="job-card" data-id="${ent.id}">
            <div class="job-card__header">
              ${avatarIniciales(ent.candidatoNombre)}
              <div class="job-card__title-area">
                <h3 class="job-card__title">Entrevista con ${escapeHTML(ent.candidatoNombre)}</h3>
                <div class="job-card__company-name">
                  <span>${escapeHTML(ent.empresa)}</span> • <span>${escapeHTML(ent.entrevistador)}</span>
                </div>
              </div>
              <span class="badge-match" style="background-color: #fff3e0; color: #e65100;">
                En Proceso
              </span>
            </div>

            <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0.75rem 0; line-height: 1.5;">
               <strong>Notas:</strong> ${escapeHTML(ent.notas)}
            </p>

            <div class="job-card__details">
              <span class="job-tag"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path></svg>${escapeHTML(ent.fechaHora)}</span>
              <span class="job-tag">${iconoModalidad(ent.modalidad)}${escapeHTML(ent.modalidad)}</span>
              <span class="job-tag"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6"></path></svg>@${escapeHTML(ent.candidatoUsuario)}</span>
              <span class="job-tag"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h8l4 4v14H7z"></path><path d="M15 3v5h4"></path></svg>Ref. #${ent.postId}</span>
            </div>

            <div class="job-card__footer">
              <div>
                <span class="job-card__salary" style="font-size: 0.85rem; color: var(--color-primary);">Sala Virtual Asignada</span>
              </div>
              <div class="job-card__actions" style="display: flex; gap: 0.5rem;">
                ${ent.linkReunion !== "#" ? `<a href="${ent.linkReunion}" target="_blank" rel="noreferrer" class="btn btn-cta" style="padding: 0.55rem 0.9rem; text-decoration: none;">Ingresar a Sala</a>` : ''}
                <button type="button" class="btn btn-secondary btn-editar" data-id="${ent.id}">Notas</button>
                <button type="button" class="btn btn--danger btn-eliminar" data-id="${ent.id}" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding: 0.55rem 0.8rem; border-radius: var(--radius-md); font-weight:600; cursor:pointer;" aria-label="Eliminar entrevista"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
              </div>
            </div>
          </article>
        `;
  }).join("")}
    </div>
  `;

  document.getElementById("btnNuevaEntrevista")?.addEventListener("click", () => abrirFormulario());

  contenedor.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", () => abrirFormulario(Number(btn.dataset.id)));
  });
  contenedor.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", () => confirmar("¿Eliminar esta entrevista agendada?", () => eliminarEntrevistaConfirmada(Number(btn.dataset.id))));
  });
}

async function cargarEntrevistas() {
  mostrarLoading();
  try {
    const data = await getAll("comments");
    entrevistasRaw = data.comments ?? (Array.isArray(data) ? data : []);
    entrevistasAdaptadas = entrevistasRaw.map((c, idx) => adaptarEntrevista(c, idx));
    renderCards(entrevistasAdaptadas);
  } catch {
    mostrarToast("Error al cargar entrevistas desde DummyJSON.", "error");
  } finally {
    ocultarLoading();
  }
}

function formularioHTML(ent = {}) {
  return `
    <div class="form-group">
      <label>Título / Notas de la Entrevista</label>
      <input class="form-control" id="fBody" value="${escapeHTML(ent.notas ?? ent.body ?? "")}" placeholder="Ej: Entrevista técnica Frontend con Carlos" required>
    </div>
    <div class="form-group">
      <label>ID Postulación / Candidato</label>
      <input class="form-control" type="number" id="fPostId" value="${ent.postId ?? 1}" placeholder="1">
    </div>
    <div class="form-group">
      <label>Nombre de usuario del candidato</label>
      <input class="form-control" id="fUsername" value="${escapeHTML(ent.candidatoUsuario ?? ent.user?.username ?? "")}" placeholder="Ej: emilys">
    </div>
  `;
}

function abrirFormulario(id = null) {
  const ent = id ? entrevistasAdaptadas.find((e) => e.id === id) : {};
  const titulo = id ? "Editar Entrevista" : "Agendar Nueva Entrevista";

  abrirModal(titulo, formularioHTML(ent), async () => {
    const datos = {
      body: document.getElementById("fBody").value.trim(),
      postId: Number(document.getElementById("fPostId").value) || 1,
      user: {
        id: 1,
        username: document.getElementById("fUsername").value.trim() || "candidato",
      },
    };

    if (!datos.body) {
      mostrarToast("Las notas de la entrevista son obligatorias.", "warning");
      return;
    }

    mostrarLoading();
    try {
      if (id) {
        // En /comments se usa PATCH (SIN PUT)
        await patch("comments", id, datos);
        const idx = entrevistasAdaptadas.findIndex((e) => e.id === id);
        if (idx !== -1) {
          entrevistasAdaptadas[idx] = { ...entrevistasAdaptadas[idx], ...datos, notas: datos.body };
        }
        mostrarToast("Entrevista actualizada.", "success");
      } else {
        const nueva = await create("comments", datos);
        const adaptada = adaptarEntrevista({ ...nueva, ...datos, id: nueva?.id ?? `local-${Date.now()}` });
        entrevistasAdaptadas.unshift(adaptada);
        mostrarToast("Entrevista agendada con éxito.", "success");
      }
      cerrarModal();
      renderCards(entrevistasAdaptadas);
    } catch {
      mostrarToast("Error al guardar.", "error");
    } finally {
      ocultarLoading();
    }
  });
}

async function eliminarEntrevistaConfirmada(id) {
  mostrarLoading();
  try {
    await remove("comments", id);
    entrevistasAdaptadas = entrevistasAdaptadas.filter((e) => e.id !== id);
    mostrarToast("Entrevista eliminada.", "success");
    renderCards(entrevistasAdaptadas);
  } catch {
    mostrarToast("Error al eliminar.", "error");
  } finally {
    ocultarLoading();
  }
}

cargarEntrevistas();