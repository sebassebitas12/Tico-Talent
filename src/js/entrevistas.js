// src/js/entrevistas.js
// CRUD Entrevistas / Notas → /comments de DummyJSON

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

let entrevistas = [];

function renderTabla(lista) {
  const contenedor = document.getElementById("interviewsList");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML = `<p class="empty-msg">No hay entrevistas registradas.</p>`;
    return;
  }

  contenedor.innerHTML = `
    <div class="toolbar">
      <button class="btn btn--primary" id="btnNuevo">+ Nueva entrevista</button>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Candidato</th>
          <th>Email</th>
          <th>Nota / Comentario</th>
          <th>Post (vacante)</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map((e) => `
          <tr>
            <td>${e.id}</td>
            <td>${e.user?.fullName ?? e.user ?? "—"}</td>
            <td>${e.user?.email ?? "—"}</td>
            <td>${e.body?.substring(0, 60)}...</td>
            <td>${e.postId}</td>
            <td class="actions">
              <button class="btn btn--sm btn--secondary" onclick="editarEntrevista(${e.id})">✏️ Editar</button>
              <button class="btn btn--sm btn--danger"    onclick="eliminarEntrevista(${e.id})">🗑️ Eliminar</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  document.getElementById("btnNuevo")?.addEventListener("click", () => abrirFormulario());
}

async function cargarEntrevistas() {
  mostrarLoading();
  try {
    const data = await getAll("comments");
    entrevistas = data.comments ?? data;
    renderTabla(entrevistas);
  } catch {
    mostrarToast("Error al cargar entrevistas.", "error");
  } finally {
    ocultarLoading();
  }
}

function formularioHTML(e = {}) {
  return `
    <div class="form-group">
      <label>ID de vacante (postId)</label>
      <input class="form-control" type="number" id="fPostId" value="${e.postId ?? ""}" placeholder="1" required>
    </div>
    <div class="form-group">
      <label>Nombre del candidato</label>
      <input class="form-control" id="fNombre" value="${e.user?.fullName ?? ""}" placeholder="Nombre completo">
    </div>
    <div class="form-group">
      <label>Email del candidato</label>
      <input class="form-control" type="email" id="fEmail" value="${e.user?.email ?? ""}" placeholder="correo@ejemplo.com">
    </div>
    <div class="form-group">
      <label>Nota / Observaciones</label>
      <textarea class="form-control" id="fBody" rows="4" placeholder="Anotaciones de la entrevista...">${e.body ?? ""}</textarea>
    </div>
  `;
}

function abrirFormulario(id = null) {
  const entrevista = id ? entrevistas.find((e) => e.id === id) : {};
  const titulo     = id ? "Editar entrevista" : "Nueva entrevista";

  abrirModal(titulo, formularioHTML(entrevista), async () => {
    const datos = {
      postId: Number(document.getElementById("fPostId").value),
      body:   document.getElementById("fBody").value.trim(),
      user: {
        fullName: document.getElementById("fNombre").value.trim(),
        email:    document.getElementById("fEmail").value.trim(),
      },
    };

    if (!datos.postId || !datos.body) {
      mostrarToast("ID de vacante y nota son obligatorios.", "warning");
      return;
    }

    mostrarLoading();
    try {
      if (id) {
        await patch("comments", id, datos);
        mostrarToast("Entrevista actualizada.", "success");
      } else {
        await create("comments", datos);
        mostrarToast("Entrevista registrada.", "success");
      }
      cerrarModal();
      await cargarEntrevistas();
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
    mostrarToast("Entrevista eliminada.", "success");
    await cargarEntrevistas();
  } catch {
    mostrarToast("Error al eliminar.", "error");
  } finally {
    ocultarLoading();
  }
}

window.editarEntrevista   = (id) => abrirFormulario(id);
window.eliminarEntrevista = (id) => confirmar("¿Eliminar esta entrevista?", () => eliminarEntrevistaConfirmada(id));

cargarEntrevistas();