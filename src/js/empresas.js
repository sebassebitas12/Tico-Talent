// src/js/empresas.js
// CRUD Empresas Clientes → /carts de DummyJSON

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

let empresas = [];

function renderTabla(lista) {
  const contenedor = document.getElementById("companiesList");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML = `<p class="empty-msg">No hay empresas registradas.</p>`;
    return;
  }

  contenedor.innerHTML = `
    <div class="toolbar">
      <button class="btn btn--primary" id="btnNuevo">+ Nueva empresa</button>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>ID Empresa (userId)</th>
          <th>Total productos</th>
          <th>Total (₡)</th>
          <th>Descuento</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map((e) => `
          <tr>
            <td>${e.id}</td>
            <td>${e.userId}</td>
            <td>${e.totalProducts}</td>
            <td>₡${e.total}</td>
            <td>${e.discountedTotal}</td>
            <td class="actions">
              <button class="btn btn--sm btn--secondary" onclick="editarEmpresa(${e.id})">✏️ Editar</button>
              <button class="btn btn--sm btn--danger"    onclick="eliminarEmpresa(${e.id})">🗑️ Eliminar</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  document.getElementById("btnNuevo")?.addEventListener("click", () => abrirFormulario());
}

async function cargarEmpresas() {
  mostrarLoading();
  try {
    const data = await getAll("carts");
    empresas = data.carts ?? data;
    renderTabla(empresas);
  } catch {
    mostrarToast("Error al cargar empresas.", "error");
  } finally {
    ocultarLoading();
  }
}

function formularioHTML(e = {}) {
  return `
    <div class="form-group">
      <label>ID de empresa (userId)</label>
      <input class="form-control" type="number" id="fUserId" value="${e.userId ?? ""}" placeholder="1" required>
    </div>
    <div class="form-group">
      <label>Total de servicios contratados</label>
      <input class="form-control" type="number" id="fTotal" value="${e.total ?? ""}" placeholder="0">
    </div>
    <div class="form-group">
      <label>Descuento aplicado</label>
      <input class="form-control" type="number" id="fDescuento" value="${e.discountedTotal ?? ""}" placeholder="0">
    </div>
  `;
}

function abrirFormulario(id = null) {
  const empresa = id ? empresas.find((e) => e.id === id) : {};
  const titulo  = id ? "Editar empresa" : "Nueva empresa";

  abrirModal(titulo, formularioHTML(empresa), async () => {
    const datos = {
      userId:          Number(document.getElementById("fUserId").value),
      total:           Number(document.getElementById("fTotal").value),
      discountedTotal: Number(document.getElementById("fDescuento").value),
    };

    if (!datos.userId) {
      mostrarToast("El ID de empresa es obligatorio.", "warning");
      return;
    }

    mostrarLoading();
    try {
      if (id) {
        await update("carts", id, datos);
        mostrarToast("Empresa actualizada.", "success");
      } else {
        await create("carts", datos);
        mostrarToast("Empresa creada.", "success");
      }
      cerrarModal();
      await cargarEmpresas();
    } catch {
      mostrarToast("Error al guardar.", "error");
    } finally {
      ocultarLoading();
    }
  });
}

async function eliminarEmpresaConfirmada(id) {
  mostrarLoading();
  try {
    await remove("carts", id);
    mostrarToast("Empresa eliminada.", "success");
    await cargarEmpresas();
  } catch {
    mostrarToast("Error al eliminar.", "error");
  } finally {
    ocultarLoading();
  }
}

window.editarEmpresa   = (id) => abrirFormulario(id);
window.eliminarEmpresa = (id) => confirmar("¿Eliminar esta empresa?", () => eliminarEmpresaConfirmada(id));

cargarEmpresas();