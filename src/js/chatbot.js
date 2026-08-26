// src/js/chatbot.js
// Asistente Virtual Inteligente con IA (Groq API + LLaMA con fallback resiliente)
// Contextualizado para TicoTalent y el mercado laboral tecnológico de Costa Rica.

import { getUser, getRole, getPerfilExtendido } from "./auth.js";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const CANDIDATE_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768"
];

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

  return `Eres "TicoBot", el asistente virtual de IA de TicoTalent (JobConnect), la plataforma de empleabilidad tech en Costa Rica.

DATOS DEL USUARIO ACTUAL:
- Nombre: ${nombre}
- Rol: ${rol === "empleador" || rol === "reclutador" ? "Empleador / Reclutador de Empresa" : "Candidato / Profesional"}
${rol === "empleador" ? `- Empresa: ${perfil?.empresaNombre || "Empresa Aliada"}` : `- Perfil/Titular: ${perfil?.titular || "Desarrollador / Profesional"}`}

CONOCIMIENTO DE TICOTALENT & COSTA RICA:
- Conecta profesionales de TI con empresas top en CR (Intel, AWS, BAC Digital Labs, SoftServe, Fiserv, Microsoft CR, zonas francas como América, UltraPark, Coyol, El Cafetal).
- Módulos: Explorar/Inicio, Vacantes (con match de compatibilidad), Postulaciones (pipeline de 4 fases), Directorio de Candidatos (Talent Pool), Empresas, Entrevistas y Tareas.
- Rango salarial de referencia en Costa Rica tech: Juniors ($1,200 - $2,000 USD), Mid ($2,200 - $3,800 USD), Seniors/Leads ($4,000 - $7,500+ USD). Modalidades: Remoto WFH, Híbrido, Presencial.

DIRECTRICES:
- Sé servicial, profesional y conciso.
- Usa viñetas y negritas para facilitar la lectura.
- Responde siempre en español.`;
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
 * Intenta llamar a la API de Groq con reintentos en modelos alternativos
 */
