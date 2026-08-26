// src/js/tareas.js
// CRUD Tareas del reclutador -> /todos de DummyJSON

import { requireAuth } from "./auth.js";
import { getAll, create, patch, remove } from "./dummyapi.js";
import { mostrarToast, mostrarLoading, ocultarLoading, abrirModal, cerrarModal, confirmar, escapeHTML, renderNavbar } from "./ui.js";

requireAuth();
renderNavbar("tareas");

let tareas = [];

function renderCards(lista) {
  const contenedor = document.getElementById("tasksList");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; background: var(--surface-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <p style="color: var(--text-muted); margin-bottom: 1rem;">No hay tareas pendientes.</p>
        <button class="btn btn-cta" id="btnNuevaEmpty">+ Crear primera tarea</button>
      </div>
    `;
    document.getElementById("btnNuevaEmpty")?.addEventListener("click", () => abrirFormulario());
    return;
  }

  const pendientes = lista.filter((t) => !t.completed).length;

  contenedor.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; width: 100%;">
      <span style="font-size: 0.95rem; color: var(--text-muted);">
        Pendientes: <strong style="color: var(--action-pink);">${pendientes}</strong> de ${lista.length} tareas totales
      </span>
      <button class="btn btn-cta" id="btnNuevaTarea">+ Nueva Tarea</button>
    </div>
    <div class="job-list" style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
      ${lista.map((t) => {
        const badgeBg = t.completed ? "#E6F6EE" : "#fff3e0";
        const badgeColor = t.completed ? "var(--color-success)" : "#e65100";
        const badgeBorder = t.completed ? "rgba(0, 163, 92, 0.2)" : "#ffe0b2";
        const badgeText = t.completed ? "Completada" : "Pendiente";

        return `
          <article class="job-card" style="${t.completed ? "opacity: 0.85; border-left: 4px solid var(--color-success);" : "border-left: 4px solid var(--action-pink);"}">
            <div class="job-card__header">
              <div class="job-card__company-logo">TA</div>
              <div class="job-card__title-area">
                <h3 class="job-card__title" style="${t.completed ? "text-decoration: line-through; color: var(--text-muted);" : ""}">${escapeHTML(t.todo)}</h3>
                <div class="job-card__company-name">
                  <span>Asignado a: Usuario #${t.userId}</span> - <span>Prioridad ${t.completed ? "Baja" : "Alta"}</span>
                </div>
              </div>
              <span class="badge-match" style="background-color: ${badgeBg}; color: ${badgeColor}; border-color: ${badgeBorder};">${badgeText}</span>
            </div>

            <div class="job-card__details">
              <span class="job-tag">Vencimiento: Proximamente</span>
              <span class="job-tag">Tarea #${t.id}</span>
              <span class="job-tag">Reclutamiento Tico Talent</span>
            </div>

            <div class="job-card__footer">
              <div>
                <span class="job-card__date">${t.completed ? "Estado: Resuelta" : "Estado: En seguimiento activo"}</span>
              </div>
              <div class="job-card__actions" style="display: flex; gap: 0.5rem; align-items: center;">
                <button type="button" class="btn ${t.completed ? "btn--secondary" : "btn--cta"} btn-toggle" data-id="${t.id}" data-completed="${t.completed}">
                  ${t.completed ? "Reabrir" : "Completar Tarea"}
                </button>
                <button type="button" class="btn btn--secondary btn-editar" data-id="${t.id}">Editar</button>
                <button type="button" class="btn btn--danger btn-eliminar" data-id="${t.id}">Eliminar</button>
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;

  document.getElementById("btnNuevaTarea")?.addEventListener("click", () => abrirFormulario());

  contenedor.querySelectorAll(".btn-toggle").forEach(btn => {
    btn.addEventListener("click", () => toggleTareaEstado(Number(btn.dataset.id), btn.dataset.completed === "true"));
  });
  contenedor.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", () => abrirFormulario(Number(btn.dataset.id)));
  });
  contenedor.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", () => confirmar("Eliminar esta tarea?", () => eliminarTareaConfirmada(Number(btn.dataset.id))));
  });
}

async function cargarTareas() {
  mostrarLoading();
  try {
    const data = await getAll("todos");
    tareas = data.todos ?? (Array.isArray(data) ? data : []);
    renderCards(tareas);
  } catch {
    mostrarToast("Error al cargar tareas.", "error");
  } finally {
    ocultarLoading();
  }
}

function formularioHTML(t = {}) {
  return `
    <div class="form-group">
      <label>Descripcion de la tarea</label>
      <input class="form-control" id="fTodo" value="${escapeHTML(t.todo ?? "")}" placeholder="Ej: Llamar a candidato Juan para entrevista tecnica" required>
    </div>
    <div class="form-group">
      <label>ID Usuario / Responsable</label>
      <input class="form-control" type="number" id="fUserId" value="${t.userId ?? 1}" placeholder="1">
    </div>
    <div class="form-group">
      <label>Estado</label>
      <select class="form-control" id="fCompletado">
        <option value="false" ${!t.completed ? "selected" : ""}>Pendiente</option>
        <option value="true"  ${t.completed  ? "selected" : ""}>Completada</option>
      </select>
    </div>
  `;
}

function abrirFormulario(id = null) {
  const tarea  = id ? tareas.find((t) => t.id === id) : {};
  const titulo = id ? "Editar tarea" : "Nueva tarea";

  abrirModal(titulo, formularioHTML(tarea), async () => {
    const datos = {
      todo:      document.getElementById("fTodo").value.trim(),
      userId:    Number(document.getElementById("fUserId").value),
      completed: document.getElementById("fCompletado").value === "true",
    };

    if (!datos.todo) {
      mostrarToast("La descripcion es obligatoria.", "warning");
      return;
    }

    mostrarLoading();
    try {
      if (id) {
        await patch("todos", id, datos);
        const idx = tareas.findIndex((t) => t.id === id);
        if (idx !== -1) tareas[idx] = { ...tareas[idx], ...datos };
        mostrarToast("Tarea actualizada.", "success");
      } else {
        const nueva = await create("todos", datos);
        tareas.unshift({ ...nueva, ...datos, id: Date.now() });
        mostrarToast("Tarea creada.", "success");
      }
      cerrarModal();
      renderCards(tareas);
    } catch {
      mostrarToast("Error al guardar.", "error");
    } finally {
      ocultarLoading();
    }
  });
}

async function toggleTareaEstado(id, completadoActual) {
  mostrarLoading();
  try {
    await patch("todos", id, { completed: !completadoActual });
    const idx = tareas.findIndex((t) => t.id === id);
    if (idx !== -1) tareas[idx].completed = !completadoActual;
    mostrarToast(completadoActual ? "Tarea reabierta." : "Tarea completada con exito!", "success");
    renderCards(tareas);
  } catch {
    mostrarToast("Error al actualizar estado.", "error");
  } finally {
    ocultarLoading();
  }
}

async function eliminarTareaConfirmada(id) {
  mostrarLoading();
  try {
    await remove("todos", id);
    tareas = tareas.filter((t) => t.id !== id);
    mostrarToast("Tarea eliminada.", "success");
    renderCards(tareas);
  } catch {
    mostrarToast("Error al eliminar.", "error");
  } finally {
    ocultarLoading();
  }
}

cargarTareas();
