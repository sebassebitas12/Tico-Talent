# TicoTalent (JobConnect) — Trabajo Realizado por Sebastián Flores
**Sistema Web Profesional de Empleabilidad y Reclutamiento para Costa Rica**  
Rama Git: `Flores` · FWD Costa Rica · Agosto 2026

---

## 1. Visión General del Proyecto

**TicoTalent** es una plataforma de reclutamiento laboral desarrollada **100% en Frontend** (HTML5 semántico, CSS3 moderno y JavaScript ES6+ modular), sin backend propio ni servidores intermedios, consumiendo directamente la API pública **DummyJSON** mediante `fetch()` y `async/await`.

El sistema implementa una **arquitectura de doble rol** (Candidato / Empleador) con localización contextual completa para el mercado tecnológico costarricense: salarios en USD, zonas francas, empresas locales, e inteligencia de compatibilidad (match %).

---

## 2. Funcionalidades Implementadas

### A. Módulo de Autenticación, Roles y Perfil Extendido (`auth.js`, `login.js`, `login.html`)

- **Autenticación Dual**:
  - Conexión directa contra `POST https://dummyjson.com/auth/login` (credenciales `emilys` / `emilyspass`).
  - Fallback local de cuentas demo: `carlos` (Empleador) y `maria` (Candidata).
  - Almacenamiento seguro del token JWT y sesión en `localStorage`.
- **Detección Dinámica de Rol**:
  - Soporte de parámetros URL `?rol=empleador` / `?rol=solicitante` desde la Landing para pre-seleccionar rol.
- **Perfil Extendido** (`perfil.html`, `perfil.js`):
  - Vista diferenciada por rol:
    - **Candidato**: titular profesional, pretensión salarial, skills (chips editables), LinkedIn/GitHub, experiencia laboral por empresa.
    - **Empleador**: nombre comercial, razón social, cédula jurídica, sector, sede CR, tamaño, beneficios, experiencia del reclutador.
  - Generador de CV con 3 plantillas (Moderno, Ejecutivo, Minimalista).

---

### B. Capa de Presentación y UI Global (`adapters.js`, `ui.js`)

- **Patrón Adaptador** (`adapters.js`):
  - Transforma datos en inglés de DummyJSON a objetos contextualizados para CR:
    - `/products` → Vacantes laborales con rango salarial USD, ubicación en zonas francas y match %.
    - `/users` → Candidatos profesionales con títulos IT, skills técnicos y pretensión salarial.
    - `/carts` → Empresas aliadas: Intel, AWS, BAC Digital Labs, SoftServe, Fiserv, Microsoft CR.
    - `/posts` → Postulaciones con estados por fases, empresas y porcentajes de match.
    - `/comments` → Entrevistas con horarios en hora CR, enlaces Meet/Teams.
    - `/todos` → Tareas del reclutador con prioridades y fechas límite.
- **Componentes Globales** (`ui.js`):
  - Navbar reactivo por rol (muestra solo los módulos permitidos según el usuario).
  - Sistema de toasts animados con SVG inline (éxito, error, advertencia, info) — sin emojis.
  - Modales dinámicos y diálogos de confirmación con SVG de advertencia.
  - `escapeHTML()` para sanitización contra XSS.
  - Dropdown de notificaciones en el topbar que NO se cierra al hacer scroll interno.

---

### C. Módulos Operativos y CRUDs

#### Dashboard Principal (`principal.html`, `principal.js`)
- Métricas en tiempo real con `Promise.allSettled()` sobre los 5 recursos de DummyJSON.
- Saludo personalizado por nombre y rol.
- Accesos rápidos diferenciados por Candidato / Empleador.
- Stat cards sin emojis — íconos SVG.

