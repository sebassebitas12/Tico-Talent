// src/js/chatbot.js
// Asistente Virtual TicoBot — TicoTalent
// Compatible con la API /api/ticobot configurada en vite.config.js.

import { getUser, getRole, getPerfilExtendido, isAuthenticated } from "./auth.js";

const TICO_BOT_API_URL = "/api/ticobot";

let conversationHistory = [];
let isGenerating = false;


const TICOBOT_AVATAR = `
<svg class="ticobot-avatar-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="8" y="14" width="48" height="37" rx="15" fill="#FFFFFF" stroke="#531068" stroke-width="2"/>
  <rect x="15" y="21" width="34" height="22" rx="10" fill="#531068"/>
  <circle cx="26" cy="32" r="3" fill="#8CE7FF"/>
  <circle cx="38" cy="32" r="3" fill="#8CE7FF"/>
  <path d="M26 37c3 2 7 2 12 0" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
  <path d="M32 14V8" stroke="#531068" stroke-width="2" stroke-linecap="round"/>
  <circle cx="32" cy="6" r="3" fill="#D8006E"/>
  <path d="M11 29H6M53 29h5" stroke="#531068" stroke-width="2" stroke-linecap="round"/>
  <path d="M18 51l-4 7M46 51l4 7" stroke="#531068" stroke-width="3" stroke-linecap="round"/>
  <circle cx="14" cy="59" r="3" fill="#7BCB62"/>
  <circle cx="50" cy="59" r="3" fill="#7BCB62"/>
</svg>`;

function getSystemPrompt() {
  const authenticated = isAuthenticated();
  const user = authenticated ? getUser() : null;
  const perfil = authenticated ? getPerfilExtendido() : {};
  const rol = authenticated ? getRole() : null;
  const nombre = perfil?.nombre || user?.firstName || "Usuario";

  return `Eres "TicoBot", el asistente virtual de IA de TicoTalent, una plataforma de empleabilidad tecnológica en Costa Rica.

DATOS DEL USUARIO ACTUAL:
- Nombre: ${nombre}
- Rol: ${rol === "empleador" || rol === "reclutador" ? "Empleador / Reclutador de Empresa" : "Candidato / Profesional"}
${rol === "empleador"
      ? `- Empresa: ${perfil?.empresaNombre || "Empresa Aliada"}`
      : `- Perfil/Titular: ${perfil?.titular || "Desarrollador / Profesional"}`}

CONOCIMIENTO DE TICOTALENT:
- Vacantes y búsqueda de empleo.
- Postulaciones.
- Empresas.
- Entrevistas.
- Tareas.
- Desarrollo Profesional.
- Perfil y CV.
- Directorio de candidatos.
- Gestión de talento para empresas.

CONTEXTO LABORAL:
- La plataforma está orientada al mercado laboral tecnológico de Costa Rica.
- Modalidades: remoto, híbrido y presencial.
- Puedes orientar sobre CV, entrevistas, búsqueda de empleo, desarrollo profesional y procesos de selección.

DIRECTRICES:
- Responde de forma natural, conversacional y generativa.
- Responde siempre en español de Costa Rica.
- Sé claro y útil.
- No inventes datos específicos sobre vacantes que no conozcas.
- Si no sabes algo con certeza, dilo.
- Mantén el contexto de la conversación.
- No repitas respuestas enlatadas si el usuario continúa la conversación.`;
}

