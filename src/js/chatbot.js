// src/js/chatbot.js
// Asistente Virtual TicoBot — Anthropic Claude API (claude-sonnet-4-6)
// Contextualizado para TicoTalent y el mercado laboral tecnológico de Costa Rica.

import { getUser, getRole, getPerfilExtendido } from "./auth.js";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

let conversationHistory = [];
let isGenerating = false;

/**
 * Genera el System Prompt contextualizado según el usuario activo
 */
function getSystemPrompt() {
  const user = getUser();
  const perfil = getPerfilExtendido();
  const rol = getRole();
  const nombre = perfil?.nombre || user?.firstName || "Usuario";

  return `Eres "TicoBot", el asistente virtual de IA de TicoTalent (JobConnect), la plataforma de empleabilidad tech en Costa Rica. Eres un asistente conversacional generativo, inteligente y empático.

DATOS DEL USUARIO ACTUAL:
- Nombre: ${nombre}
- Rol: ${rol === "empleador" || rol === "reclutador" ? "Empleador / Reclutador de Empresa" : "Candidato / Profesional"}
${rol === "empleador" ? `- Empresa: ${perfil?.empresaNombre || "Empresa Aliada"}` : `- Perfil/Titular: ${perfil?.titular || "Desarrollador / Profesional"}`}

CONOCIMIENTO DE TICOTALENT & COSTA RICA:
- Conecta profesionales de TI con empresas top en CR (Intel, AWS, BAC Digital Labs, SoftServe, Fiserv, Microsoft CR, zonas francas como América, UltraPark, Coyol, El Cafetal).
- Módulos: Explorar/Inicio, Vacantes (con match de compatibilidad), Postulaciones (pipeline de 4 fases), Directorio de Candidatos (Talent Pool), Empresas, Entrevistas y Tareas.
- Rango salarial de referencia en Costa Rica tech: Juniors ($1,200 - $2,000 USD), Mid ($2,200 - $3,800 USD), Seniors/Leads ($4,000 - $7,500+ USD). Modalidades: Remoto WFH, Híbrido, Presencial.

DIRECTRICES:
- Responde de forma natural, conversacional y generativa. Adapta cada respuesta al contexto específico del mensaje.
- Nunca uses respuestas enlatadas o repetitivas. Cada respuesta debe ser única y relevante.
- Usa viñetas y negritas con moderación para facilitar la lectura cuando la información lo amerite.
- Responde siempre en español de Costa Rica (podés usar "tico" coloquialmente cuando sea apropiado).
- Si no sabes algo con certeza, dilo honestamente y ofrece orientar al usuario.
- Mantén el contexto de la conversación para dar respuestas coherentes y continuas.`;
}

/**
 * Renderiza el Widget del Chatbot en el DOM si no existe
 */
