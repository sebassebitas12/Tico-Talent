# System Design & UI Style Guide: **Tico-Talent**

Este documento define la arquitectura visual, tokens de diseño y especificaciones de componentes para la plataforma **Tico-Talent** (anteriormente JobConnect), adaptados para integración directa con Tailwind CSS e HTML semántico.

---

## 1. Identidad de Marca y Paleta de Colores

La paleta de colores de Tico-Talent está diseñada para reflejar un entorno corporativo moderno, confiable y dinámico.

### 🎨 Tokens de Color (Tailwind Config / CSS Variables)

| Rol / Categoría | Nombre del Color | Hex Code | Uso Principal | Tailwind Class Equivalent |
| :--- | :--- | :--- | :--- | :--- |
| **Primario (Branding)** | Morado Mora | `#531068` | Navegación superior, barra lateral, elementos de marca destacados | `bg-[#531068]`, `text-[#531068]` |
| **Secundario (Texto/Títulos)** | Azul Marino | `#0C2340` | Títulos principales (`h1`, `h2`, `h3`), encabezados de tarjetas, texto de alta jerarquía | `text-[#0C2340]`, `bg-[#0C2340]` |
| **Acción Principal (CTA)** | Rosa Magenta | `#D8006E` | Botones de acción principal (e.g. *Postularse*, *Guardar*, *Crear Vacante*) | `bg-[#D8006E] hover:bg-[#B5005B] text-white` |
| **Éxito / Match** | Verde Éxito | `#00A35C` | Badges de porcentaje de match, estado activo, confirmaciones positivas | `text-[#00A35C] bg-[#00A35C]/10` |
| **Fondo General** | Gris Suave | `#F9F9F9` | Fondo de la aplicación y áreas secundarias | `bg-[#F9F9F9]` |
| **Contenedores** | Blanco Puro | `#FFFFFF` | Tarjetas, modales, formularios y paneles flotantes | `bg-white` |
| **Borde / Separadores** | Gris Neutro | `#DADADA` | Bordes sutiles en tarjetas, campos de texto e insumos | `border-[#DADADA]` |
| **Texto Secundario** | Gris Oscuro Muted | `#555555` | Descripciones, subtextos y metadatos | `text-slate-600` / `text-[#555555]` |

---

## 2. Tipografía

