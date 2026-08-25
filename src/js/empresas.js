// src/js/empresas.js
// CRUD Empresas Clientes → /carts de DummyJSON con diseño Stitch (job-card)
// RF-05 al RF-10

import { requireAuth, getUser, logout } from "./auth.js";
import { getAll, create, update, remove } from "./dummyapi.js";
import { mostrarToast, mostrarLoading, ocultarLoading, abrirModal, cerrarModal, confirmar } from "./ui.js";

requireAuth();

const user = getUser();
if (user) {
  const nameEl = document.getElementById("userName");
  const roleEl = document.getElementById("userRole");
  const avatarEl = document.getElementById("userAvatar");
  if (nameEl) nameEl.textContent = `${user.firstName} ${user.lastName}`;
  if (roleEl) roleEl.textContent = user.email;
  if (avatarEl) avatarEl.textContent = user.firstName.charAt(0).toUpperCase();
}
document.getElementById("btnLogout")?.addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

let empresas = [];

const nombresEmpresas = [
  "TechCR Solutions", "Innovatech Pura Vida", "Global Talent Hub",
  "Costa Rica Softworks", "San José Cloud Labs", "Pura Vida Analytics",
  "EcoTech Innovations", "Tico Fintech Group", "Bananera Digital Systems",
  "AeroCR Engineering", "Caribe Dev Center", "Volcán Interactive"
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

  const logos = ["🏢", "🌐", "💻", "⚡", "🚀", "🏦", "📱", "🛰️"];

  contenedor.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; width: 100%;">
      <span style="font-size: 0.95rem; color: var(--text-muted);">Total: <strong>${lista.length}</strong> empresas aliadas</span>
      <button class="btn btn-cta" id="btnNuevaEmpresa">+ Nueva Empresa</button>
    </div>
    <div class="job-list" style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
      ${lista.map((emp, idx) => {
        const nombre = emp.nombre || nombresEmpresas[idx % nombresEmpresas.length];
        const logo = logos[idx % logos.length];
        const totalProds = emp.totalProducts ?? (emp.products?.length || (2 + (emp.id % 8)));
        const colabs = 50 + ((emp.id * 35) % 400);

        return `
          <article class="job-card">
            <div class="job-card__header">
              <div class="job-card__company-logo">${logo}</div>
              <div class="job-card__title-area">
                <h3 class="job-card__title">${nombre}</h3>
                <div class="job-card__company-name">
                  <span>Tecnología & Servicios</span> • <span>San José, Costa Rica</span>
                </div>
              </div>
              <span class="badge-match" style="background-color: #f0ebf5; color: var(--primary-purple); border-color: rgba(83, 16, 104, 0.2);">⭐ Empresa Verificada</span>
            </div>

            <div class="job-card__details">
              <span class="job-tag">👥 ${colabs}+ Colaboradores</span>
              <span class="job-tag">💼 ${totalProds} Vacantes Activas</span>
              <span class="job-tag">🏆 Top Employer 2026</span>
              <span class="job-tag">🆔 Código #${emp.id}</span>
            </div>

            <div class="job-card__footer">
              <div>
                <span class="job-card__date">Miembro aliado desde 2024</span>
              </div>
              <div class="job-card__actions" style="display: flex; gap: 0.5rem;">
                <a href="vacantes.html" class="btn btn-cta" style="text-decoration: none;">Ver Vacantes (${totalProds})</a>
                <button type="button" class="btn btn-secondary" onclick="editarEmpresa(${emp.id})">✏️</button>
                <button type="button" class="btn btn--danger" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding: 0.55rem 0.8rem; border-radius: var(--radius-md); font-weight:600; cursor:pointer;" onclick="eliminarEmpresa(${emp.id})">🗑️</button>
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;

  document.getElementById("btnNuevaEmpresa")?.addEventListener("click", () => abrirFormulario());
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
      <input class="form-control" id="fNombreEmpresa" value="${emp.nombre ?? ""}" placeholder="Ej: Pura Vida Software" required>
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
        mostrarToast("Empresa registrada con éxito.", "success");
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

window.editarEmpresa   = (id) => abrirFormulario(id);
window.eliminarEmpresa = (id) =>
  confirmar("¿Eliminar esta empresa aliada?", () => eliminarEmpresaConfirmada(id));

cargarEmpresas();