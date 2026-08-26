// src/js/adapters.js
/**
 * ============================================================================
 * CAPA DE MAPEO Y ADAPTACIÓN FRONTEND (TicoTalent / JobConnect)
 * ============================================================================
 * NOTA DE ARQUITECTURA:
 * DummyJSON devuelve datos simulados en inglés de recursos genéricos (/products,
 * /users, /carts, /posts, /comments, /todos).
 *
 * Estas funciones actúan como "Adaptadores de Presentación" (Presentation Layer)
 * enriqueciendo los objetos para la UI con datos contextuales de Costa Rica
 * (salarios en USD, modalidades, zonas francas, empresas ticas, match % de IA),
 * sin alterar la comunicación Fetch API real contra https://dummyjson.com.
 * ============================================================================
 */

// Listas de referencia para contextualización costarricense
const EMPRESAS_CR = [
  { nombre: "Intel Costa Rica", sector: "Semiconductores & Cloud", sede: "Zona Franca América, Heredia", logo: "🏢" },
  { nombre: "Amazon Web Services CR", sector: "Cloud Computing & Tech", sede: "Calle Blancos, San José", logo: "☁️" },
  { nombre: "SoftServe Costa Rica", sector: "Software Engineering & IA", sede: "Torre Universal, Sabana Sur", logo: "💻" },
  { nombre: "BAC Digital Labs", sector: "Fintech & Banca Digital", sede: "San José Centro, Costa Rica", logo: "🏦" },
  { nombre: "Fiserv Global Services", sector: "Tecnología Financiera", sede: "El Cafetal Corporate Center, Belén", logo: "💳" },
  { nombre: "Align Technology CR", sector: "Medical Devices & Software", sede: "UltraPark II, Lagunilla Heredia", logo: "🩺" },
  { nombre: "Microsoft Costa Rica", sector: "Enterprise Software & Cloud", sede: "Plaza Roble, Escazú", logo: "🖥️" },
  { nombre: "Pura Vida Tech Solutions", sector: "Consultoría & Desarrollo Web", sede: "Cartago Tech Park, Cartago", logo: "🚀" }
];

const UBICACIONES_CR = [
  "San José (Torre Universal, La Sabana)",
  "Heredia (Zona Franca América)",
  "Belén, Heredia (El Cafetal)",
  "Escazú, San José (Plaza Roble)",
  "Alajuela (El Coyol Free Zone)",
  "Cartago (Parque Tecnológico)",
  "Remoto - Costa Rica (100% WFH)"
];

const MODALIDADES = ["Remoto 100%", "Híbrido (2 días oficina)", "Híbrido (1 día oficina)", "Presencial"];
const NIVELES = ["Desarrollador Junior", "Ingeniero Semi-Senior", "Especialista Senior", "Líder Técnico / Arquitecto"];

const TITULOS_TECNICOS = [
  "Desarrollador Full Stack Senior (React / Node)",
  "Ingeniero Frontend (React / TypeScript)",
  "Arquitecto Cloud & DevOps (AWS / Kubernetes)",
  "Líder de Automatización QA (Cypress / Playwright)",
  "Diseñador de Producto UI/UX",
  "Ingeniero Backend (Go / Microservicios)",
  "Científico de Datos & Especialista en IA",
  "Desarrollador Móvil (Flutter / React Native)"
];

const ESTADOS_POSTULACION = [
  { texto: "CV Recibido", bg: "#f0ebf5", color: "#531068", paso: 1 },
  { texto: "En Revisión Técnica", bg: "#e6f6ee", color: "#00875a", paso: 2 },
  { texto: "Entrevista Agendada", bg: "#fff3e0", color: "#e65100", paso: 3 },
  { texto: "Oferta Final", bg: "#e0f2fe", color: "#0369a1", paso: 4 }
];

/**
 * Adapta un producto de DummyJSON (/products) a una Vacante laboral de Costa Rica.
 */
