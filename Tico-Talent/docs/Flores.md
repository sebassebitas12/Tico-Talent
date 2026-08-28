# 🇨🇷 TicoTalent (JobConnect) — Resumen Ejecutivo del Trabajo Realizado
**Sistema Web Profesional de Empleabilidad y Reclutamiento para Costa Rica**

---

## 📌 1. Visión General del Proyecto
**TicoTalent** es una plataforma de reclutamiento laboral de alto rendimiento desarrollada **100% en el Frontend** (HTML5 Semántico, CSS3 Moderno y JavaScript ES6+ Modular), diseñada para operar sin backend propio ni servidores intermedios (`db.json` o `json-server`), consumiendo directamente la API pública oficial **DummyJSON** mediante `fetch()` y `async/await`.

El sistema implementa una **arquitectura de doble rol** (Candidato / Empleador) con localización contextual completa para el mercado tecnológico costarricense (salarios en USD, zonas francas, empresas locales e inteligencia de compatibilidad).

---

## 🛠️ 2. Resumen de Funcionalidades y Trabajo Implementado

### 🔐 A. Módulo de Autenticación, Roles y Perfil Extendido (`auth.js`, `login.js`, `login.html`)
- **Autenticación Dual**:
  - Conexión directa contra `POST https://dummyjson.com/auth/login` (credenciales oficiales `emilys` / `emilyspass`).
  - Fallback local de cuentas demo (`carlos` para Empleador, `maria` para Candidata).
  - Almacenamiento seguro del token JWT y sesión en `localStorage`.
- **Detección Dinámica de Rol**:
  - Soporte de parámetros URL (`?rol=empleador` o `?rol=solicitante`) desde la Landing Page para pre-seleccionar credenciales y roles.
- **Perfil Extendido Personalizado (`perfil.html`, `perfil.js`)**:
  - Vistas y formularios interactivos diferenciados:
    - **Candidato**: Nombre, titular profesional, experiencia, pretensión salarial en USD, modalidad de trabajo, gestión dinámica de etiquetas de habilidades (skills) y enlaces a LinkedIn/GitHub.
    - **Empleador / Reclutador**: Nombre comercial, razón social, cédula jurídica, sector industrial, sede en Costa Rica, tamaño de empresa, cargo del reclutador y paquete de beneficios.

---

### 🎨 B. Capa de Presentación, Adaptación y UI Global (`adapters.js`, `ui.js`)
- **Patrón Adaptador (`adapters.js`)**:
  - Transforma los datos crudos y genéricos en inglés de DummyJSON a objetos contextualizados para Costa Rica:
    - `/products` ➔ **Vacantes Laborales** (rango salarial $1,800 - $6,500 USD, ubicación en zonas francas, match de compatibilidad 88%-98%).
    - `/users` ➔ **Candidatos Profesionales** (títulos IT, experiencia laboral, habilidades técnicas y pretensión salarial).
    - `/carts` ➔ **Empresas Aliadas** (Intel, AWS, BAC Digital Labs, SoftServe, Fiserv, Microsoft CR, sedes corporativas).
    - `/posts` ➔ **Postulaciones** (estados por fases, empresas, porcentajes de match).
    - `/comments` ➔ **Entrevistas y Sesiones Técnicas** (horarios en hora CR, enlaces a Google Meet / Teams).
    - `/todos` ➔ **Tareas del Reclutador** (prioridades alta/media/normal, fechas límite).
- **Componentes Globales Reutilizables (`ui.js`)**:
  - **Navbar reactivo por rol**: Renderiza los módulos permitidos en tiempo real (oculta herramientas de reclutador al candidato).
  - **Sistema de Toasts animados**: Notificaciones flotantes no invasivas para éxito, error, advertencia e información.
  - **Modales dinámicos y Diálogos de Confirmación**: Accesibles y desacoplados del DOM.
  - **Seguridad**: Sanitización de strings con `escapeHTML()` contra vulnerabilidades XSS.

