// src/js/empresas.js
// CRUD Empresas Clientes -> /carts de DummyJSON

import { requireAuth } from "./auth.js";
import { getAll, create, update, remove } from "./dummyapi.js";
import { mostrarToast, mostrarLoading, ocultarLoading, abrirModal, cerrarModal, confirmar, escapeHTML, renderNavbar } from "./ui.js";

requireAuth();
renderNavbar("empresas");

let empresas = [];

const nombresEmpresas = [
  "TechCR Solutions", "Innovatech Pura Vida", "Global Talent Hub",
  "Costa Rica Softworks", "San Jose Cloud Labs", "Pura Vida Analytics",
  "EcoTech Innovations", "Tico Fintech Group", "Bananera Digital Systems",
  "AeroCR Engineering", "Caribe Dev Center", "Volcan Interactive"
];

function renderCards(lista) {
  const contenedor = document.getElementById("companiesList");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; background: var(--surface-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <p style="color: var(--text-muted); margin-bottom: 1rem;">No hay empresas registradas.</p>
        <button class="btn btn-cta" id="btnNuevaEmpty">+ Registrar primera empresa</button>
      </div>
    `;
    document.getElementById("btnNuevaEmpty")?.addEventListener("click", () => abrirFormulario());
    return;
  }

  contenedor.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; width: 100%;">
      <span style="font-size: 0.95rem; color: var(--text-muted);">Total: <strong>${lista.length}</strong> empresas aliadas</span>
      <button class="btn btn-cta" id="btnNuevaEmpresa">+ Nueva Empresa</button>
    </div>
    <div class="job-list" style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
      ${lista.map((emp, idx) => {
        const nombre = emp.nombre || nombresEmpresas[idx % nombresEmpresas.length];
        const totalProds = emp.totalProducts ?? (emp.products?.length || (2 + (emp.id % 8)));
        const colabs = 50 + ((emp.id * 35) % 400);

        return `
          <article class="job-card">
            <div class="job-card__header">
              <div class="job-card__company-logo">${nombre.charAt(0)}</div>
              <div class="job-card__title-area">
                <h3 class="job-card__title">${escapeHTML(nombre)}</h3>
                <div class="job-card__company-name">
                  <span>Tecnologia & Servicios</span> - <span>San Jose, Costa Rica</span>
                </div>
              </div>
              <span class="badge-match" style="background-color: #f0ebf5; color: var(--primary-purple); border-color: rgba(83, 16, 104, 0.2);">Empresa Verificada</span>
            </div>

            <div class="job-card__details">
              <span class="job-tag">${colabs}+ Colaboradores</span>
              <span class="job-tag">${totalProds} Vacantes Activas</span>
              <span class="job-tag">Top Employer 2026</span>
              <span class="job-tag">Codigo #${emp.id}</span>
            </div>

            <div class="job-card__footer">
              <div>
                <span class="job-card__date">Miembro aliado desde 2024</span>
              </div>
              <div class="job-card__actions" style="display: flex; gap: 0.5rem;">
                <button type="button" class="btn btn--secondary btn-editar" data-id="${emp.id}">Editar</button>
                <button type="button" class="btn btn--danger btn-eliminar" data-id="${emp.id}">Eliminar</button>
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;

  document.getElementById("btnNuevaEmpresa")?.addEventListener("click", () => abrirFormulario());

  contenedor.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", () => abrirFormulario(Number(btn.dataset.id)));
  });
  contenedor.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", () => confirmar("Eliminar esta empresa aliada?", () => eliminarEmpresaConfirmada(Number(btn.dataset.id))));
  });
}

async function cargarEmpresas() {
  mostrarLoading();
  try {
    const data = await getAll("carts");
    empresas = data.carts ?? (Array.isArray(data) ? data : []);
    renderCards(empresas);
  } catch {
    mostrarToast("Error al cargar empresas.", "error");
  } finally {
    ocultarLoading();
  }
}

function formularioHTML(emp = {}) {
  return `
    <div class="form-group">
      <label>Nombre de la Empresa</label>
      <input class="form-control" id="fNombreEmpresa" value="${escapeHTML(emp.nombre ?? "")}" placeholder="Ej: Pura Vida Software" required>
    </div>
    <div class="form-group">
      <label>ID Usuario / Representante</label>
      <input class="form-control" type="number" id="fUserId" value="${emp.userId ?? 1}" placeholder="1">
    </div>
    <div class="form-group">
      <label>Vacantes / Posiciones Iniciales</label>
      <input class="form-control" type="number" id="fTotalProds" value="${emp.totalProducts ?? 3}" placeholder="3">
    </div>
  `;
}

function abrirFormulario(id = null) {
  const emp = id ? empresas.find((e) => e.id === id) : {};
  const titulo = id ? "Editar empresa" : "Nueva empresa";

  abrirModal(titulo, formularioHTML(emp), async () => {
    const datos = {
      nombre:        document.getElementById("fNombreEmpresa").value.trim(),
      userId:        Number(document.getElementById("fUserId").value),
      totalProducts: Number(document.getElementById("fTotalProds").value),
      products:      [],
    };

    if (!datos.nombre) {
      mostrarToast("El nombre de la empresa es obligatorio.", "warning");
      return;
    }

    mostrarLoading();
    try {
      if (id) {
        await update("carts", id, datos);
        const idx = empresas.findIndex((e) => e.id === id);
        if (idx !== -1) empresas[idx] = { ...empresas[idx], ...datos };
        mostrarToast("Empresa actualizada.", "success");
      } else {
        const nueva = await create("carts", datos);
        empresas.unshift({ ...nueva, ...datos, id: Date.now() });
        mostrarToast("Empresa registrada con exito.", "success");
      }
      cerrarModal();
      renderCards(empresas);
    } catch {
      mostrarToast("Error al guardar empresa.", "error");
    } finally {
      ocultarLoading();
    }
  });
}

async function eliminarEmpresaConfirmada(id) {
  mostrarLoading();
  try {
    await remove("carts", id);
    empresas = empresas.filter((e) => e.id !== id);
    mostrarToast("Empresa eliminada.", "success");
    renderCards(empresas);
  } catch {
    mostrarToast("Error al eliminar.", "error");
  } finally {
    ocultarLoading();
  }
}

cargarEmpresas();
