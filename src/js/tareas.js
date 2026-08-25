// src/js/tareas.js
// CRUD Tareas del reclutador → /todos de DummyJSON

import { requireAuth, getUser, logout } from "./auth.js";
import { getAll, create, patch, remove } from "./dummyapi.js";
import { mostrarToast, mostrarLoading, ocultarLoading, abrirModal, cerrarModal, confirmar } from "./ui.js";

requireAuth();

const user = getUser();
if (user) {
  document.getElementById("userName").textContent = `${user.firstName} ${user.lastName}`;
  document.getElementById("userRole").textContent = user.email;
}
document.getElementById("btnLogout")?.addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

let tareas = [];

function renderTabla(lista) {
  const contenedor = document.getElementById("tasksList");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML = `<p class="empty-msg">No hay tareas registradas.</p>`;
    return;
  }

  const pendientes = lista.filter((t) => !t.completed).length;

  contenedor.innerHTML = `
    <div class="toolbar">
      <button class="btn btn--primary" id="btnNuevo">+ Nueva tarea</button>
      <span class="toolbar__info">${pendientes} pendiente${pendientes !== 1 ? "s" : ""}</span>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Tarea</th>
          <th>Responsable (userId)</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map((t) => `
          <tr class="${t.completed ? "row--done" : ""}">
            <td>${t.id}</td>
            <td>${t.todo}</td>
            <td>${t.userId}</td>
            <td>
              <span class="badge badge--${t.completed ? "success" : "warning"}">
                ${t.completed ? "✅ Completada" : "⏳ Pendiente"}
              </span>
            </td>
            <td class="actions">
              <button class="btn btn--sm btn--secondary" onclick="editarTarea(${t.id})">✏️ Editar</button>
              <button class="btn btn--sm btn--${t.completed ? "warning" : "success"}"
                onclick="toggleTarea(${t.id}, ${t.completed})">
                ${t.completed ? "↩️ Reabrir" : "✔️ Completar"}
              </button>
              <button class="btn btn--sm btn--danger" onclick="eliminarTarea(${t.id})">🗑️ Eliminar</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  document.getElementById("btnNuevo")?.addEventListener("click", () => abrirFormulario());
}

async function cargarTareas() {
  mostrarLoading();
  try {
    const data = await getAll("todos");
    tareas = data.todos ?? data;
    renderTabla(tareas);
  } catch {
    mostrarToast("Error al cargar tareas.", "error");
  } finally {
    ocultarLoading();
  }
}

function formularioHTML(t = {}) {
  return `
    <div class="form-group">
      <label>Descripción de la tarea</label>
      <input class="form-control" id="fTodo" value="${t.todo ?? ""}" placeholder="Ej: Llamar a candidato Juan" required>
    </div>
    <div class="form-group">
      <label>Responsable (userId)</label>
      <input class="form-control" type="number" id="fUserId" value="${t.userId ?? ""}" placeholder="1">
    </div>
    <div class="form-group">
      <label>Estado</label>
      <select class="form-control" id="fCompletado">
        <option value="false" ${!t.completed ? "selected" : ""}>⏳ Pendiente</option>
        <option value="true"  ${t.completed  ? "selected" : ""}>✅ Completada</option>
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
      mostrarToast("La descripción es obligatoria.", "warning");
      return;
    }

    mostrarLoading();
    try {
      if (id) {
        await patch("todos", id, datos);
        mostrarToast("Tarea actualizada.", "success");
      } else {
        await create("todos", datos);
        mostrarToast("Tarea creada.", "success");
      }
      cerrarModal();
      await cargarTareas();
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
    mostrarToast(completadoActual ? "Tarea reabierta." : "Tarea completada. ✅", "success");
    await cargarTareas();
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
    mostrarToast("Tarea eliminada.", "success");
    await cargarTareas();
  } catch {
    mostrarToast("Error al eliminar.", "error");
  } finally {
    ocultarLoading();
  }
}

window.editarTarea    = (id) => abrirFormulario(id);
window.toggleTarea    = (id, completado) => toggleTareaEstado(id, completado);
window.eliminarTarea  = (id) => confirmar("¿Eliminar esta tarea?", () => eliminarTareaConfirmada(id));

cargarTareas();