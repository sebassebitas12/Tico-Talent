// src/js/auth.js
// Sistema de autenticación con DummyJSON /auth/login + gestión de roles y perfil extendido en localStorage.

const DEMO_USERS = [
  {
    id: 2,
    username: "carlos",
    password: "carlos123",
    firstName: "Carlos",
    lastName: "Rodríguez",
    email: "carlos.recruiter@intelcr.com",
    rol: "empleador"
  },
  {
    id: 3,
    username: "maria",
    password: "maria123",
    firstName: "María",
    lastName: "García",
    email: "maria.dev@gmail.com",
    rol: "solicitante"
  }
];

const ROLE_PERMISSIONS = {
  solicitante: ["principal", "vacantes", "postulaciones", "empresas", "perfil"],
  empleador: ["principal", "vacantes", "candidatos", "empresas", "postulaciones", "entrevistas", "tareas", "perfil"],
  reclutador: ["principal", "vacantes", "candidatos", "empresas", "postulaciones", "entrevistas", "tareas", "perfil"]
};

function getUsers() {
  const stored = localStorage.getItem("tt_users");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

function saveUsers(users) {
  localStorage.setItem("tt_users", JSON.stringify(users));
}

function findUser(username) {
  const builtIn = DEMO_USERS.find(u => u.username === username);
  if (builtIn) return builtIn;
  const custom = getUsers().find(u => u.username === username);
  return custom || null;
}

export async function login(username, password, selectedRole = null) {
  // 1. Intentar autenticación directa contra DummyJSON /auth/login
  try {
    const response = await fetch("https://dummyjson.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      const token = data.accessToken || data.token;
      // Respetar el rol elegido por el usuario; si no se pasó, inferir del username
      const rol = selectedRole || "solicitante";
      const userData = {
        id: data.id,
        username: data.username,
        firstName: data.firstName || "Usuario",
        lastName: data.lastName || "Demo",
        email: data.email || `${data.username}@dummyjson.com`,
        image: data.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
        rol: rol
      };
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("rol", userData.rol);
      // Limpiar perfil extendido anterior al hacer login nuevo
      localStorage.removeItem("perfilExtendido");
      return userData;
    }
  } catch {
    // Si DummyJSON no responde en red, caer al fallback de usuarios demo
  }

  // 2. Fallback de usuarios demo locales
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = findUser(username);
      if (!user || user.password !== password) {
        reject(new Error("Usuario o contraseña incorrectos."));
        return;
      }
      const token = "tt_" + btoa(Date.now() + "_" + user.username);
      const rol = selectedRole || user.rol || "solicitante";
      const userData = {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        rol: rol
      };
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("rol", rol);
      localStorage.removeItem("perfilExtendido");
      resolve(userData);
    }, 400);
  });
}

export function register({ name, email, username, password, rol }) {
  const allUsers = [...DEMO_USERS, ...getUsers()];
  const exists = allUsers.find(u => u.username === username || u.email === email);
  if (exists) {
    throw new Error("El usuario o correo ya está registrado.");
  }
  const newUser = {
    id: Date.now(),
    username,
    password,
    firstName: name.split(" ")[0],
    lastName: name.split(" ").slice(1).join(" ") || "",
    email,
    rol: rol || "solicitante"
  };
  const users = getUsers();
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function forgotPassword(email) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const allUsers = [...DEMO_USERS, ...getUsers()];
      const user = allUsers.find(u => u.email === email);
      if (!user) {
        reject(new Error("No se encontró una cuenta asociada a ese correo electrónico."));
        return;
      }
      resolve({ message: "Se enviaron las instrucciones a tu correo." });
    }, 600);
  });
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("rol");
  window.location.href = "/login.html";
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function getRole() {
  return localStorage.getItem("rol") || "solicitante";
}

export function setRole(newRole) {
  localStorage.setItem("rol", newRole);
  const u = getUser();
  if (u) {
    u.rol = newRole;
    localStorage.setItem("user", JSON.stringify(u));
  }
}

export function getVisibleModules() {
  const rol = getRole();
  return ROLE_PERMISSIONS[rol] || ROLE_PERMISSIONS.solicitante;
}

export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = "/login.html";
  }
}

// ── Gestión del Perfil Extendido (Almacenado en localStorage) ───
export function getPerfilExtendido() {
  const stored = localStorage.getItem("perfilExtendido");
  const user = getUser() || {};
  const rol = getRole();

  if (stored) {
    try {
      return { ...getDefaultPerfil(user, rol), ...JSON.parse(stored) };
    } catch {
      return getDefaultPerfil(user, rol);
    }
  }
  return getDefaultPerfil(user, rol);
}

export function savePerfilExtendido(datos) {
  localStorage.setItem("perfilExtendido", JSON.stringify(datos));
  // Si cambia nombre o email, actualizar el objeto de sesión
  const user = getUser() || {};
  if (datos.nombre) {
    const parts = datos.nombre.split(" ");
    user.firstName = parts[0] || user.firstName;
    user.lastName = parts.slice(1).join(" ") || user.lastName;
  }
  if (datos.email) user.email = datos.email;
  localStorage.setItem("user", JSON.stringify(user));
}

function getDefaultPerfil(user, rol) {
  if (rol === "empleador" || rol === "reclutador") {
    return {
      nombre: `${user.firstName || "Carlos"} ${user.lastName || "Rodríguez"}`,
      empresaNombre: "Intel Costa Rica",
      razonSocial: "Intel Free Zone Costa Rica S.A.",
      cedulaJuridica: "3-101-445892",
      sector: "Tecnología & Semiconductores",
      sedeUbicacion: "Zona Franca América, Heredia",
      tamanoEmpresa: "1,000+ colaboradores",
      emailCorporativo: user.email || "carlos.recruiter@intelcr.com",
      telefonoEmpresa: "+506 2298-6000",
      reclutadorCargo: "Senior Technical Recruiter",
      descripcionEmpresa: "Líder global en innovación tecnológica y diseño de microarquitecturas presente en Costa Rica.",
      beneficios: "Seguro médico privado, Asociación Solidarista, Bono de conectividad, Trabajo híbrido flexible, Fondo de retiro."
    };
  }

  return {
    nombre: `${user.firstName || "María"} ${user.lastName || "García"}`,
    email: user.email || "maria.dev@gmail.com",
    telefono: "+506 8899-3344",
    ubicacion: "San José, Costa Rica",
    titular: "Senior Full Stack Developer (React / Node.js)",
    experienciaAnos: "5 años",
    pretensionSalarial: "$3,500 - $4,800 USD",
    modalidadPreferida: "Remoto 100% o Híbrido",
    skills: ["React", "TypeScript", "Node.js", "AWS", "Git", "PostgreSQL"],
    linkedin: `https://linkedin.com/in/${user.username || "maria"}`,
    github: `https://github.com/${user.username || "maria"}`,
    bio: "Desarrolladora de software con pasión por crear aplicaciones web modernas, escalables y orientadas a una excelente experiencia de usuario."
  };
}
