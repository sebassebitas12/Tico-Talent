// src/js/adapters.js
// Capa de adaptación: DummyJSON -> modelo visual coherente de TicoTalent.

const EMPRESAS_CR = [
  { nombre: "Intel Costa Rica", sector: "Semiconductores & Cloud", sede: "Zona Franca América, Heredia", dominio: "intel.com", color: "#0071c5" },
  { nombre: "Amazon Web Services CR", sector: "Cloud Computing & Tech", sede: "Calle Blancos, San José", dominio: "aws.amazon.com", color: "#ff9900" },
  { nombre: "SoftServe Costa Rica", sector: "Software Engineering & IA", sede: "Sabana Sur, San José", dominio: "softserveinc.com", color: "#f05a22" },
  { nombre: "BAC Digital Labs", sector: "Fintech & Banca Digital", sede: "San José Centro", dominio: "bac.net", color: "#e30613" },
  { nombre: "Fiserv Global Services", sector: "Tecnología Financiera", sede: "Belén, Heredia", dominio: "fiserv.com", color: "#ff6600" },
  { nombre: "Align Technology CR", sector: "Medical Devices & Software", sede: "Lagunilla, Heredia", dominio: "aligntech.com", color: "#00a8e0" },
  { nombre: "Microsoft Costa Rica", sector: "Enterprise Software & Cloud", sede: "Escazú, San José", dominio: "microsoft.com", color: "#00a4ef" },
  { nombre: "Pura Vida Tech Solutions", sector: "Consultoría & Desarrollo Web", sede: "Cartago", dominio: null, color: "#531068" }
];

const UBICACIONES_CR = [
  "San José · La Sabana",
  "Heredia · Zona Franca América",
  "Belén · Heredia",
  "Escazú · San José",
  "Alajuela · El Coyol",
  "Cartago · Parque Tecnológico",
  "Remoto · Costa Rica"
];

const MODALIDADES = ["Remoto", "Híbrido", "Híbrido flexible", "Presencial"];
const NIVELES = ["Junior", "Semi-Senior", "Senior", "Lead / Arquitectura"];

const TITULOS_TECNICOS = [
  "Desarrollador Full Stack Senior",
  "Ingeniero Frontend React / TypeScript",
  "Arquitecto Cloud & DevOps",
  "Líder de QA Automation",
  "Diseñador de Producto UI/UX",
  "Ingeniero Backend de Microservicios",
  "Científico de Datos e IA",
  "Desarrollador Mobile"
];

const SKILLS_TECNICAS = [
  ["React", "TypeScript", "Next.js", "Tailwind CSS"],
  ["Node.js", "Express", "PostgreSQL", "Docker"],
  ["AWS", "Terraform", "CI/CD", "Kubernetes"],
  ["Python", "FastAPI", "Machine Learning", "SQL"],
  ["Figma", "Design Systems", "UX Research", "HTML/CSS"],
  ["Java", "Spring Boot", "Microservicios", "Kafka"],
  ["C#", ".NET", "SQL Server", "Azure"],
  ["Flutter", "React Native", "Firebase", "REST APIs"]
];

const ESTADOS_POSTULACION = [
  { texto: "CV Recibido", paso: 1, bg: "#f0ebf5", color: "#531068" },
  { texto: "Revisión Técnica", paso: 2, bg: "#e6f6ee", color: "#00875a" },
  { texto: "Entrevista Agendada", paso: 3, bg: "#fff3e0", color: "#e65100" },
  { texto: "Oferta Final", paso: 4, bg: "#e0f2fe", color: "#0369a1" }
];

function safeIndex(id, index = 0, length = 1) {
  const n = Number(id);
  const base = Number.isFinite(n) ? Math.max(0, n - 1) : 0;
  return Math.abs(base + Number(index || 0)) % length;
}

function initials(name = "Empresa") {
  return String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "TT";
}

export function avatarUsuario(seed = "Usuario", label = "Foto de perfil") {
  const safeSeed = encodeURIComponent(String(seed || "Usuario"));
  return `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${safeSeed}`;
}

export function avatarTicoBot() {
  return "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=TicoBot";
}