async function llamarGroqAPI(userMessage) {
  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const payload = {
        model: model,
        messages: [
          { role: "system", content: getSystemPrompt() },
          ...conversationHistory.slice(-6)
        ],
        temperature: 0.7,
        max_tokens: 500
      };

      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      } else {
        const errJson = await response.json().catch(() => ({}));
        lastError = new Error(errJson?.error?.message || `HTTP ${response.status}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("No se pudo obtener respuesta de los modelos de IA.");
}

/**
 * Motor de Respuestas de Respaldo Heurístico
 * Garantiza que el chatbot SIEMPRE responda incluso sin conexión de red o API limitada.
 */
function generarRespuestaFallback(query) {
  const q = query.toLowerCase();
  const rol = getRole();
  const perfil = getPerfilExtendido();
  const nombre = perfil?.nombre || "Profesional";

  if (q.includes("salario") || q.includes("sueldo") || q.includes("cuanto ganan") || q.includes("usd")) {
    return `En el mercado tecnológico de **Costa Rica (2026)**, los rangos salariales promedio en zonas francas y empresas multinacionales son:

- **Desarrollador Junior (0-2 años):** $1,400 - $2,200 USD / mes.
- **Ingeniero Semi-Senior (2-5 años):** $2,500 - $3,800 USD / mes.
- **Especialista Senior / Líder Técnico (5+ años):** $4,200 - $6,500+ USD / mes.
- **Arquitecto Cloud / DevOps / Datos:** $5,000 - $7,800 USD / mes.

*Nota:* La mayoría de posiciones en TicoTalent ofrecen esquema híbrido o 100% remoto con seguro médico privado.`;
  }

  if (q.includes("vacante") || q.includes("empleo") || q.includes("trabajo") || q.includes("plaza")) {
    return `Actualmente en **TicoTalent** contamos con vacantes activas en las principales empresas tecnológicas de Costa Rica:

- **Desarrollador Full Stack Senior (React / Node):** Intel Costa Rica ($4,500 USD)
- **Ingeniero Frontend (React / TypeScript):** BAC Digital Labs ($3,800 USD)
- **Arquitecto Cloud & DevOps (AWS):** Amazon Web Services CR ($5,500 USD)
- **Ingeniero de Automatización QA:** SoftServe Costa Rica ($3,400 USD)
- **Diseñador de Producto UI/UX:** Align Technology ($3,200 USD)

Puedes ingresar a la sección de **Vacantes** en el menú superior para postularte con tu porcentaje de compatibilidad.`;
  }

  if (q.includes("entrevista") || q.includes("cv") || q.includes("tips") || q.includes("consejo") || q.includes("preparar")) {
    return `Aquí tienes **3 recomendaciones clave** para procesos de selección tech en Costa Rica:

1. **Estructura tu CV en formato STAR:** Destaca logros medibles (ej: *"Optimicé el tiempo de carga un 35% usando React y Vite"*).
2. **Prepara los Fundamentos:** Repasa algoritmos, estructuras de datos y preguntas de diseño de sistemas.
3. **Inglés Técnico:** La mayoría de empresas multinacionales en zonas francas (Heredia, San José) realizan entrevistas en inglés. Demuestra fluidez en tu experiencia técnica.`;
  }

  if (q.includes("como funciona") || q.includes("guia") || q.includes("plataforma") || q.includes("ticotalent")) {
    return `**TicoTalent** funciona de forma sencilla y eficiente:

1. **Explorar:** Revisa el resumen métrico de vacantes y candidatos del país.
2. **Vacantes:** Aplica filtros por modalidad (Remoto, Híbrido), nivel de experiencia y postúlate en un click.
3. **Seguimiento:** Monitorea tu postulación en el pipeline de 4 fases (*CV Recibido ➔ Revisión Técnica ➔ Entrevista ➔ Oferta*).
4. **Mi Perfil:** Mantén actualizadas tus habilidades, pretensión salarial y enlaces a GitHub/LinkedIn.`;
  }

  if (rol === "empleador") {
    return `Estimado/a ${nombre}, desde tu **Panel de Empleador** puedes:
- Publicar y gestionar vacantes laborales.
- Buscar profesionales en el **Talent Pool de Candidatos**.
- Administrar el embudo de postulaciones y agendar entrevistas técnicas.

¿Deseas ayuda con algún módulo específico?`;
  }

  return `Hola ${nombre}, un gusto saludarte. Como asistente de **TicoTalent**, puedo orientarte con:
- Información de vacantes activas en Costa Rica.
- Bandas salariales y modalidades (Remoto / Híbrido).
- Consejos para optimizar tu CV y entrevistas técnicas.
- Guía de uso de los módulos de la plataforma.

¿Qué consulta te gustaría realizar?`;
}

/**
 * Envía el mensaje del usuario a la API de Groq con fallback automático
 */
async function enviarMensaje(userMessage) {
  const input = document.getElementById("ticobotInput");
  const sendBtn = document.getElementById("ticobotSend");
  const messagesEl = document.getElementById("ticobotMessages");
  const suggestions = document.getElementById("ticobotSuggestions");

  if (suggestions) suggestions.style.display = "none";
  if (input) input.value = "";

  appendMessage("user", userMessage);
  conversationHistory.push({ role: "user", content: userMessage });

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
    // 1. Intentar con API de Groq
    const botReply = await llamarGroqAPI(userMessage);
    conversationHistory.push({ role: "assistant", content: botReply });
    document.getElementById(loadingId)?.remove();
    appendMessage("bot", botReply);
  } catch (error) {
    console.warn("Groq API no disponible, activando motor contextual local:", error);
    // 2. Fallback inteligente instantáneo (nunca deja al usuario sin respuesta)
    const fallbackReply = generarRespuestaFallback(userMessage);
    conversationHistory.push({ role: "assistant", content: fallbackReply });
    document.getElementById(loadingId)?.remove();
    appendMessage("bot", fallbackReply);
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
  html = html.replace(/^[•\-\*]\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

  // Saltos de línea
  html = html.replace(/\n/g, "<br>");

  return html;
}
