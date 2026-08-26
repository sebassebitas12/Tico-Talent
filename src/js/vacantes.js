// src/js/vacantes.js
// CRUD Vacantes → /products de DummyJSON
// RF-05 al RF-10

import { requireAuth } from "./auth.js";
import { getAll, create, update, remove } from "./dummyapi.js";
import { mostrarToast, mostrarLoading, ocultarLoading, abrirModal, cerrarModal, confirmar, escapeHTML, initUserNav } from "./ui.js";

requireAuth();
initUserNav();

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
              <h3 class="job-card__title">${escapeHTML(v.title)}</h3>
              <div class="job-card__company-name">
                <span>${escapeHTML(v.brand || v.category || "Tech Solutions CR")}</span> • <span>San José, Costa Rica (Híbrido/Remoto)</span>
              </div>
            </div>
            <span class="badge-match">⚡ ${match}% Match</span>
          </div>

          <div class="job-card__details">
            <span class="job-tag">📂 ${escapeHTML(v.category || "Tecnología")}</span>
            <span class="job-tag">⭐ ${escapeHTML(String(v.rating || "4.8"))} / 5.0</span>
            <span class="job-tag">💼 Tiempo Completo</span>
            <span class="job-tag">📦 Disponibles: ${v.stock ?? 1} plazas</span>
          </div>

          <div class="job-card__footer">
            <div>
              <span class="job-card__salary">${escapeHTML(salary)}</span>
              <span class="job-card__date" style="display: block;">Publicado recientemente</span>
            </div>
            <div class="job-card__actions" style="display: flex; gap: 0.5rem; align-items: center;">
              <button type="button" class="btn btn-cta btn-postularme" data-id="${v.id}" data-title="${escapeHTML(v.title)}">Postularse</button>
              <button type="button" class="btn btn-secondary btn-editar" data-id="${v.id}">✏️</button>
              <button type="button" class="btn btn--danger btn-eliminar" data-id="${v.id}" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding: 0.55rem 0.8rem; border-radius: var(--radius-md); font-weight:600; cursor:pointer;">🗑️</button>
            </div>
          </div>
        </article>
      `;
    }).join("")}
  `;

  document.getElementById("btnNuevaVacante")?.addEventListener("click", () => abrirFormulario());

  contenedor.querySelectorAll(".btn-postularme").forEach(btn => {
    btn.addEventListener("click", () => postularseVacante(btn.dataset.id, btn.dataset.title));
  });
  contenedor.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", () => abrirFormulario(Number(btn.dataset.id)));
  });
  contenedor.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", () => confirmar("¿Eliminar esta vacante?", () => eliminarVacanteConfirmada(Number(btn.dataset.id))));
  });
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
      <input class="form-control" id="fTitulo" value="${escapeHTML(v.title ?? "")}" placeholder="Ej: Senior React Developer" required>
    </div>
    <div class="form-group">
      <label>Categoría / Área</label>
      <input class="form-control" id="fCategoria" value="${escapeHTML(v.category ?? "")}" placeholder="Ej: software, devops, design" required>
    </div>
    <div class="form-group">
      <label>Empresa / Marca</label>
      <input class="form-control" id="fBrand" value="${escapeHTML(v.brand ?? "")}" placeholder="Ej: TechCR Solutions">
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
        const idx = vacantes.findIndex((v) => v.id === id);
        if (idx !== -1) vacantes[idx] = { ...vacantes[idx], ...datos };
        mostrarToast("Vacante actualizada.", "success");
      } else {
        const nueva = await create("products", datos);
        vacantes.unshift({ ...nueva, ...datos, id: Date.now() });
        mostrarToast("Vacante publicada.", "success");
      }
      cerrarModal();
      renderCards(vacantes);
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
    vacantes = vacantes.filter((v) => v.id !== id);
    mostrarToast("Vacante eliminada.", "success");
    renderCards(vacantes);
  } catch {
    mostrarToast("Error al eliminar.", "error");
  } finally {
    ocultarLoading();
  }
}

async function postularseVacante(id, titulo) {
  mostrarLoading();
  try {
    await create("posts", {
      title: titulo,
      body: `Postulación automática a: ${titulo}`,
      userId: 1,
      tags: ["auto-postulacion", "ticotalent"],
    });
    mostrarToast(`¡Te has postulado con éxito a: ${titulo}!`, "success");
  } catch {
    mostrarToast("Error al postularse.", "error");
  } finally {
    ocultarLoading();
  }
}

function aplicarFiltros() {
  const query = document.getElementById("searchRole")?.value.toLowerCase().trim() || "";
  const location = document.getElementById("searchLocation")?.value.toLowerCase().trim() || "";

  const checkedModalidades = [...document.querySelectorAll('input[name="modality"]:checked')].map(c => c.value);
  const checkedNiveles = [...document.querySelectorAll('input[name="level"]:checked')].map(c => c.value);
  const checkedJornadas = [...document.querySelectorAll('input[name="type"]:checked')].map(c => c.value);

  let resultado = [...vacantes];

  if (query) {
    resultado = resultado.filter(v =>
      (v.title && v.title.toLowerCase().includes(query)) ||
      (v.category && v.category.toLowerCase().includes(query)) ||
      (v.brand && v.brand.toLowerCase().includes(query))
    );
  }

  if (location) {
    resultado = resultado.filter(v =>
      (v.brand && v.brand.toLowerCase().includes(location)) ||
      (v.category && v.category.toLowerCase().includes(location))
    );
  }

  if (checkedModalidades.length > 0) {
    resultado = resultado.filter(v => {
      const cat = (v.category || "").toLowerCase();
      return checkedModalidades.some(m => cat.includes(m));
    });
  }

  if (checkedNiveles.length > 0) {
    resultado = resultado.filter(v => {
      const stock = v.stock || 1;
      if (checkedNiveles.includes("junior") && stock >= 5) return true;
      if (checkedNiveles.includes("mid") && stock >= 2 && stock <= 8) return true;
      if (checkedNiveles.includes("senior") && stock <= 3) return true;
      if (checkedNiveles.includes("lead") && stock <= 1) return true;
      return false;
    });
  }

  if (checkedJornadas.length > 0) {
    resultado = resultado.filter(v => {
      const cat = (v.category || "").toLowerCase();
      return checkedJornadas.some(j => cat.includes(j));
    });
  }

  renderCards(resultado);
}

const searchForm = document.getElementById("heroSearchForm");
if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    aplicarFiltros();
  });
}

document.querySelectorAll('input[name="modality"], input[name="level"], input[name="type"]').forEach(cb => {
  cb.addEventListener("change", aplicarFiltros);
});

document.getElementById("btnResetFilters")?.addEventListener("click", () => {
  if (document.getElementById("searchRole")) document.getElementById("searchRole").value = "";
  if (document.getElementById("searchLocation")) document.getElementById("searchLocation").value = "";
  document.querySelectorAll('input[name="modality"], input[name="level"], input[name="type"]').forEach(cb => {
    cb.checked = false;
  });
  renderCards(vacantes);
  mostrarToast("Filtros restablecidos", "info");
});

cargarVacantes();
