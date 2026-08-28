// Buscadores inteligentes de Inicio y Vacantes.
// Solo se activa cuando existen #searchRole/#searchLocation o los inputs equivalentes del inicio.
const SEARCH_ROLE_DATA = {
  recent: ["tec", "todas las ofertas en San José"],
  popular: ["Operador/a", "Producción", "Vendedor/a", "Chofer", "Desarrollador/a de Software", "Analista de Datos"]
};

const LOCATIONS = [
  {name:"Mi ubicación", detail:"Detectar ubicación"},
  {name:"San José", detail:"Departamento"},
  {name:"Alajuela", detail:"Departamento"},
  {name:"Heredia", detail:"Departamento"},
  {name:"Cartago", detail:"Departamento"},
  {name:"Guanacaste", detail:"Provincia"},
  {name:"Puntarenas", detail:"Provincia"},
  {name:"Limón", detail:"Provincia"},
  {name:"Remoto", detail:"Trabajo remoto"}
];

function createDropdown(input, type) {
  if (!input || input.parentElement.querySelector(".search-suggestions")) return;
  const wrap = input.parentElement;
  wrap.classList.add("search-field--with-dropdown");

  const dropdown = document.createElement("div");
  dropdown.className = "search-suggestions";
  dropdown.hidden = true;
  dropdown.setAttribute("role", "listbox");
  wrap.appendChild(dropdown);

  const render = (term = "") => {
    const q = term.toLowerCase().trim();
    if (type === "role") {
      const recent = SEARCH_ROLE_DATA.recent.filter(x => !q || x.toLowerCase().includes(q));
      const popular = SEARCH_ROLE_DATA.popular.filter(x => !q || x.toLowerCase().includes(q));
      dropdown.innerHTML = `
        ${recent.length ? `<div class="search-suggestions__heading">ÚLTIMAS BÚSQUEDAS</div>
          ${recent.map(x => `<button type="button" class="search-suggestion search-suggestion--recent" data-value="${escapeAttr(x)}"><span class="suggestion-icon">◷</span><span>${escapeHTML(x)}</span></button>`).join("")}` : ""}
        ${popular.length ? `<div class="search-suggestions__heading">EMPLEOS MÁS DEMANDADOS</div>
          ${popular.map(x => `<button type="button" class="search-suggestion" data-value="${escapeAttr(x)}"><span class="suggestion-icon">⌕</span><span>${escapeHTML(x)}</span></button>`).join("")}` : ""}
        ${!recent.length && !popular.length ? `<div class="search-suggestions__empty">No encontramos coincidencias.</div>` : ""}
      `;
    } else {
      const list = LOCATIONS.filter(x => !q || x.name.toLowerCase().includes(q));
      dropdown.innerHTML = `
        ${list.map(x => `
          <button type="button" class="search-suggestion search-suggestion--location" data-value="${escapeAttr(x.name)}">
            <span class="suggestion-icon">${x.name === "Mi ubicación" ? "◉" : "⌖"}</span>
            <span><strong>${escapeHTML(x.name)}</strong><small>${escapeHTML(x.detail)}</small></span>
            ${x.name === "Mi ubicación" ? '<em>Nuevo</em>' : ''}
          </button>
        `).join("") || '<div class="search-suggestions__empty">No encontramos esa ubicación.</div>'}
      `;
    }

    dropdown.querySelectorAll(".search-suggestion").forEach(btn => {
      btn.addEventListener("click", () => {
        input.value = btn.dataset.value || "";
        hide();
        input.dispatchEvent(new Event("input", {bubbles:true}));
      });
    });
  };

  const show = () => {
    render(input.value);
    dropdown.hidden = false;
    dropdown.classList.add("is-open");
  };
  const hide = () => {
    dropdown.hidden = true;
    dropdown.classList.remove("is-open");
  };

  input.addEventListener("focus", show);
  input.addEventListener("click", show);
  input.addEventListener("input", () => {
    if (!dropdown.hidden) render(input.value);
  });
  document.addEventListener("click", e => {
    if (!wrap.contains(e.target)) hide();
  });
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}
function escapeAttr(value) {
  return String(value ?? "").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function initSearchDropdowns() {
  // Inicio
  const homeRole = document.querySelector('input[name="q"]');
  const homeLocation = document.querySelector('input[name="location"]');
  createDropdown(homeRole, "role");
  createDropdown(homeLocation, "location");

  // Vacantes
  createDropdown(document.getElementById("searchRole"), "role");
  createDropdown(document.getElementById("searchLocation"), "location");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSearchDropdowns);
} else {
  initSearchDropdowns();
}