export function adaptarVacante(p, index = 0) {
  if (!p) return {};
  const empresaRef = EMPRESAS_CR[(p.id + index) % EMPRESAS_CR.length];
  const ubicacion = UBICACIONES_CR[(p.id * 2 + index) % UBICACIONES_CR.length];
  const modalidad = MODALIDADES[(p.id + index) % MODALIDADES.length];
  const nivel = NIVELES[(p.id + index) % NIVELES.length];
  const match = 88 + ((p.id * 7) % 11); // 88% - 98%
  
  // Cálculo de salario en USD con base en el precio del producto DummyJSON
  const baseSalary = (p.price && p.price > 0) ? Math.round(p.price * 32) : 3200;
  const salaryMin = Math.max(1800, baseSalary - 400);
  const salaryMax = salaryMin + 1400;
  const salarioFormateado = `$${salaryMin.toLocaleString()} - $${salaryMax.toLocaleString()} USD / mes`;

  const tags = p.tags && Array.isArray(p.tags) && p.tags.length > 0
    ? p.tags.slice(0, 4)
    : ["JavaScript", "React", "Node.js", "Git"];

  // Categorías traducidas al español si vienen en inglés de DummyJSON
  const categoriasTraducidas = {
    "beauty": "Belleza & Cuidado",
    "fragrances": "Fragancias & Retail",
    "furniture": "Mobiliario & Espacios",
    "groceries": "Consumo Masivo",
    "home-decoration": "Diseño & Decoración",
    "kitchen-accessories": "Accesorios & Equipamiento",
    "laptops": "Tecnología & Hardware",
    "mens-shirts": "Textil & Moda",
    "mens-shoes": "Calzado & Manufactura",
    "mens-watches": "Joyería & Retail",
    "mobile-accessories": "Telecomunicaciones",
    "motorcycle": "Automotriz & Logística",
    "skin-care": "Salud & Cuidado Personal",
    "smartphones": "Dispositivos Móviles",
    "sports-accessories": "Deportes & Bienestar",
    "sunglasses": "Óptica & Salud Visual",
    "tablets": "Tecnología Digital",
    "tops": "Comercio & Textil",
    "vehicle": "Transporte & Movilidad",
    "womens-bags": "Moda & Accesorios",
    "womens-dresses": "Diseño Textil",
    "womens-jewellery": "Joyería Fina",
    "womens-shoes": "Calzado Femenino",
    "womens-watches": "Relojería de Precisión"
  };

  const categoriaOriginal = (p.category || "").toLowerCase();
  const categoriaEsp = categoriasTraducidas[categoriaOriginal] || p.category || "Tecnología";

  // Generar título profesional en español coherente para la vacante
  const tituloVacante = TITULOS_TECNICOS[(p.id + index) % TITULOS_TECNICOS.length];

  return {
    id: p.id,
    titulo: tituloVacante,
    descripcion: `Oportunidad laboral en ${empresaRef.nombre}. Se requiere profesional con experiencia comprobada en desarrollo, metodologías ágiles y trabajo en equipo para proyectos de alto impacto.`,
    empresa: empresaRef.nombre,
    empresaSector: empresaRef.sector,
    empresaLogo: empresaRef.logo,
    ubicacion: ubicacion,
    modalidad: modalidad,
    nivel: nivel,
    jornada: (p.id % 4 === 0) ? "Medio Tiempo" : "Tiempo Completo",
    salario: salarioFormateado,
    match: match,
    tags: tags,
    rating: 4.8,
    plazas: p.stock ?? 2,
    categoria: categoriaEsp,
    fechaPublicacion: `Hace ${(p.id % 5) + 1} días`,
    // Datos crudos originales para mantener compatibilidad
    _raw: p
  };
}

/**
 * Adapta un usuario de DummyJSON (/users) a un Candidato profesional en Costa Rica.
 */
export function adaptarCandidato(u, index = 0) {
  if (!u) return {};
  const titulo = TITULOS_TECNICOS[(u.id + index) % TITULOS_TECNICOS.length];
  const ciudad = u.address?.city ? `${u.address.city}, Costa Rica` : UBICACIONES_CR[(u.id + index) % UBICACIONES_CR.length];
  const match = 90 + ((u.id * 3) % 9);
  const expYears = 2 + (u.id % 7);

  const skillsList = [
    ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    ["Node.js", "Express", "PostgreSQL", "Docker"],
    ["AWS", "Terraform", "CI/CD", "Kubernetes"],
    ["Python", "FastAPI", "Machine Learning", "SQL"],
    ["Figma", "Design Systems", "UX Research", "HTML/CSS"],
    ["Java", "Spring Boot", "Microservicios", "Kafka"]
  ];
  const skills = skillsList[(u.id + index) % skillsList.length];

  return {
    id: u.id,
    nombreCompleto: `${u.firstName} ${u.lastName}`,
    firstName: u.firstName,
    lastName: u.lastName,
    username: u.username,
    email: u.email,
    telefono: u.phone ? `+506 ${u.phone.replace(/[^0-9]/g, '').slice(-8)}` : "+506 8888-7777",
    foto: u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
    titulo: titulo,
    ubicacion: ciudad,
    experiencia: `${expYears} años de experiencia`,
    skills: skills,
    match: match,
    disponibilidad: expYears > 4 ? "A convenir (2 semanas)" : "Inmediata",
    pretensionSalarial: `$${(expYears * 600 + 1500).toLocaleString()} - $${(expYears * 750 + 2000).toLocaleString()} USD`,
    linkedin: `https://linkedin.com/in/${u.username}`,
    github: `https://github.com/${u.username}`,
    _raw: u
  };
}

/**
 * Adapta un carrito de DummyJSON (/carts) a una Empresa Cliente en Costa Rica.
 */
