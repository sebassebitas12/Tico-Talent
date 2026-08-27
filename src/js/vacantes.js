// src/js/vacantes.js
// Módulo de Vacantes con consumo a /products de DummyJSON
// Integra adaptadores de Costa Rica y permisos diferenciados por rol (Candidato vs Empleador).

import { requireAuth, getRole, getUser } from "./auth.js";
import { getAll, create, update, remove } from "./dummyapi.js";
import { adaptarVacante } from "./adapters.js";
import { mostrarToast, mostrarLoading, ocultarLoading, abrirModal, cerrarModal, confirmar, escapeHTML, initUserNav } from "./ui.js";

requireAuth();
initUserNav();

let vacantesRaw = [];
let vacantesAdaptadas = [];

function renderCards(lista) {
  const contenedor = document.getElementById("vacantesList");
  if (!contenedor) return;

  const rol = getRole();
  const esEmpleador = (rol === "empleador" || rol === "reclutador");

  const countEl = document.getElementById("vacanteCount");
  if (countEl) countEl.textContent = `(${lista.length} plazas disponibles)`;

  if (lista.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; background: var(--surface-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <p style="color: var(--text-muted); margin-bottom: 1rem;">No se encontraron vacantes con los filtros seleccionados.</p>
        ${esEmpleador ? '<button class="btn btn-cta" id="btnNuevaEmpty">+ Publicar primera vacante</button>' : ''}
      </div>
    `;
    document.getElementById("btnNuevaEmpty")?.addEventListener("click", () => abrirFormulario());
    return;
  }

  const headerActionHTML = esEmpleador ? `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
      <span style="font-size: 0.95rem; color: var(--text-muted);">Panel de Gestión de Vacantes de Empleador</span>
      <button class="btn btn-cta" id="btnNuevaVacante">+ Publicar Nueva Vacante</button>
    </div>
  ` : `
    <div style="margin-bottom: 1.25rem; background: rgba(83, 16, 104, 0.04); border: 1px solid rgba(83, 16, 104, 0.15); padding: 0.85rem 1.25rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
      <span style="font-size: 0.9rem; color: var(--primary-purple); font-weight: 500;">
        💡 Estás en modo <strong>Candidato</strong>: Explora oportunidades en Costa Rica y postúlate con un solo clic.
      </span>
      <span class="badge-match" style="background: #e6f6ee; color: #00875a;">⚡ Match Inteligente Activo</span>
    </div>
  `;

  contenedor.innerHTML = `
    ${headerActionHTML}
    <div class="job-list" style="display: flex; flex-direction: column; gap: 1.25rem;">
      ${lista.map((v) => {
        return `
          <article class="job-card" data-id="${v.id}">
            <div class="job-card__header">
              <div class="job-card__company-logo">${v.empresaLogo || "💼"}</div>
              <div class="job-card__title-area">
                <h3 class="job-card__title">${escapeHTML(v.titulo)}</h3>
                <div class="job-card__company-name">
                  <span>${escapeHTML(v.empresa)}</span> • <span>${escapeHTML(v.ubicacion)}</span>
                </div>
              </div>
              <span class="badge-match">${v.match}% Match</span>
            </div>

            <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0.75rem 0; line-height: 1.5;">
              ${escapeHTML(v.descripcion)}
            </p>

            <div class="job-card__details">
              <span class="job-tag">${escapeHTML(v.categoria)}</span>
              <span class="job-tag">${escapeHTML(v.modalidad)}</span>
              <span class="job-tag">${escapeHTML(v.nivel)}</span>
              <span class="job-tag">Jornada: ${escapeHTML(v.jornada || "Tiempo Completo")}</span>
              <span class="job-tag">Plazas: ${v.plazas}</span>
              ${v.tags.map(t => `<span class="job-tag" style="background: var(--surface-subtle);">#${escapeHTML(t)}</span>`).join("")}
            </div>

            <div class="job-card__footer">
              <div>
                <span class="job-card__salary">${escapeHTML(v.salario)}</span>
                <span class="job-card__date" style="display: block; font-size: 0.8rem; margin-top: 0.2rem;">${v.fechaPublicacion}</span>
              </div>
              
              <div class="job-card__actions" style="display: flex; gap: 0.5rem; align-items: center;">
                ${esEmpleador ? `
                  <button type="button" class="btn btn-secondary btn-editar" data-id="${v.id}">Editar</button>
                  <button type="button" class="btn btn--danger btn-eliminar" data-id="${v.id}" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding: 0.55rem 1rem; border-radius: var(--radius-md); font-weight:600; cursor:pointer;">Eliminar</button>
                ` : `
                  <button type="button" class="btn btn-cta btn-postularme" data-id="${v.id}" data-title="${escapeHTML(v.titulo)}">
                    Postularme
                  </button>
                `}
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;

  // Conectar eventos según rol
  if (esEmpleador) {
    document.getElementById("btnNuevaVacante")?.addEventListener("click", () => abrirFormulario());
    contenedor.querySelectorAll(".btn-editar").forEach((btn) => {
      btn.addEventListener("click", () => abrirFormulario(Number(btn.dataset.id)));
    });
    contenedor.querySelectorAll(".btn-eliminar").forEach((btn) => {
      btn.addEventListener("click", () => confirmar("¿Estás seguro de eliminar esta vacante?", () => eliminarVacanteConfirmada(Number(btn.dataset.id))));
    });
  } else {
    contenedor.querySelectorAll(".btn-postularme").forEach((btn) => {
      btn.addEventListener("click", () => postularseVacante(Number(btn.dataset.id), btn.dataset.title));
    });
  }
}

async function cargarVacantes() {
  mostrarLoading();
  try {
    const data = await getAll("products");
    vacantesRaw = data.products ?? (Array.isArray(data) ? data : []);
    vacantesAdaptadas = vacantesRaw.map((p, idx) => adaptarVacante(p, idx));

    // Si viene con parámetros en la URL (desde el hero de inicio o landing)
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q");
    const loc = urlParams.get("location") || urlParams.get("loc");

    if (query && document.getElementById("searchRole")) {
      document.getElementById("searchRole").value = query;
    }
    if (loc && document.getElementById("searchLocation")) {
      document.getElementById("searchLocation").value = loc;
    }

    if (query || loc) {
      aplicarFiltros();
    } else {
      renderCards(vacantesAdaptadas);
    }
  } catch (err) {
    mostrarToast("Error al cargar vacantes desde DummyJSON.", "error");
  } finally {
    ocultarLoading();
  }
}

function formularioHTML(v = {}) {
  return `
    <div class="form-group">
      <label>Título del Puesto / Vacante</label>
      <input class="form-control" id="fTitulo" value="${escapeHTML(v.titulo ?? v.title ?? "")}" placeholder="Ej: Desarrollador React / Node Senior" required>
    </div>
    <div class="form-group">
      <label>Empresa / Marca</label>
      <input class="form-control" id="fEmpresa" value="${escapeHTML(v.empresa ?? v.brand ?? "Intel Costa Rica")}" placeholder="Intel Costa Rica">
    </div>
    <div class="form-group">
      <label>Salario Estimado Base ($ USD)</label>
      <input class="form-control" type="number" id="fPrecio" value="${v.price ?? 95}" placeholder="95">
    </div>
    <div class="form-group">
      <label>Plazas Disponibles</label>
      <input class="form-control" type="number" id="fStock" value="${v.plazas ?? v.stock ?? 2}" placeholder="2">
    </div>
    <div class="form-group">
      <label>Categoría</label>
      <input class="form-control" id="fCategoria" value="${escapeHTML(v.categoria ?? v.category ?? "Tecnología")}" placeholder="Tecnología">
    </div>
    <div class="form-group">
      <label>Descripción del Puesto</label>
      <textarea class="form-control" id="fDescripcion" rows="3" placeholder="Requisitos y responsabilidades">${escapeHTML(v.descripcion ?? v.description ?? "")}</textarea>
    </div>
  `;
}

function abrirFormulario(id = null) {
  const vacante = id ? vacantesAdaptadas.find((v) => v.id === id) : {};
  const tituloModal = id ? "Editar Vacante" : "Publicar Nueva Vacante";

  abrirModal(tituloModal, formularioHTML(vacante), async () => {
    const datos = {
      title:       document.getElementById("fTitulo").value.trim(),
      brand:       document.getElementById("fEmpresa").value.trim(),
      price:       Number(document.getElementById("fPrecio").value) || 95,
      stock:       Number(document.getElementById("fStock").value) || 2,
      category:    document.getElementById("fCategoria").value.trim() || "Tecnología",
      description: document.getElementById("fDescripcion").value.trim(),
    };

    if (!datos.title) {
      mostrarToast("El título de la vacante es obligatorio.", "warning");
      return;
    }

    mostrarLoading();
    try {
      if (id) {
        await update("products", id, datos);
        const idx = vacantesAdaptadas.findIndex((v) => v.id === id);
        if (idx !== -1) {
          vacantesAdaptadas[idx] = { ...vacantesAdaptadas[idx], ...datos, titulo: datos.title, empresa: datos.brand };
        }
        mostrarToast("Vacante actualizada con éxito.", "success");
      } else {
        const nueva = await create("products", datos);
        const adaptada = adaptarVacante({ ...nueva, ...datos, id: Date.now() });
        vacantesAdaptadas.unshift(adaptada);
        mostrarToast("Vacante publicada con éxito.", "success");
      }
      cerrarModal();
      renderCards(vacantesAdaptadas);
    } catch {
      mostrarToast("Error al guardar vacante en el servidor.", "error");
    } finally {
      ocultarLoading();
    }
  });
}

async function eliminarVacanteConfirmada(id) {
  mostrarLoading();
  try {
    await remove("products", id);
    vacantesAdaptadas = vacantesAdaptadas.filter((v) => v.id !== id);
    mostrarToast("Vacante eliminada.", "success");
    renderCards(vacantesAdaptadas);
  } catch {
    mostrarToast("Error al eliminar la vacante.", "error");
  } finally {
    ocultarLoading();
  }
}

async function postularseVacante(id, titulo) {
  const user = getUser() || {};
  mostrarLoading();
  try {
    // Registra la postulación real vía POST /posts/add en DummyJSON
    await create("posts", {
      title: `Postulación a: ${titulo}`,
      body: `Candidato ${user.firstName || "Usuario"} postulado a la posición #${id} (${titulo})`,
      userId: user.id || 1,
      tags: ["postulacion", "costa-rica", "ticotalent"],
    });
    mostrarToast(`¡Felicidades! Te has postulado exitosamente a "${titulo}".`, "success", 4000);
  } catch {
    mostrarToast("No se pudo completar la postulación.", "error");
  } finally {
    ocultarLoading();
  }
}

// ── FILTROS Y BÚSQUEDA DINÁMICA ──
function actualizarContadoresFiltros() {
  const total = vacantesAdaptadas.length;
  
  const countRemoto = vacantesAdaptadas.filter(v => (v.modalidad || "").toLowerCase().includes("remoto")).length;
  const countHibrido = vacantesAdaptadas.filter(v => (v.modalidad || "").toLowerCase().includes("híbrido") || (v.modalidad || "").toLowerCase().includes("hibrido")).length;
  const countPresencial = vacantesAdaptadas.filter(v => (v.modalidad || "").toLowerCase().includes("presencial")).length;

  const countJunior = vacantesAdaptadas.filter(v => (v.nivel || "").toLowerCase().includes("junior")).length;
  const countMid = vacantesAdaptadas.filter(v => (v.nivel || "").toLowerCase().includes("semi") || (v.nivel || "").toLowerCase().includes("mid")).length;
  const countSenior = vacantesAdaptadas.filter(v => (v.nivel || "").toLowerCase().includes("senior") && !(v.nivel || "").toLowerCase().includes("semi")).length;
  const countLead = vacantesAdaptadas.filter(v => (v.nivel || "").toLowerCase().includes("líder") || (v.nivel || "").toLowerCase().includes("lider") || (v.nivel || "").toLowerCase().includes("arquitecto")).length;

  const countCompleto = vacantesAdaptadas.filter(v => (v.jornada || "").toLowerCase().includes("completo")).length;
  const countMedio = vacantesAdaptadas.filter(v => (v.jornada || "").toLowerCase().includes("medio")).length;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt("countModRemoto", countRemoto);
  setTxt("countModHibrido", countHibrido);
  setTxt("countModPresencial", countPresencial);

  setTxt("countNivelJunior", countJunior);
  setTxt("countNivelMid", countMid);
  setTxt("countNivelSenior", countSenior);
  setTxt("countNivelLead", countLead);

  setTxt("countJornadaCompleta", countCompleto);
  setTxt("countJornadaMedia", countMedio);
}

function aplicarFiltros() {
  const query = document.getElementById("searchRole")?.value.toLowerCase().trim() || "";
  const location = document.getElementById("searchLocation")?.value.toLowerCase().trim() || "";

  const checkedModalidades = [...document.querySelectorAll('input[name="modality"]:checked')].map(c => c.value);
  const checkedNiveles = [...document.querySelectorAll('input[name="level"]:checked')].map(c => c.value);
  const checkedJornadas = [...document.querySelectorAll('input[name="type"]:checked')].map(c => c.value);

  let resultado = [...vacantesAdaptadas];

  if (query) {
    resultado = resultado.filter(v =>
      (v.titulo && v.titulo.toLowerCase().includes(query)) ||
      (v.categoria && v.categoria.toLowerCase().includes(query)) ||
      (v.empresa && v.empresa.toLowerCase().includes(query)) ||
      (v.tags && v.tags.some(t => t.toLowerCase().includes(query)))
    );
  }

  if (location) {
    resultado = resultado.filter(v =>
      (v.ubicacion && v.ubicacion.toLowerCase().includes(location)) ||
      (v.empresa && v.empresa.toLowerCase().includes(location))
    );
  }

  if (checkedModalidades.length > 0) {
    resultado = resultado.filter(v => {
      const mod = (v.modalidad || "").toLowerCase();
      return checkedModalidades.some(m => {
        if (m === "remoto") return mod.includes("remoto");
        if (m === "hibrido") return mod.includes("híbrido") || mod.includes("hibrido");
        if (m === "presencial") return mod.includes("presencial");
        return false;
      });
    });
  }

  if (checkedNiveles.length > 0) {
    resultado = resultado.filter(v => {
      const niv = (v.nivel || "").toLowerCase();
      return checkedNiveles.some(n => {
        if (n === "junior") return niv.includes("junior");
        if (n === "semi-senior" || n === "mid") return niv.includes("semi") || niv.includes("mid");
        if (n === "senior") return niv.includes("senior") && !niv.includes("semi");
        if (n === "lider" || n === "lead") return niv.includes("líder") || niv.includes("lider") || niv.includes("arquitecto");
        return false;
      });
    });
  }

  if (checkedJornadas.length > 0) {
    resultado = resultado.filter(v => {
      const jor = (v.jornada || "").toLowerCase();
      return checkedJornadas.some(j => {
        if (j === "completo") return jor.includes("completo");
        if (j === "medio") return jor.includes("medio");
        return false;
      });
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
  renderCards(vacantesAdaptadas);
  mostrarToast("Filtros restablecidos", "info");
});

async function inicializar() {
  await cargarVacantes();
  actualizarContadoresFiltros();
}

inicializar();
