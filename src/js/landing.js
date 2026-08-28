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
      <source src="/videos/hero-bg.mp4" type="video/mp4">
    </video>
    <div class="landing-hero__overlay"></div>
    <div class="landing-hero__center">
      <p class="landing-hero__eyebrow">¡Ahora es el momento de cambiar!</p>
      <h1 class="landing-hero__title">Encuentra tu empleo ideal en Costa Rica</h1>
      <p class="landing-hero__subtitle">Conectamos talento costarricense con las mejores empresas. <strong>5,000+</strong> vacantes activas.</p>
      <div style="background:#fff;border-radius:50px;display:flex;align-items:center;padding:0.35rem 0.35rem 0.35rem 1.25rem;box-shadow:0 4px 24px rgba(0,0,0,0.18);max-width:720px;width:100%;margin:0 auto;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
        <input type="text" id="heroSearchJob" placeholder="Cargo o categoría"
          style="flex:1;border:none;outline:none;font-size:0.97rem;padding:0.6rem 0.75rem;color:#111827;background:transparent;min-width:0;">
        <div style="width:1px;height:28px;background:#e5e7eb;flex-shrink:0;"></div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-left:0.75rem;">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <input type="text" id="heroSearchLocation" placeholder="Lugar"
          style="flex:0.7;border:none;outline:none;font-size:0.97rem;padding:0.6rem 0.75rem;color:#111827;background:transparent;min-width:0;">
        <button id="heroSearchBtn"
          style="background:var(--secondary-navy,#1e3a8a);color:#fff;border:none;border-radius:50px;padding:0.7rem 1.4rem;font-size:0.93rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:0.5rem;white-space:nowrap;flex-shrink:0;transition:background 0.2s;">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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