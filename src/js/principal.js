// src/js/principal.js
// Controlador para la vista de Inicio / Dashboard

import { requireAuth, getUser, getRole, getVisibleModules } from "./auth.js";
import { getAll } from "./dummyapi.js";
import { mostrarToast, mostrarLoading, ocultarLoading, renderNavbar, escapeHTML } from "./ui.js";

requireAuth();
renderNavbar("principal");

const MODULES_CONFIG = {
  vacantes:      { label: "Vacantes",              desc: "Busca y aplica a ofertas de empleo",                   href: "vacantes.html" },
  candidatos:    { label: "Candidatos",            desc: "Gestiona candidatos y cambia su estado",               href: "candidatos.html" },
  empresas:      { label: "Empresas",              desc: "Administra empresas aliadas",                          href: "empresas.html" },
  postulaciones: { label: "Mis Postulaciones",      desc: "Estado y trazabilidad de tus aplicaciones",            href: "postulaciones.html" },
  entrevistas:   { label: "Entrevistas",            desc: "Programa y da seguimiento a entrevistas",              href: "entrevistas.html" },
  tareas:        { label: "Tareas",                 desc: "Gestiona tareas del proceso de reclutamiento",         href: "tareas.html" }
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
    const [candidatosData, vacantesData, empresasData, entrevistasData, tareasData] = await Promise.allSettled([
      getAll("users"),
      getAll("products"),
      getAll("carts"),
      getAll("comments"),
      getAll("todos")
    ]);

    const elCandidatos = document.getElementById("candidatesTotal");
    const elVacantes = document.getElementById("vacanciesTotal");
    const elEmpresas = document.getElementById("companiesTotal");
    const elPostulaciones = document.getElementById("applicationsTotal");
    const elEntrevistas = document.getElementById("interviewsTotal");
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

    if (entrevistasData.status === "fulfilled" && elEntrevistas) {
      const comments = entrevistasData.value.comments ?? entrevistasData.value;
      elEntrevistas.textContent = Array.isArray(comments) ? (entrevistasData.value.total ?? comments.length) : "0";
    }

    if (tareasData.status === "fulfilled" && elTareas) {
      const todos = tareasData.value.todos ?? tareasData.value;
      elTareas.textContent = Array.isArray(todos) ? (tareasData.value.total ?? todos.length) : "0";
    }

    if (elPostulaciones) elPostulaciones.textContent = "0";
  } catch (error) {
    console.error("Error al cargar metricas:", error);
    mostrarToast("Error al cargar metricas del panel.", "error");
  } finally {
    ocultarLoading();
  }
}

cargarMetricas();