* **Familia Tipográfica Recomendada:** `Syne` (para títulos y personalidad de marca) + `Inter` / `sans-serif` geométrica (para cuerpo de texto y datos legibles).
* **Importación Google Fonts:**
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  ```

### Jerarquía Tipográfica
1. **H1 (Títulos de Vista / Hero):** `font-['Syne'] font-bold text-2xl md:text-3xl text-[#0C2340]`
2. **H2 (Títulos de Tarjeta / Sección):** `font-['Syne'] font-semibold text-lg md:text-xl text-[#0C2340]`
3. **Body / Textos Standard:** `font-['Inter'] font-normal text-sm md:text-base text-gray-700`
4. **Badges & Labels:** `font-['Inter'] font-medium text-xs md:text-sm`

---

## 3. Guía de Componentes de Interfaz (UI)

### A. Barra de Navegación y Sidebar
- **Navbar / Header:** Fondo `#531068` (Morado Mora) o Blanco `#FFFFFF` con acentos en `#531068`.
- **Items del Menú Activo:** Acento en Rosa Magenta (`#D8006E`) o resalte suave.

### B. Hero & Layout de Búsqueda
- **Campos de Búsqueda:** Inputs con bordes redondeados (`rounded-full` o `rounded-lg`), bordes sutiles `#DADADA`, sombras suaves al enfoque (`focus:ring-2 focus:ring-[#531068]`).
- **Sidebar de Filtros (Filtros Laterales):**
  - Checkboxes personalizados en color Morado Mora (`accent-[#531068]`).
  - Agrupadores limpios con títulos en Azul Marino (`#0C2340`).

### C. Tarjetas de Empleo y Candidatos (Cards)
- **Fondo:** `#FFFFFF` (Blanco Puro).
- **Sombra & Borde:** `border border-[#DADADA] shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl`.
- **Título del Puesto / Candidato:** `font-['Syne'] font-bold text-[#0C2340] hover:text-[#531068]`.
- **Badge de Match (Compatibilidad):**
  - Estilo: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00A35C]/10 text-[#00A35C] border border-[#00A35C]/20`.
- **Botón de Acción ("Postularse" / "Ver Detalles"):**
  - Estilo CTA Principal: `bg-[#D8006E] hover:bg-[#b8005d] text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out`.

---

## 4. Configuración CDN de Tailwind CSS (para inclusión rápida)

Para aplicar rápidamente Tailwind CSS en los archivos HTML (`principal.html`, `candidatos.html`, `vacantes.html`, etc.), se incluye el siguiente bloque `<script>` dentro del `<head>`:

```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          mora: '#531068',
          marino: '#0C2340',
          magenta: '#D8006E',
          exito: '#00A35C',
          'gris-suave': '#F9F9F9',
          'borde-suave': '#DADADA',
        },
        fontFamily: {
          syne: ['Syne', 'sans-serif'],
          sans: ['Inter', 'sans-serif'],
        }
      }
    }
  }
</script>
```

---

## 5. Estructura HTML Actualizada de Ejemplo (`principal.html`)

A continuación se muestra cómo actualizar la estructura del archivo base para alinearlo con la identidad de **Tico-Talent**:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tico-Talent - Plataforma de Reclutamiento</title>
  
  <!-- Tipografía Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS CDN Configurado -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            mora: '#531068',
            marino: '#0C2340',
            magenta: '#D8006E',
            exito: '#00A35C',
            'gris-suave': '#F9F9F9',
            'borde-suave': '#DADADA',
          },
          fontFamily: {
            syne: ['Syne', 'sans-serif'],
            sans: ['Inter', 'sans-serif'],
          }
        }
      }
    }
  </script>
  
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/main.css">
</head>
<body class="bg-gris-suave font-sans text-slate-800 antialiased min-h-screen flex">

  <!-- ========== SIDEBAR ========== -->
  <aside class="w-64 bg-mora text-white min-h-screen flex flex-col justify-between p-4 shadow-lg">
    <div>
      <div class="flex items-center justify-between pb-6 border-b border-white/20">
        <span class="font-syne font-bold text-xl tracking-wide text-white">🇨🇷 Tico-Talent</span>
        <button class="md:hidden text-white text-xl" id="sidebarToggle">☰</button>
      </div>

      <nav class="mt-6 space-y-6">
        <div>
          <span class="text-xs uppercase tracking-wider text-purple-200 font-semibold px-2">Principal</span>
          <a href="principal.html" class="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-lg bg-white/10 text-white font-medium">
            <span>📊</span> <span>Dashboard</span>
          </a>
        </div>

        <div>
          <span class="text-xs uppercase tracking-wider text-purple-200 font-semibold px-2">Gestión</span>
          <div class="mt-2 space-y-1">
            <a href="candidatos.html" class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-purple-100 hover:text-white transition">
              <span class="flex items-center gap-3"><span>👤</span> <span>Candidatos</span></span>
            </a>
            <a href="vacantes.html" class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-purple-100 hover:text-white transition">
              <span class="flex items-center gap-3"><span>💼</span> <span>Vacantes</span></span>
            </a>
            <a href="empresas.html" class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-purple-100 hover:text-white transition">
              <span class="flex items-center gap-3"><span>🏢</span> <span>Empresas</span></span>
            </a>
            <a href="postulaciones.html" class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-purple-100 hover:text-white transition">
              <span class="flex items-center gap-3"><span>📄</span> <span>Postulaciones</span></span>
            </a>
          </div>
        </div>
      </nav>
    </div>

    <div class="pt-4 border-t border-white/20">
      <button id="btnLogout" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-purple-200 hover:bg-red-500/20 hover:text-white transition">
        <span>🚪</span> <span>Cerrar Sesión</span>
      </button>
    </div>
  </aside>

  <!-- ========== MAIN CONTENT ========== -->
  <main class="flex-1 flex flex-col min-w-0">
    <!-- Header principal -->
    <header class="bg-white border-b border-borde-suave px-8 py-4 flex items-center justify-between shadow-sm">
      <h1 class="font-syne font-bold text-2xl text-marino" id="viewTitle">Dashboard de Reclutamiento</h1>
      
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-mora text-white flex items-center justify-center font-bold font-syne">
          E
        </div>
        <div class="hidden sm:block">
          <p class="text-sm font-semibold text-marino">Emily</p>
          <p class="text-xs text-gray-500">Reclutadora</p>
        </div>
      </div>
    </header>

    <!-- Contenido dinámico -->
    <section class="p-8 flex-1" id="mainContent">
      <!-- Ejemplo de Tarjeta con estilo Tico-Talent -->
      <div class="bg-white p-6 rounded-xl border border-borde-suave shadow-sm hover:shadow-md transition">
        <div class="flex justify-between items-start">
          <div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-exito/10 text-exito border border-exito/20">
              95% Match
            </span>
            <h2 class="font-syne font-bold text-xl text-marino mt-2">Desarrollador Web Front-End</h2>
            <p class="text-sm text-gray-500">San José, Costa Rica • Híbrido</p>
          </div>
          <button class="bg-magenta hover:bg-[#b8005d] text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow transition">
            Postularse
          </button>
        </div>
      </div>
    </section>
  </main>

</body>
</html>