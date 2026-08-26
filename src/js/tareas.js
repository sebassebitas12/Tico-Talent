// src/js/tareas.js
// CRUD Tareas Reclutador → /todos de DummyJSON (GET, POST, PATCH, DELETE — SIN PUT)
// RF-05 al RF-10

import { requireAuth, getRole } from "./auth.js";
import { getAll, create, patch, remove } from "./dummyapi.js";
import { adaptarTarea } from "./adapters.js";
import { mostrarToast, mostrarLoading, ocultarLoading, abrirModal, cerrarModal, confirmar, escapeHTML, initUserNav } from "./ui.js";

requireAuth();
initUserNav();

let tareasRaw = [];
let tareasAdaptadas = [];

function renderCards(lista) {
  const contenedor = document.getElementById("tasksList");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; background: var(--surface-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <p style="color: var(--text-muted); margin-bottom: 1rem;">No hay tareas pendientes en el pipeline.</p>
        <button class="btn btn-cta" id="btnNuevaEmpty">+ Crear primera tarea</button>
      </div>
    `;
    document.getElementById("btnNuevaEmpty")?.addEventListener("click", () => abrirFormulario());
    return;
  }

  const completadas = lista.filter(t => t.completada).length;

  contenedor.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; width: 100%; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin: 0;">Tareas & Pipeline de Reclutamiento</h2>
        <span style="font-size: 0.9rem; color: var(--text-muted);">Progreso: <strong>${completadas}/${lista.length}</strong> tareas completadas</span>
      </div>
      <button class="btn btn-cta" id="btnNuevaTarea">+ Nueva Tarea</button>
    </div>

    <div class="job-list" style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
      ${lista.map((t) => {
        return `
          <article class="job-card" data-id="${t.id}" style="${t.completada ? "opacity: 0.75; background: var(--surface-subtle);" : ""}">
            <div class="job-card__header">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <input type="checkbox" class="task-checkbox" data-id="${t.id}" ${t.completada ? "checked" : ""} style="width: 22px; height: 22px; cursor: pointer; accent-color: var(--primary-purple);">
                <div class="job-card__title-area">
                  <h3 class="job-card__title" style="${t.completada ? "text-decoration: line-through; color: var(--text-muted);" : ""}">${escapeHTML(t.descripcion)}</h3>
                  <div class="job-card__company-name">
                    <span>Categoría: ${escapeHTML(t.categoria)}</span> • <span>Fecha límite: ${t.fechaLimite}</span>
                  </div>
                </div>
              </div>
              <span class="badge-match" style="background-color: ${t.prioridadBg}; color: ${t.prioridadColor};">
                ${t.prioridad}
              </span>
            </div>

            <div class="job-card__footer" style="margin-top: 0.75rem;">
              <div>
                <span class="job-tag" style="background: ${t.completada ? "#dcfce7" : "#fef3c7"}; color: ${t.completada ? "#16a34a" : "#d97706"}; font-weight: 600;">
                  ${t.completada ? "✅ Completada" : "⏳ Pendiente"}
                </span>
                <span class="job-tag">👤 Responsable ID: #${t.userId}</span>
              </div>
              <div class="job-card__actions" style="display: flex; gap: 0.5rem;">
                <button type="button" class="btn btn-secondary btn-editar" data-id="${t.id}">✏️ Editar</button>
                <button type="button" class="btn btn--danger btn-eliminar" data-id="${t.id}" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding: 0.55rem 0.8rem; border-radius: var(--radius-md); font-weight:600; cursor:pointer;">🗑️</button>
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;

  document.getElementById("btnNuevaTarea")?.addEventListener("click", () => abrirFormulario());

  contenedor.querySelectorAll(".task-checkbox").forEach((cb) => {
    cb.addEventListener("change", () => toggleTareaEstado(Number(cb.dataset.id), !cb.checked));
  });

  contenedor.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => abrirFormulario(Number(btn.dataset.id)));
  });

  contenedor.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", () => confirmar("¿Eliminar esta tarea?", () => eliminarTareaConfirmada(Number(btn.dataset.id))));
  });
}

