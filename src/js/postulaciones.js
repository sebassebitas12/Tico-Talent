// src/js/postulaciones.js
// CRUD Postulaciones → /posts de DummyJSON

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

let postulaciones = [];

const ESTADOS = ["Recibida", "En revisión", "Entrevista", "Oferta", "Rechazada"];

function renderTabla(lista) {
  const contenedor = document.getElementById("applicationsList");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML = `<p class="empty-msg">No hay postulaciones registradas.</p>`;
    return;
  }

  contenedor.innerHTML = `
    <div class="toolbar">
      <button class="btn btn--primary" id="btnNuevo">+ Nueva postulación</button>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Título</th>
          <th>Candidato (userId)</th>
          <th>Estado</th>
          <th>Reacciones</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map((p) => `
          <tr>
            <td>${p.id}</td>
            <td>${p.title}</td>
            <td>${p.userId}</td>
            <td><span class="badge">${p.tags?.[0] ?? "Recibida"}</span></td>
            <td>👍${p.reactions?.likes ?? 0}</td>
            <td class="actions">
              <button class="btn btn--sm btn--secondary" onclick="editarPostulacion(${p.id})">✏️ Editar</button>
              <button class="btn btn--sm btn--danger"    onclick="eliminarPostulacion(${p.id})">🗑️ Eliminar</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  document.getElementById("btnNuevo")?.addEventListener("click", () => abrirFormulario());
}

async function cargarPostulaciones() {
  mostrarLoading();
  try {
    const data = await getAll("posts");
    postulaciones = data.posts ?? data;
    renderTabla(postulaciones);
  } catch {
    mostrarToast("Error al cargar postulaciones.", "error");
  } finally {
    ocultarLoading();
  }
}

function formularioHTML(p = {}) {
  const estadoActual = p.tags?.[0] ?? "Recibida";
  return `
    <div class="form-group">
      <label>Título / Vacante</label>
      <input class="form-control" id="fTitulo" value="${p.title ?? ""}" placeholder="Ej: Postulación para Desarrollador" required>
    </div>
    <div class="form-group">
      <label>Cuerpo / Descripción</label>
      <textarea class="form-control" id="fBody" rows="3" placeholder="Detalles de la postulación...">${p.body ?? ""}</textarea>
    </div>
    <div class="form-group">
      <label>ID del candidato (userId)</label>
      <input class="form-control" type="number" id="fUserId" value="${p.userId ?? ""}" placeholder="1">
    </div>
    <div class="form-group">
      <label>Estado</label>
      <select class="form-control" id="fEstado">
        ${ESTADOS.map((e) => `<option value="${e}" ${e === estadoActual ? "selected" : ""}>${e}</option>`).join("")}
      </select>
    </div>
  `;
}

function abrirFormulario(id = null) {
  const post   = id ? postulaciones.find((p) => p.id === id) : {};
  const titulo = id ? "Editar postulación" : "Nueva postulación";

  abrirModal(titulo, formularioHTML(post), async () => {
    const datos = {
      title:  document.getElementById("fTitulo").value.trim(),
      body:   document.getElementById("fBody").value.trim(),
      userId: Number(document.getElementById("fUserId").value),
      tags:   [document.getElementById("fEstado").value],
    };

    if (!datos.title) {
      mostrarToast("El título es obligatorio.", "warning");
      return;
    }

    mostrarLoading();
    try {
      if (id) {
        await patch("posts", id, datos);
        mostrarToast("Postulación actualizada.", "success");
      } else {
        await create("posts", datos);
        mostrarToast("Postulación creada.", "success");
      }
      cerrarModal();
      await cargarPostulaciones();
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
    mostrarToast("Postulación eliminada.", "success");
    await cargarPostulaciones();
  } catch {
    mostrarToast("Error al eliminar.", "error");
  } finally {
    ocultarLoading();
  }
}

window.editarPostulacion   = (id) => abrirFormulario(id);
window.eliminarPostulacion = (id) => confirmar("¿Eliminar esta postulación?", () => eliminarPostulacionConfirmada(id));

cargarPostulaciones();