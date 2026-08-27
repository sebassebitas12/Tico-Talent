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

// ── Reemplazar hero con diseño estilo Computrabajo ──
const hero = document.querySelector('.landing-hero');
if (hero) {
  hero.innerHTML = `
    <video class="landing-hero__video-bg" autoplay muted loop playsinline preload="metadata">
      <source src="public/videos/hero-bg.mp4" type="video/mp4">
    </video>
    <div class="landing-hero__overlay"></div>
    <div class="landing-hero__center">
      <p class="landing-hero__eyebrow">¡Ahora es el momento de cambiar!</p>
      <h1 class="landing-hero__title">Encuentra tu empleo ideal en Costa Rica</h1>
      <p class="landing-hero__subtitle">Conectamos talento costarricense con las mejores empresas. <strong>5,000+</strong> vacantes activas.</p>
      <div class="landing-hero__search">
        <div class="landing-hero__search-group">
          <svg class="landing-hero__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" class="landing-hero__search-input" placeholder="Puesto, empresa o categoría" id="heroSearchJob">
        </div>
        <div class="landing-hero__search-divider"></div>
        <div class="landing-hero__search-group">
          <svg class="landing-hero__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <input type="text" class="landing-hero__search-input" placeholder="San José, Heredia, Alajuela..." id="heroSearchLocation">
        </div>
        <button class="landing-hero__search-btn" id="heroSearchBtn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Buscar empleos
        </button>
      </div>
      <div class="landing-hero__tags">
        <span class="landing-hero__tag">Desarrollador</span>
        <span class="landing-hero__tag">Marketing</span>
        <span class="landing-hero__tag">Contabilidad</span>
        <span class="landing-hero__tag">Diseño</span>
        <span class="landing-hero__tag">Recursos Humanos</span>
      </div>
      <div class="landing-hero__ctas">
        <a href="login.html?rol=solicitante" class="landing-hero__cta landing-hero__cta--primary">Soy Candidato</a>
        <a href="login.html?rol=empleador" class="landing-hero__cta landing-hero__cta--secondary">Soy Empleador</a>
      </div>
    </div>
    <div class="landing-hero__wave">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,80 C360,0 1080,0 1440,80 L1440,80 L0,80 Z" fill="white"/>
      </svg>
    </div>
  `;

  // Re-registrar eventos del buscador
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
}