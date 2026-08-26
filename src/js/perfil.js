// src/js/perfil.js
// Controlador de la vista de Perfil y Configuración Individual
// Persistencia en localStorage bajo la clave "perfilExtendido"

import { requireAuth, getUser, getRole, setRole, getPerfilExtendido, savePerfilExtendido } from "./auth.js";
import { initUserNav, mostrarToast, escapeHTML } from "./ui.js";

requireAuth();
initUserNav();

let perfil = getPerfilExtendido();
let rolActual = getRole();
let skillsTags = Array.isArray(perfil.skills) ? [...perfil.skills] : ["React", "TypeScript", "Node.js"];

function renderHero() {
  const user = getUser() || {};
  const heroAvatar = document.getElementById("heroAvatar");
  const heroName = document.getElementById("heroName");
  const heroRoleBadge = document.getElementById("heroRoleBadge");
  const heroSubtitle = document.getElementById("heroSubtitle");

  const displayName = perfil.nombre || (user.firstName ? `${user.firstName} ${user.lastName}` : "Usuario");
  const initial = displayName.charAt(0).toUpperCase();

  if (heroAvatar) heroAvatar.textContent = initial;
  if (heroName) heroName.textContent = displayName;
  
  if (rolActual === "empleador" || rolActual === "reclutador") {
    if (heroRoleBadge) {
      heroRoleBadge.textContent = "Empresa / Reclutador";
      heroRoleBadge.style.backgroundColor = "#fff3e0";
      heroRoleBadge.style.color = "#e65100";
    }
    if (heroSubtitle) heroSubtitle.textContent = `${perfil.empresaNombre || "Empresa Aliada"} • ${perfil.sedeUbicacion || "Costa Rica"}`;
  } else {
    if (heroRoleBadge) {
      heroRoleBadge.textContent = "Candidato Profesional";
      heroRoleBadge.style.backgroundColor = "#f0ebf5";
      heroRoleBadge.style.color = "var(--primary-purple)";
    }
    if (heroSubtitle) heroSubtitle.textContent = `${perfil.titular || "Desarrollador"} • ${perfil.ubicacion || "Costa Rica"}`;
  }
}

