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
let experienciaLaboral = Array.isArray(perfil.experienciaLaboral) ? [...perfil.experienciaLaboral] : [];

function renderHero() {
  const user = getUser() || {};
  const heroAvatar = document.getElementById("heroAvatar");
  const heroName = document.getElementById("heroName");
  const heroRoleBadge = document.getElementById("heroRoleBadge");
  const heroSubtitle = document.getElementById("heroSubtitle");

  const displayName = perfil.nombre || (user.firstName ? `${user.firstName} ${user.lastName}` : "Usuario");
  const initial = displayName.charAt(0).toUpperCase();

  const photoKey = user.id ? 'avatar_' + user.id : null;
  const photoUploaded = user.id ? localStorage.getItem('avatarUploaded_' + user.id) === '1' : false;
  const savedPhoto = photoUploaded && photoKey ? localStorage.getItem(photoKey) : null;

  if (heroAvatar) {
    if (savedPhoto) {
      heroAvatar.innerHTML = `<img src="${savedPhoto}" alt="Foto de perfil" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      heroAvatar.textContent = initial;
    }
  }
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

function experienciaSectionHTML() {
  return `
    <section class="perfil-experiencia" style="margin-top:1.75rem;padding-top:1.5rem;border-top:1px solid var(--border-subtle);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;margin-bottom:1rem;">
        <div>
          <h3 style="margin:0;font-size:1.05rem;color:var(--secondary-navy);">Experiencia laboral</h3>
          <p style="margin:.25rem 0 0;color:var(--text-muted);font-size:.84rem;">Agrega tus puestos anteriores. Esta información se incluirá automáticamente en tu CV.</p>
        </div>
        <button type="button" class="btn btn-secondary" id="btnAddExperiencia">+ Agregar experiencia</button>
      </div>
      <div id="experienciaContainer" style="display:grid;gap:.8rem;"></div>

      <div id="experienciaEditor" style="display:none;margin-top:1rem;padding:1rem;border:1px solid var(--border-subtle);border-radius:12px;background:var(--surface-subtle);">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;">
          <div class="form-group">
            <label class="login__label">Cargo / Puesto</label>
            <input class="login__input" id="expCargo" placeholder="Ej: Desarrollador Full Stack">
          </div>
          <div class="form-group">
            <label class="login__label">Empresa</label>
            <input class="login__input" id="expEmpresa" placeholder="Ej: Intel Costa Rica">
          </div>
          <div class="form-group">
            <label class="login__label">Ubicación</label>
            <input class="login__input" id="expUbicacion" placeholder="Ej: Heredia, Costa Rica">
          </div>
          <div class="form-group">
            <label class="login__label">Fecha de inicio</label>
            <input class="login__input" type="month" id="expInicio">
          </div>
          <div class="form-group">
            <label class="login__label">Fecha de finalización</label>
            <input class="login__input" type="month" id="expFin">
          </div>
          <label style="display:flex;align-items:center;gap:.5rem;font-size:.86rem;color:var(--text-main);align-self:end;padding-bottom:.65rem;">
            <input type="checkbox" id="expActual"> Trabajo actualmente aquí
          </label>
        </div>
        <div class="form-group" style="margin-top:1rem;">
          <label class="login__label">Descripción / logros</label>
          <textarea class="login__input" id="expDescripcion" rows="3" placeholder="Describe responsabilidades, tecnologías o logros relevantes."></textarea>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:.5rem;">
          <button type="button" class="btn btn-secondary" id="btnCancelarExperiencia">Cancelar</button>
          <button type="button" class="btn btn-cta" id="btnGuardarExperiencia">Guardar experiencia</button>
        </div>
      </div>
    </section>
  `;
}

function renderFormFields() {
  const container = document.getElementById("perfilFieldsContainer");
  if (!container) return;

  if (rolActual === "empleador" || rolActual === "reclutador") {
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

      ${experienciaSectionHTML()}
    `;
    setupExperienciaEvents();
  } else {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        
        <div class="form-group">
          <label class="login__label">Nombre Completo</label>
          <input class="login__input" id="fNombre" value="${escapeHTML(perfil.nombre || "")}" placeholder="Ej: María González" required>
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

      ${experienciaSectionHTML()}
    `;

    renderSkillsChips();
    setupSkillsEvents();
    setupExperienciaEvents();
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

function renderExperienciaLaboral() {
  const container = document.getElementById("experienciaContainer");
  if (!container) return;
  if (!experienciaLaboral.length) {
    container.innerHTML = `<div style="padding:1rem;border:1px dashed var(--border-subtle);border-radius:10px;color:var(--text-muted);font-size:.84rem;">Aún no has agregado experiencia laboral.</div>`;
    return;
  }

  container.innerHTML = experienciaLaboral.map((exp, index) => `
    <article style="border:1px solid var(--border-subtle);border-radius:12px;padding:1rem;background:#fff;">
      <div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;">
        <div>
          <h4 style="margin:0;color:var(--text-main);font-size:.95rem;">${escapeHTML(exp.cargo || "Puesto")}</h4>
          <p style="margin:.25rem 0;color:var(--primary-purple);font-weight:600;font-size:.84rem;">${escapeHTML(exp.empresa || "Empresa")}</p>
          <p style="margin:0;color:var(--text-muted);font-size:.78rem;">
            ${escapeHTML(exp.ubicacion || "")}${exp.ubicacion ? " • " : ""}${escapeHTML(exp.inicio || "")} — ${exp.actual ? "Actualidad" : escapeHTML(exp.fin || "Sin fecha")}
          </p>
        </div>
        <div style="display:flex;gap:.35rem;">
          <button type="button" class="btn btn-secondary btn-editar-exp" data-index="${index}" style="padding:.35rem .65rem;font-size:.75rem;">Editar</button>
          <button type="button" class="btn btn-secondary btn-eliminar-exp" data-index="${index}" style="padding:.35rem .65rem;font-size:.75rem;">Eliminar</button>
        </div>
      </div>
      ${exp.descripcion ? `<p style="margin:.7rem 0 0;color:var(--text-muted);font-size:.82rem;line-height:1.5;">${escapeHTML(exp.descripcion)}</p>` : ""}
    </article>
  `).join("");

  container.querySelectorAll(".btn-eliminar-exp").forEach(btn => {
    btn.addEventListener("click", () => {
      experienciaLaboral.splice(Number(btn.dataset.index), 1);
      renderExperienciaLaboral();
    });
  });

  container.querySelectorAll(".btn-editar-exp").forEach(btn => {
    btn.addEventListener("click", () => abrirEditorExperiencia(Number(btn.dataset.index)));
  });
}

function abrirEditorExperiencia(index = null) {
  const editor = document.getElementById("experienciaEditor");
  if (!editor) return;
  editor.style.display = "block";
  editor.dataset.index = index == null ? "" : String(index);
  const exp = index == null ? {} : (experienciaLaboral[index] || {});
  document.getElementById("expCargo").value = exp.cargo || "";
  document.getElementById("expEmpresa").value = exp.empresa || "";
  document.getElementById("expUbicacion").value = exp.ubicacion || "";
  document.getElementById("expInicio").value = exp.inicio || "";
  document.getElementById("expFin").value = exp.fin || "";
  document.getElementById("expActual").checked = !!exp.actual;
  document.getElementById("expDescripcion").value = exp.descripcion || "";
  document.getElementById("expFin").disabled = !!exp.actual;
}

function setupExperienciaEvents() {
  const editor = document.getElementById("experienciaEditor");
  const add = document.getElementById("btnAddExperiencia");
  const cancel = document.getElementById("btnCancelarExperiencia");
  const save = document.getElementById("btnGuardarExperiencia");
  const actual = document.getElementById("expActual");
  if (!editor || !add || !save) return;

  add.addEventListener("click", () => abrirEditorExperiencia());
  cancel?.addEventListener("click", () => { editor.style.display = "none"; });

  actual?.addEventListener("change", () => {
    const fin = document.getElementById("expFin");
    if (fin) {
      fin.disabled = actual.checked;
      if (actual.checked) fin.value = "";
    }
  });

  save.addEventListener("click", () => {
    const item = {
      cargo: document.getElementById("expCargo").value.trim(),
      empresa: document.getElementById("expEmpresa").value.trim(),
      ubicacion: document.getElementById("expUbicacion").value.trim(),
      inicio: document.getElementById("expInicio").value,
      fin: actual.checked ? "" : document.getElementById("expFin").value,
      actual: actual.checked,
      descripcion: document.getElementById("expDescripcion").value.trim()
    };
    if (!item.cargo || !item.empresa || !item.inicio) {
      mostrarToast("Indica al menos cargo, empresa y fecha de inicio.", "warning");
      return;
    }
    const idx = editor.dataset.index;
    if (idx === "") experienciaLaboral.push(item);
    else experienciaLaboral[Number(idx)] = item;
    editor.style.display = "none";
    renderExperienciaLaboral();
  });

  renderExperienciaLaboral();
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
        beneficios: document.getElementById("fBeneficios").value.trim(),
        experienciaLaboral
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
        bio: document.getElementById("fBio").value.trim(),
        experienciaLaboral
      };
      savePerfilExtendido(datos);
    }

    perfil = getPerfilExtendido();
    experienciaLaboral = Array.isArray(perfil.experienciaLaboral) ? [...perfil.experienciaLaboral] : [];
    renderHero();
    initUserNav();
    mostrarToast("¡Perfil y configuración actualizados correctamente!", "success");
  });
}

// ── GENERADOR Y DESCARGA DE CV ──
// Estilos de CV disponibles
const CV_TEMPLATES = {
  clasico: {
    label: "Clásico Profesional",
    accent: "#531068",
    bg: "#ffffff",
    headerBg: "#ffffff",
    font: "Georgia, 'Times New Roman', serif"
  },
  moderno: {
    label: "Moderno Minimalista",
    accent: "#531068",
    bg: "#ffffff",
    headerBg: "#531068",
    font: "'Segoe UI', system-ui, sans-serif"
  },
  ejecutivo: {
    label: "Ejecutivo Bicolor",
    accent: "#1e3a5f",
    bg: "#ffffff",
    headerBg: "#1e3a5f",
    font: "'Calibri', 'Trebuchet MS', sans-serif"
  }
};

let selectedTemplate = "moderno";

function buildCVHTML(p, skills, template) {
  const t = CV_TEMPLATES[template];
  const nombre = p.nombre || "Candidato";
  const titular = p.titular || "Profesional de Software";
  const ubicacion = p.ubicacion || "Costa Rica";
  const email = p.email || "";
  const telefono = p.telefono || "";
  const salario = p.pretensionSalarial || "";
  const bio = p.bio || "Profesional con experiencia comprobada en desarrollo y proyectos tecnológicos.";
  const linkedin = p.linkedin || "";
  const github = p.github || "";
  const skillsList = (skills.length ? skills : ["JavaScript", "React", "Node.js", "Git"]);
  const experienciaList = Array.isArray(p.experienciaLaboral) ? p.experienciaLaboral : [];
  const experienciaHTML = experienciaList.length
    ? experienciaList.map(exp => `
        <div style="margin-bottom:.9rem;">
          <div style="font-weight:700;color:#1e293b;">${escapeHTML(exp.cargo || "Puesto")}</div>
          <div style="font-size:.82rem;color:${t.accent};font-weight:600;">${escapeHTML(exp.empresa || "")}${exp.ubicacion ? ` · ${escapeHTML(exp.ubicacion)}` : ""}</div>
          <div style="font-size:.76rem;color:#64748b;margin:.1rem 0 .25rem;">${escapeHTML(exp.inicio || "")} — ${exp.actual ? "Actualidad" : escapeHTML(exp.fin || "Sin fecha")}</div>
          ${exp.descripcion ? `<p style="font-size:.82rem;color:#475569;margin:0;">${escapeHTML(exp.descripcion)}</p>` : ""}
        </div>`).join("")
    : `<p class="bio">Agrega tu experiencia laboral desde Mi Perfil para verla aquí.</p>`;

  if (template === "clasico") {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>CV — ${nombre}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: ${t.font}; color: #1e293b; background: #fff; padding: 2.5rem; font-size: 13px; line-height: 1.6; }
          h1 { font-size: 2rem; font-weight: 700; color: ${t.accent}; }
          h2 { font-size: 0.85rem; font-weight: 400; color: #475569; margin-top: 0.2rem; }
          .contact { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 0.75rem; font-size: 0.82rem; color: #64748b; }
          .contact span { display: flex; align-items: center; gap: 0.3rem; }
          hr { border: none; border-top: 2px solid ${t.accent}; margin: 1.25rem 0; }
          .section-title { font-size: 0.78rem; font-weight: 700; color: ${t.accent}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.6rem; }
          .bio { font-size: 0.88rem; color: #334155; }
          .skills-wrap { display: flex; flex-wrap: wrap; gap: 0.4rem; }
          .skill-tag { background: #f1f5f9; color: #334155; padding: 0.25rem 0.7rem; border-radius: 4px; font-size: 0.78rem; font-weight: 600; border: 1px solid #e2e8f0; }
          .link { color: ${t.accent}; font-size: 0.83rem; text-decoration: none; }
          .link-row { margin: 0.25rem 0; }
          @media print {
            body { padding: 1.5rem; }
            a { color: ${t.accent}; }
          }
        </style>
      </head>
      <body>
        <h1>${nombre}</h1>
        <h2>${titular}</h2>
        <div class="contact">
          <span>${ubicacion}</span>
          ${email ? `<span>✉️ ${email}</span>` : ""}
          ${telefono ? `<span>${telefono}</span>` : ""}
          ${salario ? `<span>💵 ${salario}</span>` : ""}
        </div>
        <hr>
        <div class="section-title">Perfil Profesional</div>
        <p class="bio">${bio}</p>
        <hr>
        <div class="section-title">Experiencia Laboral</div>
        ${experienciaHTML}
        <hr>
        <div class="section-title">Habilidades Técnicas</div>
        <div class="skills-wrap">
          ${skillsList.map(s => `<span class="skill-tag">${s}</span>`).join("")}
        </div>
        ${(linkedin || github) ? `
        <hr>
        <div class="section-title">Presencia Profesional</div>
        ${linkedin ? `<div class="link-row"><strong>LinkedIn:</strong> <a class="link" href="${linkedin}">${linkedin}</a></div>` : ""}
        ${github ? `<div class="link-row"><strong>GitHub / Portafolio:</strong> <a class="link" href="${github}">${github}</a></div>` : ""}
        ` : ""}
      </body>
      </html>
    `;
  }

  if (template === "moderno") {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>CV — ${nombre}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: ${t.font}; color: #1e293b; background: #fff; font-size: 13px; line-height: 1.6; display: flex; min-height: 100vh; }
          .sidebar { width: 220px; background: ${t.accent}; color: #fff; padding: 2rem 1.25rem; flex-shrink: 0; }
          .main { flex: 1; padding: 2rem 1.75rem; }
          .avatar { width: 72px; height: 72px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; margin: 0 auto 1rem; border: 3px solid rgba(255,255,255,0.4); }
          .s-name { font-size: 1.1rem; font-weight: 700; text-align: center; line-height: 1.3; }
          .s-titular { font-size: 0.72rem; text-align: center; opacity: 0.85; margin-top: 0.25rem; margin-bottom: 1.5rem; }
          .s-section { margin-bottom: 1.25rem; }
          .s-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; margin-bottom: 0.4rem; font-weight: 700; }
          .s-value { font-size: 0.78rem; opacity: 0.9; word-break: break-all; }
          .s-link { color: #fff; font-size: 0.75rem; word-break: break-all; }
          .skill-pill { display: inline-block; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); padding: 0.2rem 0.55rem; border-radius: 20px; font-size: 0.7rem; margin: 0.15rem 0.1rem; }
          .section-title { font-size: 0.82rem; font-weight: 700; color: ${t.accent}; text-transform: uppercase; letter-spacing: 0.8px; padding-bottom: 0.4rem; border-bottom: 2px solid ${t.accent}; margin-bottom: 0.75rem; }
          .bio { font-size: 0.87rem; color: #334155; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .sidebar { background: ${t.accent} !important; }
          }
        </style>
      </head>
      <body>
        <div class="sidebar">
          <div class="avatar">${nombre.charAt(0).toUpperCase()}</div>
          <div class="s-name">${nombre}</div>
          <div class="s-titular">${titular}</div>

          <div class="s-section">
            <div class="s-label">Ubicación</div>
            <div class="s-value">${ubicacion}</div>
          </div>
          ${email ? `<div class="s-section"><div class="s-label">Correo</div><div class="s-value">${email}</div></div>` : ""}
          ${telefono ? `<div class="s-section"><div class="s-label">Teléfono</div><div class="s-value">${telefono}</div></div>` : ""}
          ${salario ? `<div class="s-section"><div class="s-label">Pretensión</div><div class="s-value">${salario}</div></div>` : ""}

          <div class="s-section">
            <div class="s-label">Habilidades</div>
            <div>${skillsList.map(s => `<span class="skill-pill">${s}</span>`).join("")}</div>
          </div>

          ${linkedin ? `<div class="s-section"><div class="s-label">LinkedIn</div><a class="s-link" href="${linkedin}">${linkedin.replace("https://", "")}</a></div>` : ""}
          ${github ? `<div class="s-section"><div class="s-label">GitHub</div><a class="s-link" href="${github}">${github.replace("https://", "")}</a></div>` : ""}
        </div>
        <div class="main">
          <div class="section-title">Perfil Profesional</div>
          <p class="bio" style="margin-bottom:1.5rem;">${bio}</p>
          <div class="section-title">Experiencia Laboral</div>
          ${experienciaHTML}
          <div class="section-title" style="margin-top:1.25rem;">Competencias</div>
          <p class="bio">Profesional orientado a resultados, trabajo colaborativo y mejora continua.</p>
        </div>
      </body>
      </html>
    `;
  }

  // ejecutivo
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>CV — ${nombre}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ${t.font}; color: #1e293b; background: #fff; font-size: 13px; line-height: 1.6; }
        .header { background: ${t.accent}; color: #fff; padding: 2rem 2.5rem; }
        .header h1 { font-size: 1.9rem; font-weight: 700; }
        .header h2 { font-size: 1rem; opacity: 0.85; margin-top: 0.2rem; }
        .contact-bar { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-top: 0.75rem; font-size: 0.78rem; opacity: 0.9; }
        .body { padding: 2rem 2.5rem; display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
        .section-title { font-size: 0.78rem; font-weight: 700; color: ${t.accent}; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid ${t.accent}; padding-bottom: 0.3rem; margin-bottom: 0.75rem; }
        .bio { font-size: 0.87rem; color: #334155; }
        .skill-tag { display: inline-block; background: #eef2f7; color: #1e3a5f; padding: 0.25rem 0.65rem; border-radius: 4px; font-size: 0.76rem; font-weight: 600; margin: 0.15rem; }
        .link { color: ${t.accent}; font-size: 0.82rem; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .header { background: ${t.accent} !important; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${nombre}</h1>
        <h2>${titular}</h2>
        <div class="contact-bar">
          <span>${ubicacion}</span>
          ${email ? `<span>✉️ ${email}</span>` : ""}
          ${telefono ? `<span>${telefono}</span>` : ""}
          ${salario ? `<span>💵 ${salario}</span>` : ""}
        </div>
      </div>
      <div class="body">
        <div>
          <div class="section-title">Perfil Ejecutivo</div>
          <p class="bio" style="margin-bottom:1.5rem;">${bio}</p>
          <div class="section-title">Experiencia Laboral</div>
          ${experienciaHTML}
          <div class="section-title" style="margin-top:1.25rem;">Competencias Técnicas</div>
          <div style="margin-bottom:1.5rem;">${skillsList.map(s => `<span class="skill-tag">${s}</span>`).join("")}</div>
        </div>
        <div>
          ${(linkedin || github) ? `
          <div class="section-title">Presencia Digital</div>
          ${linkedin ? `<p style="margin-bottom:0.4rem;"><strong>LinkedIn</strong><br><a class="link" href="${linkedin}">${linkedin.replace("https://", "")}</a></p>` : ""}
          ${github ? `<p><strong>GitHub</strong><br><a class="link" href="${github}">${github.replace("https://", "")}</a></p>` : ""}
          ` : ""}
        </div>
      </div>
    </body>
    </html>
  `;
}

document.getElementById("btnExportarCV")?.addEventListener("click", () => {
  const p = getPerfilExtendido();
  const esEmpresa = (rolActual === "empleador" || rolActual === "reclutador");

  if (esEmpresa) {
    mostrarToast("La generación de CV está diseñada para perfiles de Candidatos.", "info");
    return;
  }

  const selectorHTML = `
    <div class="cv-editor-layout">
      <div class="cv-editor-panel">
    <div style="padding:1rem;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;margin-bottom:1rem;">
      <div style="display:flex;justify-content:space-between;gap:1rem;align-items:center;flex-wrap:wrap;">
        <div><strong style="color:#1e293b;">1. Editá el contenido</strong><p style="font-size:.82rem;color:#64748b;margin:.25rem 0 0;">Estos cambios se reflejan de inmediato en la vista previa.</p></div>
        <button type="button" class="btn btn-secondary" id="cvSaveChanges" style="padding:.45rem .8rem;font-size:.82rem;">Guardar cambios en mi perfil</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.75rem;margin-top:.9rem;">
        <input class="login__input" id="cvNombre" value="${escapeHTML(p.nombre || '')}" placeholder="Nombre completo">
        <input class="login__input" id="cvTitular" value="${escapeHTML(p.titular || '')}" placeholder="Titular profesional">
        <input class="login__input" id="cvUbicacion" value="${escapeHTML(p.ubicacion || '')}" placeholder="Ubicación">
        <input class="login__input" id="cvTelefono" value="${escapeHTML(p.telefono || '')}" placeholder="Teléfono">
      </div>
      <textarea class="login__input" id="cvBio" rows="3" style="margin-top:.75rem;">${escapeHTML(p.bio || '')}</textarea>
      <input class="login__input" id="cvSkills" value="${escapeHTML(skillsTags.join(', '))}" placeholder="Habilidades separadas por comas" style="margin-top:.75rem;">
    </div>
    <div style="margin-bottom:1rem;">
      <p style="font-size:0.9rem;color:#475569;margin-bottom:0.75rem;"><strong>2. Elegí una plantilla</strong></p>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;" id="cvTemplateSelector">
        ${Object.entries(CV_TEMPLATES).map(([key, tmpl]) => `
          <label style="cursor:pointer;flex:1;min-width:120px;">
            <input type="radio" name="cvTemplate" value="${key}" ${key === selectedTemplate ? "checked" : ""} style="display:none;">
            <div class="cv-template-card" data-key="${key}" style="
              border: 2px solid ${key === selectedTemplate ? tmpl.accent : '#e2e8f0'};
              border-radius: 10px;
              padding: 0.75rem;
              text-align: center;
              transition: all 0.2s;
              background: ${key === selectedTemplate ? '#f8f0fc' : '#fff'};
            ">
              <div style="width:40px;height:52px;margin:0 auto 0.5rem;border-radius:4px;overflow:hidden;border:1px solid #e2e8f0;background:${tmpl.headerBg}">
                <div style="height:16px;background:${tmpl.accent};"></div>
                <div style="padding:3px 4px;">
                  <div style="height:3px;background:#ddd;border-radius:2px;margin-bottom:2px;"></div>
                  <div style="height:3px;background:#ddd;border-radius:2px;width:70%;"></div>
                </div>
              </div>
              <div style="font-size:0.75rem;font-weight:600;color:#334155;">${tmpl.label}</div>
            </div>
          </label>
        `).join("")}
      </div>
    </div>

      </div>
      <div class="cv-preview-panel">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.65rem;">
          <strong style="color:#334155;font-size:.95rem;">Vista previa</strong>
          <span style="font-size:.78rem;color:#64748b;">Se actualiza en tiempo real</span>
        </div>
        <div id="cvPreviewWrapper" style="border:1px solid #d8dee8;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 10px 28px rgba(15,30,60,.10);">
          <iframe id="cvPreviewFrame" class="cv-preview-frame" title="Vista previa del CV"></iframe>
        </div>
      </div>
    </div>
  `;

  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const btnFormCancel = document.getElementById("btnFormCancel");
  const btnFormSubmit = document.getElementById("btnFormSubmit");
  const modalClose = document.getElementById("modalClose");

  if (modalTitle) modalTitle.textContent = "Vista Previa de tu Currículum Vitae (CV)";
  if (modalBody) modalBody.innerHTML = selectorHTML;
  if (btnFormSubmit) {
    btnFormSubmit.classList.remove("d-none");
    btnFormSubmit.textContent = "Imprimir / Guardar en PDF";
  }
  if (btnFormCancel) btnFormCancel.textContent = "Cerrar";

  modalOverlay?.classList.remove("d-none");
  modalOverlay?.classList.add("cv-editor-overlay");
  modalOverlay?.querySelector(".modal")?.classList.add("cv-editor-modal");

  // Render inicial y edición en vivo
  function getDraft() {
    return { ...p,
      nombre: document.getElementById("cvNombre")?.value.trim() || p.nombre,
      titular: document.getElementById("cvTitular")?.value.trim() || p.titular,
      ubicacion: document.getElementById("cvUbicacion")?.value.trim() || p.ubicacion,
      telefono: document.getElementById("cvTelefono")?.value.trim() || p.telefono,
      bio: document.getElementById("cvBio")?.value.trim() || p.bio
    };
  }
  function getDraftSkills() { return (document.getElementById("cvSkills")?.value || skillsTags.join(",")).split(",").map(x => x.trim()).filter(Boolean); }
  function renderPreview() {
    const frame = document.getElementById("cvPreviewFrame");
    if (!frame) return;
    frame.srcdoc = buildCVHTML(getDraft(), getDraftSkills(), selectedTemplate);
  }
  modalBody?.querySelectorAll("#cvNombre,#cvTitular,#cvUbicacion,#cvTelefono,#cvBio,#cvSkills").forEach(el => el.addEventListener("input", renderPreview));
  modalBody?.querySelector("#cvSaveChanges")?.addEventListener("click", () => {
    const draft = getDraft();
    skillsTags = getDraftSkills();
    savePerfilExtendido({ ...p, ...draft, skills: skillsTags, experienciaLaboral });
    perfil = getPerfilExtendido();
    renderHero();
    mostrarToast("Los cambios del CV se guardaron en tu perfil.", "success");
  });
  renderPreview();

  // Cambio de template
  modalBody?.querySelectorAll("input[name='cvTemplate']").forEach(radio => {
    radio.addEventListener("change", () => {
      selectedTemplate = radio.value;
      // Actualizar estilos visuales de las cards
      modalBody.querySelectorAll(".cv-template-card").forEach(card => {
        const key = card.dataset.key;
        const t = CV_TEMPLATES[key];
        card.style.border = `2px solid ${key === selectedTemplate ? t.accent : '#e2e8f0'}`;
        card.style.background = key === selectedTemplate ? '#f8f0fc' : '#fff';
      });
      renderPreview();
    });
  });

  // Imprimir: abre ventana nueva con solo el CV
  if (btnFormSubmit) {
    btnFormSubmit.onclick = () => {
      const html = buildCVHTML(getDraft(), getDraftSkills(), selectedTemplate);
      const win = window.open("", "_blank", "width=900,height=700");
      if (win) {
        win.document.open();
        win.document.write(html);
        win.document.close();
        win.onload = () => {
          win.focus();
          win.print();
        };
      } else {
        mostrarToast("Habilita las ventanas emergentes para imprimir.", "warning");
      }
    };
  }

  const cerrar = () => {
    modalOverlay?.classList.add("d-none");
    modalOverlay?.classList.remove("cv-editor-overlay");
    modalOverlay?.querySelector(".modal")?.classList.remove("cv-editor-modal");
    if (btnFormSubmit) {
      btnFormSubmit.classList.add("d-none");
      btnFormSubmit.onclick = null;
    }
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
  experienciaLaboral = Array.isArray(perfil.experienciaLaboral) ? [...perfil.experienciaLaboral] : [];
  renderHero();
  renderFormFields();
  initUserNav();
  mostrarToast(`Rol cambiado a: ${nuevoRol === "empleador" ? "Empleador" : "Candidato"}`, "info");
});

// ── SUBIDA DE FOTO DE PERFIL ──
function setupFotoPerfil() {
  const input = document.getElementById("fotoPerfilInput");
  if (!input) return;

  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      mostrarToast("Por favor selecciona un archivo de imagen válido.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      mostrarToast("La imagen no debe superar los 5MB.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      const user = getUser() || {};
      if (user.id) {
        localStorage.setItem("avatar_" + user.id, base64);
        localStorage.setItem("avatarUploaded_" + user.id, "1");
      }

      perfil.foto = base64;
      savePerfilExtendido(perfil);

      const heroAvatar = document.getElementById("heroAvatar");
      if (heroAvatar) {
        heroAvatar.innerHTML = `<img src="${base64}" alt="Foto de perfil" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      }

      const userAvatar = document.getElementById("userAvatar");
      if (userAvatar) {
        userAvatar.innerHTML = `<img src="${base64}" alt="Foto de perfil" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
      }

      mostrarToast("Foto de perfil actualizada correctamente", "success");
    };
    reader.readAsDataURL(file);
  });
}

// Inicialización
renderHero();
renderFormFields();
setupFotoPerfil();