#### Vacantes (`vacantes.html`, `vacantes.js`)
- Buscador interactivo por cargo/tecnología y ubicación.
- Filtros: Modalidad (Remoto / Híbrido / Presencial), Nivel (Junior / Mid / Senior / Lead), Jornada.
- Soporte para parámetros `?q=&location=` desde la Landing.
- CRUD completo para empleadores (Crear, Editar, Eliminar).
- Botón **"Postularme"** con lógica corregida:
  - Guarda la postulación en `applicationStore` (`tt_postulaciones_local`) con `vacanteId` y `userId`.
  - Prevención de doble postulación a la misma vacante.
  - La postulación aparece inmediatamente en "Mis Postulaciones" del candidato.

#### Candidatos (`candidatos.html`, `candidatos.js`)
- Buscador reactivo en vivo: nombre, puesto, ciudad, correo, tecnologías.
- Fichas de perfil con avatar, años de experiencia, pretensión salarial y chips de skills.
- Operaciones de contacto, registro y edición de perfiles.

#### Postulaciones (`postulaciones.html`, `postulaciones.js`)
- Candidato: vista de "Mis Postulaciones" filtrada por `userId === usuario logueado`.
  - Barra de progreso visual en 4 etapas: CV Recibido → Revisión Técnica → Entrevista → Oferta Final.
  - Merge de postulaciones locales (`applicationStore`) + remotas de DummyJSON.
- Empleador: embudo de selección con todas las postulaciones.
  - Modal de cambio de etapa con radio buttons visuales.
  - `PATCH /posts/{id}` para actualizar estado en DummyJSON.
- Eliminación con notificación de undo vía `localTrashStore`.

#### Empresas (`empresas.html`, `empresas.js`)
- Directorio de parques empresariales y corporaciones con volumen de colaboradores y vacantes activas.
- CRUD: Crear, Editar (`PUT`), Eliminar.

#### Entrevistas (`entrevistas.html`, `entrevistas.js`)
- Agendamiento de citas con plataformas: Google Meet, Microsoft Teams, Presencial.
- Íconos SVG inline para plataforma (sin emojis).
- Botón de eliminar con SVG trash — sin texto, solo ícono.

#### Tareas (`tareas.html`, `tareas.js`)
- Checklist operativo con prioridad alta/media/normal.
- Cálculo automático de progreso (completadas / total).
- `PATCH /todos/{id}` para marcar completado.

---

### D. Asistente Virtual TicoBot AI (`chatbot.js`, `chatbot.css`)

- **Groq API + LLaMA 3.3 70B**:
  - `POST https://api.groq.com/openai/v1/chat/completions`
- **Widget flotante** (bottom-right):
  - Botón con animación de pulso y gradiente.
  - Indicador "Escribiendo..." durante la respuesta.
  - Historial de conversación en memoria de sesión.
  - Markdown → HTML para respuestas con viñetas y negritas.
  - Sugerencias rápidas: Vacantes, Salarios CR, Tips de entrevista, Guía web.
- Contextualizado: conoce el nombre y rol del usuario activo, salarios típicos CR, zonas francas.

---

### E. Persistencia y Stores

- **`applicationStore.js`** — Guarda postulaciones en `localStorage["tt_postulaciones_local"]`. Esencial porque DummyJSON no persiste los `POST /posts/add`.
- **`notificationStore.js`** — Maneja estado de notificaciones: creación, marcar leídas, limpiar.
- **`localTrashStore.js`** — Papelera con soporte undo: guarda copias de registros eliminados y permite restaurarlos desde el Centro de Notificaciones.

---

### F. Centro de Notificaciones (`notificaciones.html`, `notificaciones.js`)

- Filtros por tipo: Todas / Vacantes / Postulaciones / Sistema / Capacitación.
- Event delegation en `#notifFiltros` — botones estáticos del HTML (no duplicados desde JS).
- Botones globales `#btnMarcarTodas` y `#btnLimpiarTodas` conectados al JS.
- Tarjetas con: punto de no leído, botón "Marcar leída", botón "Deshacer eliminación" (cuando aplica), botón "Eliminar".
- Dropdown de notificaciones en topbar — corregido: no cierra al hacer scroll interno.