function renderFormFields() {
  const container = document.getElementById("perfilFieldsContainer");
  if (!container) return;

  if (rolActual === "empleador" || rolActual === "reclutador") {
    // ── FORMULARIO EMPRESA ──
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        
        <div class="form-group">
          <label class="login__label">Nombre Comercial de la Empresa</label>
          <input class="login__input" id="fEmpresaNombre" value="${escapeHTML(perfil.empresaNombre || "")}" placeholder="Ej: Intel Costa Rica" required>
        </div>

        <div class="form-group">
          <label class="login__label">Razón Social / Cédula Jurídica</label>
          <input class="login__input" id="fRazonSocial" value="${escapeHTML(perfil.razonSocial || "")}" placeholder="Ej: 3-101-445892">
        </div>

        <div class="form-group">
          <label class="login__label">Sector / Industria</label>
          <input class="login__input" id="fSector" value="${escapeHTML(perfil.sector || "")}" placeholder="Ej: Tecnología, Semiconductores, Fintech">
        </div>

        <div class="form-group">
          <label class="login__label">Sede / Ubicación en Costa Rica</label>
          <input class="login__input" id="fSede" value="${escapeHTML(perfil.sedeUbicacion || "")}" placeholder="Ej: Zona Franca América, Heredia">
        </div>

        <div class="form-group">
          <label class="login__label">Tamaño de la Empresa</label>
          <select class="login__input" id="fTamano">
            <option value="1-50 colaboradores" ${perfil.tamanoEmpresa === "1-50 colaboradores" ? "selected" : ""}>1-50 colaboradores (Startup)</option>
            <option value="50-250 colaboradores" ${perfil.tamanoEmpresa === "50-250 colaboradores" ? "selected" : ""}>50-250 colaboradores (Mediana)</option>
            <option value="250-1,000 colaboradores" ${perfil.tamanoEmpresa === "250-1,000 colaboradores" ? "selected" : ""}>250-1,000 colaboradores (Grande)</option>
            <option value="1,000+ colaboradores" ${perfil.tamanoEmpresa === "1,000+ colaboradores" ? "selected" : ""}>1,000+ colaboradores (Multinacional)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="login__label">Nombre del Reclutador / Contacto</label>
          <input class="login__input" id="fNombreContacto" value="${escapeHTML(perfil.nombre || "")}" placeholder="Ej: Carlos Rodríguez" required>
        </div>

        <div class="form-group">
          <label class="login__label">Cargo del Reclutador</label>
          <input class="login__input" id="fCargoContacto" value="${escapeHTML(perfil.reclutadorCargo || "")}" placeholder="Ej: Senior Talent Acquisition Partner">
        </div>

        <div class="form-group">
          <label class="login__label">Correo Corporativo</label>
          <input class="login__input" type="email" id="fEmailCorp" value="${escapeHTML(perfil.emailCorporativo || "")}" placeholder="reclutamiento@empresa.com" required>
        </div>

      </div>

      <div class="form-group" style="margin-top: 1.5rem;">
        <label class="login__label">Descripción Corporativa & Misión</label>
        <textarea class="login__input" id="fDescripcion" rows="3" placeholder="Describe la misión y cultura de la empresa">${escapeHTML(perfil.descripcionEmpresa || "")}</textarea>
      </div>

      <div class="form-group" style="margin-top: 1.5rem;">
        <label class="login__label">Beneficios para Colaboradores en CR</label>
        <textarea class="login__input" id="fBeneficios" rows="3" placeholder="Ej: Seguro médico privado, Asociación Solidarista, Teletrabajo, Bonos">${escapeHTML(perfil.beneficios || "")}</textarea>
      </div>
    `;
  } else {
    // ── FORMULARIO CANDIDATO ──
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        
        <div class="form-group">
          <label class="login__label">Nombre Completo</label>
          <input class="login__input" id="fNombre" value="${escapeHTML(perfil.nombre || "")}" placeholder="Ej: Emily Johnson" required>
        </div>

        <div class="form-group">
          <label class="login__label">Correo Electrónico</label>
          <input class="login__input" type="email" id="fEmail" value="${escapeHTML(perfil.email || "")}" placeholder="tu@email.com" required>
        </div>

        <div class="form-group">
          <label class="login__label">Teléfono (Costa Rica)</label>
          <input class="login__input" id="fTelefono" value="${escapeHTML(perfil.telefono || "")}" placeholder="+506 8899-3344">
        </div>

        <div class="form-group">
          <label class="login__label">Ubicación / Residencia</label>
          <input class="login__input" id="fUbicacion" value="${escapeHTML(perfil.ubicacion || "")}" placeholder="Ej: San José, Heredia, Alajuela">
        </div>

        <div class="form-group">
          <label class="login__label">Titular Profesional</label>
          <input class="login__input" id="fTitular" value="${escapeHTML(perfil.titular || "")}" placeholder="Ej: Desarrollador Full Stack Senior (React / Node)">
        </div>

        <div class="form-group">
          <label class="login__label">Años de Experiencia</label>
          <input class="login__input" id="fExperiencia" value="${escapeHTML(perfil.experienciaAnos || "")}" placeholder="Ej: 5 años">
        </div>

        <div class="form-group">
          <label class="login__label">Pretensión Salarial Mensual (USD)</label>
          <input class="login__input" id="fSalario" value="${escapeHTML(perfil.pretensionSalarial || "")}" placeholder="Ej: $3,500 - $4,500 USD">
        </div>

        <div class="form-group">
          <label class="login__label">Modalidad Preferida</label>
          <select class="login__input" id="fModalidad">
            <option value="Remoto 100%" ${perfil.modalidadPreferida?.includes("Remoto") ? "selected" : ""}>Remoto 100% (WFH)</option>
            <option value="Híbrido (1-2 días oficina)" ${perfil.modalidadPreferida?.includes("Híbrido") ? "selected" : ""}>Híbrido (1-2 días oficina)</option>
            <option value="Presencial" ${perfil.modalidadPreferida === "Presencial" ? "selected" : ""}>Presencial</option>
          </select>
        </div>

      </div>

      <!-- Skills Chips -->
      <div class="form-group" style="margin-top: 1.5rem;">
        <label class="login__label">Habilidades Técnicas & Competencias</label>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
          <input class="login__input" id="fNuevoSkill" placeholder="Agregar habilidad (Ej: Docker, Python, AWS)" style="max-width: 350px;">
          <button type="button" class="btn btn-secondary" id="btnAddSkill">+ Añadir</button>
        </div>
        <div id="skillsContainer" style="display: flex; flex-wrap: wrap; gap: 0.5rem;"></div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
        <div class="form-group">
          <label class="login__label">Enlace a LinkedIn</label>
          <input class="login__input" id="fLinkedin" value="${escapeHTML(perfil.linkedin || "")}" placeholder="https://linkedin.com/in/tu-perfil">
        </div>
        <div class="form-group">
          <label class="login__label">Enlace a GitHub / Portafolio</label>
          <input class="login__input" id="fGithub" value="${escapeHTML(perfil.github || "")}" placeholder="https://github.com/tu-usuario">
        </div>
      </div>

      <div class="form-group" style="margin-top: 1.5rem;">
        <label class="login__label">Resumen Profesional & Biografía</label>
        <textarea class="login__input" id="fBio" rows="3" placeholder="Cuéntanos sobre tus logros y metas profesionales">${escapeHTML(perfil.bio || "")}</textarea>
      </div>
    `;

    renderSkillsChips();
    setupSkillsEvents();
  }
}

