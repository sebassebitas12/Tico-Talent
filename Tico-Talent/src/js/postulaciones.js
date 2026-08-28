// src/js/postulaciones.js
// CRUD Postulaciones → /posts de DummyJSON (GET, POST, PATCH, DELETE — SIN PUT)
// Integra adaptadores de Costa Rica y diferenciación por rol (Mis Postulaciones vs Pipeline de Empresa).

import { requireAuth, getRole, getUser } from "./auth.js";
import { getAll, create, patch, remove } from "./dummyapi.js";
import { adaptarPostulacion } from "./adapters.js";
import { getLocalApplications, saveLocalApplication } from "./applicationStore.js";
import { isDeleted, saveDeletedRecord } from "./localTrashStore.js";
import { addNotification } from "./notificationStore.js";
import { mostrarToast, mostrarLoading, ocultarLoading, abrirModal, cerrarModal, confirmar, escapeHTML, initUserNav } from "./ui.js";

requireAuth();
initUserNav();

let postulacionesRaw = [];
let postulacionesAdaptadas = [];
const ESTADOS_PIPELINE = [
  { value: "CV Recibido", paso: 1, bg: "#f0ebf5", color: "#531068", icono: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h8l4 4v14H7z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 3v5h4M10 13h6M10 17h6" fill="none" stroke="currentColor" stroke-width="2"/></svg>', titulo: "CV Recibido", descripcion: "El perfil ingresó al proceso." },
  { value: "En Revisión Técnica", paso: 2, bg: "#e6f6ee", color: "#00875a", icono: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 16 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>', titulo: "Revisión Técnica", descripcion: "Evaluación de experiencia y habilidades." },
  { value: "Entrevista Agendada", paso: 3, bg: "#fff3e0", color: "#e65100", icono: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 3v4M8 3v4M3 10h18" fill="none" stroke="currentColor" stroke-width="2"/></svg>', titulo: "Entrevista", descripcion: "El candidato avanza a entrevista." },
  { value: "Oferta Final", paso: 4, bg: "#e0f2fe", color: "#0369a1", icono: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.5 5.1 5.5.8-4 4 .9 5.6-4.9-2.7-4.9 2.7.9-5.6-4-4 5.5-.8L12 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>', titulo: "Oferta Final", descripcion: "Proceso final de contratación." }
];

function estadoMeta(estado = "") {
  return ESTADOS_PIPELINE.find(e =>
    estado.includes("Oferta") ? e.paso === 4 :
      estado.includes("Entrevista") ? e.paso === 3 :
        estado.includes("Revisión") ? e.paso === 2 :
          e.paso === 1
  ) || ESTADOS_PIPELINE[0];
}


function renderCards(lista) {
  const contenedor = document.getElementById("applicationsList");
  if (!contenedor) return;

  const rol = getRole();
  const esEmpleador = (rol === "empleador" || rol === "reclutador");

  if (lista.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; background: var(--surface-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <p style="color: var(--text-muted); margin-bottom: 1rem;">No hay postulaciones registradas en el sistema.</p>
  
      </div>
    `;
    return;
  }

  const headerTitle = esEmpleador ? "Gestionar Postulantes" : "Mis Postulaciones en Seguimiento";
  const btnLabel = "+ Agregar Postulante";

  const pageTitle = document.getElementById("viewTitle");
  const pageDescription = document.querySelector(".main__description");
  if (esEmpleador && pageTitle) pageTitle.textContent = "Gestionar Postulantes";
  if (esEmpleador && pageDescription) pageDescription.textContent = "Revisá candidatos y movelos entre etapas del proceso de selección.";

  contenedor.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; width: 100%; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin: 0;">${headerTitle}</h2>
        <span style="font-size: 0.9rem; color: var(--text-muted);">Total: <strong>${lista.length}</strong> procesos activos</span>
      </div>
${esEmpleador ? `<button class="btn btn-cta" id="btnNuevaPostulacion">${btnLabel}</button>` : ""}
    </div>

    <div class="job-list" style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
      ${lista.map((p) => {
    return `
          <article class="job-card" data-id="${p.id}">
            <div class="job-card__header">
              <div class="job-card__company-logo">${p.empresaLogo || "📄"}</div>
              <div class="job-card__title-area">
                <h3 class="job-card__title">${escapeHTML(p.titulo)}</h3>
                <div class="job-card__company-name">
                  <span>${escapeHTML(p.empresa)}</span> • <span>${escapeHTML(p.ubicacion)}</span>
                </div>
              </div>
              <span class="badge-match" style="background-color: ${p.estadoBg}; color: ${p.estadoColor}; border-color: ${p.estadoColor}33;">
                ${p.estado}
              </span>
            </div>

            <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0.75rem 0; line-height: 1.5;">
              ${escapeHTML(p.detalle)}
            </p>

            <!-- BARRA DE PROGRESO VISUAL POR ETAPAS -->
            <div style="background: var(--surface-card); border: 1px solid var(--border-subtle); padding: 0.75rem 1rem; border-radius: var(--radius-md); margin: 0.75rem 0;">
              <div style="display: flex; justify-content: space-between; position: relative; margin-bottom: 0.4rem;">
                <div style="text-align: center; flex: 1;">
                  <span style="font-size: 0.75rem; font-weight: ${p.paso >= 1 ? "700" : "400"}; color: ${p.paso >= 1 ? "var(--primary-purple)" : "var(--text-muted)"};">1. CV Recibido</span>
                </div>
                <div style="text-align: center; flex: 1;">
                  <span style="font-size: 0.75rem; font-weight: ${p.paso >= 2 ? "700" : "400"}; color: ${p.paso >= 2 ? "#00875a" : "var(--text-muted)"};">2. Revisión Técnica</span>
                </div>
                <div style="text-align: center; flex: 1;">
                  <span style="font-size: 0.75rem; font-weight: ${p.paso >= 3 ? "700" : "400"}; color: ${p.paso >= 3 ? "#e65100" : "var(--text-muted)"};">3. Entrevista</span>
                </div>
                <div style="text-align: center; flex: 1;">
                  <span style="font-size: 0.75rem; font-weight: ${p.paso >= 4 ? "700" : "400"}; color: ${p.paso >= 4 ? "#0369a1" : "var(--text-muted)"};">4. Oferta Final</span>
                </div>
              </div>
              <div style="height: 6px; background: var(--surface-subtle); border-radius: 3px; overflow: hidden; display: flex;">
                <div style="width: ${(p.paso / 4) * 100}%; background: linear-gradient(90deg, var(--primary-purple), #00875a); border-radius: 3px; transition: width 0.4s ease;"></div>
              </div>
            </div>

            <div class="job-card__details">
              <span class="job-tag">Fecha: ${p.fechaPostulacion}</span>
              <span class="job-tag">Afinidad: ${p.match}% Match</span>
              <span class="job-tag">Candidato ID: #${p.userId}</span>
              ${p.tags.map(t => `<span class="job-tag">#${escapeHTML(t)}</span>`).join("")}
            </div>

            <div class="job-card__footer">
              <div>
                <span class="job-card__salary" style="font-size: 0.95rem; color: var(--primary-purple);">
                  ${esEmpleador ? "Gestión de Embudo" : "Estado del Proceso"}
                </span>
                <span class="job-card__date" style="display: block; font-size: 0.8rem;">Actualizado recientemente</span>
              </div>

              <div class="job-card__actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${esEmpleador ? `
                  <button type="button" class="btn btn-secondary btn-cambiar-estado" data-id="${p.id}">Cambiar Estado</button>
                  <button type="button" class="btn btn-secondary btn-editar" data-id="${p.id}">Editar</button>
                  <button type="button" class="btn btn--danger btn-eliminar" data-id="${p.id}" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding: 0.55rem 0.9rem; border-radius: var(--radius-md); font-weight:600; cursor:pointer;">Eliminar</button>
                ` : `
                  <button type="button" class="btn btn-secondary btn-editar" data-id="${p.id}">Ver / Editar Nota</button>
                  <button type="button" class="btn btn--danger btn-eliminar" data-id="${p.id}" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding: 0.55rem 0.9rem; border-radius: var(--radius-md); font-weight:600; cursor:pointer;">Retirar</button>
                `}
              </div>
            </div>
          </article>
        `;
  }).join("")}
    </div>
  `;

  document.getElementById("btnNuevaPostulacion")?.addEventListener("click", () => abrirFormulario());

  contenedor.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => abrirFormulario(Number(btn.dataset.id)));
  });

  contenedor.querySelectorAll(".btn-cambiar-estado").forEach((btn) => {
    btn.addEventListener("click", () => abrirModalCambioEstado(Number(btn.dataset.id)));
  });

  contenedor.querySelectorAll(".btn-eliminar").forEach((btn) => {
    const msg = esEmpleador ? "¿Deseas descartar/eliminar esta postulación?" : "¿Deseas retirar tu postulación a esta vacante?";
    btn.addEventListener("click", () => confirmar(msg, () => eliminarPostulacionConfirmada(Number(btn.dataset.id))));
  });
}

async function cargarPostulaciones() {
  mostrarLoading();
  try {
    const data = await getAll("posts");
    const remoto = data.posts ?? (Array.isArray(data) ? data : []);
    const locales = getLocalApplications();
    const merged = [...locales, ...remoto].filter((item, index, arr) =>
      arr.findIndex((x) => String(x.id) === String(item.id)) === index
    );
    postulacionesRaw = merged.filter((p) => !isDeleted("posts", p.id));

    const usuario = getUser();
    const rolActual = getRole();
    const esEmpleadorActual = rolActual === "empleador" || rolActual === "reclutador";
    const visibles = esEmpleadorActual
      ? postulacionesRaw
      : postulacionesRaw.filter((p) => Number(p.userId) === Number(usuario?.id)).slice(0, 8);
    postulacionesAdaptadas = visibles.map((p, idx) => adaptarPostulacion(p, idx));
    renderCards(postulacionesAdaptadas);
  } catch {
    mostrarToast("Error al cargar postulaciones desde DummyJSON.", "error");
  } finally {
    ocultarLoading();
  }
}

function formularioHTML(p = {}) {
  return `
    <div class="form-group">
      <label>Título de la Postulación / Cargo</label>
      <input class="form-control" id="fTitulo" value="${escapeHTML(p.titulo ?? p.title ?? "")}" placeholder="Ej: Postulación a Desarrollador Frontend React" required>
    </div>
    <div class="form-group">
      <label>Notas / Carta de Presentación</label>
      <textarea class="form-control" id="fBody" rows="3" placeholder="Detalles de la postulación y experiencia">${escapeHTML(p.detalle ?? p.body ?? "")}</textarea>
    </div>
    <div class="form-group">
      <label>ID del Candidato (userId)</label>
      <input class="form-control" type="number" id="fUserId" value="${p.userId ?? 1}" placeholder="1">
    </div>
    <div class="form-group">
      <label>Etiquetas (separadas por coma)</label>
      <input class="form-control" id="fTags" value="${escapeHTML((p.tags ?? ["react", "frontend", "remoto"]).join(", "))}" placeholder="react, typescript, remoto">
    </div>
  `;
}

function abrirFormulario(id = null) {
  const post = id ? postulacionesAdaptadas.find((p) => p.id === id) : {};
  const tituloModal = id ? "Editar Postulación" : "Nueva Postulación";

  abrirModal(tituloModal, formularioHTML(post), async () => {
    const datos = {
      title: document.getElementById("fTitulo").value.trim(),
      body: document.getElementById("fBody").value.trim(),
      userId: Number(document.getElementById("fUserId").value) || 1,
      tags: document.getElementById("fTags").value.split(",").map((t) => t.trim()).filter(Boolean),
    };

    if (!datos.title) {
      mostrarToast("El título de la postulación es obligatorio.", "warning");
      return;
    }

    mostrarLoading();
    try {
      if (id) {
        // En /posts se utiliza PATCH (SIN PUT) según el mapeo oficial
        await patch("posts", id, datos);
        const idx = postulacionesAdaptadas.findIndex((p) => p.id === id);
        if (idx !== -1) {
          postulacionesAdaptadas[idx] = { ...postulacionesAdaptadas[idx], ...datos, titulo: datos.title, detalle: datos.body };
        }
        mostrarToast("Postulación actualizada.", "success");
      } else {
        const nueva = await create("posts", datos);
        const registro = { ...datos, ...nueva, id: nueva?.id ?? `local-${Date.now()}` };
        saveLocalApplication(registro);
        const adaptada = adaptarPostulacion(registro, postulacionesAdaptadas.length);
        postulacionesAdaptadas.unshift(adaptada);
        mostrarToast("Postulación registrada con éxito.", "success");
      }
      cerrarModal();
      renderCards(postulacionesAdaptadas);
    } catch {
      mostrarToast("Error al procesar la postulación.", "error");
    } finally {
      ocultarLoading();
    }
  });
}

async function eliminarPostulacionConfirmada(id) {
  const original = postulacionesAdaptadas.find((p) => Number(p.id) === Number(id));
  if (!original) return;

  mostrarLoading();
  try {
    try {
      await remove("posts", id);
    } catch (error) {
      console.warn("DELETE remoto no disponible; se conservará la eliminación local.", error);
    }

    saveDeletedRecord("posts", original);
    postulacionesAdaptadas = postulacionesAdaptadas.filter((p) => Number(p.id) !== Number(id));
    renderCards(postulacionesAdaptadas);

    const notification = addNotification({
      tipo: "eliminacion",
      titulo: "Postulación eliminada",
      detalle: `${original.titulo || "La postulación"} fue retirada. Puedes restaurarla desde el Centro de Notificaciones.`,
      tiempo: "Ahora",
      accion: {
        tipo: "deshacer-eliminacion",
        entidad: "posts",
        id: original.id
      }
    });

    console.debug("Notificación de eliminación creada:", notification.id);
    mostrarToast("Postulación eliminada. Puedes deshacerla desde Notificaciones.", "success", 5000);
  } catch (error) {
    console.error("No se pudo eliminar la postulación:", error);
    mostrarToast("No se pudo eliminar la postulación.", "error");
  } finally {
    ocultarLoading();
  }
}

function abrirModalCambioEstado(id) {
  const post = postulacionesAdaptadas.find((p) => p.id === id);
  if (!post) return;

  const html = `
    <div class="status-picker" id="statusPicker">
      <p class="status-picker__hint">Elegí la etapa del proceso. La barra de avance se actualizará inmediatamente.</p>
      ${ESTADOS_PIPELINE.map(e => `
        <label class="status-option ${post.paso === e.paso ? "is-selected" : ""}" data-status-option>
          <input type="radio" name="nuevoEstado" value="${e.value}" ${post.paso === e.paso ? "checked" : ""}>
          <span class="status-option__icon">${e.icono}</span>
          <span class="status-option__content">
            <strong>${e.titulo}</strong>
            <small>${e.descripcion}</small>
          </span>
          <span class="status-option__check">✓</span>
        </label>
      `).join("")}
    </div>
  `;

  abrirModal(`Actualizar proceso: ${post.titulo}`, html, async () => {
    const selected = document.querySelector('input[name="nuevoEstado"]:checked');
    if (!selected) return;
    const nuevoEstado = selected.value;
    const meta = estadoMeta(nuevoEstado);

    mostrarLoading();
    try {
      await patch("posts", id, { body: `Estado actualizado a: ${nuevoEstado}` });
      const idx = postulacionesAdaptadas.findIndex((p) => p.id === id);
      if (idx !== -1) {
        Object.assign(postulacionesAdaptadas[idx], {
          estado: nuevoEstado,
          paso: meta.paso,
          estadoBg: meta.bg,
          estadoColor: meta.color
        });
      }
      cerrarModal();
      renderCards(postulacionesAdaptadas);
      mostrarToast(`${meta.icono} Proceso actualizado: ${meta.titulo}`, "success");
    } catch {
      mostrarToast("Error al cambiar estado.", "error");
    } finally {
      ocultarLoading();
    }
  });

  document.querySelectorAll("[data-status-option]").forEach(option => {
    option.addEventListener("click", () => {
      document.querySelectorAll("[data-status-option]").forEach(el => el.classList.remove("is-selected"));
      option.classList.add("is-selected");
      option.querySelector('input').checked = true;
    });
  });
}


// ── INICIALIZACIÓN ──────────────────────────────────────────────
cargarPostulaciones();
