// src/js/principal.js
// Controlador para la vista de Inicio / Dashboard Principal
// RF-05, RF-10

import { requireAuth, getUser, getRole, getPerfilExtendido } from "./auth.js";
import { getAll } from "./dummyapi.js";
import { initUserNav, mostrarToast, mostrarLoading, ocultarLoading, escapeHTML } from "./ui.js";

requireAuth();
initUserNav();

const user = getUser() || {};
const perfil = getPerfilExtendido();
const rol = getRole();

// Personalizar saludo del Hero y módulos rápidos
const heroTitle = document.getElementById("heroTitle");
const heroSubtitle = document.querySelector(".hero__subtitle");
if (heroTitle && perfil.nombre) {
  heroTitle.textContent = `¡Hola, ${perfil.nombre.split(" ")[0]}! Bienvenido a Tico Talent`;
  if (heroSubtitle) {
    heroSubtitle.textContent = (rol === "empleador" || rol === "reclutador")
      ? `Gestiona las vacantes de ${perfil.empresaNombre || "tu empresa"} y encuentra a los mejores profesionales en Costa Rica.`
      : `Explora vacantes afines a tu perfil como ${perfil.titular || "profesional"} y postúlate en empresas líderes de CR.`;
  }
}

// Renderizar accesos directos dinámicos por rol
const statsGrid = document.querySelector(".stats-grid");
if (statsGrid) {
  if (rol === "empleador" || rol === "reclutador") {
    statsGrid.innerHTML = `
      <a href="candidatos.html" class="stat-card" style="text-decoration:none;">
        <span class="stat-card__label">👤 Talent Pool de Candidatos</span>
        <p style="color:var(--text-muted);font-size:0.85rem;margin:0;">Explora perfiles y descarga hojas de vida</p>
      </a>
      <a href="vacantes.html" class="stat-card" style="text-decoration:none;">
        <span class="stat-card__label">💼 Publicar / Gestionar Vacantes</span>
        <p style="color:var(--text-muted);font-size:0.85rem;margin:0;">Administra plazas activas y requisitos</p>
      </a>
      <a href="postulaciones.html" class="stat-card" style="text-decoration:none;">
        <span class="stat-card__label">🎯 Pipeline de Postulaciones</span>
        <p style="color:var(--text-muted);font-size:0.85rem;margin:0;">Avanza candidatos de etapa y revisa notas</p>
      </a>
      <a href="tareas.html" class="stat-card" style="text-decoration:none;">
        <span class="stat-card__label">✅ Tareas del Reclutador</span>
        <p style="color:var(--text-muted);font-size:0.85rem;margin:0;">Organiza pendientes del día y entrevistas</p>
      </a>
    `;
  } else {
    statsGrid.innerHTML = `
      <a href="vacantes.html" class="stat-card" style="text-decoration:none;">
        <span class="stat-card__label">💼 Explorar Vacantes Afines</span>
        <p style="color:var(--text-muted);font-size:0.85rem;margin:0;">Plazas de empleo con match de compatibilidad</p>
      </a>
      <a href="postulaciones.html" class="stat-card" style="text-decoration:none;">
        <span class="stat-card__label">📄 Mis Postulaciones Activas</span>
        <p style="color:var(--text-muted);font-size:0.85rem;margin:0;">Trazabilidad y estados de tus aplicaciones</p>
      </a>
      <a href="empresas.html" class="stat-card" style="text-decoration:none;">
        <span class="stat-card__label">🏢 Directorio de Empresas</span>
        <p style="color:var(--text-muted);font-size:0.85rem;margin:0;">Corporaciones y parques tecnológicos en CR</p>
      </a>
      <a href="perfil.html" class="stat-card" style="text-decoration:none;">
        <span class="stat-card__label">⚙️ Mi Perfil Profesional</span>
        <p style="color:var(--text-muted);font-size:0.85rem;margin:0;">Actualiza tus skills, CV y pretensión salarial</p>
      </a>
    `;
  }
}

// ── Cargar métricas del resumen ───────────────────────────────
async function cargarMetricas() {
  mostrarLoading();
  try {
    const [candidatosData, vacantesData, empresasData, postulacionesData, tareasData] = await Promise.allSettled([
      getAll("users"),
      getAll("products"),
      getAll("carts"),
      getAll("posts"),
      getAll("todos")
    ]);

    const elCandidatos = document.getElementById("candidatesTotal");
    const elVacantes = document.getElementById("vacanciesTotal");
    const elEmpresas = document.getElementById("companiesTotal");
    const elPostulaciones = document.getElementById("applicationsTotal");
    const elTareas = document.getElementById("tasksTotal");

    if (candidatosData.status === "fulfilled" && elCandidatos) {
      const users = candidatosData.value.users ?? candidatosData.value;
      elCandidatos.textContent = Array.isArray(users) ? (candidatosData.value.total ?? users.length) : "0";
    }

    if (vacantesData.status === "fulfilled" && elVacantes) {
      const prods = vacantesData.value.products ?? vacantesData.value;
      elVacantes.textContent = Array.isArray(prods) ? (vacantesData.value.total ?? prods.length) : "0";
    }

    if (empresasData.status === "fulfilled" && elEmpresas) {
      const carts = empresasData.value.carts ?? empresasData.value;
      elEmpresas.textContent = Array.isArray(carts) ? (empresasData.value.total ?? carts.length) : "0";
    }

    if (postulacionesData.status === "fulfilled" && elPostulaciones) {
      const posts = postulacionesData.value.posts ?? postulacionesData.value;
      elPostulaciones.textContent = Array.isArray(posts) ? (postulacionesData.value.total ?? posts.length) : "0";
    }

    if (tareasData.status === "fulfilled" && elTareas) {
      const todos = tareasData.value.todos ?? tareasData.value;
      elTareas.textContent = Array.isArray(todos) ? (tareasData.value.total ?? todos.length) : "0";
    }
  } catch (error) {
    console.error("Error al cargar métricas:", error);
    mostrarToast("Error al sincronizar métricas del panel.", "error");
  } finally {
    ocultarLoading();
  }
}

cargarMetricas();
