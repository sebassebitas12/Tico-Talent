// src/js/auth.js
// Sistema de autenticacion con DummyJSON /auth/login + fallback demo local.
// Roles: solicitante y empresa.

const DEMO_USERS = [
  {
    id: 1,
    username: "carlos",
    password: "carlos123",
    firstName: "Carlos",
    lastName: "Rodriguez",
    email: "carlos@ticotalent.com",
    rol: "empresa"
  },
  {
    id: 2,
    username: "maria",
    password: "maria123",
    firstName: "Maria",
    lastName: "Garcia",
    email: "maria@gmail.com",
    rol: "solicitante"
  }
];

const ROLE_PERMISSIONS = {
  solicitante: ["vacantes", "candidatos", "empresas", "postulaciones", "entrevistas", "tareas"],
  empresa: ["vacantes", "candidatos", "empresas", "postulaciones", "entrevistas", "tareas"]
};

const ROLE_LABELS = {
  solicitante: "Solicitante",
  empresa: "Empresa"
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

export async function login(username, password) {
  try {
    const response = await fetch("https://dummyjson.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      const token = data.accessToken;
      const builtIn = DEMO_USERS.find(u => u.username === data.username);
      const userData = {
        id: data.id,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: builtIn ? builtIn.email : data.email,
        image: data.image,
        rol: builtIn ? builtIn.rol : "solicitante"
      };
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("rol", userData.rol);
      return userData;
    }
  } catch {
    // Si DummyJSON no responde, caer al fallback local
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = findUser(username);
      if (!user || user.password !== password) {
        reject(new Error("Usuario o contrasena incorrectos"));
        return;
      }
      const token = "tt_" + btoa(Date.now() + "_" + user.username);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        rol: user.rol
      }));
      localStorage.setItem("rol", user.rol);
      resolve(user);
    }, 800);
  });
}

export function register({ name, email, username, password, rol }) {
  const allUsers = [...DEMO_USERS, ...getUsers()];
  const exists = allUsers.find(u => u.username === username || u.email === email);
  if (exists) {
    throw new Error("El usuario o correo ya esta registrado");
  }

  if (rol === "empresa" && !email.endsWith("@ticotalent.com")) {
    throw new Error("El correo de la empresa debe ser @ticotalent.com");
  }
  if (rol === "solicitante" && email.endsWith("@ticotalent.com")) {
    throw new Error("El correo del solicitante debe ser un correo personal (@gmail.com)");
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
        reject(new Error("No se encontro una cuenta con ese correo"));
        return;
      }
      resolve({ message: "Se enviaron las instrucciones a tu correo" });
    }, 1000);
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

export function getRoleLabel() {
  return ROLE_LABELS[getRole()] || "Solicitante";
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