async function cargarTareas() {
  mostrarLoading();
  try {
    const data = await getAll("todos");
    tareasRaw = data.todos ?? (Array.isArray(data) ? data : []);
    tareasAdaptadas = tareasRaw.map((t, idx) => adaptarTarea(t, idx));
    renderCards(tareasAdaptadas);
  } catch {
    mostrarToast("Error al cargar tareas desde DummyJSON.", "error");
  } finally {
    ocultarLoading();
  }
}

function formularioHTML(t = {}) {
  return `
    <div class="form-group">
      <label>Descripción de la Tarea</label>
      <input class="form-control" id="fTodo" value="${escapeHTML(t.descripcion ?? t.todo ?? "")}" placeholder="Ej: Revisar CV técnico y validar referencias" required>
    </div>
    <div class="form-group">
      <label>ID Usuario / Responsable</label>
      <input class="form-control" type="number" id="fUserId" value="${t.userId ?? 1}" placeholder="1">
    </div>
    <div class="form-group">
      <label>Estado</label>
      <select class="form-control" id="fCompletado">
        <option value="false" ${!t.completada ? "selected" : ""}>⏳ Pendiente</option>
        <option value="true"  ${t.completada  ? "selected" : ""}>✅ Completada</option>
      </select>
    </div>
  `;
}

function abrirFormulario(id = null) {
  const tarea = id ? tareasAdaptadas.find((t) => t.id === id) : {};
  const titulo = id ? "Editar Tarea" : "Nueva Tarea";

  abrirModal(titulo, formularioHTML(tarea), async () => {
    const datos = {
      todo:      document.getElementById("fTodo").value.trim(),
      userId:    Number(document.getElementById("fUserId").value) || 1,
      completed: document.getElementById("fCompletado").value === "true",
    };

    if (!datos.todo) {
      mostrarToast("La descripción es obligatoria.", "warning");
      return;
    }

    mostrarLoading();
    try {
      if (id) {
        // En /todos se usa PATCH (SIN PUT)
        await patch("todos", id, datos);
        const idx = tareasAdaptadas.findIndex((t) => t.id === id);
        if (idx !== -1) {
          tareasAdaptadas[idx] = { ...tareasAdaptadas[idx], ...datos, descripcion: datos.todo, completada: datos.completed };
        }
        mostrarToast("Tarea actualizada.", "success");
      } else {
        const nueva = await create("todos", datos);
        const adaptada = adaptarTarea({ ...nueva, ...datos, id: Date.now() });
        tareasAdaptadas.unshift(adaptada);
        mostrarToast("Tarea creada con éxito.", "success");
      }
      cerrarModal();
      renderCards(tareasAdaptadas);
    } catch {
      mostrarToast("Error al guardar tarea.", "error");
    } finally {
      ocultarLoading();
    }
  });
}

async function toggleTareaEstado(id, completadoActual) {
  mostrarLoading();
  try {
    await patch("todos", id, { completed: !completadoActual });
    const idx = tareasAdaptadas.findIndex((t) => t.id === id);
    if (idx !== -1) tareasAdaptadas[idx].completada = !completadoActual;
    mostrarToast(!completadoActual ? "¡Tarea completada con éxito! ✅" : "Tarea reabierta.", "success");
    renderCards(tareasAdaptadas);
  } catch {
    mostrarToast("Error al actualizar estado de la tarea.", "error");
  } finally {
    ocultarLoading();
  }
}

async function eliminarTareaConfirmada(id) {
  mostrarLoading();
  try {
    await remove("todos", id);
    tareasAdaptadas = tareasAdaptadas.filter((t) => t.id !== id);
    mostrarToast("Tarea eliminada.", "success");
    renderCards(tareasAdaptadas);
  } catch {
    mostrarToast("Error al eliminar.", "error");
  } finally {
    ocultarLoading();
  }
}

cargarTareas();