---

### G. Landing Page (`index.html`, `landing.js`)

- Hero con video de fondo (Pexels CDN), buscador de empleo con 5 tags de categorías.
- Sección "Cómo funciona" con 3 pasos.
- Sección "Beneficios" con ilustración SVG animada inline (reemplazó `<dotlottie-player>` que fallaba — ahora cero dependencias externas, animaciones CSS puras con `prefers-reduced-motion`).
- Sección "Empresas" con logos de texto.
- Sección "Guías" con 2 artículos extensos: Cómo crear un CV / Cómo prepararse para una entrevista.
- Modal de plantillas de CV con 3 opciones interactivas.
- Footer completo con navegación, contacto y copyright.

---

## 3. Bugs Resueltos en Esta Sesión

| # | Archivo | Problema | Solución |
|---|---|---|---|
| 1 | `ui.js` | Bloque de CSS pegado al final del archivo JS | Eliminado; estilos movidos a `components.css` |
| 2 | `ui.js` | Íconos de toast con emojis (✓ ✕ ℹ ⚠) | Reemplazados con SVGs inline |
| 3 | `ui.js` | Dropdown de notificaciones se cerraba al hacer scroll interno | Corregido con guard en listener de `document` |
| 4 | `notificaciones.js` | Toolbar duplicado (HTML estático + renderizado por JS) | JS solo dueño de la lista; HTML dueño del toolbar |
| 5 | `notificaciones.js` | Filtros y botones del HTML estáticos no conectados | Conectados vía event delegation e IDs |
| 6 | `principal.js` | Emojis ✅ y ⚙️ en las stat cards | Eliminados |
| 7 | `entrevistas.js` | Botón eliminar sin contenido | Ahora tiene SVG trash |
| 8 | `components.css` | Estilos de notificaciones faltantes | Añadidos: `.notif-filter-bar`, `.notification-card`, `.notifications-empty`, etc. |
| 9 | `index.html` | `<dotlottie-player>` fallaba (CDN/URL rota, mostraba triángulo de error) | Reemplazado por SVG animado inline — sin CDN, sin dependencias |
| 10 | `vacantes.js` | Postularse desde vacantes no guardaba en `applicationStore` | Corregido: `saveLocalApplication()` con `vacanteId` + prevención de duplicados |

---

## 4. Mapeo de Recursos DummyJSON

| Módulo | Recurso | Métodos |
|---|---|---|
| Candidatos | `/users` | GET · POST · PUT · PATCH · DELETE |
| Vacantes | `/products` | GET · POST · PUT · PATCH · DELETE |
| Empresas clientes | `/carts` | GET · POST · PUT · DELETE |
| Postulaciones | `/posts` | GET · POST · PATCH · DELETE |
| Entrevistas / Notas | `/comments` | GET · POST · PATCH · DELETE |
| Tareas del reclutador | `/todos` | GET · POST · PATCH · DELETE |
| Autenticación | `/auth/login` | POST |

---

## 5. Puntos Fuertes para la Exposición

1. **Frontend puro y robusto** — Sin backend, sin servidores locales; consumo real de DummyJSON con manejo de errores y estados de carga.
2. **Arquitectura en capas clara** — API Client → Adapters → Stores → Auth → UI Controllers.
3. **Localización CR real** — Salarios USD, zonas francas, empresas reales, modalidades del mercado local.
4. **IA integrada** — TicoBot con Groq + LLaMA 3.3 funcionando en producción, contextualizado para el usuario y el mercado CR.
5. **Diseño premium** — Paleta violeta/magenta, microinteracciones, componentes accesibles (aria-labels, `prefers-reduced-motion`).
6. **Persistencia confiable** — 3 stores en localStorage (applicationStore, notificationStore, localTrashStore) con soporte de undo.
7. **Postulaciones que funcionan** — La acción "Postularme" guarda en el store y aparece inmediatamente en el pipeline del candidato.
