# Evidencia de Trabajo y Contribución al Proyecto

**Estudiante:** Tiffany Bejarano  
**Proyecto:** TicoTalent — Sistema de Empleabilidad (Front-End con IA aplicada)  
**Fecha:** 25/08/2026  
**Rama:** `thifanie`  

---

## 📌 Resumen Ejecutivo
Durante esta etapa del proyecto, me enfoqué en la **reestructuración arquitectónica de estilos**, la **integración del sistema de diseño visual (Mockup Stitch)**, el **desarrollo de la biblioteca de componentes modulares** y la **unificación de la navegación a través de un panel lateral (Sidebar)** para todas las vistas de la plataforma TicoTalent.

---

## 🛠️ Detalle de Tareas Realizadas y Aportes

### 1. Reorganización de Archivos y Corrección de Rutas
* **Reubicación de Estilos:** Se trasladó la carpeta de hojas de estilo a `src/css/` para mantener una estructura de proyecto limpia y modular (cumpliendo con el requerimiento **RNF-02**).
* **Corrección de Referencias:**
  * Actualización en `index.html` a la ruta `src/css/`.
  * Corrección de rutas relativas en todos los módulos de `src/html/` (`../css/variables.css`, `../css/reset.css`, `../css/main.css`, `../css/components.css`).

---

### 2. Implementación del Sistema de Diseño (`src/css/variables.css`)
Se definieron y centralizaron todos los tokens de diseño e identidad visual de la marca TicoTalent:
* **Primario (Morado Mora - `#531068`):** Utilizado en el logotipo, branding y estados activos de navegación.
* **Secundario (Azul Marino - `#0C2340`):** Empleado en títulos de puestos, encabezados de alta jerarquía y textos principales.
* **Acción / CTA (Rosa Magenta - `#D8006E`):** Exclusivo para botones de interacción principal (*Postularse*, *Buscar Empleos*, *Iniciar Sesión*) con efectos de micro-animación y sombra (`--shadow-cta`).
* **Éxito (Verde Éxito - `#00A35C`):** Con fondo tenue (`#E6F6EE`) para indicadores de compatibilidad (*Match %*) y estados aprobados.
* **Superficies y Fondos:** Fondo general `#F9F9F9`, tarjetas en `#FFFFFF` y bordes sutiles `#DADADA`.
* **Tipografía:** Integración de Google Fonts (**Syne** y **Outfit**) para una estética moderna y geométrica.
* **Consistencia de Bordes:** Estandarización de bordes redondeados (`8px` y `píldora/full`).

---

### 3. Creación de Componentes de Interfaz (`src/css/components.css`)
Se construyó la biblioteca de componentes visuales adaptada a las necesidades del dominio de reclutamiento:
* **Hero Section & Buscador Dual:** Sección de bienvenida con degradado morado institucional y barra de búsqueda con inputs redondeados para *Cargo/Habilidad* y *Ubicación*.
* **Sidebar de Filtros (`.filter-sidebar`):** Panel lateral con tarjetas blancas y checkboxes personalizados para filtrar por *Modalidad* (Remoto/Híbrido/Presencial), *Nivel de Experiencia* y *Tipo de Jornada*.
* **Tarjetas de Empleo (*Job Cards*):** Diseño de contenedores blancos con sombra suave, logotipo de empresa, tags de habilidades, indicador dinámico de compatibilidad (*⚡ 98% Match*) y botón CTA de postulación.
* **Tarjetas de Métricas:** Contenedores de resumen estadístico para el panel principal.
* **Modales y Diálogos:** Estructura para modales de creación/edición de registros y confirmaciones de eliminación.

---

### 4. Transformación de Navegación a Panel Lateral Izquierdo (`src/css/main.css`)
* **Sidebar Fijo y Sticky (270px):** Se sustituyó la barra superior horizontal por un panel lateral vertical a la izquierda, resolviendo problemas de desbordamiento en pantalla.
* **Estructura de Menú:**
  * **Principal:** *Explorar*.
  * **Gestión de Talento:** *Vacantes*, *Candidatos*, *Empresas*, *Mis Postulaciones*.
  * **Seguimiento:** *Entrevistas*, *Tareas*.
* **Perfil de Usuario Integrado:** Tarjeta con avatar institucional, nombre (*Emily Salazar*), rol (*Reclutadora Senior*) y botón de cierre de sesión en el pie del sidebar.
* **Diseño Responsivo:** Adaptación para dispositivos móviles donde el sidebar se ajusta dinámicamente.

---

### 5. Unificación de Vistas HTML
Se actualizaron todas las vistas del proyecto para adoptar la nueva estructura de dos columnas (`.sidebar` + `.main-page__wrapper`):
* `index.html` (Shell principal)
* `src/html/principal.html` (Vista de exploración y métricas)
* `src/html/vacantes.html` (Catálogo de empleos con buscador y filtros)
* `src/html/candidatos.html` (Directorio de talento)
* `src/html/empresas.html` (Empresas aliadas)
* `src/html/postulaciones.html` (Seguimiento de postulaciones)
* `src/html/entrevistas.html` (Agenda de citas)
* `src/html/tareas.html` (Gestión de actividades)
* `src/html/login.html` (Pantalla de autenticación con branding institucional)

---

## 📊 Commits y Control de Versiones
* `fix: se arregla ruta de carpeta css`
* `feat: integracion de diseno stitch, paleta de colores y componentes`
* `feat: implementacion de sidebar lateral izquierdo en todas las vistas`