---

### 💼 C. Módulos Operativos y CRUDs Completos

#### 1. 🏠 Explorar y Dashboard Principal (`principal.html`, `principal.js`)
- Indicadores métricos en tiempo real consumiendo los 5 recursos de DummyJSON mediante `Promise.allSettled()`.
- Saludo personalizado con el nombre del usuario y su rol.
- Accesos directos y módulos rápidos dinámicos adaptados según si el usuario es Candidato o Empleador.

#### 2. 📋 Gestión de Vacantes (`vacantes.html`, `vacantes.js`)
- Buscador interactivo por cargo/tecnología y por ubicación geográfica en Costa Rica.
- Barra lateral de filtros combinados: **Modalidad** (Remoto, Híbrido, Presencial), **Nivel** (Junior, Mid, Senior, Lead) y **Jornada**.
- Soporte para parámetros de búsqueda desde el Hero de la Landing (`?q=...&location=...`).
- CRUD completo para reclutadores (Crear nueva vacante, Editar salario/requisitos, Eliminar).
- Modal interactivo de postulación inmediata para candidatos con cálculo de afinidad.

#### 3. 👤 Directorio de Candidatos & Talent Pool (`candidatos.html`, `candidatos.js`)
- Buscador reactivo en vivo por nombre, puesto, ciudad, correo o tecnologías.
- Fichas de perfil con avatar, años de experiencia, pretensión salarial y chips de skills.
- Operaciones de contacto, registro de candidatos y edición de perfiles.

#### 4. 🎯 Pipeline de Postulaciones (`postulaciones.html`, `postulaciones.js`)
- **Stepper visual de progreso en 4 etapas** para candidatos:
  1. *CV Recibido* ➔ 2. *Revisión Técnica* ➔ 3. *Entrevista Agendada* ➔ 4. *Oferta Final*.
- Vista de embudo de reclutamiento para empleadores con cambio de fases en tiempo real.

#### 5. 🏢 Empresas Aliadas (`empresas.html`, `empresas.js`)
- Directorio de parques empresariales y corporaciones con volumen de colaboradores y vacantes activas.

#### 6. 📅 Agenda de Entrevistas (`entrevistas.html`, `entrevistas.js`)
- Programación de citas virtuales con plataformas de reunión (Google Meet, Microsoft Teams, Presencial).

#### 7. ✅ Tareas del Reclutador (`tareas.html`, `tareas.js`)
- Checklist operativo con cálculo automático de progreso (completadas / totales) y etiquetas de prioridad.

---

### 🤖 D. Asistente Virtual Inteligente — TicoBot AI (`chatbot.js`, `chatbot.css`)
- **Integración con Groq API & LLaMA 3.3**:
  - Conexión vía Fetch con endpoint `https://api.groq.com/openai/v1/chat/completions`.
- **Caja de Chat Flotante (Widget Bottom-Right)**:
  - Botón flotante animado con pulso y gradiente violeta/magenta.
  - Ventana moderna con indicador de estado en línea ("Online").
  - Botones de sugerencias rápidas (*Vacantes, Salarios en CR, Tips de entrevista, Guía web*).
  - Indicador animado de respuesta ("Escribiendo...").
  - Historial de conversación continuo con memoria de sesión.
  - Conversión de Markdown a HTML para respuestas limpias con viñetas y negritas.
- **Contextualización Especializada**:
  - Conoce el nombre y rol del usuario conectado.
  - Asesora sobre el ecosistema tech de Costa Rica, zonas francas, salarios promedio y preparación para entrevistas.

---

## 🌐 3. Mapeo Oficial de Recursos (DummyJSON)