export function logoEmpresa(nombre, dominio, color = "#531068") {
  const safeName = String(nombre || "Empresa").replace(/"/g, "&quot;");
  const fill = /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#531068";
  const letters = initials(nombre);

  return `
    <span class="company-logo" title="${safeName}" aria-label="${safeName}">
      <svg viewBox="0 0 48 48" role="img" aria-hidden="true">
        <rect width="48" height="48" rx="12" fill="${fill}"></rect>
        <text x="24" y="25" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-family="Arial, sans-serif" font-size="13" font-weight="700">${letters}</text>
      </svg>
    </span>
  `;
}

export function adaptarVacante(p, index = 0) {
  if (!p) return {};
  const empresa = EMPRESAS_CR[safeIndex(p.id, index, EMPRESAS_CR.length)];
  const posicion = safeIndex(p.id, index, TITULOS_TECNICOS.length);
  const skills = SKILLS_TECNICAS[posicion % SKILLS_TECNICAS.length];
  const salarioMin = 1800 + ((Number(p.id) || 1) % 8) * 250;

  return {
    id: p.id,
    titulo: TITULOS_TECNICOS[posicion],
    descripcion: `Oportunidad en ${empresa.nombre} para integrarte a proyectos tecnológicos de alto impacto en Costa Rica.`,
    empresa: empresa.nombre,
    empresaSector: empresa.sector,
    empresaLogo: logoEmpresa(empresa.nombre, empresa.dominio, empresa.color),
    ubicacion: UBICACIONES_CR[safeIndex(p.id, index, UBICACIONES_CR.length)],
    modalidad: MODALIDADES[safeIndex(p.id, index, MODALIDADES.length)],
    nivel: NIVELES[safeIndex(p.id, index, NIVELES.length)],
    jornada: Number(p.id) % 4 === 0 ? "Medio Tiempo" : "Tiempo Completo",
    salario: `$${salarioMin.toLocaleString()} - $${(salarioMin + 1400).toLocaleString()} USD / mes`,
    match: 88 + ((Number(p.id) * 7) % 11),
    tags: skills,
    rating: 4.8,
    plazas: Number(p.stock) || 2,
    categoria: "Tecnología",
    fechaPublicacion: `Hace ${((Number(p.id) || 1) % 5) + 1} días`,
    _raw: p
  };
}

export function adaptarCandidato(u, index = 0) {
  if (!u) return {};
  const posicion = safeIndex(u.id, index, TITULOS_TECNICOS.length);
  const username = u.username || `usuario-${u.id}`;
  const fullName = `${u.firstName || "Usuario"} ${u.lastName || "Técnico"}`.trim();
  const skills = SKILLS_TECNICAS[posicion % SKILLS_TECNICAS.length];
  const experienceYears = 2 + (Number(u.id) % 7);

  return {
    id: u.id,
    nombreCompleto: fullName,
    firstName: u.firstName || "Usuario",
    lastName: u.lastName || "Técnico",
    username,
    email: u.email || `${username}@ticotalent.cr`,
    telefono: u.phone ? `+506 ${String(u.phone).replace(/[^0-9]/g, "").slice(-8)}` : "+506 8888-0000",
    foto: u.image || avatarUsuario(username, `Foto de ${fullName}`),
    titulo: TITULOS_TECNICOS[posicion],
    ubicacion: UBICACIONES_CR[safeIndex(u.id, index, UBICACIONES_CR.length)],
    experiencia: `${experienceYears} años de experiencia`,
    skills,
    match: 90 + ((Number(u.id) * 3) % 9),
    disponibilidad: experienceYears > 4 ? "A convenir" : "Inmediata",
    pretensionSalarial: `$${(experienceYears * 600 + 1500).toLocaleString()} - $${(experienceYears * 750 + 2000).toLocaleString()} USD`,
    linkedin: `https://linkedin.com/in/${encodeURIComponent(username)}`,
    github: `https://github.com/${encodeURIComponent(username)}`,
    _raw: u
  };
}

export function adaptarEmpresa(c, index = 0) {
  if (!c) return {};
  const ref = EMPRESAS_CR[safeIndex(c.id, index, EMPRESAS_CR.length)];
  return {
    id: c.id,
    nombre: c.nombre || ref.nombre,
    sector: ref.sector,
    ubicacion: ref.sede,
    logo: logoEmpresa(ref.nombre, ref.dominio, ref.color),
    colaboradores: `${150 + ((Number(c.id) * 85) % 900)}+ colaboradores`,
    vacantesActivas: Number(c.totalProducts) || c.products?.length || 3,
    rating: Number((4.7 + ((Number(c.id) % 3) * 0.1)).toFixed(1)),
    userId: c.userId || 1,
    beneficios: ["Seguro médico privado", "Asociación solidarista", "Subsidio de internet", "Capacitación continua"],
    _raw: c
  };
}

export function adaptarPostulacion(p, index = 0) {
  if (!p) return {};
  const pos = safeIndex(p.id, index, ESTADOS_POSTULACION.length);
  const estado = ESTADOS_POSTULACION[pos];
  const empresa = EMPRESAS_CR[safeIndex(p.id, index, EMPRESAS_CR.length)];
  const skills = SKILLS_TECNICAS[safeIndex(p.id, index, SKILLS_TECNICAS.length)];
  const titles = [
    "Postulación a Desarrollador Full Stack Senior",
    "Postulación a Ingeniero Cloud & DevOps",
    "Postulación a QA Automation",
    "Postulación a Científico de Datos e IA",
    "Postulación a Diseñador UI/UX",
    "Postulación a Ingeniero Backend",
    "Postulación a Arquitecto Cloud",
    "Postulación a Desarrollador Mobile"
  ];

  return {
    id: p.id,
    titulo: titles[safeIndex(p.id, 0, titles.length)],
    detalle: p.body || "Candidato con perfil técnico alineado con los requisitos de la posición.",
    empresa: empresa.nombre,
    empresaLogo: logoEmpresa(empresa.nombre, empresa.dominio, empresa.color),
    ubicacion: empresa.sede,
    estado: estado.texto,
    estadoColor: estado.color,
    estadoBg: estado.bg,
    paso: estado.paso,
    match: 91 + ((Number(p.id) * 5) % 8),
    userId: p.userId || 1,
    tags: skills,
    fechaPostulacion: `2026-08-${String(10 + ((Number(p.id) || 1) % 16)).padStart(2, "0")}`,
    _raw: p
  };
}

const NOTAS_ENTREVISTA = [
  "Revisar experiencia en desarrollo y resolver ejercicio de arquitectura.",
  "Evaluación de habilidades técnicas y presentación de caso práctico.",
  "Sesión de preguntas sobre experiencia laboral y competencias clave.",
  "Entrevista técnica enfocada en resolución de problemas y buenas prácticas.",
  "Revisión de portafolio y discusión de proyectos anteriores.",
  "Evaluación de fit cultural y alineación con los valores de la empresa.",
  "Entrevista de competencias: liderazgo, colaboración y gestión del tiempo.",
  "Prueba técnica en vivo y revisión de conocimientos específicos del área."
];

export function adaptarEntrevista(c, index = 0) {
  if (!c) return {};
  const empresa = EMPRESAS_CR[safeIndex(c.id, index, EMPRESAS_CR.length)];
  const username = c.user?.username || `candidato-${c.id}`;
  const fullName = c.user?.fullName || username;
  const plataformas = [
    { nombre: "Google Meet", link: `https://meet.google.com/tt-${c.id}-cr` },
    { nombre: "Microsoft Teams", link: `https://teams.microsoft.com/l/meetup-join/tt-${c.id}` },
    { nombre: "Presencial", link: "#" }
  ];
  const plataforma = plataformas[safeIndex(c.id, index, plataformas.length)];
  const hour = 9 + (Number(c.id) % 8);

  return {
    id: c.id,
    postId: c.postId || 1,
    notas: NOTAS_ENTREVISTA[safeIndex(c.id, index, NOTAS_ENTREVISTA.length)],
    candidatoUsuario: username,
    candidatoNombre: fullName,
    candidatoFoto: c.user?.image || avatarUsuario(username, `Foto de ${fullName}`),
    empresa: empresa.nombre,
    empresaLogo: logoEmpresa(empresa.nombre, empresa.dominio, empresa.color),
    fechaHora: `${25 + (Number(c.id) % 5)} de Agosto, 2026 · ${hour}:00 ${hour >= 12 ? "PM" : "AM"} · Hora CR`,
    modalidad: plataforma.nombre,
    modalidadIcono: "",
    linkReunion: plataforma.link,
    entrevistador: "Equipo de Reclutamiento & Tech Leads",
    _raw: c
  };
}

const TAREAS_RRHH = [
  "Revisar CVs recibidos para la vacante de Desarrollador Full Stack",
  "Coordinar entrevistas técnicas con candidatos preseleccionados",
  "Enviar retroalimentación a candidatos descartados en primera fase",
  "Actualizar pipeline de postulaciones en el sistema",
  "Agendar entrevista final con gerencia para candidato seleccionado",
  "Verificar referencias laborales del candidato seleccionado",
  "Redactar oferta económica para posición de Cloud Architect",
  "Publicar nueva vacante de QA Automation en portal",
  "Revisar prueba técnica enviada por candidato de Backend",
  "Coordinar inducción para nuevo colaborador"
];

export function adaptarTarea(t, index = 0) {
  if (!t) return {};
  const pos = safeIndex(t.id, index, TAREAS_RRHH.length);
  const prioridades = [
    { texto: "Alta", color: "#dc2626", bg: "#fee2e2" },
    { texto: "Media", color: "#d97706", bg: "#fef3c7" },
    { texto: "Normal", color: "#16a34a", bg: "#dcfce7" }
  ];
  const prioridad = prioridades[safeIndex(t.id, index, prioridades.length)];

  return {
    id: t.id,
    descripcion: TAREAS_RRHH[pos],
    completada: Boolean(t.completed),
    userId: t.userId || 1,
    responsableFoto: avatarUsuario(`responsable-${t.userId || 1}`, "Foto del responsable"),
    prioridad: prioridad.texto,
    prioridadColor: prioridad.color,
    prioridadBg: prioridad.bg,
    categoria: ["Entrevistas", "Revisión de CV", "Ofertas Finales", "Seguimiento"][safeIndex(t.id, index, 4)],
    fechaLimite: `2026-08-${String(26 + ((Number(t.id) || 1) % 4)).padStart(2, "0")}`,
    _raw: t
  };
}