export function initChatbot() {
  if (document.getElementById("ticobotWidget")) return;

  const widgetHTML = `
    <div class="ticobot-widget" id="ticobotWidget">
      <button
        class="ticobot-toggle-btn"
        id="ticobotToggle"
        type="button"
        aria-label="Abrir asistente TicoBot AI"
        title="Asistente Virtual TicoBot AI"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="ticobot-toggle-badge">AI</span>
      </button>

      <div class="ticobot-card d-none" id="ticobotCard">
        <div class="ticobot-header">
          <div class="ticobot-header__avatar">
            ${TICOBOT_AVATAR}
            <span class="ticobot-status-dot" title="En línea"></span>
          </div>

          <div class="ticobot-header__info">
            <h4 class="ticobot-title">TicoBot AI</h4>
            <span class="ticobot-subtitle">Asistente de Empleabilidad CR</span>
          </div>

          <div class="ticobot-header__actions">
            <button class="ticobot-btn-action" id="ticobotClear" type="button" title="Limpiar conversación" aria-label="Limpiar conversación">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>

            <button class="ticobot-btn-action" id="ticobotClose" type="button" title="Minimizar" aria-label="Minimizar">
              ✕
            </button>
          </div>
        </div>

        <div class="ticobot-suggestions" id="ticobotSuggestions">
          <button class="ticobot-chip" type="button" data-prompt="¿Qué vacantes hay disponibles en Costa Rica?">Vacantes Activas</button>
          <button class="ticobot-chip" type="button" data-prompt="¿Cuáles son los salarios promedio en tecnología en Costa Rica?">Salarios Tech CR</button>
          <button class="ticobot-chip" type="button" data-prompt="Dame consejos para preparar mi CV y entrevista técnica">Tips de CV</button>
          <button class="ticobot-chip" type="button" data-prompt="Explícame cómo funciona TicoTalent paso a paso">Guía de la Web</button>
        </div>

        <div class="ticobot-messages" id="ticobotMessages">
          <div class="ticobot-msg ticobot-msg--bot">
            <div class="ticobot-msg__avatar">${TICOBOT_AVATAR}</div>
            <div class="ticobot-msg__bubble">
              ¡Hola! Soy <strong>TicoBot</strong>, tu asistente de IA en TicoTalent. ¿En qué te puedo colaborar con tu búsqueda laboral o gestión de talento en Costa Rica?
            </div>
          </div>
        </div>

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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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

function bindChatbotEvents() {
  const toggleBtn = document.getElementById("ticobotToggle");
  const card = document.getElementById("ticobotCard");
  const closeBtn = document.getElementById("ticobotClose");
  const clearBtn = document.getElementById("ticobotClear");
  const form = document.getElementById("ticobotForm");
  const input = document.getElementById("ticobotInput");
  const suggestions = document.getElementById("ticobotSuggestions");

  toggleBtn?.addEventListener("click", () => {
    if (!card) return;

    const isClosed = card.classList.contains("d-none");
    card.classList.toggle("d-none", !isClosed);

    if (isClosed) {
      window.setTimeout(() => input?.focus(), 120);
    }
  });

  closeBtn?.addEventListener("click", () => {
    card?.classList.add("d-none");
  });

  clearBtn?.addEventListener("click", () => {
    conversationHistory = [];

    const messagesEl = document.getElementById("ticobotMessages");

    if (messagesEl) {
      messagesEl.innerHTML = `
        <div class="ticobot-msg ticobot-msg--bot">
          <div class="ticobot-msg__avatar">${TICOBOT_AVATAR}</div>
          <div class="ticobot-msg__bubble">
            Conversación reiniciada. ¿En qué más te puedo colaborar hoy?
          </div>
        </div>
      `;
    }

    if (suggestions) {
      suggestions.style.display = "flex";
    }

    input?.focus();
  });

  suggestions?.querySelectorAll(".ticobot-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const prompt = chip.dataset.prompt || "";

      if (!prompt || isGenerating) return;

      if (input) input.value = prompt;

      enviarMensaje(prompt);
    });
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!input || isGenerating) return;

    const texto = input.value.trim();

    if (!texto) return;

    enviarMensaje(texto);
  });
}

/**
 * Llama a la API de TicoBot.
 *
 * El servidor de Vite devuelve:
 * {
 *   content: "...",
 *   demo: false
 * }
 */
async function llamarGroqAPI(userMessage) {
  const messages = [
    { role: "system", content: getSystemPrompt() },
    ...conversationHistory.slice(-10),
    { role: "user", content: userMessage }
  ];

  let response;

  try {
    response = await fetch(TICO_BOT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ messages }),
      cache: "no-store"
    });
  } catch (networkError) {
    console.error("TicoBot: no se pudo conectar con Vite.", networkError);
    throw new Error("No se pudo conectar con el servidor de TicoBot.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detalle = data?.error || `TicoBot API respondió HTTP ${response.status}`;
    throw new Error(detalle);
  }

  if (typeof data?.content !== "string" || !data.content.trim()) {
    throw new Error("El servicio de TicoBot no devolvió contenido.");
  }

  return data.content.trim();
}

function respuestaLocal(userMessage) {
  const q = String(userMessage || "").toLowerCase();
  const esEmpresa = ["empleador", "reclutador"].includes(getRole());
  if (q.includes("cv") || q.includes("currículum") || q.includes("curriculum")) return "Podés crear tu CV desde Mi perfil y CV. Elegí una plantilla, revisá la vista previa y editá tu información antes de descargarlo como PDF.";
  if (q.includes("vacante") || q.includes("empleo") || q.includes("trabajo")) return esEmpresa ? "Como empleador, podés gestionar tus vacantes desde Servicios → Gestionar vacantes y revisar las postulaciones asociadas." : "Podés explorar oportunidades desde Servicios → Buscar empleo y filtrar por puesto, tecnología, empresa y ubicación.";
  if (q.includes("candidato") || q.includes("postul")) return esEmpresa ? "Podés buscar candidatos y gestionar postulaciones desde el menú Servicios. También podés usar el pipeline para dar seguimiento a cada proceso." : "Podés revisar el estado de tus postulaciones desde Servicios → Mis postulaciones.";
  if (q.includes("entrevista")) return "Para prepararte, definí ejemplos concretos de tus proyectos, logros y problemas que resolviste. Si querés, escribime el puesto y practicamos preguntas específicas.";
  return esEmpresa ? "Puedo ayudarte a gestionar vacantes, candidatos, postulaciones, entrevistas y procesos de contratación." : "Puedo ayudarte con tu CV, vacantes, postulaciones, entrevistas y desarrollo profesional.";
}

async function enviarMensaje(userMessage) {
  const input = document.getElementById("ticobotInput");
  const sendBtn = document.getElementById("ticobotSend");
  const messagesEl = document.getElementById("ticobotMessages");
  const suggestions = document.getElementById("ticobotSuggestions");

  if (!messagesEl || isGenerating) return;

  if (suggestions) {
    suggestions.style.display = "none";
  }

  if (input) {
    input.value = "";
  }

  appendMessage("user", userMessage);

  const loadingId = `typing-${Date.now()}`;

  messagesEl.insertAdjacentHTML(
    "beforeend",
    `
      <div class="ticobot-msg ticobot-msg--bot" id="${loadingId}">
        <div class="ticobot-msg__avatar">${TICOBOT_AVATAR}</div>
        <div class="ticobot-msg__bubble ticobot-msg__bubble--typing">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    `
  );

  messagesEl.scrollTop = messagesEl.scrollHeight;

  isGenerating = true;

  if (sendBtn) {
    sendBtn.disabled = true;
  }

  try {
    const botReply = await llamarGroqAPI(userMessage);

    conversationHistory.push({
      role: "user",
      content: userMessage
    });

    conversationHistory.push({
      role: "assistant",
      content: botReply
    });

    document.getElementById(loadingId)?.remove();

    appendMessage("bot", botReply);
  } catch (error) {
    console.error("TicoBot Groq error:", error);

    document.getElementById(loadingId)?.remove();

    const mensajeError = error?.message || "No se pudo obtener una respuesta de TicoBot.";
    const esClaveInvalida = /invalid api key|invalid_api_key/i.test(mensajeError);
    const mensajeVisible = esClaveInvalida
      ? "TicoBot no pudo autenticarse con Groq. Revisá la clave GROQ_API_KEY del archivo .env, guardá el cambio y reiniciá Vite."
      : `No pude completar la consulta con la IA: ${mensajeError}`;
    appendMessage("bot", mensajeVisible);
    console.error("TicoBot: respuesta de error del servicio:", mensajeError);
  } finally {
    isGenerating = false;

    if (sendBtn) {
      sendBtn.disabled = false;
    }

    input?.focus();
  }
}

function appendMessage(sender, text) {
  const messagesEl = document.getElementById("ticobotMessages");

  if (!messagesEl) return;

  const isBot = sender === "bot";
  const formattedText = formatMarkdownToHTML(text);

  messagesEl.insertAdjacentHTML(
    "beforeend",
    `
      <div class="ticobot-msg ticobot-msg--${sender}">
        ${isBot ? '<div class="ticobot-msg__avatar">${TICOBOT_AVATAR}</div>' : ""}
        <div class="ticobot-msg__bubble">${formattedText}</div>
      </div>
    `
  );

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function formatMarkdownToHTML(str) {
  if (!str) return "";

  let html = String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/^[-•]\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
  html = html.replace(/<\/ul>\s*<ul>/g, "");
  html = html.replace(/\n/g, "<br>");

  return html;
}
