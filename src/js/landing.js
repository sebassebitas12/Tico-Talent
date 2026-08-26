// src/js/landing.js
// Interacciones de la Landing Page pública
import { initChatbot } from "./chatbot.js";

// Inicializar Asistente TicoBot AI
initChatbot();

// Manejo del botón "Crear CV Gratis"
document.getElementById("btnCrearCVLanding")?.addEventListener("click", (e) => {
  const token = localStorage.getItem("token");
  if (token) {
    e.preventDefault();
    window.location.href = "src/html/perfil.html";
  }
});

document.getElementById("heroSearchBtn")?.addEventListener("click", () => {
  const job = document.getElementById("heroSearchJob")?.value.trim() || "";
  const location = document.getElementById("heroSearchLocation")?.value.trim() || "";
  const token = localStorage.getItem("token");

  const params = [];
  if (job) params.push("q=" + encodeURIComponent(job));
  if (location) params.push("loc=" + encodeURIComponent(location));
  const queryString = params.length ? "?" + params.join("&") : "";

  if (token) {
    window.location.href = `src/html/vacantes.html${queryString}`;
  } else {
    window.location.href = `login.html?rol=solicitante${queryString ? "&" + params.join("&") : ""}`;
  }
});

document.querySelectorAll(".landing-hero__tag").forEach(tag => {
  tag.addEventListener("click", () => {
    const input = document.getElementById("heroSearchJob");
    if (input) input.value = tag.textContent.trim();
  });
});

const nav = document.querySelector(".landing-nav");
if (nav) {
  window.addEventListener("scroll", () => {
    nav.classList.toggle("landing-nav--scrolled", window.scrollY > 20);
  });
}