# 👤 Registro de trabajo — Alex (Alexx-Aguilar)

> Documento para registrar todo lo que **yo**, Alex, he hecho en la página **Tico-Talent**.
> Basado en el historial de Git (rama `alex`) y los cambios recientes del proyecto.

---

## 🗂️ Contexto del proyecto

- **Proyecto:** Tico-Talent — Plataforma de empleo para Costa Rica.
- **Rama de trabajo:** `alex`
- **Colaboradores:** `anaocampo1994fwdcostarica-code`, `sebassebitas12`, `Thiffanie-Programadora`, `Alexx-Aguilar` (yo).

---

## ✅ Lo que he hecho — Resumen por fecha

### 1. 25 de agosto de 2026 — "modificación css, estructura global y visual" (`30882cf`)

Fue un cambio grande de estructura y diseño en todo el proyecto:

- **Reorganicé la estructura de CSS:** moví los estilos de `src/css/` a una carpeta `css/` y añadí muchísimo estilo nuevo:
  - Creé/aumenté `css/main.css` (≈532 líneas nuevas).
  - Amplié `css/components.css` e hice los componentes más completos.
  - Agregué `css/variables.css` con la paleta de colores y variables del tema.
- **Rediseñé la landing `index.html`** (agregué +155 líneas) con una estructura visual nueva.
- **Actualicé todos los paneles internos** (candidatos, empresas, entrevistas, postulaciones, tareas, vacantes, login, principal) para que compartan la estructura y estética global.
- **Eliminé archivos duplicados** (ej. `src/html/index.html`) para dejar una estructura limpia.

### 2. 26 de agosto de 2026 — "cambios" (`7ddb74ce`)

Agregué **videos de fondo** en las pantallas clave del proyecto:

- **Hero del panel principal (`principal.html`):**
  - Agregué un `<video>` como fondo del hero con el video de stock (edificio de oficinas, `17383526.mp4`).
  - Configuré `autoplay muted loop playsinline` para que se reproduzca solo y en silencio.
- **Login (`login.html`):**
  - Agregué un video de fondo (`17383517.mp4`).

**Estilos nuevos que acompañaron esos videos (CSS):**
- `.hero__video`: video que cubre toda la sección morada (`object-fit: cover`, ocupa toda el `hero`).
- Overlay morado semitransparente (`.hero::before`) para que el texto siempre se lea bien encima del video.
- Contenido del hero por encima del video (z-index).
- Borde/contorno y sombra de texto para el título y subtítulo (`-webkit-text-stroke`, `text-shadow`) para destacar sobre el video.
- Actualicé también `main.css` con los ajustes de layout para el `body.main-page`/`body.app`.

### 3. 26 de agosto de 2026 — Merge (`71a1c87`)

- Hice **merge de la rama `maria`** hacia mi rama `alex` para mantener el código del equipo al día.

### 4. Trabajo reciente (sin commitear todavía) — Reemplazo del video en el Login

Junto con la colaboración en curso, reemplacé la animación **Lottie** del panel izquierdo del login por un **video** real:

- **Antes:** un `<dotlottie-player>` (animación Lottie) de 400×400px.
- **Ahora:** un `<video>` del item de Envato "Empresarios caminando por el edificio de oficinas 11" (17383527.mp4):
  - `autoplay muted loop playsinline preload="metadata"`.
- **CSS nuevo (`src/css/main.css`):**
  - Clase `.login-split__video`: 400×400, `object-fit: cover`, bordes redondeados y sombra.
  - Ajusté el responsive para que el video también sea de 280px en pantallas pequeñas.

---

## 🎨 Archivos principales que he tocado

| Archivo | Tipo de cambio |
|---------|----------------|
| `index.html` | Landing rediseñada |
| `src/css/main.css` / `css/main.css` | Estilos generales y de video |
| `css/components.css` | Componentes y hero con video |
| `css/variables.css` | Variable de paleta/tema |
| `src/html/login.html` | Video de fondo + reemplazo del Lottie por video |
| `src/html/principal.html` | Video de fondo del hero |
| `src/html/candidatos.html`, `empresas.html`, `entrevistas.html`, `postulaciones.html`, `tareas.html`, `vacantes.html` | Aplicación de estructura y estilos globales |

---

## 🎯 Cosas en las que quiero / puedo seguir

- [ ] Commitear el último cambio del video en el login.
- [ ] Revisar que la marca de agua de los videos de Envato no afecte la presentación, o conseguir los archivos originales.
- [ ] Probar el responsive de los videos en móvil (280px).

---

<sub>Documento generado para uso personal de Alex — Tico-Talent 2026</sub>