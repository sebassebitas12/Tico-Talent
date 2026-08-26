// src/js/candidatos.js
// CRUD Candidatos → /users de DummyJSON (GET, POST, PUT, PATCH, DELETE)
// Integra adaptadores de Costa Rica y Talent Pool para Empleadores.

import { requireAuth, getRole } from "./auth.js";
import { getAll, create, update, remove } from "./dummyapi.js";
import { adaptarCandidato } from "./adapters.js";
import { mostrarToast, mostrarLoading, ocultarLoading, abrirModal, cerrarModal, confirmar, escapeHTML, initUserNav } from "./ui.js";

requireAuth();
initUserNav();

let candidatosRaw = [];
let candidatosAdaptados = [];

function renderCards(lista) {
  const contenedor = document.getElementById("candidatesList");
  if (!contenedor) return;

  const rol = getRole();
  const esEmpleador = (rol === "empleador" || rol === "reclutador");

  if (lista.length === 0) {
    contenedor.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 2rem; background: var(--surface-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <p style="color: var(--text-muted); margin-bottom: 1rem;">No se encontraron candidatos en la base de datos.</p>
        ${esEmpleador ? '<button class="btn btn-cta" id="btnNuevoEmpty">+ Crear primer candidato</button>' : ''}
      </div>
    `;
    document.getElementById("btnNuevoEmpty")?.addEventListener("click", () => abrirFormulario());
    return;
  }

  const headerNotice = esEmpleador ? `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; width: 100%; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin: 0;">Talent Pool de Costa Rica</h2>
        <span style="font-size: 0.9rem; color: var(--text-muted);">Total: <strong>${lista.length}</strong> profesionales calificados</span>
      </div>
      <button class="btn btn-cta" id="btnNuevo">+ Registrar Nuevo Perfil</button>
    </div>
  ` : `
    <div style="margin-bottom: 1.5rem; background: rgba(83, 16, 104, 0.04); border: 1px solid rgba(83, 16, 104, 0.15); padding: 1rem 1.25rem; border-radius: var(--radius-md);">
      <p style="font-size: 0.9rem; color: var(--primary-purple); margin: 0; font-weight: 500;">
        🔍 <strong>Directorio de Perfiles Profesionales:</strong> Explora cómo los reclutadores visualizan el talento técnico en Costa Rica. Puedes actualizar tu propio perfil en la pestaña <strong>"Mi Perfil"</strong>.
      </p>
    </div>
  `;

  contenedor.innerHTML = `
    ${headerNotice}
    <div class="job-list" style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
      ${lista.map((c) => {
        return `
          <article class="job-card" data-id="${c.id}">
            <div class="job-card__header">
              <div class="job-card__company-logo" style="overflow: hidden; padding: 0;">
                <img src="${c.foto}" alt="${escapeHTML(c.nombreCompleto)}" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
              <div class="job-card__title-area">
                <h3 class="job-card__title">${escapeHTML(c.nombreCompleto)}</h3>
                <div class="job-card__company-name">
                  <span>${escapeHTML(c.titulo)}</span> • <span>${escapeHTML(c.ubicacion)}</span>
                </div>
              </div>
              <span class="badge-match">⚡ ${c.match}% Match</span>
            </div>

            <div class="job-card__details">
              <span class="job-tag">👤 @${escapeHTML(c.username)}</span>
              <span class="job-tag">📧 ${escapeHTML(c.email)}</span>
              <span class="job-tag">📞 ${escapeHTML(c.telefono)}</span>
              <span class="job-tag">🕒 ${escapeHTML(c.experiencia)}</span>
              <span class="job-tag">💰 ${escapeHTML(c.pretensionSalarial)}</span>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.5rem 0;">
              ${c.skills.map(s => `<span class="job-tag" style="background: var(--surface-subtle); border-color: rgba(83,16,104,0.15);">#${escapeHTML(s)}</span>`).join("")}
            </div>

            <div class="job-card__footer">
              <div>
                <span class="job-card__salary" style="font-size: 0.85rem; color: var(--color-success);">🟢 Disponibilidad: ${escapeHTML(c.disponibilidad)}</span>
                <span class="job-card__date" style="display: block; font-size: 0.8rem;">Candidato Verificado</span>
              </div>
              <div class="job-card__actions" style="display: flex; gap: 0.5rem;">
                ${esEmpleador ? `
                  <button type="button" class="btn btn-secondary btn-contactar" data-email="${escapeHTML(c.email)}" data-nombre="${escapeHTML(c.nombreCompleto)}">✉️ Contactar</button>
                  <button type="button" class="btn btn-secondary btn-editar" data-id="${c.id}">✏️ Editar</button>
                  <button type="button" class="btn btn--danger btn-eliminar" data-id="${c.id}" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding: 0.55rem 0.9rem; border-radius: var(--radius-md); font-weight:600; cursor:pointer;">🗑️</button>
                ` : `
                  <a href="${c.linkedin}" target="_blank" rel="noreferrer" class="btn btn-secondary" style="text-decoration: none;">🌐 LinkedIn</a>
                  <a href="${c.github}" target="_blank" rel="noreferrer" class="btn btn-secondary" style="text-decoration: none;">💻 GitHub</a>
                `}
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;

  if (esEmpleador) {
    document.getElementById("btnNuevo")?.addEventListener("click", () => abrirFormulario());
    
    contenedor.querySelectorAll(".btn-contactar").forEach(btn => {
      btn.addEventListener("click", () => {
        mostrarToast(`Iniciando contacto con ${btn.dataset.nombre} (${btn.dataset.email})`, "info");
      });
    });

    contenedor.querySelectorAll(".btn-editar").forEach(btn => {
      btn.addEventListener("click", () => abrirFormulario(Number(btn.dataset.id)));
    });

    contenedor.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", () => confirmar("¿Eliminar este candidato de la base?", () => eliminarCandidatoConfirmado(Number(btn.dataset.id))));
    });
  }
}

async function cargarCandidatos() {
  mostrarLoading();
  try {
    const data = await getAll("users");
    const allUsers = data.users ?? (Array.isArray(data) ? data : []);
    candidatosRaw = allUsers.filter(u => u.id !== 1 && u.username !== "emilys").slice(0, 2);
    candidatosAdaptados = candidatosRaw.map((u, idx) => adaptarCandidato(u, idx));
    renderCards(candidatosAdaptados);
  } catch {
    mostrarToast("Error al cargar candidatos desde DummyJSON.", "error");
  } finally {
    ocultarLoading();
  }
}

function formularioHTML(c = {}) {
  return `
    <div class="form-group">
      <label>Nombre</label>
      <input class="form-control" id="fNombre" value="${escapeHTML(c.firstName ?? "")}" placeholder="Nombre" required>
    </div>
    <div class="form-group">
      <label>Apellidos</label>
      <input class="form-control" id="fApellido" value="${escapeHTML(c.lastName ?? "")}" placeholder="Apellidos" required>
    </div>
    <div class="form-group">
      <label>Usuario (username)</label>
      <input class="form-control" id="fUsername" value="${escapeHTML(c.username ?? "")}" placeholder="usuario.cr">
    </div>
    <div class="form-group">
      <label>Correo Electrónico</label>
      <input class="form-control" type="email" id="fEmail" value="${escapeHTML(c.email ?? "")}" placeholder="correo@ejemplo.com" required>
    </div>
    <div class="form-group">
      <label>Teléfono</label>
      <input class="form-control" id="fTelefono" value="${escapeHTML(c.telefono ?? c.phone ?? "+506 8888-0000")}" placeholder="+506 8888-0000">
    </div>
  `;
}

function abrirFormulario(id = null) {
  const c = id ? candidatosAdaptados.find((x) => x.id === id) : {};
  const tituloModal = id ? "Editar Candidato" : "Nuevo Candidato";

  abrirModal(tituloModal, formularioHTML(c), async () => {
    const datos = {
      firstName: document.getElementById("fNombre").value.trim(),
      lastName:  document.getElementById("fApellido").value.trim(),
      username:  document.getElementById("fUsername").value.trim() || "usuario",
      email:     document.getElementById("fEmail").value.trim(),
      phone:     document.getElementById("fTelefono").value.trim(),
    };

    if (!datos.firstName || !datos.email) {
      mostrarToast("Nombre y correo son obligatorios.", "warning");
      return;
    }

    mostrarLoading();
    try {
      if (id) {
        await update("users", id, datos);
        const idx = candidatosAdaptados.findIndex((x) => x.id === id);
        if (idx !== -1) {
          candidatosAdaptados[idx] = { ...candidatosAdaptados[idx], ...datos, nombreCompleto: `${datos.firstName} ${datos.lastName}` };
        }
        mostrarToast("Candidato actualizado con éxito.", "success");
      } else {
        const nuevo = await create("users", datos);
        const adaptado = adaptarCandidato({ ...nuevo, ...datos, id: Date.now() });
        candidatosAdaptados.unshift(adaptado);
        mostrarToast("Candidato registrado con éxito.", "success");
      }
      cerrarModal();
      renderCards(candidatosAdaptados);
    } catch {
      mostrarToast("Error al guardar candidato.", "error");
    } finally {
      ocultarLoading();
    }
  });
}

async function eliminarCandidatoConfirmado(id) {
  mostrarLoading();
  try {
    await remove("users", id);
    candidatosAdaptados = candidatosAdaptados.filter((c) => c.id !== id);
    mostrarToast("Candidato eliminado.", "success");
    renderCards(candidatosAdaptados);
  } catch {
    mostrarToast("Error al eliminar.", "error");
  } finally {
    ocultarLoading();
  }
}

// ── FILTRO REACTIVO DE CANDIDATOS ──
const searchCandidateInput = document.getElementById("searchCandidate");
if (searchCandidateInput) {
  searchCandidateInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!term) {
      renderCards(candidatosAdaptados);
      return;
    }
    const filtrados = candidatosAdaptados.filter(c => 
      c.nombreCompleto.toLowerCase().includes(term) ||
      c.titulo.toLowerCase().includes(term) ||
      c.ubicacion.toLowerCase().includes(term) ||
      c.skills.some(s => s.toLowerCase().includes(term)) ||
      c.email.toLowerCase().includes(term)
    );
    renderCards(filtrados);
  });
}

cargarCandidatos();
