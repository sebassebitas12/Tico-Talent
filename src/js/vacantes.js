// src/js/vacantes.js
// CRUD Vacantes → /products de DummyJSON

import { requireAuth, getUser, logout } from "./auth.js";
import { getAll, create, update, remove } from "./dummyapi.js";
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

let vacantes = [];

function renderTabla(lista) {
  const contenedor = document.getElementById("vacantesList");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML = `<p class="empty-msg">No hay vacantes registradas.</p>`;
    return;
  }

  contenedor.innerHTML = `
    <div class="toolbar">
      <button class="btn btn--primary" id="btnNuevo">+ Nueva vacante</button>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Título</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map((v) => `
          <tr>
            <td>${v.id}</td>
            <td>${v.title}</td>
            <td>${v.category}</td>
            <td>₡${v.price}</td>
            <td>${v.stock}</td>
            <td class="actions">
              <button class="btn btn--sm btn--secondary" onclick="editarVacante(${v.id})">✏️ Editar</button>
              <button class="btn btn--sm btn--danger"    onclick="eliminarVacante(${v.id})">🗑️ Eliminar</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  document.getElementById("btnNuevo")?.addEventListener("click", () => abrirFormulario());
}

async function cargarVacantes() {
  mostrarLoading();
  try {
    const data = await getAll("products");
    vacantes = data.products ?? data;
    renderTabla(vacantes);
  } catch {
    mostrarToast("Error al cargar vacantes.", "error");
  } finally {
    ocultarLoading();
  }
}

function formularioHTML(v = {}) {
  return `
    <div class="form-group">
      <label>Título del puesto</label>
      <input class="form-control" id="fTitulo" value="${v.title ?? ""}" placeholder="Ej: Desarrollador Frontend" required>
    </div>
    <div class="form-group">
      <label>Categoría</label>
      <input class="form-control" id="fCategoria" value="${v.category ?? ""}" placeholder="Ej: Tecnología">
    </div>
    <div class="form-group">
      <label>Salario (₡)</label>
      <input class="form-control" type="number" id="fPrecio" value="${v.price ?? ""}" placeholder="800000">
    </div>
    <div class="form-group">
      <label>Plazas disponibles</label>
      <input class="form-control" type="number" id="fStock" value="${v.stock ?? ""}" placeholder="1">
    </div>
    <div class="form-group">
      <label>Descripción</label>
      <textarea class="form-control" id="fDescripcion" rows="3" placeholder="Descripción del puesto...">${v.description ?? ""}</textarea>
    </div>
  `;
}

function abrirFormulario(id = null) {
  const vacante = id ? vacantes.find((v) => v.id === id) : {};
  const titulo  = id ? "Editar vacante" : "Nueva vacante";

  abrirModal(titulo, formularioHTML(vacante), async () => {
    const datos = {
      title:       document.getElementById("fTitulo").value.trim(),
      category:    document.getElementById("fCategoria").value.trim(),
      price:       Number(document.getElementById("fPrecio").value),
      stock:       Number(document.getElementById("fStock").value),
      description: document.getElementById("fDescripcion").value.trim(),
    };

    if (!datos.title) {
      mostrarToast("El título es obligatorio.", "warning");
      return;
    }

    mostrarLoading();
    try {
      if (id) {
        await update("products", id, datos);
        mostrarToast("Vacante actualizada.", "success");
      } else {
        await create("products", datos);
        mostrarToast("Vacante creada.", "success");
      }
      cerrarModal();
      await cargarVacantes();
    } catch {
      mostrarToast("Error al guardar.", "error");
    } finally {
      ocultarLoading();
    }
  });
}

async function eliminarVacanteConfirmada(id) {
  mostrarLoading();
  try {
    await remove("products", id);
    mostrarToast("Vacante eliminada.", "success");
    await cargarVacantes();
  } catch {
    mostrarToast("Error al eliminar.", "error");
  } finally {
    ocultarLoading();
  }
}

window.editarVacante   = (id) => abrirFormulario(id);
window.eliminarVacante = (id) => confirmar("¿Eliminar esta vacante?", () => eliminarVacanteConfirmada(id));

cargarVacantes();
