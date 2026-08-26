// src/js/principal.js
// Controlador para la vista de Inicio / Dashboard

import { requireAuth, getUser, getRole, getVisibleModules } from "./auth.js";
import { getAll } from "./dummyapi.js";
import { mostrarToast, mostrarLoading, ocultarLoading, renderNavbar, escapeHTML } from "./ui.js";

requireAuth();
renderNavbar("principal");

const MODULES_CONFIG = {
  vacantes:      { label: "Vacantes",              desc: "Busca y aplica a ofertas de empleo",                   href: "vacantes.html" },
  postulaciones: { label: "Mis Postulaciones",      desc: "Estado y trazabilidad de tus aplicaciones",            href: "postulaciones.html" },
  candidatos:    { label: "Candidatos Postulados",  desc: "Gestiona candidatos y cambia su estado",              href: "candidatos.html" }
};

function renderQuickModules() {
  const container = document.getElementById("quickModules");
  if (!container) return;

  const modules = getVisibleModules();
  const rol = getRole();

  container.innerHTML = modules.map(id => {
    const mod = MODULES_CONFIG[id];
    if (!mod) return "";
    let label = mod.label;
    let desc = mod.desc;
    if (id === "vacantes" && rol === "empresa") {
      label = "Mis Vacantes";
      desc = "Publica, edita y elimina ofertas de empleo";
    }
    if (id === "candidatos" && rol === "empresa") {
      label = "Candidatos Postulados";
      desc = "Gestiona el estado de los candidatos";
    }
    return `
      <a href="${mod.href}" class="stat-card" style="text-decoration:none;">
        <span class="stat-card__label">${label}</span>
        <p style="color:var(--text-muted);font-size:0.85rem;margin:0;">${desc}</p>
      </a>
    `;
  }).join("");
}

renderQuickModules();

async function cargarMetricas() {
  mostrarLoading();
  try {
    const [candidatosData, vacantesData] = await Promise.allSettled([
      getAll("users"),
      getAll("products")
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

    if (elEmpresas) elEmpresas.textContent = "2";
    if (elPostulaciones) elPostulaciones.textContent = "0";
    if (elTareas) elTareas.textContent = "0";
  } catch (error) {
    console.error("Error al cargar metricas:", error);
    mostrarToast("Error al cargar metricas del panel.", "error");
  } finally {
    ocultarLoading();
  }
}

cargarMetricas();