function renderSkillsChips() {
  const container = document.getElementById("skillsContainer");
  if (!container) return;
  container.innerHTML = skillsTags.map((skill, index) => `
    <span class="job-tag" style="background: var(--surface-subtle); border: 1px solid var(--border-subtle); padding: 0.4rem 0.8rem; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.5rem;">
      ${escapeHTML(skill)}
      <button type="button" data-index="${index}" class="btn-remove-skill" style="background:none; border:none; color: var(--text-muted); cursor:pointer; font-weight:bold;">✕</button>
    </span>
  `).join("");

  container.querySelectorAll(".btn-remove-skill").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      skillsTags.splice(idx, 1);
      renderSkillsChips();
    });
  });
}

function setupSkillsEvents() {
  const addBtn = document.getElementById("btnAddSkill");
  const input = document.getElementById("fNuevoSkill");
  if (addBtn && input) {
    const agregar = () => {
      const val = input.value.trim();
      if (val && !skillsTags.includes(val)) {
        skillsTags.push(val);
        input.value = "";
        renderSkillsChips();
      }
    };
    addBtn.addEventListener("click", agregar);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        agregar();
      }
    });
  }
}

// ── GUARDAR CAMBIOS ──
const form = document.getElementById("perfilForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (rolActual === "empleador" || rolActual === "reclutador") {
      const datos = {
        nombre: document.getElementById("fNombreContacto").value.trim(),
        empresaNombre: document.getElementById("fEmpresaNombre").value.trim(),
        razonSocial: document.getElementById("fRazonSocial").value.trim(),
        sector: document.getElementById("fSector").value.trim(),
        sedeUbicacion: document.getElementById("fSede").value.trim(),
        tamanoEmpresa: document.getElementById("fTamano").value,
        reclutadorCargo: document.getElementById("fCargoContacto").value.trim(),
        emailCorporativo: document.getElementById("fEmailCorp").value.trim(),
        descripcionEmpresa: document.getElementById("fDescripcion").value.trim(),
        beneficios: document.getElementById("fBeneficios").value.trim()
      };
      savePerfilExtendido(datos);
    } else {
      const datos = {
        nombre: document.getElementById("fNombre").value.trim(),
        email: document.getElementById("fEmail").value.trim(),
        telefono: document.getElementById("fTelefono").value.trim(),
        ubicacion: document.getElementById("fUbicacion").value.trim(),
        titular: document.getElementById("fTitular").value.trim(),
        experienciaAnos: document.getElementById("fExperiencia").value.trim(),
        pretensionSalarial: document.getElementById("fSalario").value.trim(),
        modalidadPreferida: document.getElementById("fModalidad").value,
        skills: skillsTags,
        linkedin: document.getElementById("fLinkedin").value.trim(),
        github: document.getElementById("fGithub").value.trim(),
        bio: document.getElementById("fBio").value.trim()
      };
      savePerfilExtendido(datos);
    }

    perfil = getPerfilExtendido();
    renderHero();
    initUserNav();
    mostrarToast("¡Perfil y configuración actualizados correctamente!", "success");
  });
}

