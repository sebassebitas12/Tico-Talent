// src/js/entrevistas.js
// CRUD Entrevistas / Agenda -> /comments de DummyJSON

import { requireAuth } from "./auth.js";
import { getAll, create, patch, remove } from "./dummyapi.js";
import { mostrarToast, mostrarLoading, ocultarLoading, abrirModal, cerrarModal, confirmar, escapeHTML, renderNavbar } from "./ui.js";

requireAuth();
renderNavbar("entrevistas");

let entrevistas = [];

function renderCards(lista) {
  const contenedor = document.getElementById("interviewsList");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; background: var(--surface-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <p style="color: var(--text-muted); margin-bottom: 1rem;">No hay entrevistas agendadas.</p>
        <button class="btn btn-cta" id="btnNuevaEmpty">+ Agendar primera entrevista</button>
      </div>
    `;
    document.getElementById("btnNuevaEmpty")?.addEventListener("click", () => abrirFormulario());
    return;
  }

  const dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];
  const horas = ["09:00 AM", "10:30 AM", "02:00 PM", "03:30 PM", "04:45 PM"];

  contenedor.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; width: 100%;">
      <span style="font-size: 0.95rem; color: var(--text-muted);">Total: <strong>${lista.length}</strong> citas en agenda</span>
      <button class="btn btn-cta" id="btnNuevaEntrevista">+ Agendar Entrevista</button>
    </div>
    <div class="job-list" style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
      ${lista.map((ent, idx) => {
        const dia = dias[idx % dias.length];
        const hora = horas[idx % horas.length];
        const candidato = ent.user?.username || "candidato_" + (ent.postId || (idx + 1));
        const titulo = ent.body ? (ent.body.length > 55 ? ent.body.substring(0, 55) + "..." : ent.body) : "Entrevista Tecnica #" + ent.id;

        return `
          <article class="job-card">
            <div class="job-card__header">
              <div class="job-card__company-logo">EN</div>
              <div class="job-card__title-area">
                <h3 class="job-card__title">${escapeHTML(titulo)}</h3>
                <div class="job-card__company-name">
                  <span>Candidato: <strong>@${escapeHTML(candidato)}</strong></span> - <span>Via Google Meet / Teams</span>
                </div>
              </div>
              <span class="badge-match" style="background-color: #E6F6EE; color: var(--color-success);">Confirmada</span>
            </div>

            <div class="job-card__details">
              <span class="job-tag">${dia} proximo, ${hora} (CST)</span>
              <span class="job-tag">Panel Reclutador Tico Talent</span>
              <span class="job-tag">ID #${ent.id}</span>
            </div>

            <div class="job-card__footer">
              <div>
                <span class="job-card__date">Enlace enviado al correo electronico</span>
              </div>
              <div class="job-card__actions" style="display: flex; gap: 0.5rem;">
                <button type="button" class="btn btn--cta btn-reunion" data-id="${ent.id}">Unirse a la Reunion</button>
                <button type="button" class="btn btn--secondary btn-editar" data-id="${ent.id}">Editar</button>
                <button type="button" class="btn btn--danger btn-eliminar" data-id="${ent.id}">Eliminar</button>
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;

  document.getElementById("btnNuevaEntrevista")?.addEventListener("click", () => abrirFormulario());

  contenedor.querySelectorAll(".btn-reunion").forEach(btn => {
    btn.addEventListener("click", () => mostrarToast("Abriendo enlace de la videollamada...", "info"));
  });
  contenedor.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", () => abrirFormulario(Number(btn.dataset.id)));
  });
  contenedor.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", () => confirmar("Eliminar esta cita de la agenda?", () => eliminarEntrevistaConfirmada(Number(btn.dataset.id))));
  });
}

async function cargarEntrevistas() {
  mostrarLoading();
  try {
    const data = await getAll("comments");
    entrevistas = data.comments ?? (Array.isArray(data) ? data : []);
    renderCards(entrevistas);
  } catch {
    mostrarToast("Error al cargar entrevistas.", "error");
  } finally {
    ocultarLoading();
  }
}

function formularioHTML(ent = {}) {
  return `
    <div class="form-group">
      <label>Titulo / Notas de la Entrevista</label>
      <input class="form-control" id="fBody" value="${escapeHTML(ent.body ?? "")}" placeholder="Ej: Entrevista tecnica Frontend con Carlos" required>
    </div>
    <div class="form-group">
      <label>ID Postulacion / Candidato</label>
      <input class="form-control" type="number" id="fPostId" value="${ent.postId ?? 1}" placeholder="1">
    </div>
    <div class="form-group">
      <label>Nombre de usuario del candidato</label>
      <input class="form-control" id="fUsername" value="${escapeHTML(ent.user?.username ?? "")}" placeholder="Ej: emilys">
    </div>
  `;
}

function abrirFormulario(id = null) {
  const ent = id ? entrevistas.find((e) => e.id === id) : {};
  const titulo = id ? "Editar entrevista" : "Agendar nueva entrevista";

  abrirModal(titulo, formularioHTML(ent), async () => {
    const datos = {
      body:   document.getElementById("fBody").value.trim(),
      postId: Number(document.getElementById("fPostId").value),
      user: {
        id: 1,
        username: document.getElementById("fUsername").value.trim() || "candidato",
      },
    };

    if (!datos.body) {
      mostrarToast("La descripcion de la entrevista es obligatoria.", "warning");
      return;
    }

    mostrarLoading();
    try {
      if (id) {
        await patch("comments", id, datos);
        const idx = entrevistas.findIndex((e) => e.id === id);
        if (idx !== -1) entrevistas[idx] = { ...entrevistas[idx], ...datos };
        mostrarToast("Entrevista actualizada.", "success");
      } else {
        const nueva = await create("comments", datos);
        entrevistas.unshift({ ...nueva, ...datos, id: Date.now() });
        mostrarToast("Entrevista agendada con exito.", "success");
      }
      cerrarModal();
      renderCards(entrevistas);
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
    entrevistas = entrevistas.filter((e) => e.id !== id);
    mostrarToast("Entrevista eliminada.", "success");
    renderCards(entrevistas);
  } catch {
    mostrarToast("Error al eliminar.", "error");
  } finally {
    ocultarLoading();
  }
}

cargarEntrevistas();