| Módulo de TicoTalent | Recurso DummyJSON | Métodos HTTP Implementados |
|---|---|---|
| **Candidatos** | `/users` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| **Vacantes** | `/products` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| **Empresas Clientes** | `/carts` | `GET`, `POST`, `PUT`, `DELETE` *(Sin PATCH)* |
| **Postulaciones** | `/posts` | `GET`, `POST`, `PATCH`, `DELETE` *(Sin PUT)* |
| **Entrevistas / Notas** | `/comments` | `GET`, `POST`, `PATCH`, `DELETE` *(Sin PUT)* |
| **Tareas Reclutador** | `/todos` | `GET`, `POST`, `PATCH`, `DELETE` *(Sin PUT)* |
| **Autenticación** | `/auth/login` | `POST` (JWT Token Handling) |

---

## 📂 4. Estructura de Archivos del Proyecto

```text
ticotalent/
├── index.html                      # Landing page pública institucional
├── login.html                      # Vista de inicio de sesión, registro y selector de rol
├── package.json                    # Configuración de scripts y entorno Vite
├── TRABAJO_REALIZADO.md            # Documentación integral del proyecto
└── src/
    ├── css/
    │   ├── variables.css           # Tokens de diseño (colores HSL/HEX, tipografías, sombras)
    │   ├── reset.css               # Normalización de estilos cross-browser
    │   ├── main.css                # Estructura de layouts y grillas
    │   ├── components.css          # Tarjetas, modales, botones y badges
    │   └── chatbot.css             # Estilos y animaciones del widget TicoBot AI
    ├── html/
    │   ├── principal.html          # Panel central / Dashboard de métricas
    │   ├── vacantes.html           # Catálogo de empleos con filtros
    │   ├── candidatos.html         # Directorio y Talent Pool
    │   ├── empresas.html           # Directorio corporativo
    │   ├── postulaciones.html      # Seguimiento de aplicaciones y pipeline
    │   ├── entrevistas.html        # Agenda de citas técnicas
    │   ├── tareas.html             # Checklist del reclutador
    │   └── perfil.html             # Configuración de perfil individual
    └── js/
        ├── dummyapi.js             # Cliente Fetch HTTP para DummyJSON
        ├── adapters.js             # Capa de transformación de datos para Costa Rica
        ├── auth.js                 # Autenticación, roles y perfil extendido en localStorage
        ├── ui.js                   # Navbar dinámico, toasts, modales y confirmaciones
        ├── chatbot.js              # Asistente virtual con IA Groq (LLaMA 3.3)
        ├── landing.js              # Controlador interactivo de la Landing
        ├── login.js                # Controlador del formulario de acceso
        ├── principal.js            # Lógica del dashboard y métricas
        ├── vacantes.js             # Lógica de búsqueda, filtrado y CRUD de vacantes
        ├── candidatos.js           # Búsqueda reactiva y gestión de candidatos
        ├── empresas.js             # Gestión de empresas aliadas
        ├── postulaciones.js        # Pipeline y barra de progreso por etapas
        ├── entrevistas.js          # Agenda y citas
        ├── tareas.js               # Checklist de reclutamiento
        └── perfil.js               # Edición de perfil de candidato y empresa
```

---

## 🚀 5. Puntos Fuertes para la Exposición y Evaluación
1. **Frontend Puro y Robusto**: Cero dependencias de servidores locales o simulados; consumo real de API REST con manejo de errores y estados de carga.
2. **Experiencia de Usuario Premium**: Diseño moderno con paleta violeta/magenta inspirada en plataformas internacionales de reclutamiento, microinteracciones, transiciones fluidas y diseño responsivo para móviles y escritorio.
3. **Innovación con Inteligencia Artificial**: Integración de un chatbot en vivo con la API de Groq impulsado por **LLaMA 3.3**, capaz de interactuar en lenguaje natural y asistir a los usuarios en tiempo real.
4. **Separación de Responsabilidades (SoC)**: Código modular, reutilizable y limpio estructurado en capas (*Client API ➔ Adapters ➔ State/Auth ➔ UI Controllers*).
