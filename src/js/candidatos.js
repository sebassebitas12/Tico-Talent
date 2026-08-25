// src/js/candidatos.js
// Módulo CRUD de Candidatos → mapea /users de DummyJSON con diseño Stitch (job-card)
// RF-05 al RF-10

import { requireAuth, getUser, logout } from "./auth.js";
import { getAll, create, update, remove } from "./dummyapi.js";
import { mostrarToast, mostrarLoading, ocultarLoading, abrirModal, cerrarModal, confirmar } from "./ui.js";

requireAuth();

// ── Inicialización de usuario en el header/sidebar ────────────
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

// ── Estado ────────────────────────────────────────────────────
let candidatos = [];

// ── Render de tarjetas (Mockup Stitch) ─────────────────────────
function renderCards(lista) {
  const contenedor = document.getElementById("candidatesList");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 2rem; background: var(--surface-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <p style="color: var(--text-muted); margin-bottom: 1rem;">No hay candidatos registrados.</p>
        <button class="btn btn-cta" id="btnNuevoEmpty">+ Crear primer candidato</button>
      </div>
    `;
    document.getElementById("btnNuevoEmpty")?.addEventListener("click", () => abrirFormulario());
    return;
  }

  const logos = ["👩‍💻", "👨‍💻", "👩‍💼", "👨‍💼", "🧑‍💻", "👩‍🔬"];

  contenedor.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; width: 100%;">
      <span style="font-size: 0.95rem; color: var(--text-muted);">Total: <strong>${lista.length}</strong> candidatos registrados</span>
      <button class="btn btn-cta" id="btnNuevo">+ Nuevo Candidato</button>
    </div>
    <div class="job-list" style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
      ${lista.map((c, index) => {
        const logo = logos[index % logos.length];
        const match = 88 + ((c.id * 3) % 11);
        const city = c.address?.city || "San José, Costa Rica";
        const role = c.company?.title || "Desarrollador / Profesional";
        return `
          <article class="job-card">
            <div class="job-card__header">
              <div class="job-card__company-logo">${logo}</div>
              <div class="job-card__title-area">
                <h3 class="job-card__title">${c.firstName} ${c.lastName}</h3>
                <div class="job-card__company-name">
                  <span>${role}</span> • <span>${city}</span>
                </div>
              </div>
              <span class="badge-match">⚡ ${match}% Match</span>
            </div>

            <div class="job-card__details">
              <span class="job-tag">👤 @${c.username}</span>
              <span class="job-tag">📧 ${c.email}</span>
              <span class="job-tag">📞 ${c.phone || "+506 8888-0000"}</span>
              <span class="job-tag">🏢 ${c.company?.name || "Tico Talent Network"}</span>
            </div>

            <div class="job-card__footer">
              <div>
                <span class="job-card__salary">ID #${c.id}</span>
                <span class="job-card__date" style="display: block; font-size: 0.8rem;">Perfil activo</span>
              </div>
              <div class="job-card__actions" style="display: flex; gap: 0.5rem;">
                <button type="button" class="btn btn-secondary" onclick="editarCandidato(${c.id})">✏️ Editar</button>
                <button type="button" class="btn btn--danger" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding: 0.55rem 1rem; border-radius: var(--radius-md); font-weight:600; cursor:pointer;" onclick="eliminarCandidato(${c.id})">🗑️ Eliminar</button>
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;

  document.getElementById("btnNuevo")?.addEventListener("click", () => abrirFormulario());
}

// ── Cargar candidatos ─────────────────────────────────────────
async function cargarCandidatos() {
  mostrarLoading();
  try {
    const data = await getAll("users");
    candidatos = data.users ?? (Array.isArray(data) ? data : []);
    renderCards(candidatos);
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

// Exponer globalmente para los onclick en las tarjetas
window.editarCandidato   = (id) => abrirFormulario(id);
window.eliminarCandidato = (id) =>
  confirmar("¿Eliminar este candidato?", () => eliminarCandidatoConfirmado(id));

// ── Arranque ──────────────────────────────────────────────────
cargarCandidatos();