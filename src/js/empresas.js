// src/js/empresas.js
// CRUD Empresas Clientes → /carts de DummyJSON (GET, POST, PUT, DELETE — SIN PATCH)
// RF-05 al RF-10

import { requireAuth, getRole } from "./auth.js";
import { getAll, create, update, remove } from "./dummyapi.js";
import { adaptarEmpresa } from "./adapters.js";
import { mostrarToast, mostrarLoading, ocultarLoading, abrirModal, cerrarModal, confirmar, escapeHTML, initUserNav } from "./ui.js";

requireAuth();
initUserNav();

let empresasRaw = [];
let empresasAdaptadas = [];

function renderCards(lista) {
  const contenedor = document.getElementById("companiesList");
  if (!contenedor) return;

  const rol = getRole();
  const esEmpleador = (rol === "empleador" || rol === "reclutador");

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
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; width: 100%; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin: 0;">Empresas Aliadas en Costa Rica</h2>
        <span style="font-size: 0.9rem; color: var(--text-muted);">Total: <strong>${lista.length}</strong> corporaciones y parques tecnológicos</span>
      </div>
      ${esEmpleador ? '<button class="btn btn-cta" id="btnNuevaEmpresa">+ Nueva Empresa Aliada</button>' : ''}
    </div>

    <div class="job-list" style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
      ${lista.map((emp) => {
        return `
          <article class="job-card" data-id="${emp.id}">
            <div class="job-card__header">
              <div class="job-card__company-logo">${emp.logo || "🏢"}</div>
              <div class="job-card__title-area">
                <h3 class="job-card__title">${escapeHTML(emp.nombre)}</h3>
                <div class="job-card__company-name">
                  <span>${escapeHTML(emp.sector)}</span> • <span>${escapeHTML(emp.ubicacion)}</span>
                </div>
              </div>
              <span class="badge-match" style="background-color: #f0ebf5; color: var(--primary-purple); border-color: rgba(83, 16, 104, 0.2);">
                ⭐ Top Employer CR
              </span>
            </div>

            <div class="job-card__details">
              <span class="job-tag">👥 ${escapeHTML(emp.colaboradores)}</span>
              <span class="job-tag">💼 ${emp.vacantesActivas} Vacantes Activas</span>
              <span class="job-tag">⭐ ${emp.rating} / 5.0</span>
              <span class="job-tag">🆔 Código Cart #${emp.id}</span>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.5rem 0;">
              ${emp.beneficios.map(b => `<span class="job-tag" style="background: var(--surface-subtle);">✓ ${escapeHTML(b)}</span>`).join("")}
            </div>

            <div class="job-card__footer">
              <div>
                <span class="job-card__salary" style="font-size: 0.85rem; color: var(--color-success);">🟢 Convenio Activo</span>
                <span class="job-card__date" style="display: block; font-size: 0.8rem;">Parque Empresarial / Zona Franca</span>
              </div>
              <div class="job-card__actions" style="display: flex; gap: 0.5rem;">
                <a href="vacantes.html" class="btn btn-secondary" style="text-decoration: none;">Ver Vacantes</a>
                ${esEmpleador ? `
                  <button type="button" class="btn btn-secondary btn-editar" data-id="${emp.id}">✏️</button>
                  <button type="button" class="btn btn--danger btn-eliminar" data-id="${emp.id}" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding: 0.55rem 0.8rem; border-radius: var(--radius-md); font-weight:600; cursor:pointer;">🗑️</button>
                ` : ''}
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
    btn.addEventListener("click", () => confirmar("¿Eliminar esta empresa aliada?", () => eliminarEmpresaConfirmada(Number(btn.dataset.id))));
  });
}

async function cargarEmpresas() {
  mostrarLoading();
  try {
    const data = await getAll("carts");
    empresasRaw = data.carts ?? (Array.isArray(data) ? data : []);
    empresasAdaptadas = empresasRaw.map((c, idx) => adaptarEmpresa(c, idx));
    renderCards(empresasAdaptadas);
  } catch {
    mostrarToast("Error al cargar empresas desde DummyJSON.", "error");
  } finally {
    ocultarLoading();
  }
}

function formularioHTML(emp = {}) {
  return `
    <div class="form-group">
      <label>Nombre de la Empresa</label>
      <input class="form-control" id="fNombreEmpresa" value="${escapeHTML(emp.nombre ?? "")}" placeholder="Ej: Intel Costa Rica" required>
    </div>
    <div class="form-group">
      <label>ID de Usuario / Representante</label>
      <input class="form-control" type="number" id="fUserId" value="${emp.userId ?? 1}" placeholder="1">
    </div>
    <div class="form-group">
      <label>Vacantes / Posiciones Iniciales</label>
      <input class="form-control" type="number" id="fTotalProds" value="${emp.vacantesActivas ?? 3}" placeholder="3">
    </div>
  `;
}

function abrirFormulario(id = null) {
  const emp = id ? empresasAdaptadas.find((e) => e.id === id) : {};
  const titulo = id ? "Editar Empresa" : "Nueva Empresa Aliada";

  abrirModal(titulo, formularioHTML(emp), async () => {
    const datos = {
      nombre:        document.getElementById("fNombreEmpresa").value.trim(),
      userId:        Number(document.getElementById("fUserId").value) || 1,
      totalProducts: Number(document.getElementById("fTotalProds").value) || 3,
      products:      [],
    };

    if (!datos.nombre) {
      mostrarToast("El nombre de la empresa es obligatorio.", "warning");
      return;
    }

    mostrarLoading();
    try {
      if (id) {
        // En /carts se usa PUT (SIN PATCH)
        await update("carts", id, datos);
        const idx = empresasAdaptadas.findIndex((e) => e.id === id);
        if (idx !== -1) {
          empresasAdaptadas[idx] = { ...empresasAdaptadas[idx], ...datos, nombre: datos.nombre, vacantesActivas: datos.totalProducts };
        }
        mostrarToast("Empresa actualizada con éxito.", "success");
      } else {
        const nueva = await create("carts", datos);
        const adaptada = adaptarEmpresa({ ...nueva, ...datos, id: Date.now() });
        empresasAdaptadas.unshift(adaptada);
        mostrarToast("Empresa registrada con éxito.", "success");
      }
      cerrarModal();
      renderCards(empresasAdaptadas);
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
    empresasAdaptadas = empresasAdaptadas.filter((e) => e.id !== id);
    mostrarToast("Empresa eliminada.", "success");
    renderCards(empresasAdaptadas);
  } catch {
    mostrarToast("Error al eliminar.", "error");
  } finally {
    ocultarLoading();
  }
}

cargarEmpresas();