export function initChatbot() {
  if (document.getElementById("ticobotWidget")) return;

  const widgetHTML = `
    <div class="ticobot-widget" id="ticobotWidget">
      <!-- Botón Flotante de Activación -->
      <button class="ticobot-toggle-btn" id="ticobotToggle" aria-label="Abrir asistente TicoBot AI" title="Asistente Virtual TicoBot AI">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="ticobot-toggle-badge">AI</span>
      </button>

      <!-- Caja / Ventana del Chat Flotante -->
      <div class="ticobot-card d-none" id="ticobotCard">
        <!-- Header -->
        <div class="ticobot-header">
          <div class="ticobot-header__avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span class="ticobot-status-dot" title="En línea"></span>
          </div>
          <div class="ticobot-header__info">
            <h4 class="ticobot-title">TicoBot AI</h4>
            <span class="ticobot-subtitle">Asistente de Empleabilidad CR</span>
          </div>
          <div class="ticobot-header__actions">
            <button class="ticobot-btn-action" id="ticobotClear" title="Limpiar conversación">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
            <button class="ticobot-btn-action" id="ticobotClose" title="Minimizar">✕</button>
          </div>
        </div>

        <!-- Sugerencias Rápidas / Pills -->
        <div class="ticobot-suggestions" id="ticobotSuggestions">
          <button class="ticobot-chip" data-prompt="¿Qué vacantes hay disponibles en Costa Rica?">Vacantes Activas</button>
          <button class="ticobot-chip" data-prompt="¿Cuáles son los salarios promedio en tech en Costa Rica?">Salarios Tech CR</button>
          <button class="ticobot-chip" data-prompt="Dame consejos para preparar mi CV y entrevista técnica">Tips de Entrevista</button>
          <button class="ticobot-chip" data-prompt="Explícame cómo funciona TicoTalent paso a paso">Guía de la Web</button>
        </div>

        <!-- Área de Mensajes -->
        <div class="ticobot-messages" id="ticobotMessages">
          <div class="ticobot-msg ticobot-msg--bot">
            <div class="ticobot-msg__avatar">AI</div>
            <div class="ticobot-msg__bubble">
              ¡Hola! Soy <strong>TicoBot</strong>, tu asistente de IA en TicoTalent. ¿En qué te puedo colaborar con tu búsqueda laboral o gestión de talento en Costa Rica?
            </div>
          </div>
        </div>

        <!-- Footer / Input -->
        <form class="ticobot-footer" id="ticobotForm">
          <input 
            type="text" 
            class="ticobot-input" 
            id="ticobotInput" 
            placeholder="Pregúntale a TicoBot AI..." 
            autocomplete="off"
            required
          />
          <button type="submit" class="ticobot-send-btn" id="ticobotSend" aria-label="Enviar mensaje">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", widgetHTML);
  bindChatbotEvents();
}

/**
 * Conecta los event listeners del chatbot
 */
function bindChatbotEvents() {
  const toggleBtn = document.getElementById("ticobotToggle");
  const card = document.getElementById("ticobotCard");
  const closeBtn = document.getElementById("ticobotClose");
  const clearBtn = document.getElementById("ticobotClear");
  const form = document.getElementById("ticobotForm");
  const input = document.getElementById("ticobotInput");
  const suggestions = document.getElementById("ticobotSuggestions");

  toggleBtn?.addEventListener("click", () => {
    const isClosed = card.classList.contains("d-none");
    card.classList.toggle("d-none", !isClosed);
    if (isClosed) {
      setTimeout(() => input?.focus(), 150);
    }
  });

  closeBtn?.addEventListener("click", () => {
    card.classList.add("d-none");
  });

  clearBtn?.addEventListener("click", () => {
    conversationHistory = [];
    const messagesEl = document.getElementById("ticobotMessages");
    if (messagesEl) {
      messagesEl.innerHTML = `
        <div class="ticobot-msg ticobot-msg--bot">
          <div class="ticobot-msg__avatar">AI</div>
          <div class="ticobot-msg__bubble">
            Conversación reiniciada. ¿En qué más te puedo colaborar hoy?
          </div>
        </div>
      `;
    }
    if (suggestions) suggestions.style.display = "flex";
  });

  suggestions?.querySelectorAll(".ticobot-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const prompt = chip.dataset.prompt;
      if (prompt) {
        if (input) input.value = prompt;
        enviarMensaje(prompt);
      }
    });
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto || isGenerating) return;
    enviarMensaje(texto);
  });
}

/**
 * Llama a la Anthropic API (claude-sonnet-4-6) de forma generativa
 */
async function llamarAnthropicAPI(userMessage) {
  const messages = [
    ...conversationHistory.slice(-10), // últimos 10 turnos para contexto
    { role: "user", content: userMessage }
  ];

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: getSystemPrompt(),
      messages: messages
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  if (!content) throw new Error("Respuesta vacía de la API.");
  return content;
}

/**
 * Envía el mensaje del usuario a la Anthropic API con streaming visual
 */
async function enviarMensaje(userMessage) {
  const input = document.getElementById("ticobotInput");
  const sendBtn = document.getElementById("ticobotSend");
  const messagesEl = document.getElementById("ticobotMessages");
  const suggestions = document.getElementById("ticobotSuggestions");

  if (suggestions) suggestions.style.display = "none";
  if (input) input.value = "";

  appendMessage("user", userMessage);

  const loadingId = "typing-" + Date.now();
  const loadingHTML = `
    <div class="ticobot-msg ticobot-msg--bot" id="${loadingId}">
      <div class="ticobot-msg__avatar">AI</div>
      <div class="ticobot-msg__bubble ticobot-msg__bubble--typing">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>
    </div>
  `;
  messagesEl.insertAdjacentHTML("beforeend", loadingHTML);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  isGenerating = true;
  if (sendBtn) sendBtn.disabled = true;

  try {
    const botReply = await llamarAnthropicAPI(userMessage);

    // Guardar en historial DESPUÉS de obtener respuesta
    conversationHistory.push({ role: "user", content: userMessage });
    conversationHistory.push({ role: "assistant", content: botReply });

    document.getElementById(loadingId)?.remove();
    appendMessage("bot", botReply);
  } catch (error) {
    console.error("Error en TicoBot API:", error);
    document.getElementById(loadingId)?.remove();
    appendMessage("bot", `Lo siento, tuve un problema para conectarme en este momento. Por favor intenta de nuevo en unos segundos. Si el error persiste, podés escribirnos a soporte@ticotalent.com 🙏`);
  } finally {
    isGenerating = false;
    if (sendBtn) sendBtn.disabled = false;
    if (input) input.focus();
  }
}

/**
 * Agrega un mensaje formateado al contenedor
 */
function appendMessage(sender, text) {
  const messagesEl = document.getElementById("ticobotMessages");
  if (!messagesEl) return;

  const isBot = sender === "bot";
  const formattedText = formatMarkdownToHTML(text);

  const msgHTML = `
    <div class="ticobot-msg ticobot-msg--${sender}">
      ${isBot ? '<div class="ticobot-msg__avatar">AI</div>' : ''}
      <div class="ticobot-msg__bubble">
        ${formattedText}
      </div>
    </div>
  `;

  messagesEl.insertAdjacentHTML("beforeend", msgHTML);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

/**
 * Convierte Markdown básico a HTML seguro
 */
function formatMarkdownToHTML(str) {
  if (!str) return "";
  let html = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Negrita **texto**
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Cursiva *texto*
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Listas con viñetas
  html = html.replace(/^[-•]\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  // Saltos de línea
  html = html.replace(/\n/g, "<br>");

  return html;
}