export function adaptarEmpresa(c, index = 0) {
  if (!c) return {};
  const ref = EMPRESAS_CR[(c.id + index) % EMPRESAS_CR.length];
  const totalVacantes = c.totalProducts ?? (c.products?.length || (2 + (c.id % 6)));
  const colaboradores = 150 + ((c.id * 85) % 900);

  return {
    id: c.id,
    nombre: c.nombre || ref.nombre,
    sector: ref.sector,
    ubicacion: ref.sede,
    logo: ref.logo,
    colaboradores: `${colaboradores}+ colaboradores`,
    vacantesActivas: totalVacantes,
    rating: Number((4.7 + ((c.id % 3) * 0.1)).toFixed(1)),
    userId: c.userId || 1,
    beneficios: ["Seguro médico privado", "Asociación solidarista", "Subsidio de internet", "Capacitación continua"],
    _raw: c
  };
}

/**
 * Adapta un post de DummyJSON (/posts) a una Postulación laboral con su estado.
 */
export function adaptarPostulacion(p, index = 0) {
  if (!p) return {};
  const estadoObj = ESTADOS_POSTULACION[(p.id + index) % ESTADOS_POSTULACION.length];
  const empresaRef = EMPRESAS_CR[(p.id + index) % EMPRESAS_CR.length];
  const match = 91 + ((p.id * 5) % 8);

  return {
    id: p.id,
    titulo: p.title || "Postulación a Posición Técnica",
    detalle: p.body || "Candidato con perfil calificado postulando para vacante activa.",
    empresa: empresaRef.nombre,
    empresaLogo: empresaRef.logo,
    ubicacion: empresaRef.sede,
    estado: estadoObj.texto,
    estadoColor: estadoObj.color,
    estadoBg: estadoObj.bg,
    paso: estadoObj.paso,
    match: match,
    userId: p.userId || 1,
    tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ["tech", "costa-rica", "remoto"],
    fechaPostulacion: `2026-08-${String(10 + (p.id % 16)).padStart(2, '0')}`,
    _raw: p
  };
}

/**
 * Adapta un comentario de DummyJSON (/comments) a una Entrevista / Nota Técnica.
 */
export function adaptarEntrevista(c, index = 0) {
  if (!c) return {};
  const empresaRef = EMPRESAS_CR[(c.id + index) % EMPRESAS_CR.length];
  const plataformas = [
    { nombre: "Google Meet", link: `https://meet.google.com/tt-${c.id}-cr`, icono: "📹" },
    { nombre: "Microsoft Teams", link: `https://teams.microsoft.com/l/meetup-join/tt-${c.id}`, icono: "💻" },
    { nombre: "Presencial (Oficinas CR)", link: "#", icono: "🏢" }
  ];
  const plat = plataformas[(c.id + index) % plataformas.length];
  const day = 25 + (c.id % 5);
  const hour = 9 + (c.id % 8);

  return {
    id: c.id,
    postId: c.postId || 1,
    notas: c.body || "Revisión de experiencia técnica y resolución de caso práctico.",
    candidatoUsuario: c.user?.username || "candidato.demo",
    candidatoNombre: c.user?.fullName || `@${c.user?.username || "candidato"}`,
    empresa: empresaRef.nombre,
    empresaLogo: empresaRef.logo,
    fechaHora: `${day} de Agosto, 2026 - ${hour}:00 ${hour >= 12 ? 'PM' : 'AM'} (Hora CR)`,
    modalidad: plat.nombre,
    modalidadIcono: plat.icono,
    linkReunion: plat.link,
    entrevistador: "Equipo de Reclutamiento & Tech Leads",
    _raw: c
  };
}

/**
 * Adapta una tarea de DummyJSON (/todos) a una Tarea de Reclutador / Seguimiento.
 */
export function adaptarTarea(t, index = 0) {
  if (!t) return {};
  const prioridades = [
    { texto: "Alta", color: "#dc2626", bg: "#fee2e2" },
    { texto: "Media", color: "#d97706", bg: "#fef3c7" },
    { texto: "Normal", color: "#16a34a", bg: "#dcfce7" }
  ];
  const categorias = ["Entrevistas", "Revisión de CV", "Ofertas Finales", "Retroalimentación"];
  
  const prio = prioridades[(t.id + index) % prioridades.length];
  const cat = categorias[(t.id + index) % categorias.length];

  return {
    id: t.id,
    descripcion: t.todo || "Seguimiento de proceso de selección",
    completada: !!t.completed,
    userId: t.userId || 1,
    prioridad: prio.texto,
    prioridadColor: prio.color,
    prioridadBg: prio.bg,
    categoria: cat,
    fechaLimite: `2026-08-${String(26 + (t.id % 4)).padStart(2, '0')}`,
    _raw: t
  };
}
