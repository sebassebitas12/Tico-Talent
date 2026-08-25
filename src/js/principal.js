// src/js/principal.js
// Controlador para la vista de Inicio / Dashboard
// RF-05, RF-10

import { requireAuth, getUser, logout } from "./auth.js";
import { getAll } from "./dummyapi.js";
import { mostrarToast, mostrarLoading, ocultarLoading } from "./ui.js";

requireAuth();

// ── Inicialización del usuario ────────────────────────────────
const user = getUser();
if (user) {
  const nameEl = document.getElementById("userName");
  const roleEl = document.getElementById("userRole");
  if (nameEl) nameEl.textContent = `${user.firstName} ${user.lastName}`;
  if (roleEl) roleEl.textContent = user.email;
}

document.getElementById("btnLogout")?.addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

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
    mostrarToast("Error al cargar métricas del panel.", "error");
  } finally {
    ocultarLoading();
  }
}

cargarMetricas();
