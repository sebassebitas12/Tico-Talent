// src/js/candidatos.js
// Módulo CRUD de Candidatos → mapea /users de DummyJSON
// RF-05 al RF-10

import { requireAuth, getUser, logout } from "./auth.js";
import { getAll, getById, create, update, remove } from "./dummyapi.js";
import { mostrarToast, mostrarLoading, ocultarLoading, abrirModal, cerrarModal, confirmar } from "./ui.js";

requireAuth();

// ── Inicialización de usuario en el header ────────────────────
const user = getUser();
if (user) {
  const nameEl = document.getElementById("userName");
  const roleEl = document.getElementById("userRole");
  if (nameEl) nameEl.textContent = `${user.firstName} ${user.lastName}`;
  if (roleEl) roleEl.textContent = user.email;
}
document.getElementById("btnLogout")?.addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

// ── Estado ────────────────────────────────────────────────────
let candidatos = [];

// ── Render de tabla ───────────────────────────────────────────
function renderTabla(lista) {
  const contenedor = document.getElementById("candidatesList");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML = `<p class="empty-msg">No hay candidatos registrados.</p>`;
    return;
  }

  contenedor.innerHTML = `
    <div class="toolbar">
      <button class="btn btn--primary" id="btnNuevo">+ Nuevo candidato</button>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Usuario</th>
          <th>Email</th>
          <th>Teléfono</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map((c) => `
          <tr>
            <td>${c.id}</td>
            <td>${c.firstName} ${c.lastName}</td>
            <td>${c.username}</td>
            <td>${c.email}</td>
            <td>${c.phone}</td>
            <td class="actions">
              <button class="btn btn--sm btn--secondary" onclick="editarCandidato(${c.id})">✏️ Editar</button>
              <button class="btn btn--sm btn--danger"    onclick="eliminarCandidato(${c.id})">🗑️ Eliminar</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  document.getElementById("btnNuevo")?.addEventListener("click", () => abrirFormulario());
}

// ── Cargar candidatos ─────────────────────────────────────────
async function cargarCandidatos() {
  mostrarLoading();
  try {
    const data = await getAll("users");
    // DummyJSON devuelve { users: [...] }
    candidatos = data.users ?? data;
    renderTabla(candidatos);
  } catch {
    mostrarToast("Error al cargar candidatos.", "error");
  } finally {
    ocultarLoading();
  }
}

// ── Formulario (crear / editar) ───────────────────────────────
function formularioHTML(c = {}) {
  return `
    <div class="form-group">
      <label>Nombre</label>
      <input class="form-control" id="fNombre" value="${c.firstName ?? ""}" placeholder="Nombre" required>
    </div>
    <div class="form-group">
      <label>Apellido</label>
      <input class="form-control" id="fApellido" value="${c.lastName ?? ""}" placeholder="Apellido" required>
    </div>
    <div class="form-group">
      <label>Usuario</label>
      <input class="form-control" id="fUsername" value="${c.username ?? ""}" placeholder="usuario123" required>
    </div>
    <div class="form-group">
      <label>Email</label>
      <input class="form-control" type="email" id="fEmail" value="${c.email ?? ""}" placeholder="correo@ejemplo.com" required>
    </div>
    <div class="form-group">
      <label>Teléfono</label>
      <input class="form-control" id="fTelefono" value="${c.phone ?? ""}" placeholder="+506 1234-5678">
    </div>
  `;
}

function abrirFormulario(id = null) {
  const candidato = id ? candidatos.find((c) => c.id === id) : {};
  const titulo    = id ? "Editar candidato" : "Nuevo candidato";

  abrirModal(titulo, formularioHTML(candidato), async () => {
    const datos = {
      firstName: document.getElementById("fNombre").value.trim(),
      lastName:  document.getElementById("fApellido").value.trim(),
      username:  document.getElementById("fUsername").value.trim(),
      email:     document.getElementById("fEmail").value.trim(),
      phone:     document.getElementById("fTelefono").value.trim(),
    };

    if (!datos.firstName || !datos.email) {
      mostrarToast("Nombre y email son obligatorios.", "warning");
      return;
    }

    mostrarLoading();
    try {
      if (id) {
        await update("users", id, datos);
        mostrarToast("Candidato actualizado.", "success");
      } else {
        await create("users", datos);
        mostrarToast("Candidato creado.", "success");
      }
      cerrarModal();
      await cargarCandidatos();
    } catch {
      mostrarToast("Error al guardar.", "error");
    } finally {
      ocultarLoading();
    }
  });
}

// ── Eliminar ──────────────────────────────────────────────────
async function eliminarCandidatoConfirmado(id) {
  mostrarLoading();
  try {
    await remove("users", id);
    mostrarToast("Candidato eliminado.", "success");
    await cargarCandidatos();
  } catch {
    mostrarToast("Error al eliminar.", "error");
  } finally {
    ocultarLoading();
  }
}

// Exponer globalmente para los onclick en la tabla
window.editarCandidato   = (id) => abrirFormulario(id);
window.eliminarCandidato = (id) =>
  confirmar("¿Eliminar este candidato?", () => eliminarCandidatoConfirmado(id));

// ── Arranque ──────────────────────────────────────────────────
cargarCandidatos();