// ── GENERADOR Y DESCARGA DE CV ──
document.getElementById("btnExportarCV")?.addEventListener("click", () => {
  const p = getPerfilExtendido();
  const esEmpresa = (rolActual === "empleador" || rolActual === "reclutador");
  
  if (esEmpresa) {
    mostrarToast("La generación de CV está diseñada para perfiles de Candidatos.", "info");
    return;
  }

  const cvHTML = `
    <div id="cvPreviewDoc" style="font-family: var(--font-family, sans-serif); color: #1e293b; line-height: 1.6; max-height: 65vh; overflow-y: auto; padding: 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="border-bottom: 2px solid var(--primary-purple, #531068); padding-bottom: 1rem; margin-bottom: 1.5rem;">
        <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--primary-purple, #531068); margin: 0 0 0.25rem 0;">${escapeHTML(p.nombre || "Candidato")}</h1>
        <h2 style="font-size: 1.1rem; font-weight: 600; color: #475569; margin: 0 0 0.5rem 0;">${escapeHTML(p.titular || "Desarrollador de Software")}</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.85rem; color: #64748b;">
          <span>📍 ${escapeHTML(p.ubicacion || "Costa Rica")}</span>
          <span>✉️ ${escapeHTML(p.email || "")}</span>
          <span>📞 ${escapeHTML(p.telefono || "")}</span>
          <span>💵 Pretensión: ${escapeHTML(p.pretensionSalarial || "")}</span>
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1rem; font-weight: 700; color: var(--primary-purple, #531068); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">Perfil Profesional</h3>
        <p style="font-size: 0.9rem; color: #334155; margin: 0;">${escapeHTML(p.bio || "Profesional con experiencia comprobada en desarrollo y proyectos tecnológicos.")}</p>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1rem; font-weight: 700; color: var(--primary-purple, #531068); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">Habilidades Técnicas</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
          ${(skillsTags.length ? skillsTags : ["JavaScript", "React", "Node.js", "Git"]).map(s => `
            <span style="background: #f1f5f9; color: #334155; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">${escapeHTML(s)}</span>
          `).join("")}
        </div>
      </div>

      <div style="margin-bottom: 1rem;">
        <h3 style="font-size: 1rem; font-weight: 700; color: var(--primary-purple, #531068); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">Presencia Profesional</h3>
        <p style="font-size: 0.85rem; margin: 0.2rem 0;"><strong>LinkedIn:</strong> <a href="${escapeHTML(p.linkedin || "#")}" target="_blank" style="color: var(--primary-purple);">${escapeHTML(p.linkedin || "linkedin.com")}</a></p>
        <p style="font-size: 0.85rem; margin: 0.2rem 0;"><strong>GitHub / Portafolio:</strong> <a href="${escapeHTML(p.github || "#")}" target="_blank" style="color: var(--primary-purple);">${escapeHTML(p.github || "github.com")}</a></p>
      </div>
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
      <button class="btn btn-cta" id="btnPrintCV" style="display: inline-flex; align-items: center; gap: 0.4rem;">
        🖨️ Imprimir / Guardar en PDF
      </button>
    </div>
  `;

  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const btnFormCancel = document.getElementById("btnFormCancel");
  const btnFormSubmit = document.getElementById("btnFormSubmit");
  const modalClose = document.getElementById("modalClose");

  if (modalTitle) modalTitle.textContent = "Vista Previa de tu Currículum Vitae (CV)";
  if (modalBody) modalBody.innerHTML = cvHTML;
  if (btnFormSubmit) btnFormSubmit.classList.add("d-none");
  if (btnFormCancel) btnFormCancel.textContent = "Cerrar";

  modalOverlay?.classList.remove("d-none");

  document.getElementById("btnPrintCV")?.addEventListener("click", () => {
    window.print();
  });

  const cerrar = () => {
    modalOverlay?.classList.add("d-none");
    if (btnFormSubmit) btnFormSubmit.classList.remove("d-none");
  };

  if (modalClose) modalClose.onclick = cerrar;
  if (btnFormCancel) btnFormCancel.onclick = cerrar;
});

// ── BOTÓN TOGGLE ROL (DEMO RÁPIDO) ──
document.getElementById("btnToggleRol")?.addEventListener("click", () => {
  const nuevoRol = (rolActual === "solicitante") ? "empleador" : "solicitante";
  setRole(nuevoRol);
  rolActual = nuevoRol;
  perfil = getPerfilExtendido();
  skillsTags = Array.isArray(perfil.skills) ? [...perfil.skills] : ["React", "TypeScript", "Node.js"];
  renderHero();
  renderFormFields();
  initUserNav();
  mostrarToast(`Rol cambiado a: ${nuevoRol === "empleador" ? "Empleador" : "Candidato"}`, "info");
});

document.getElementById("btnRestablecer")?.addEventListener("click", () => {
  perfil = getPerfilExtendido();
  renderFormFields();
  mostrarToast("Cambios descartados", "info");
});

// Inicialización
renderHero();
renderFormFields();
