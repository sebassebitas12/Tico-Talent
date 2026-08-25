// src/js/vacantes.js
// CRUD Vacantes → /products de DummyJSON con diseño Stitch (job-card)
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

let vacantes = [];

function renderCards(lista) {
  const contenedor = document.getElementById("vacantesList");
  if (!contenedor) return;

  const countEl = document.getElementById("vacanteCount");
  if (countEl) countEl.textContent = `(${lista.length} resultados)`;

  if (lista.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; background: var(--surface-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <p style="color: var(--text-muted); margin-bottom: 1rem;">No se encontraron vacantes.</p>
        <button class="btn btn-cta" id="btnNuevaEmpty">+ Publicar primera vacante</button>
      </div>
    `;
    document.getElementById("btnNuevaEmpty")?.addEventListener("click", () => abrirFormulario());
    return;
  }

  const icons = ["💻", "☁️", "🎨", "⚙️", "📱", "🛡️", "📊", "🤖"];

  contenedor.innerHTML = `
    <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
      <button class="btn btn-cta" id="btnNuevaVacante">+ Publicar Vacante</button>
    </div>
    ${lista.map((v, idx) => {
      const icon = icons[idx % icons.length];
      const match = 90 + ((v.id * 7) % 10);
      const salary = v.price ? `$${(v.price * 30).toLocaleString()} - $${(v.price * 45).toLocaleString()} USD / mes` : "Salario a convenir";
      return `
        <article class="job-card">
          <div class="job-card__header">
            <div class="job-card__company-logo">${icon}</div>
            <div class="job-card__title-area">
              <h3 class="job-card__title">${v.title}</h3>
              <div class="job-card__company-name">
                <span>${v.brand || v.category || "Tech Solutions CR"}</span> • <span>San José, Costa Rica (Híbrido/Remoto)</span>
              </div>
            </div>
            <span class="badge-match">⚡ ${match}% Match</span>
          </div>

          <div class="job-card__details">
            <span class="job-tag">📂 ${v.category || "Tecnología"}</span>
            <span class="job-tag">⭐ ${v.rating || "4.8"} / 5.0</span>
            <span class="job-tag">💼 Tiempo Completo</span>
            <span class="job-tag">📦 Disponibles: ${v.stock ?? 1} plazas</span>
          </div>

          <div class="job-card__footer">
            <div>
              <span class="job-card__salary">${salary}</span>
              <span class="job-card__date" style="display: block;">Publicado recientemente</span>
            </div>
            <div class="job-card__actions" style="display: flex; gap: 0.5rem; align-items: center;">
              <button type="button" class="btn btn-cta" onclick="postularseVacante('${v.title}')">Postularse</button>
              <button type="button" class="btn btn-secondary" onclick="editarVacante(${v.id})">✏️</button>
              <button type="button" class="btn btn--danger" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding: 0.55rem 0.8rem; border-radius: var(--radius-md); font-weight:600; cursor:pointer;" onclick="eliminarVacante(${v.id})">🗑️</button>
            </div>
          </div>
        </article>
      `;
    }).join("")}
  `;

  document.getElementById("btnNuevaVacante")?.addEventListener("click", () => abrirFormulario());
}

async function cargarVacantes() {
  mostrarLoading();
  try {
    const data = await getAll("products");
    vacantes = data.products ?? (Array.isArray(data) ? data : []);
    renderCards(vacantes);
  } catch {
    mostrarToast("Error al cargar vacantes.", "error");
  } finally {
    ocultarLoading();
  }
}

function formularioHTML(v = {}) {
  return `
    <div class="form-group">
      <label>Título de la vacante</label>
      <input class="form-control" id="fTitulo" value="${v.title ?? ""}" placeholder="Ej: Senior React Developer" required>
    </div>
    <div class="form-group">
      <label>Categoría / Área</label>
      <input class="form-control" id="fCategoria" value="${v.category ?? ""}" placeholder="Ej: software, devops, design" required>
    </div>
    <div class="form-group">
      <label>Empresa / Marca</label>
      <input class="form-control" id="fBrand" value="${v.brand ?? ""}" placeholder="Ej: TechCR Solutions">
    </div>
    <div class="form-group">
      <label>Rango Base ($)</label>
      <input class="form-control" type="number" id="fPrecio" value="${v.price ?? ""}" placeholder="100">
    </div>
    <div class="form-group">
      <label>Plazas Disponibles</label>
      <input class="form-control" type="number" id="fStock" value="${v.stock ?? 1}" placeholder="1">
    </div>
  `;
}

function abrirFormulario(id = null) {
  const vacante = id ? vacantes.find((v) => v.id === id) : {};
  const titulo  = id ? "Editar vacante" : "Nueva vacante";

  abrirModal(titulo, formularioHTML(vacante), async () => {
    const datos = {
      title:    document.getElementById("fTitulo").value.trim(),
      category: document.getElementById("fCategoria").value.trim(),
      brand:    document.getElementById("fBrand").value.trim(),
      price:    Number(document.getElementById("fPrecio").value),
      stock:    Number(document.getElementById("fStock").value),
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
        mostrarToast("Vacante publicada.", "success");
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

// Búsqueda en el Hero
const searchForm = document.getElementById("heroSearchForm");
if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = document.getElementById("searchRole")?.value.toLowerCase().trim() || "";
    if (!query) {
      renderCards(vacantes);
      return;
    }
    const filtradas = vacantes.filter(
      (v) =>
        (v.title && v.title.toLowerCase().includes(query)) ||
        (v.category && v.category.toLowerCase().includes(query)) ||
        (v.brand && v.brand.toLowerCase().includes(query))
    );
    renderCards(filtradas);
  });
}

// Reset filtros
document.getElementById("btnResetFilters")?.addEventListener("click", () => {
  if (document.getElementById("searchRole")) document.getElementById("searchRole").value = "";
  if (document.getElementById("searchLocation")) document.getElementById("searchLocation").value = "";
  renderCards(vacantes);
  mostrarToast("Filtros restablecidos", "info");
});

window.editarVacante   = (id) => abrirFormulario(id);
window.eliminarVacante = (id) =>
  confirmar("¿Eliminar esta vacante?", () => eliminarVacanteConfirmada(id));
window.postularseVacante = (titulo) =>
  mostrarToast(`¡Te has postulado con éxito a: ${titulo}!`, "success");

cargarVacantes();
